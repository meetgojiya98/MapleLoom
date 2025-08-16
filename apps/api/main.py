# /workspace/main.py
import os
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_graph import graph as _graph, RAGGraph, QueryRequest, PROVIDER, OLLAMA_LLM  # <- no OPENAI_MODEL import

app = FastAPI(title="MapleLoom API", version="1.0.0")

# CORS: allow your Vite dev server (5173) and same-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
        "*",  # dev convenience; tighten in prod
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

graph: RAGGraph = _graph  # shared instance from rag_graph.py


# ============================ Models ==========================================

class QueryBody(BaseModel):
    query: str
    top_k: int = 8
    use_reranker: bool = False
    with_trace: bool = True
    prefer_speed: Optional[bool] = None  # accepted but unused


class RefreshBody(BaseModel):
    clear: bool = False


# ============================ Routes ==========================================

@app.get("/")
def root():
    return {"ok": True, "service": "MapleLoom API"}


@app.get("/status")
def status():
    # Offline mode ⇒ Ollama only
    model = OLLAMA_LLM
    embed_model = os.getenv("OLLAMA_EMBEDDINGS", "nomic-embed-text:latest")
    ok = True
    try:
        ok = graph.ping()
    except Exception:
        ok = False
    return {
        "ok": ok,
        "provider": PROVIDER,                 # "ollama"
        "model": model,                       # e.g., llama3.1:8b
        "embed_model": embed_model,           # e.g., nomic-embed-text:latest
        "collection": os.getenv("RAG_COLLECTION", "docs"),
        "ollama_base_url": os.getenv("OLLAMA_BASE_URL", "http://ollama:11434"),
    }


@app.post("/query")
def query(body: QueryBody):
    req = QueryRequest(**body.model_dump())
    return graph.run(req)


@app.post("/refresh")
def refresh(body: RefreshBody):
    """
    Optional: if a worker/ingest module exists, call it.
    We guard the import to avoid ModuleNotFoundError in the API container.
    """
    clear = bool(body.clear)
    called = False
    try:
        import importlib
        mod = importlib.import_module("ingest")  # apps/worker/ingest.py if present
        if hasattr(mod, "reindex"):
            mod.reindex(clear=clear)  # type: ignore[arg-type]
            called = True
    except Exception:
        called = False
    return {"ok": True, "invoked_worker": called, "cleared": clear}


@app.get("/docs")
def list_docs():
    """
    Optional: return a list of indexed documents from worker (if present).
    """
    items: List[Dict[str, Any]] = []
    try:
        import importlib
        mod = importlib.import_module("ingest")
        if hasattr(mod, "list_docs"):
            items = list(mod.list_docs())  # type: ignore[assignment]
    except Exception:
        items = []
    return {"items": items}


# ============================ Entrypoint (for local runs) =====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
