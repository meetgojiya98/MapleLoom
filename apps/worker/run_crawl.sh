#!/usr/bin/env bash
set -euo pipefail

SEEDFILE=${1:-/workspace/apps/worker/seeds/rag_engineering.txt}
OUTDIR=${2:-/workspace/data/crawl}
MAXPAGES=${3:-400}
MAXDEPTH=${4:-2}

# Build domain whitelist from known seeds (kept explicit for reproducibility)
WHITELIST="python.langchain.com,langchain-ai.github.io,qdrant.tech,meilisearch.com,ollama.com,docs.llamaindex.ai,docs.ragas.io"

echo "Reading seeds from: $SEEDFILE"
SEEDS=$(grep -vE '^#|^$' "$SEEDFILE" | tr '\n' ' ')

# shellcheck disable=SC2086
python /workspace/apps/worker/crawl.py   --seeds $SEEDS   --domain-whitelist "$WHITELIST"   --max-pages "$MAXPAGES"   --max-depth "$MAXDEPTH"   --delay 1.0   --same-origin   --ingest   --out "$OUTDIR"
