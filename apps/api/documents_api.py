import hashlib
import io
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import httpx
import requests
from fastapi import APIRouter, File, HTTPException, UploadFile, Query
from fastapi import Body
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.conversions import common_types as qtypes

# Reuse your Ollama embeddings helper
from rag_graph import PromptFirstOllamaEmbeddings

# ---------------------------------------------------------------------
# Env
# ---------------------------------------------------------------------
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
RAG_COLLECTION = os.getenv("RAG_COLLECTION", "docs")

MEILI_URL = os.getenv("MEILI_URL", "http://meilisearch:7700").rstrip("/")
MEILI_MASTER_KEY = os.getenv("MEILI_MASTER_KEY", "dev-meili-master-key")
MEILI_INDEX = os.getenv("MEILI_INDEX", "docs")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
OLLAMA_EMBEDDINGS = os.getenv("OLLAMA_EMBEDDINGS", "mxbai-embed-large:latest")

# ---------------------------------------------------------------------
# Clients & setup
# ---------------------------------------------------------------------
router = APIRouter(prefix="/documents", tags=["documents"])

_embedder = PromptFirstOllamaEmbeddings(
    base_url=OLLAMA_BASE_URL, model=OLLAMA_EMBEDDINGS, timeout=120
)

_qc = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)

def _ensure_qdrant_collection() -> int:
    """Ensure Qdrant collection exists and return vector size."""
    try:
        info = _qc.get_collection(RAG_COLLECTION)
        return info.config.params.vectors.size  # type: ignore[attr-defined]
    except Exception:
        pass

    dim = len(_embedder.embed_query("dim probe"))
    if not dim:
        raise RuntimeError("Embeddings returned empty vector when probing dimension.")

    _qc.recreate_collection(
        collection_name=RAG_COLLECTION,
        vectors_config=qmodels.VectorParams(size=dim, distance=qmodels.Distance.COSINE),
    )
    return dim

_VECTOR_DIM = _ensure_qdrant_collection()

def _meili_headers() -> Dict[str, str]:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MEILI_MASTER_KEY}",
        "X-Meili-API-Key": MEILI_MASTER_KEY,
    }

def _ensure_meili_index():
    try:
        # Create (idempotent) and set simple settings
        httpx.put(
            f"{MEILI_URL}/indexes/{MEILI_INDEX}",
            headers=_meili_headers(),
            json={"uid": MEILI_INDEX},
            timeout=10.0,
        )
        settings = {
            "searchableAttributes": ["title", "text", "uri"],
            "displayedAttributes": ["id", "title", "uri", "text"],
        }
        httpx.patch(
            f"{MEILI_URL}/indexes/{MEILI_INDEX}/settings",
            headers=_meili_headers(),
            json=settings,
            timeout=10.0,
        )
    except Exception:
        # Don't hard fail the whole API if Meilisearch isn't configured
        pass

_ensure_meili_index()

# ---------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------
MD_EXTS = {".md", ".markdown"}
TXT_EXTS = {".txt", ".text"}
PDF_EXTS = {".pdf"}

def _file_ext(name: str) -> str:
    parts = name.lower().rsplit(".", 1)
    return f".{parts[-1]}" if len(parts) == 2 else ""

def _strip_html(html: str) -> str:
    # very light fallback if bs4 isn't available
    text = re.sub(r"(?is)<script.*?>.*?</script>", " ", html)
    text = re.sub(r"(?is)<style.*?>.*?</style>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def _html_to_text(html: str) -> str:
    try:
        from bs4 import BeautifulSoup  # type: ignore
        soup = BeautifulSoup(html, "html.parser")
        # Prefer main/article first
        main = soup.find("main") or soup.find("article") or soup
        return re.sub(r"\s+", " ", main.get_text(" ", strip=True)).strip()
    except Exception:
        return _strip_html(html)

def _pdf_to_text(data: bytes) -> str:
    # Try pdfminer.six first; else try PyPDF2; else fail
    try:
        from pdfminer.high_level import extract_text  # type: ignore
        with io.BytesIO(data) as f:
            return extract_text(f) or ""
    except Exception:
        try:
            import PyPDF2  # type: ignore
            with io.BytesIO(data) as f:
                reader = PyPDF2.PdfReader(f)
                out = []
                for page in reader.pages:
                    out.append(page.extract_text() or "")
                return "\n".join(out)
        except Exception:
            raise HTTPException(
                status_code=415,
                detail="Cannot extract text from PDF. Install 'pdfminer.six' or 'PyPDF2' in the API image.",
            )

def _normalize_title(title: Optional[str], uri: Optional[str], fallback: str) -> str:
    if title and title.strip():
        return title.strip()
    if uri:
        return uri
    return fallback

def _hash_to_int(s: str) -> int:
    return int(hashlib.md5(s.encode("utf-8")).hexdigest()[:12], 16)

def _embed(text: str) -> List[float]:
    # stay consistent with ingest.py (trim for safety)
    trimmed = text[:6000]
    return _embedder.embed_query(trimmed)

def _upsert_qdrant(
    *, text: str, title: Optional[str], uri: Optional[str], id_hint: Optional[int] = None
) -> int:
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Empty text after extraction.")
    pid = id_hint or _hash_to_int(uri or (title or text)[:80])
    vec = _embed(text)
    payload = {
        "id": str(pid),
        "title": title,
        "uri": uri,
        "text": text[:4000],
    }
    _qc.upsert(
        collection_name=RAG_COLLECTION,
        points=[
            qmodels.PointStruct(
                id=pid,
                vector=vec,
                payload=payload,
            )
        ],
        wait=True,
    )
    return pid

def _meili_upsert(doc: Dict[str, Any]):
    try:
        httpx.post(
            f"{MEILI_URL}/indexes/{MEILI_INDEX}/documents",
            headers=_meili_headers(),
            content=json.dumps([doc]),
            timeout=10.0,
        )
    except Exception:
        pass

def _meili_delete_ids(ids: List[int]):
    try:
        httpx.post(
            f"{MEILI_URL}/indexes/{MEILI_INDEX}/documents/delete-batch",
            headers=_meili_headers(),
            content=json.dumps(ids),
            timeout=10.0,
        )
    except Exception:
        pass

def _scroll_qdrant(
    *, limit: int = 50, offset: Optional[qtypes.PointId] = None, query_uri: Optional[str] = None
) -> Tuple[List[Dict[str, Any]], Optional[qtypes.PointId]]:
    flt = None
    if query_uri:
        flt = qmodels.Filter(
            must=[qmodels.FieldCondition(key="uri", match=qmodels.MatchValue(value=query_uri))]
        )
    points, next_page = _qc.scroll(
        collection_name=RAG_COLLECTION,
        scroll_filter=flt,
        with_payload=True,
        with_vectors=False,
        limit=limit,
        offset=offset,
    )
    rows: List[Dict[str, Any]] = []
    for p in points:
        payload = p.payload or {}
        rows.append(
            {
                "id": int(p.id) if isinstance(p.id, int) else int(str(p.id)),
                "title": payload.get("title"),
                "uri": payload.get("uri"),
                "text": payload.get("text"),
            }
        )
    return rows, next_page

# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------

@router.get("")
def list_documents(
    query: Optional[str] = Query(default=None, description="Search text/title/uri"),
    limit: int = Query(default=50, ge=1, le=200),
    cursor: Optional[str] = Query(default=None, description="Opaque scroll cursor"),
):
    # If query provided and Meili available, use Meili
    if query:
        try:
            r = httpx.post(
                f"{MEILI_URL}/indexes/{MEILI_INDEX}/search",
                headers=_meili_headers(),
                json={"q": query, "limit": limit},
                timeout=8.0,
            )
            r.raise_for_status()
            hits = r.json().get("hits", [])
            rows = [
                {"id": int(h["id"]), "title": h.get("title"), "uri": h.get("uri"), "text": h.get("text")}
                for h in hits
            ]
            return {"items": rows, "next": None}
        except Exception:
            # fall back to qdrant scroll without filter
            pass

    # No query: use Qdrant scroll
    offset = int(cursor) if cursor else None
    rows, next_page = _scroll_qdrant(limit=limit, offset=offset)
    next_cursor = str(next_page) if next_page is not None else None
    return {"items": rows, "next": next_cursor}

@router.post("/text")
def add_text(
    payload: Dict[str, Any] = Body(
        ...,
        example={
            "title": "My note",
            "uri": "note://my-note",
            "text": "This is a small text note...",
        },
    )
):
    text = (payload.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text'.")
    title = _normalize_title(payload.get("title"), payload.get("uri"), "Untitled")
    uri = payload.get("uri")
    pid = _upsert_qdrant(text=text, title=title, uri=uri)
    _meili_upsert({"id": pid, "title": title, "uri": uri, "text": text[:4000]})
    return {"id": pid, "title": title, "uri": uri}

@router.post("/url")
def add_url(payload: Dict[str, Any] = Body(..., example={"url": "https://example.com", "title": "Example"})):
    url = (payload.get("url") or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="Missing 'url'.")
    title = _normalize_title(payload.get("title"), url, "Untitled")
    try:
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")

    text = _html_to_text(resp.text)
    if not text:
        raise HTTPException(status_code=415, detail="Could not extract main text from the URL.")
    pid = _upsert_qdrant(text=text, title=title, uri=url)
    _meili_upsert({"id": pid, "title": title, "uri": url, "text": text[:4000]})
    return {"id": pid, "title": title, "uri": url}

@router.post("/upload")
def upload_file(file: UploadFile = File(...), title: Optional[str] = None, uri: Optional[str] = None):
    raw = file.file.read()
    ext = _file_ext(file.filename or "")
    if ext in TXT_EXTS or ext in MD_EXTS:
        try:
            text = raw.decode("utf-8", errors="ignore")
        except Exception:
            raise HTTPException(status_code=415, detail="Cannot decode text file as UTF-8.")
    elif ext in PDF_EXTS:
        text = _pdf_to_text(raw)
    else:
        raise HTTPException(
            status_code=415, detail=f"Unsupported file type '{ext}'. Allowed: .txt, .md, .pdf"
        )

    used_title = _normalize_title(title, uri or (file.filename or None), file.filename or "Untitled")
    used_uri = uri or f"file://{file.filename}"
    pid = _upsert_qdrant(text=text, title=used_title, uri=used_uri)
    _meili_upsert({"id": pid, "title": used_title, "uri": used_uri, "text": text[:4000]})
    return {"id": pid, "title": used_title, "uri": used_uri}

@router.delete("/{doc_id}")
def delete_document(doc_id: int):
    _qc.delete(collection_name=RAG_COLLECTION, points_selector=qmodels.PointIdsList(points=[doc_id]))
    _meili_delete_ids([doc_id])
    return {"deleted": [doc_id]}

@router.post("/delete_by_uri")
def delete_by_uri(payload: Dict[str, Any] = Body(..., example={"uri": "file://my.pdf"})):
    uri = payload.get("uri")
    if not uri:
        raise HTTPException(status_code=400, detail="Missing 'uri'.")
    # Find ids first, then delete in both stores
    rows, _ = _scroll_qdrant(limit=1000, query_uri=uri)
    ids = [r["id"] for r in rows]
    if ids:
        _qc.delete(
            collection_name=RAG_COLLECTION,
            points_selector=qmodels.FilterSelector(
                filter=qmodels.Filter(
                    must=[qmodels.FieldCondition(key="uri", match=qmodels.MatchValue(value=uri))]
                )
            ),
        )
        _meili_delete_ids(ids)
    return {"deleted": ids}
