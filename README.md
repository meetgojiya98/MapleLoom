# MapleLoom — Private RAG (Ollama + Qdrant + Meilisearch)

A precise, private RAG interface powered by **Ollama**, **Qdrant**, and **Meilisearch**.  
Zero third-party calls (fully offline), source-anchored answers, and a minimal-latency UI.

> ✓ Works fully offline with Ollama (LLM + embeddings)  
> ✓ Qdrant for vector search, Meilisearch for keyword search (optional)  
> ✓ Nice web UI with inline references

---

## ✨ Screenshots

> Put these images in `docs/images/` using the filenames below.

| View | File |
|---|---|
| Answer with sources | `docs/images/app-answer-with-sources.png` |
| Landing page | `docs/images/landing-page.png` |
| Docs panel | `docs/images/docs-panel.png` |
| Settings panel | `docs/images/settings-panel.png` |
| (Troubleshooting) 502/Bad Gateway | `docs/images/setup-error-bad-gateway.jpeg` |
| (Troubleshooting) Vector dim mismatch 1 | `docs/images/vector-dim-mismatch-1.jpeg` |
| (Troubleshooting) Vector dim mismatch 2 | `docs/images/vector-dim-mismatch-2.jpeg` |

![App](docs/images/landing-page.png)

---

## 🧱 Architecture

- **LLM/Embeddings:** Ollama (`OLLAMA_LLM`, `OLLAMA_EMBEDDINGS`)
- **Vector DB:** Qdrant (collection = `RAG_COLLECTION`)
- **Keyword:** Meilisearch (optional)
- **API:** FastAPI (`apps/api`)
- **Ingest/Worker:** `apps/worker`
- **Web:** Vite/React (`apps/web`)

---

## 🚀 Quickstart

### 1) `.env`

Create a `.env` in the repo root:

```env
# Core
RAG_COLLECTION=docs

# Qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=

# Meilisearch
MEILI_URL=http://meilisearch:7700
MEILI_MASTER_KEY=devkey
MEILI_INDEX=docs

# Offline (Ollama)
LLM_PROVIDER=ollama
OLLAMA_LLM=llama3.1:8b
# Use one of: mxbai-embed-large (1024 dims)  OR  nomic-embed-text:latest (768 dims)
OLLAMA_EMBEDDINGS=mxbai-embed-large

# Web
VITE_API_URL=http://localhost:8000
