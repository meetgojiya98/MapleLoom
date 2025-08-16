import os, json, re, time, hashlib, pathlib, requests
from typing import List, Iterable, Tuple, Optional
from dataclasses import dataclass

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# ---- Config (env) -----------------------------------------------------------
QDRANT_URL       = os.getenv("QDRANT_URL", "http://qdrant:6333")
QDRANT_API_KEY   = os.getenv("QDRANT_API_KEY") or None
RAG_COLLECTION   = os.getenv("RAG_COLLECTION", "docs")

OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434").rstrip("/")
OLLAMA_EMBEDDINGS= os.getenv("OLLAMA_EMBEDDINGS", "mxbai-embed-large:latest")

MEILI_URL        = os.getenv("MEILI_URL", "http://meilisearch:7700").rstrip("/")
MEILI_MASTER_KEY = os.getenv("MEILI_MASTER_KEY", "dev-meili-master-key")
MEILI_INDEX      = os.getenv("MEILI_INDEX", "docs")

# Chunking knobs
CHUNK_CHARS      = int(os.getenv("CHUNK_CHARS", "1400"))   # ~ 800-1000 tokens
CHUNK_OVERLAP    = int(os.getenv("CHUNK_OVERLAP", "200"))
BATCH_UPSERT     = 128

# ---- Small helpers ----------------------------------------------------------
def _read_text(p: pathlib.Path) -> Tuple[str, Optional[dict]]:
    """Return (text, front_matter_dict_or_none)."""
    t = p.read_text(encoding="utf-8", errors="ignore")
    meta = None
    if t.startswith("---\n{"):
        end = t.find("\n---", 4)
        if end > 0:
            try:
                meta = json.loads(t[4:end])
                t = t[end + 4 :].lstrip()
            except Exception:
                pass
    return t, meta

def _sentences(text: str) -> Iterable[str]:
    # simple sentence splitter (no extra deps)
    for s in re.split(r"(?<=[\.!?])\s+", text.strip()):
        s = s.strip()
        if s:
            yield s

def _chunks(text: str, size: int = CHUNK_CHARS, overlap: int = CHUNK_OVERLAP) -> Iterable[str]:
    buf: List[str] = []
    n = 0
    for s in _sentences(text):
        if n + len(s) + 1 > size and buf:
            yield " ".join(buf).strip()
            # keep trailing overlap
            keep = []
            total = 0
            for x in reversed(buf):
                total += len(x) + 1
                keep.append(x)
                if total >= overlap:
                    break
            buf = list(reversed(keep))
            n = sum(len(x) + 1 for x in buf)
        buf.append(s)
        n += len(s) + 1
    if buf:
        yield " ".join(buf).strip()

# robust Ollama embeddings (prefers "prompt", falls back to "input" shapes)
def _embed_one(text: str, timeout: int = 120) -> List[float]:
    url = f"{OLLAMA_BASE_URL}/api/embeddings"
    for body in (
        {"model": OLLAMA_EMBEDDINGS, "prompt": text},
        {"model": OLLAMA_EMBEDDINGS, "input": text},
        {"model": OLLAMA_EMBEDDINGS, "input": [text]},
    ):
        r = requests.post(url, json=body, timeout=timeout)
        if r.status_code != 200:
            continue
        j = r.json()
        vec = j.get("embedding") or (j.get("embeddings") or [None])[0] \
              or (j.get("data") or [{}])[0].get("embedding")
        if isinstance(vec, list) and vec:
            return vec
    raise RuntimeError("embeddings endpoint returned empty vector")

def _probe_dim() -> int:
    v = _embed_one("dimension probe")
    return len(v)

def _ensure_qdrant(dim: int, clear: bool = False):
    qc = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    try:
        info = qc.get_collection(RAG_COLLECTION)
        current = info.vectors_count and info.config.params.vectors.size
        if clear or (current and current != dim):
            try:
                qc.delete_collection(RAG_COLLECTION)
            except Exception:
                pass
            qc.create_collection(
                RAG_COLLECTION,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
            )
    except Exception:
        qc.create_collection(
            RAG_COLLECTION,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
    return qc

def _meili_index_docs(docs: List[dict]):
    if not MEILI_MASTER_KEY:
        return
    h = {"Authorization": f"Bearer {MEILI_MASTER_KEY}", "Content-Type": "application/json"}
    # create index if missing
    requests.put(f"{MEILI_URL}/indexes/{MEILI_INDEX}", headers=h, json={"primaryKey": "id"}, timeout=30)
    # settings (idempotent)
    settings = {
        "searchableAttributes": ["title", "text", "uri"],
        "displayedAttributes": ["id", "title", "uri", "text"],
    }
    try:
        requests.patch(f"{MEILI_URL}/indexes/{MEILI_INDEX}/settings", headers=h, data=json.dumps(settings), timeout=30)
    except Exception:
        pass
    # upload
    for i in range(0, len(docs), 500):
        requests.post(
            f"{MEILI_URL}/indexes/{MEILI_INDEX}/documents",
            headers=h,
            data=json.dumps(docs[i : i + 500]),
            timeout=120,
        )

# ---- Public API -------------------------------------------------------------
def run(path: str, clear: bool = False) -> dict:
    t0 = time.time()
    root = pathlib.Path(path)
    if not root.exists():
        raise FileNotFoundError(f"path not found: {path}")
    print(f"[ingest] path={path} clear={clear}")

    dim = _probe_dim()
    print(f"[ingest] embedding dim = {dim}")
    qc = _ensure_qdrant(dim, clear=clear)

    added, skipped = 0, 0
    points: List[PointStruct] = []
    meili_docs: List[dict] = []

    files = [p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in {".md", ".txt", ".html", ".json", ".jsonl"}]
    print(f"[ingest] files found = {len(files)}")

    for p in files:
        try:
            text, meta = _read_text(p)
            if not text or len(text) < 200:
                continue
            uri = (meta or {}).get("source_url") or (meta or {}).get("uri")
            title = (meta or {}).get("title")
            base_id = hashlib.md5((uri or str(p)).encode()).hexdigest()

            # chunk & embed
            for idx, chunk in enumerate(_chunks(text)):
                if len(chunk) < 120:
                    continue
                vec = _embed_one(chunk[:6000])
                pid = int(base_id[:12], 16) + idx
                payload = {"path": str(p), "uri": uri, "title": title, "text": chunk}
                points.append(PointStruct(id=pid, vector=vec, payload=payload))

                meili_docs.append({
                    "id": f"{base_id}:{idx}",
                    "uri": uri or str(p),
                    "title": title,
                    "text": chunk
                })

                if len(points) >= BATCH_UPSERT:
                    qc.upsert(RAG_COLLECTION, points=points)
                    added += len(points)
                    points = []
        except Exception:
            skipped += 1

    if points:
        qc.upsert(RAG_COLLECTION, points=points)
        added += len(points)

    if meili_docs and MEILI_MASTER_KEY:
        _meili_index_docs(meili_docs)

    dt = time.time() - t0
    print(f"[ingest] upserted={added}, skipped={skipped}, seconds={dt:.1f}")
    return {"upserted": added, "skipped": skipped, "seconds": dt, "dim": dim}

# Keep backward-compatible CLI: `python -m ingest --path ... [--clear]`
if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", required=True, help="Folder with crawled docs")
    ap.add_argument("--clear", action="store_true", help="Recreate Qdrant collection")
    args = ap.parse_args()
    res = run(args.path, clear=args.clear)
    print(json.dumps(res, indent=2))
