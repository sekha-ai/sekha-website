# Configuration Reference

> Complete reference for all Sekha configuration options

## Overview

Sekha can be configured through environment variables, configuration files, or command-line arguments.

## Environment Variables

### Core Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `SEKHA_HOST` | `0.0.0.0` | Server bind address |
| `SEKHA_PORT` | `8080` | Server port |
| `SEKHA_LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `SEKHA_DATABASE_URL` | `sqlite://./sekha.db` | SQLite database path |

### Vector Database

| Variable | Default | Description |
|----------|---------|-------------|
| `CHROMA_HOST` | `localhost` | ChromaDB host |
| `CHROMA_PORT` | `8000` | ChromaDB port |
| `CHROMA_COLLECTION` | `sekha_memories` | Collection name |

### LLM Bridge

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_BRIDGE_URL` | `http://localhost:8001` | LLM Bridge endpoint |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama endpoint |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `SUMMARIZATION_MODEL` | `llama3.1:8b` | Summarization model |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `SEKHA_API_KEY` | `dev-key-replace-in-production` | API authentication key |
| `SEKHA_CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |

### Performance

| Variable | Default | Description |
|----------|---------|-------------|
| `SEKHA_MAX_CONNECTIONS` | `100` | Max database connections |
| `SEKHA_WORKER_THREADS` | `4` | Number of worker threads |
| `SEKHA_REQUEST_TIMEOUT` | `30` | Request timeout (seconds) |

## Configuration File

Create `sekha.toml` in the working directory:

```toml
[server]
host = "0.0.0.0"
port = 8080
log_level = "info"

[database]
url = "sqlite://./sekha.db"
max_connections = 100

[vector_db]
host = "localhost"
port = 8000
collection = "sekha_memories"

[llm]
bridge_url = "http://localhost:8001"
embedding_model = "nomic-embed-text"
summarization_model = "llama3.1:8b"

[security]
api_key = "your-secure-api-key"
cors_origins = ["https://app.example.com"]
```

## Command-Line Arguments

```bash
sekha-controller \
  --host 0.0.0.0 \
  --port 8080 \
  --database-url sqlite://./sekha.db \
  --chroma-host localhost \
  --chroma-port 8000 \
  --log-level info
```

## Docker Environment

When using Docker Compose, configure via `docker-compose.yml`:

```yaml
services:
  sekha-controller:
    environment:
      - SEKHA_PORT=8080
      - CHROMA_HOST=chroma
      - SEKHA_API_KEY=${SEKHA_API_KEY}
```

## Production Recommendations

- ✅ **Always change `SEKHA_API_KEY`** from default
- ✅ **Restrict CORS origins** to your domains
- ✅ **Enable HTTPS** via reverse proxy
- ✅ **Set appropriate log level** (warn or error in production)
- ✅ **Configure resource limits** based on load

## Related

- [Installation Guide](../getting-started/installation.md)
- [Docker Deployment](../deployment/docker-compose.md)
- [Production Guide](../deployment/production.md)
- [Security Hardening](../deployment/security.md)
