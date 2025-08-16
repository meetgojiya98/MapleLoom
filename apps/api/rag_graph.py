# /workspace/rag_graph.py
import os
import time
from typing import Any, Dict, List, Optional

import requests

# ==============================================================================
# Offline provider: Ollama only
# ==============================================================================

PROVIDER = "ollama"

# Ollama connection (container-to-container DNS name: "ollama")
OLLAMA_BASE = (os.getenv("OLLAMA_BASE_URL") or "http://ollama:11434").rstrip("/")

# Model names (override via env if you use different local models)
OLLAMA_LLM = os.getenv("OLLAMA_LLM", "llama3.1:8b")
OLLAMA_EMBEDDINGS = os.getenv("OLLAMA_EMBEDDINGS", "nomic-embed-text:latest")

# Timeouts & retries for slow cold-starts / first-run loads
HTTP_TIMEOUT = int(os.getenv("OLLAMA_HTTP_TIMEOUT", "300"))  # seconds
RETRIES = int(os.getenv("OLLAMA_HTTP_RETRIES", "2"))
RETRY_BACKOFF = float(os.getenv("OLLAMA_HTTP_RETRY_BACKOFF", "1.5"))

# ==============================================================================
# Vector DB: Qdrant
# ==============================================================================
_qdrant = None
_collection = os.getenv("RAG_COLLECTION", "docs")
try:
    from qdrant_client import QdrantClient
    _qdrant = QdrantClient(
        url=os.getenv("QDRANT_URL", "http://qdrant:6333"),
        api_key=os.getenv("QDRANT_API_KEY") or None,
        timeout=20.0,
    )
except Exception:
    _qdrant = None  # allow running without retrieval if client missing


# ==============================================================================
# Ollama helpers (robust requests with small retry loop)
# ==============================================================================

def _ollama_request(path: str, json: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{OLLAMA_BASE}{path}"
    last_err: Optional[Exception] = None
    for attempt in range(RETRIES + 1):
        try:
            r = requests.post(url, json=json, timeout=HTTP_TIMEOUT)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            last_err = e
            if attempt < RETRIES:
                time.sleep(RETRY_BACKOFF * (attempt + 1))
            else:
                raise

    # Should never reach here
    raise last_err or RuntimeError("Unknown Ollama error")

def _ollama_models_present() -> Dict[str, bool]:
    """Check that required models exist locally."""
    try:
        r = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=10)
        r.raise_for_status()
        data = r.json() or {}
        models = [m.get("name") for m in data.get("models", []) if isinstance(m, dict)]
        have_llm = any((OLLAMA_LLM == m or OLLAMA_LLM.split(":")[0] == (m or "").split(":")[0]) for m in models)
        have_embed = any((OLLAMA_EMBEDDINGS == m or OLLAMA_EMBEDDINGS.split(":")[0] == (m or "").split(":")[0]) for m in models)
        return {"llm": have_llm, "embed": have_embed}
    except Exception:
        # If tags call fails, we can’t verify; let requests fail later with a clearer message
        return {"llm": True, "embed": True}

def _generate_ollama(prompt: str) -> str:
    body = {
        "model": OLLAMA_LLM,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
        },
    }
    data = _ollama_request("/api/generate", body)
    return (data.get("response") or "").strip()

def _embed_ollama(texts: List[str]) -> List[List[float]]:
    out: List[List[float]] = []
    for t in texts:
        body = {
            "model": OLLAMA_EMBEDDINGS,
            "prompt": t,
        }
        data = _ollama_request("/api/embeddings", body)
        emb = data.get("embedding")
        if not isinstance(emb, list):
            raise RuntimeError("Ollama embeddings returned no vector.")
        out.append(emb)
    return out

def generate_text(prompt: str) -> str:
    return _generate_ollama(prompt)

def embed_texts(texts: List[str]) -> List[List[float]]:
    return _embed_ollama(texts)


# ==============================================================================
# Retrieval + Synthesis
# ==============================================================================

def _payload_text(p: Dict[str, Any]) -> str:
    # Try common keys produced by various ingesters
    for k in ("chunk", "text", "content", "page_content", "body"):
        if isinstance(p.get(k), str) and p[k].strip():
            return p[k]
    return ""

def _payload_title(p: Dict[str, Any]) -> Optional[str]:
    for k in ("title", "file_name", "name", "path"):
        v = p.get(k)
        if isinstance(v, str) and v.strip():
            return v
    return None

def _payload_uri(p: Dict[str, Any]) -> Optional[str]:
    for k in ("uri", "url", "source"):
        v = p.get(k)
        if isinstance(v, str) and v.strip():
            return v
    return None

def _build_prompt(user_query: str, ctx_blocks: List[str]) -> str:
    joined = "\n\n---\n\n".join(ctx_blocks[:10]) if ctx_blocks else "No context."
    return (
        "You answer questions using ONLY the context below. "
        "If the context is insufficient, say you don't know.\n\n"
        f"Question:\n{user_query}\n\n"
        "Context:\n"
        f"{joined}\n\n"
        "Answer (concise, with any necessary bullet points):"
    )


class QueryRequest:
    """Shape used by main.py; mirrors the Pydantic model defined there."""
    def __init__(self, query: str, top_k: int = 8, use_reranker: bool = False, with_trace: bool = False, **_):
        self.query = query
        self.top_k = top_k or 8
        self.use_reranker = use_reranker
        self.with_trace = with_trace


class RAGGraph:
    def __init__(self) -> None:
        self.collection = _collection
        self.qdrant = _qdrant

    def ping(self) -> bool:
        try:
            if self.qdrant:
                self.qdrant.get_collections()
            # Verify Ollama is reachable and models exist
            have = _ollama_models_present()
            return bool(have["llm"] and have["embed"])
        except Exception:
            return False

    def _ensure_models(self) -> None:
        have = _ollama_models_present()
        if not have["llm"] or not have["embed"]:
            from fastapi import HTTPException
            missing = []
            if not have["llm"]:
                missing.append(f"LLM '{OLLAMA_LLM}'")
            if not have["embed"]:
                missing.append(f"embedding '{OLLAMA_EMBEDDINGS}'")
            hint = (
                "Missing in Ollama. Inside the Ollama host/container run:\n"
                f"  ollama pull {OLLAMA_LLM}\n"
                f"  ollama pull {OLLAMA_EMBEDDINGS}\n"
            )
            raise HTTPException(status_code=503, detail=f"Models not available: {', '.join(missing)}. {hint}")

    def search(self, query: str, top_k: int = 8) -> List[Dict[str, Any]]:
        if not self.qdrant:
            return []
        self._ensure_models()
        vec = embed_texts([query])[0]
        hits = self.qdrant.search(
            collection_name=self.collection,
            query_vector=vec,
            limit=max(1, min(32, top_k)),
            with_payload=True,
            with_vectors=False,
        )
        out: List[Dict[str, Any]] = []
        for h in hits:
            payload = getattr(h, "payload", {}) or {}
            out.append(
                {
                    "id": getattr(h, "id", None),
                    "score": getattr(h, "score", None),
                    "payload": payload,
                    "title": _payload_title(payload),
                    "uri": _payload_uri(payload),
                    "chunk": _payload_text(payload),
                }
            )
        return out

    def synthesize(self, query: str, ctx_blocks: List[str]) -> str:
        self._ensure_models()
        prompt = _build_prompt(query, ctx_blocks)
        return generate_text(prompt)

    def run(self, req: QueryRequest) -> Dict[str, Any]:
        try:
            hits = self.search(req.query, req.top_k)
            ctx_blocks = [h["chunk"] for h in hits if h.get("chunk")]
            answer_text = self.synthesize(req.query, ctx_blocks) if ctx_blocks else "I couldn't find relevant context."

            sources = [
                {
                    "id": str(h.get("id") or i),
                    "uri": h.get("uri"),
                    "title": h.get("title") or (h.get("uri") or "Source"),
                    "chunk": h.get("chunk") or "",
                    "score": h.get("score"),
                    "metadata": h.get("payload") or {},
                }
                for i, h in enumerate(hits)
            ]

            out = {"answer": answer_text, "sources": sources}
            if req.with_trace:
                out["trace"] = {
                    "provider": PROVIDER,
                    "model": OLLAMA_LLM,
                    "embed_model": OLLAMA_EMBEDDINGS,
                    "top_k": req.top_k,
                }
            return out
        except Exception as e:
            from fastapi import HTTPException
            # Normalize errors through FastAPI for the API layer
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(status_code=502, detail=f"Query failed: {type(e).__name__}: {e}")


# Shared instance
graph = RAGGraph()
