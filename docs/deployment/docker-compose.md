# Docker Compose Deployment

Complete Sekha stack deployment using Docker Compose.

## Quick Start

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker/docker

# Configure environment
cp .env.example .env
# Edit .env and set MCP_API_KEY and REST_API_KEY (32+ chars each)

# Start full stack
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d

# Verify
curl http://localhost:8080/health
```

## What Gets Deployed

### Required Services

| Service | Port | Purpose | Image |
|---------|------|---------|-------|
| **controller** | 8080 | Memory orchestration engine | `ghcr.io/sekha-ai/sekha-controller` |
| **llm-bridge** | 5001 | LLM operations (LiteLLM) | `ghcr.io/sekha-ai/sekha-mcp` |
| **chroma** | 8000 | Vector similarity search | `chromadb/chroma` |
| **redis** | 6379 | Celery task broker | `redis:7.4-alpine` |

### Optional Services

| Service | Port | Purpose | When to Use |
|---------|------|---------|-------------|
| **proxy** | 8081 | Transparent capture layer | For generic LLM clients |
| **ollama** | 11434 | Local LLM runtime | If not using cloud LLMs |

**External Dependency:** Ollama running on host (or configure cloud LLM providers)

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│  SEKHA CONTROLLER (Rust) - Port 8080                        │
│  • REST API (19 endpoints)                                   │
│  • MCP Server (7 tools)                                      │
│  • 4-phase context assembly                                  │
└────────────────────┬──────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌─────────┐
   │ SQLite │  │ Chroma │  │ LLM     │
   │  :8080 │  │  :8000 │  │ Bridge  │
   │        │  │        │  │  :5001  │
   └────────┘  └────────┘  └────┬────┘
                                │
                     ┌──────────┼──────────┐
                     ▼          ▼          ▼
                ┌───────────┬──────────┬──────────┐
                │  Ollama  │  OpenAI │  Claude  │
                │  (host)  │  (API)  │  (API)   │
                └───────────┴──────────┴──────────┘
                     + 97 more via LiteLLM


┌───────────────────────────────────────────────────────────┐
│  PROXY (Python) - OPTIONAL - Port 8081                      │
│  • Transparent capture for generic LLM clients              │
│  • Auto-injects context from past conversations             │
│  • OpenAI-compatible API endpoint                           │
└───────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

### Copy Template

```bash
cd sekha-docker/docker
cp .env.example .env
```

### Required Settings

```bash
# API Keys (REQUIRED - minimum 32 characters each)
MCP_API_KEY=your-secure-mcp-key-here-min-32-chars
REST_API_KEY=your-secure-rest-key-here-min-32-chars

# Ollama URL
# macOS/Windows Docker Desktop:
OLLAMA_URL=http://host.docker.internal:11434

# Linux:
OLLAMA_URL=http://172.17.0.1:11434
```

### Generate Secure Keys

```bash
# Linux/macOS
export MCP_KEY=$(openssl rand -base64 32)
export REST_KEY=$(openssl rand -base64 32)
echo "MCP_API_KEY=$MCP_KEY" >> .env
echo "REST_API_KEY=$REST_KEY" >> .env

# Windows PowerShell
$MCP_KEY = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$REST_KEY = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
"MCP_API_KEY=$MCP_KEY" | Out-File -Append .env
"REST_API_KEY=$REST_KEY" | Out-File -Append .env
```

### Optional Settings

```bash
# Service Ports
CONTROLLER_PORT=8080
PROXY_PORT=8081
CHROMA_PORT=8000
LLM_BRIDGE_PORT=5001

# LLM Models
EMBEDDING_MODEL=nomic-embed-text:latest
SUMMARIZATION_MODEL=llama3.1:8b

# Features
SUMMARIZATION_ENABLED=true
PRUNING_ENABLED=true
AUTO_INJECT_CONTEXT=true

# Memory
CONTEXT_TOKEN_BUDGET=4000
DEFAULT_FOLDER=/conversations
EXCLUDED_FOLDERS=

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

---

## Deployment Modes

### Development (Pre-built Images)

Uses pre-built images from GitHub Container Registry:

```bash
cd sekha-docker/docker

# Base services only (Chroma + Redis)
docker compose up -d

# Full stack (+ Controller + LLM Bridge)
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d

# With proxy (optional)
docker compose -f docker-compose.yml -f docker-compose.full.yml -f docker-compose.proxy.yml up -d
```

### Local Build from Source

**Requirements:**
- All repos cloned as siblings:
  ```
  projects/
  ├── sekha-controller/
  ├── sekha-llm-bridge/
  ├── sekha-proxy/         (optional)
  └── sekha-docker/
      └── docker/
  ```

```bash
cd sekha-docker/docker

# Build and run from source
docker compose -f docker-compose.local.yml up -d

# View build logs
docker compose -f docker-compose.local.yml logs -f
```

### Production

Optimized for production with resource limits and security:

```bash
cd sekha-docker/docker

# Production stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Production optimizations:**
- Pre-built images from registry
- Resource limits (CPU/memory)
- Proper restart policies
- Production logging configuration
- Health check intervals

---

## Compose Files Reference

```
sekha-docker/docker/
├── docker-compose.yml           # Base: Chroma + Redis
├── docker-compose.full.yml      # Adds: Controller + LLM Bridge
├── docker-compose.prod.yml      # Production settings
├── docker-compose.local.yml     # Local build from source
├── docker-compose.dev.yml       # Development mode
└── .env.example                 # Environment template
```

### Base Services (docker-compose.yml)

```yaml
services:
  chroma:
    image: chromadb/chroma:latest
    ports:
      - "${CHROMA_PORT:-8000}:8000"
    volumes:
      - chroma-data:/chroma/chroma
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]
    restart: unless-stopped

  redis:
    image: redis:7.4-alpine
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
    restart: unless-stopped
```

### Full Stack (docker-compose.full.yml)

Extends base with Controller and LLM Bridge:

```yaml
services:
  controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    ports:
      - "${CONTROLLER_PORT:-8080}:8080"
    environment:
      - SEKHA__MCP_API_KEY=${MCP_API_KEY:?MCP_API_KEY required}
      - SEKHA__REST_API_KEY=${REST_API_KEY:-}
      - SEKHA__DATABASE_URL=${DATABASE_URL:-sqlite:///data/sekha.db}
      - SEKHA__CHROMA_URL=http://chroma:8000
      - SEKHA__LLM_BRIDGE_URL=http://llm-bridge:5001
      - SEKHA__OLLAMA_URL=${OLLAMA_URL:-http://host.docker.internal:11434}
    volumes:
      - ./data:/data
    depends_on:
      chroma:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
    restart: unless-stopped

  llm-bridge:
    image: ghcr.io/sekha-ai/sekha-mcp:latest
    ports:
      - "${LLM_BRIDGE_PORT:-5001}:5001"
    environment:
      - OLLAMA_URL=${OLLAMA_URL:-http://host.docker.internal:11434}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
    restart: unless-stopped
```

---

## Common Commands

### Starting Services

```bash
# Full stack (daemon mode)
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d

# With logs (foreground)
docker compose -f docker-compose.yml -f docker-compose.full.yml up

# Specific services only
docker compose up chroma redis
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f controller
docker compose logs -f llm-bridge

# Last N lines
docker compose logs --tail=100 controller

# Since timestamp
docker compose logs --since 2026-01-25T20:00:00 controller
```

### Managing Services

```bash
# Stop all
docker compose down

# Stop without removing containers
docker compose stop

# Restart service
docker compose restart controller

# Rebuild and restart
docker compose up -d --build controller

# Remove volumes (DELETES DATA!)
docker compose down -v
```

### Inspecting Services

```bash
# List running services
docker compose ps

# Service details
docker compose ps controller

# Execute command in container
docker compose exec controller sh

# View environment variables
docker compose exec controller env
```

---

## Verification

### Health Checks

```bash
# All services
curl http://localhost:8080/health    # Controller
curl http://localhost:5001/health    # LLM Bridge
curl http://localhost:8000/api/v1/heartbeat  # ChromaDB
docker compose exec redis redis-cli ping    # Redis
```

### Test Conversation

```bash
# Set your API key
export SEKHA_KEY="your-mcp-api-key-from-env"

# Create conversation
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEKHA_KEY" \
  -d '{
    "label": "Docker Test",
    "folder": "/test",
    "messages": [
      {"role": "user", "content": "Testing Docker deployment"},
      {"role": "assistant", "content": "Hello from Sekha!"}
    ]
  }'

# Search
curl -X POST http://localhost:8080/api/v1/memory/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEKHA_KEY" \
  -d '{"query": "docker", "limit": 5}'
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check status
docker compose ps

# View detailed logs
docker compose logs controller

# Check for port conflicts
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Verify .env file
cat .env | grep -E "MCP_API_KEY|REST_API_KEY|OLLAMA_URL"
```

### Controller Health Check Fails

```bash
# Check dependencies
curl http://localhost:8000/api/v1/heartbeat  # Chroma should respond
docker compose exec redis redis-cli ping    # Should return PONG

# Check controller can reach them
docker compose exec controller curl http://chroma:8000/api/v1/heartbeat
docker compose exec controller sh -c 'nc -zv redis 6379'

# View controller logs
docker compose logs --tail=50 controller
```

### Ollama Connection Issues

**macOS/Windows:**
```bash
# Verify Ollama running on host
curl http://localhost:11434/api/version

# Check .env has correct URL
cat .env | grep OLLAMA_URL
# Should be: OLLAMA_URL=http://host.docker.internal:11434
```

**Linux:**
```bash
# Get Docker bridge IP
ip addr show docker0 | grep 'inet '
# Usually 172.17.0.1

# Update .env
OLLAMA_URL=http://172.17.0.1:11434

# Test from container
docker compose exec llm-bridge curl http://172.17.0.1:11434/api/version
```

### Missing Models

```bash
# Check installed models
ollama list

# Pull required models
ollama pull nomic-embed-text
ollama pull llama3.1:8b

# Verify models loaded
ollama list
# Should show both models with "latest" tag
```

### Permission Errors (Linux)

```bash
# Fix data directory permissions
sudo chown -R $USER:$USER ./data ./chroma_data
chmod -R 755 ./data ./chroma_data

# Restart services
docker compose restart
```

### Out of Memory

```bash
# Check container memory
docker stats

# Increase Docker Desktop memory limit:
# Docker Desktop > Settings > Resources > Memory

# Or add limits to compose file:
services:
  controller:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## Updating

### Pull Latest Images

```bash
# Stop services
docker compose down

# Pull new images
docker compose pull

# Start with new images
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d
```

### Backup Before Update

```bash
# Backup SQLite database
docker compose exec controller cat /data/sekha.db > sekha-backup-$(date +%Y%m%d).db

# Backup entire data volume
docker run --rm \
  -v sekha-docker_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/sekha-data-$(date +%Y%m%d).tar.gz /data

# Backup ChromaDB
docker run --rm \
  -v sekha-docker_chroma-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/chroma-data-$(date +%Y%m%d).tar.gz /data
```

### Restore from Backup

```bash
# Restore SQLite
docker compose exec -T controller sh -c 'cat > /data/sekha.db' < sekha-backup-20260125.db

# Restore data volume
docker run --rm \
  -v sekha-docker_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/sekha-data-20260125.tar.gz -C /
```

---

## Production Recommendations

### Security

```bash
# Strong API keys (32+ characters)
export MCP_KEY=$(openssl rand -base64 32)
export REST_KEY=$(openssl rand -base64 32)

# Don't expose internal ports
# Only expose 8080 (and 8081 if using proxy)
# Use reverse proxy (nginx/traefik) with TLS

# Enable firewall
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 8080/tcp  # Don't expose directly
```

### Resource Limits

Add to `docker-compose.prod.yml`:

```yaml
services:
  controller:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  llm-bridge:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

### Monitoring

```bash
# Prometheus metrics
curl http://localhost:8080/metrics

# Health monitoring script
watch -n 10 'curl -s http://localhost:8080/health | jq'

# Container stats
docker stats
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * cd /path/to/sekha-docker/docker && docker compose exec -T controller cat /data/sekha.db > ~/backups/sekha-$(date +\%Y\%m\%d).db

# Weekly full backup
0 3 * * 0 cd /path/to/sekha-docker/docker && docker run --rm -v sekha-docker_data:/data -v ~/backups:/backup alpine tar czf /backup/full-$(date +\%Y\%m\%d).tar.gz /data
```

---

## Next Steps

<div class="grid cards" markdown>

-   [:material-shield-lock: **Production Guide**](production.md)
    
    Security hardening and best practices

-   [:material-shield-check: **Security**](security.md)
    
    Comprehensive security configuration

-   [:material-kubernetes: **Kubernetes**](kubernetes.md)
    
    Scale to production with K8s

-   [:material-chart-line: **Monitoring**](monitoring.md)
    
    Prometheus and Grafana setup

</div>

---

## Resources

- **Repository:** [sekha-ai/sekha-docker](https://github.com/sekha-ai/sekha-docker)
- **Container Registry:** [GitHub Packages](https://github.com/orgs/sekha-ai/packages)
- **Issues:** [Report problems](https://github.com/sekha-ai/sekha-docker/issues)
- **Discussions:** [Ask questions](https://github.com/sekha-ai/sekha-controller/discussions)

*Last updated: January 2026*
