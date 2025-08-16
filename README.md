# Advanced RAG App (Monorepo)

A batteries-included, **extremely advanced** Retrieval-Augmented Generation (RAG) web app.
Local-first by default with **Ollama** + **Qdrant** + **Meilisearch** (BM25-like) + **FastAPI** + **React (Vite + Tailwind)**. 
Includes ingestion, hybrid retrieval (dense + sparse), reranking, LangGraph pipeline, feedback capture, and basic evaluation hooks.

## Features
- **Hybrid Retrieval:** Dense (Qdrant) + Sparse (Meilisearch)
- **Multi-stage Reranking:** cross-encoder reranker (optional)
- **Graph Orchestration:** LangGraph for query rewrite → retrieve → rerank → synthesize → cite
- **Local LLM + Embeddings:** via Ollama (defaults: `llama3.1:8b`, `mxbai-embed-large`)
- **Feedback Loop:** store thumbs-up/down & corrections to improve future answers
- **Data Ingestion:** PDFs, Markdown, Text, Web URLs
- **Frontend:** Fast chat UI with source cards and trace toggle
- **Docker-first:** `docker compose up --build`

---

## Quick Start (Local, Docker)
1. Install Docker & Docker Compose.
2. Clone or unzip this project. Copy `.env.example` to `.env` and adjust if needed.
3. Put your files in `./data` (supports `.pdf`, `.md`, `.txt`). You can run ingestion any time.
4. Run:
   ```bash
   docker compose up --build
   ```
5. Open the app at http://localhost:5173 (web), API at http://localhost:8000/docs

### Ingest your data
With containers running, open a new terminal and run:
```bash
docker compose exec worker python -m ingest --path /workspace/data
```

### Test a query
Use the web UI or:
```bash
curl -s http://localhost:8000/query -H 'Content-Type: application/json'   -d '{"query":"What is this repo about?"}'
```

---

## One-Click-ish Deploy
- **Vercel (web)**: the `apps/web` folder is a standard Vite app.
- **Render/Fly/Any VM**: run docker compose on a small VM with ports exposed.
- For fully-managed DBs, point `QDRANT_URL` and `MEILI_URL` at your providers.

---

## Repo Layout
```
apps/
  api/       # FastAPI + LangGraph pipeline
  worker/    # ingestion & evaluation
  web/       # Vite + React + Tailwind chat UI
packages/
  shared/    # shared schemas/types
data/        # put your PDFs, MD, TXT here
docker-compose.yml
.env.example
```

---

## Notes
- First run will download Ollama models; allow a few minutes.
- To change models: set `OLLAMA_LLM` and `OLLAMA_EMBEDDINGS` in `.env`.
- For OpenAI fallback, provide `OPENAI_API_KEY` and `OPENAI_MODEL`.
