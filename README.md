# MapleLoom — Private RAG (Ollama + Qdrant + Meilisearch)

A precise, private RAG interface powered by **Ollama**, **Qdrant**, and **Meilisearch**.  
Zero third-party calls (fully offline), source-anchored answers, and a minimal-latency UI.

> ✓ Works fully offline with Ollama (LLM + embeddings)  
> ✓ Qdrant for vector search, Meilisearch for keyword search (optional)  
> ✓ Nice web UI with inline references

---

## 🧱 Architecture

- **LLM/Embeddings:** Ollama (`OLLAMA_LLM`, `OLLAMA_EMBEDDINGS`)
- **Vector DB:** Qdrant (collection = `RAG_COLLECTION`)
- **Keyword:** Meilisearch (optional)
- **API:** FastAPI (`apps/api`)
- **Ingest/Worker:** `apps/worker`
- **Web:** Vite/React (`apps/web`)

---

## 📸 App Screenshots

![screenshot 1](image.png)

![screenshot 2](image-1.png)

![screenshot 3](image-2.png)

![screenshot 4](image-3.png)

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

**Important:** If you change OLLAMA_EMBEDDINGS, you must recreate the Qdrant collection to the matching vector size (see Fix vector dimension mismatch).


# Quick Start (Services, Health Checks, Indexing, Troubleshooting)

## 2) Start services

```bash
docker compose up -d --build
```

### Open

- **Web UI** → <http://localhost:5173>
- **API status** → <http://localhost:8000/status>

---

## ✅ Health Checks

### From the host

```bash
# Qdrant
curl -i http://localhost:6333/readyz

# Meilisearch
curl -i http://localhost:7700/health

# API + CORS
curl -i http://localhost:8000/status -H 'Origin: http://localhost:5173'
```

### From inside the `api` container

```bash
docker compose exec api sh -lc 'curl -sf http://qdrant:6333/readyz && echo "Qdrant OK"'
docker compose exec api sh -lc 'curl -sf http://meilisearch:7700/health && echo "Meili OK"'

docker compose exec api sh -lc 'python - <<PY
import os, json, urllib.request
m=os.environ.get("OLLAMA_EMBEDDINGS","mxbai-embed-large")
req=urllib.request.Request("http://ollama:11434/api/embeddings",
  data=json.dumps({"model":m,"prompt":"hello"}).encode(),
  headers={"Content-Type":"application/json"})
with urllib.request.urlopen(req, timeout=60) as r:
  print("Emb DIM:", len(json.load(r)["embedding"]))
PY'
```

---

## 📥 Add Documents & Index

- Place files under `./data` on the host (mounted to `/workspace/data` in **worker**).
- Ensure Qdrant vector size matches the embedding **DIM** (see next section if unsure).

Run the ingester:

```bash
docker compose exec worker python ingest.py --path /workspace/data --clear
```

**Expected summary:**

```text
[ingest] embedding dim = 1024
[ingest] files found = 384
[ingest] upserted=2576, skipped=0, ...
```

---

## 🧰 Fix Vector Dimension Mismatch

If you see:

```text
Wrong input: Vector dimension error: expected dim: 768, got 1024
```

**A) Detect DIM (from api container):**

```bash
docker compose exec api sh -lc 'python - <<PY
import os, json, urllib.request
m=os.environ.get("OLLAMA_EMBEDDINGS","mxbai-embed-large")
req=urllib.request.Request("http://ollama:11434/api/embeddings",
  data=json.dumps({"model":m,"prompt":"hello"}).encode(),
  headers={"Content-Type":"application/json"})
with urllib.request.urlopen(req, timeout=60) as r:
  print(len(json.load(r)["embedding"]))
PY'
```

**B) Recreate collection with that size:**

```bash
# Replace 1024 with the number printed above
docker compose exec api sh -lc '
curl -s -X DELETE "http://qdrant:6333/collections/${RAG_COLLECTION}" >/dev/null
curl -s -X PUT "http://qdrant:6333/collections/${RAG_COLLECTION}" \
  -H "Content-Type: application/json" \
  -d "{\"vectors\":{\"size\":1024,\"distance\":\"Cosine\"}}"
echo'
```

**C) Re-index:**

```bash
docker compose exec worker python ingest.py --path /workspace/data --clear
```

_Troubleshooting refs:_
- `docs/images/vector-dim-mismatch-1.jpeg`
- `docs/images/vector-dim-mismatch-2.jpeg`

---

## 🧪 Try a Query (curl)

```bash
curl -s http://localhost:8000/query \
  -H 'Content-Type: application/json' \
  -d '{"query":"What is LangChain?","with_trace":true}' | jq .
```

---

## 🔌 API

### `GET /status`
Health & config; reflects provider, model, and collection name.

### `POST /query`

**Body:**

```json
{
  "query": "What is LangChain?",
  "top_k": 8,
  "use_reranker": false,
  "with_trace": true
}
```

### `POST /refresh`
Optional re-index hook. No-op if the worker module isn’t packaged into the API image.

### `GET /docs`
Optional listing of indexed docs. Returns empty list if not wired.

---

## 🛠️ Troubleshooting

### “Query failed: Connection error.” / 502 Bad Gateway

Check Ollama from API container:

```bash
docker compose exec api sh -lc 'curl -s http://ollama:11434/api/tags | head'
```

Ensure:

- `LLM_PROVIDER=ollama`
- `OLLAMA_LLM` is pulled (e.g., `docker compose exec ollama ollama pull llama3.1:8b`)

Reference: `docs/images/setup-error-bad-gateway.jpeg`

### CORS errors in browser console

API uses permissive CORS by default (`allow_origins=["*"]`). Validate with:

```bash
curl -i http://localhost:8000/status -H 'Origin: http://localhost:5173'
```

### Answers say “I couldn't find relevant context.”

- Make sure you ingested data (see **Add Documents & Index**).
- Verify collection exists and `points_count > 0`:

```bash
docker compose exec api sh -lc 'curl -s "http://qdrant:6333/collections/${RAG_COLLECTION}" | head -c 400; echo'
```

---

## 📦 Dev Commands

```bash
# Rebuild & restart everything
docker compose up -d --build

# Recreate just API + Worker
docker compose up -d --build api worker

# Tail API logs
docker compose logs -f api
```

---