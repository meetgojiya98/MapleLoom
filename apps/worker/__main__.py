# Simple module entrypoint
if __name__ == "__main__":
    print("Worker container ready. Use: docker compose exec worker python -m ingest --path /workspace/data")
