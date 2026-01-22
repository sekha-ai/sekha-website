# Docker Compose Deployment

The easiest way to deploy the complete Sekha stack with all dependencies.

## Quick Start

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker/docker

# Set your API key
export SEKHA_API_KEY="your-secure-key-here-min-32-chars"

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:8080/health
```

## What Gets Deployed

The full stack includes:

| Service | Port | Purpose |
|---------|------|---------||
| **sekha-controller** | 8080 | Core Rust backend (REST API) |
| **sekha-proxy** | 8081 | Context injection + Web UI |
| **sekha-llm-bridge** | 5001 | LLM routing (Ollama, OpenAI, etc.) |
| **chromadb** | 8000 | Vector database |
| **redis** | 6379 | Cache layer |
| **ollama** | 11434 | Local LLM runtime (optional) |

## Architecture

```
┌─────────────────────────────────────────────┐
│  Web UI (Port 8081)                         │
│  - Chat interface                           │
│  - Automatic memory                         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Sekha Proxy (NEW - Port 8081)              │
│  - Context injection                        │
│  - Privacy filtering                        │
└──────┬──────────────────┬───────────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Controller   │   │ LLM Bridge   │
│ (Port 8080)  │   │ (Port 5001)  │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐   ┌──────────────┐
│   ChromaDB   │   │    Redis     │
│  (Port 8000) │   │  (Port 6379) │
└──────────────┘   └──────────────┘
```

## Configuration

### Environment Variables

Create a `.env` file or export variables:

```bash
# Required
export SEKHA_API_KEY="sk-sekha-your-production-key-minimum-32-characters"

# Optional - Override defaults
export SEKHA_PORT=8080
export PROXY_PORT=8081
export BRIDGE_PORT=5001
export CHROMA_PORT=8000
export REDIS_PORT=6379

# LLM Configuration
export OLLAMA_BASE_URL="http://ollama:11434"
export OLLAMA_MODELS="nomic-embed-text:latest,llama3.1:8b"

# Privacy Controls
export AUTO_INJECT_CONTEXT=true
export CONTEXT_BUDGET=4000
export EXCLUDED_FOLDERS="/personal,/private"

# Logging
export RUST_LOG=info
export LOG_LEVEL=info
```

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  # Core Controller (Rust)
  sekha-controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    container_name: sekha-controller
    ports:
      - "8080:8080"
    environment:
      - SEKHA_API_KEY=${SEKHA_API_KEY}
      - SEKHA_PORT=8080
      - RUST_LOG=info
      - CHROMA_URL=http://chroma:8000
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - sekha-data:/data
    depends_on:
      - chroma
      - redis
    restart: unless-stopped

  # NEW: Proxy + Web UI
  sekha-proxy:
    image: ghcr.io/sekha-ai/sekha-proxy:latest
    container_name: sekha-proxy
    ports:
      - "8081:8081"
    environment:
      - SEKHA_CONTROLLER_URL=http://sekha-controller:8080
      - SEKHA_API_KEY=${SEKHA_API_KEY}
      - AUTO_INJECT_CONTEXT=true
      - CONTEXT_BUDGET=4000
      - EXCLUDED_FOLDERS=${EXCLUDED_FOLDERS:-}
    depends_on:
      - sekha-controller
    restart: unless-stopped

  # LLM Bridge (Python)
  sekha-llm-bridge:
    image: ghcr.io/sekha-ai/sekha-llm-bridge:latest
    container_name: sekha-llm-bridge
    ports:
      - "5001:5001"
    environment:
      - OLLAMA_BASE_URL=${OLLAMA_BASE_URL:-http://host.docker.internal:11434}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
    restart: unless-stopped

  # Vector Database
  chroma:
    image: chromadb/chroma:latest
    container_name: sekha-chroma
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/data
    restart: unless-stopped

  # Cache Layer
  redis:
    image: redis:7-alpine
    container_name: sekha-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  # Optional: Local LLM Runtime
  ollama:
    image: ollama/ollama:latest
    container_name: sekha-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    restart: unless-stopped

volumes:
  sekha-data:
  chroma-data:
  redis-data:
  ollama-data:
```

## Usage

### Starting the Stack

```bash
# Production mode (daemon)
docker-compose -f docker-compose.prod.yml up -d

# Development mode (with logs)
docker-compose -f docker-compose.dev.yml up

# Specific services only
docker-compose up sekha-controller chroma redis
```

### Accessing Services

**Web UI:**
```bash
open http://localhost:8081
```

**REST API:**
```bash
curl http://localhost:8080/health
```

**API Documentation:**
```bash
open http://localhost:8080/swagger-ui/
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f sekha-controller
docker-compose logs -f sekha-proxy

# Last 100 lines
docker-compose logs --tail=100
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Stop specific service
docker-compose stop sekha-controller
```

## Testing

### Health Checks

```bash
# Controller health
curl http://localhost:8080/health

# Expected output:
{
  "status": "healthy",
  "timestamp": "2026-01-21T...",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"}
  }
}
```

### Test Memory Storage

```bash
# Store a conversation
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SEKHA_API_KEY}" \
  -d '{
    "label": "Test Conversation",
    "folder": "/test",
    "messages": [
      {"role": "user", "content": "Hello Sekha!"},
      {"role": "assistant", "content": "Hello! I will remember this."}
    ]
  }'

# Search for it
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SEKHA_API_KEY}" \
  -d '{"query": "hello", "limit": 5}'
```

### Test Proxy (NEW)

```bash
# Via Web UI
open http://localhost:8081

# Via API (OpenAI-compatible)
curl -X POST http://localhost:8081/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Remember my name is Alice"}],
    "folder": "/personal"
  }'
```

## Updating

### Pull Latest Images

```bash
docker-compose pull
docker-compose up -d
```

### Backup Before Upgrade

```bash
# Backup volumes
docker run --rm -v sekha-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/sekha-data-$(date +%Y%m%d).tar.gz /data

# Backup database
docker exec sekha-controller cat /data/sekha.db > sekha.db.backup
```

## Troubleshooting

### Controller Won't Start

```bash
# Check logs
docker-compose logs sekha-controller

# Common issues:
# 1. Port 8080 already in use
lsof -i :8080

# 2. Missing API key
echo $SEKHA_API_KEY

# 3. Permission issues
docker-compose down -v
docker volume prune
```

### ChromaDB Connection Failed

```bash
# Verify ChromaDB is running
docker ps | grep chroma

# Test connection
curl http://localhost:8000/api/v1/heartbeat

# Restart if needed
docker-compose restart chroma
```

### Ollama Models Not Loading

```bash
# Enter Ollama container
docker exec -it sekha-ollama bash

# Pull models manually
ollama pull nomic-embed-text:latest
ollama pull llama3.1:8b

# List installed models
ollama list
```

### Out of Memory

```bash
# Increase Docker memory limit (Docker Desktop > Settings > Resources)

# Or limit container memory in docker-compose.yml:
services:
  sekha-controller:
    mem_limit: 2g
    memswap_limit: 2g
```

## Production Recommendations

### Security

```bash
# Use strong API key (32+ characters)
export SEKHA_API_KEY=$(openssl rand -hex 32)

# Don't expose ports publicly (use reverse proxy)
# Only expose 8080/8081 through nginx/traefik

# Enable TLS
# Use Let's Encrypt certificates
```

### Resource Limits

```yaml
services:
  sekha-controller:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Monitoring

```bash
# Prometheus metrics
curl http://localhost:8080/metrics

# Health monitoring
watch -n 5 'curl -s http://localhost:8080/health | jq'
```

### Backups

```bash
# Automated daily backups
crontab -e

# Add this line:
0 2 * * * docker exec sekha-controller cat /data/sekha.db > ~/backups/sekha-$(date +\%Y\%m\%d).db
```

## Next Steps

- [Configuration Reference](../reference/configuration.md) - All config options
- [REST API](../api-reference/rest-api.md) - API endpoints
- [Kubernetes Deployment](kubernetes.md) - Scale to production
- [Monitoring](../reference/metrics.md) - Prometheus metrics

## Resources

- **Repository:** [sekha-ai/sekha-docker](https://github.com/sekha-ai/sekha-docker)
- **Images:** [GitHub Container Registry](https://github.com/orgs/sekha-ai/packages)
- **Issues:** [Report problems](https://github.com/sekha-ai/sekha-docker/issues)
