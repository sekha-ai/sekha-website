# Installation

Complete installation guide for deploying Sekha.

## Docker Compose (Recommended)

The easiest way to get Sekha running with all required components.

### Prerequisites

- **Docker** 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.20+ (included with Docker Desktop)
- **8GB RAM** minimum (16GB recommended)
- **20GB free disk space**
- **Ollama** running on host (for local LLMs)

### Quick Install

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker/docker

# Copy environment template
cp .env.example .env

# Generate secure API keys (Linux/macOS)
export MCP_KEY=$(openssl rand -base64 32)
export REST_KEY=$(openssl rand -base64 32)
echo "MCP_API_KEY=$MCP_KEY" >> .env
echo "REST_API_KEY=$REST_KEY" >> .env

# Or manually edit .env
nano .env  # Set MCP_API_KEY and REST_API_KEY (32+ chars each)

# Start base services (Chroma + Redis)
docker compose up -d

# Start full stack (Controller + LLM Bridge + Proxy)
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d

# Verify installation
curl http://localhost:8080/health
```

### Expected Output

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T21:00:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"}
  }
}
```

### What Gets Deployed

| Service | Port | Required | Purpose |
|---------|------|----------|----------|
| **sekha-controller** | 8080 | ✅ Yes | Memory orchestration engine (Rust) |
| **llm-bridge** | 5001 | ✅ Yes | LLM operations via LiteLLM (Python) |
| **chroma** | 8000 | ✅ Yes | Vector similarity search |
| **redis** | 6379 | ✅ Yes | Celery task broker |
| **proxy** (optional) | 8081 | ❌ No | Transparent capture layer |

**External Dependency:**

- **Ollama** on host (port 11434) - Or configure OpenAI/Anthropic/other LLM providers

### Install Ollama (for local LLMs)

```bash
# macOS
brew install ollama
ollama serve

# Linux
curl -fsSL https://ollama.com/install.sh | sh
ollama serve

# Windows
winget install Ollama.Ollama
# Start Ollama from Start Menu

# Pull required models
ollama pull nomic-embed-text    # For embeddings
ollama pull llama3.1:8b          # For summarization
```

---

## Configuration

### Environment Variables (.env)

**Required Settings:**

```bash
# API Keys (REQUIRED - minimum 32 characters)
MCP_API_KEY=your-secure-key-here-min-32-chars
REST_API_KEY=your-secure-key-here-min-32-chars

# Ollama URL
# macOS/Windows: host.docker.internal
# Linux: 172.17.0.1 or your host IP
OLLAMA_URL=http://host.docker.internal:11434
```

**Optional Settings:**

```bash
# Ports (change if conflicts exist)
CONTROLLER_PORT=8080
PROXY_PORT=8081
CHROMA_PORT=8000

# LLM Models
EMBEDDING_MODEL=nomic-embed-text:latest
SUMMARIZATION_MODEL=llama3.1:8b

# Features
SUMMARIZATION_ENABLED=true
PRUNING_ENABLED=true
AUTO_INJECT_CONTEXT=true

# Memory Settings
CONTEXT_TOKEN_BUDGET=4000
DEFAULT_FOLDER=/conversations

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

See [Configuration Reference](configuration.md) for all options.

---

## Deployment Modes

### Development (Local Build)

Build from source instead of using pre-built images:

```bash
cd sekha-docker/docker

# Requires: sekha-controller, sekha-llm-bridge, sekha-proxy cloned as siblings
docker compose -f docker-compose.local.yml up -d
```

**Directory Structure:**
```
projects/
├── sekha-controller/
├── sekha-llm-bridge/
├── sekha-proxy/
└── sekha-docker/
    └── docker/
        ├── docker-compose.yml
        ├── docker-compose.local.yml
        └── .env
```

### Production

Optimized settings with resource limits:

```bash
cd sekha-docker/docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Differences from dev:**
- Pre-built images from GitHub Container Registry
- Resource limits (CPU/memory)
- Proper restart policies
- Production logging
- Security hardening

See [Production Deployment](../deployment/production.md) for full guide.

---

## Pre-Built Binaries

### Download Latest Release

```bash
# Linux x86_64
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-linux-x86_64.tar.gz
tar xzf sekha-linux-x86_64.tar.gz

# macOS (Apple Silicon)
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-darwin-arm64.tar.gz
tar xzf sekha-darwin-arm64.tar.gz

# macOS (Intel)
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-darwin-x86_64.tar.gz
tar xzf sekha-darwin-x86_64.tar.gz
```

### Manual Setup

When using pre-built binaries, you still need dependencies:

**1. Start ChromaDB:**

```bash
docker run -d --name chroma \
  -p 8000:8000 \
  -v chroma-data:/chroma/chroma \
  chromadb/chroma:latest
```

**2. Start Redis:**

```bash
docker run -d --name redis \
  -p 6379:6379 \
  redis:7.4-alpine
```

**3. Install LLM Bridge:**

```bash
git clone https://github.com/sekha-ai/sekha-llm-bridge.git
cd sekha-llm-bridge

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

python -m sekha_llm_bridge
```

**4. Configure Controller:**

```bash
# Create config.toml
cat > config.toml << EOF
[server]
host = "0.0.0.0"
port = 8080

[auth]
mcp_api_key = "your-secure-key-min-32-chars"
rest_api_key = "your-secure-key-min-32-chars"

[database]
url = "sqlite://./data/sekha.db"

[services]
chroma_url = "http://localhost:8000"
llm_bridge_url = "http://localhost:5001"
ollama_url = "http://localhost:11434"

[logging]
level = "info"
EOF

# Run controller
./sekha-controller --config config.toml
```

---

## Build from Source

### Prerequisites

- **Rust** 1.83+ ([rustup.rs](https://rustup.rs))
- **Python** 3.11+ ([python.org](https://python.org))
- **Git**
- **Docker** (for dependencies)

### Clone Repositories

```bash
# Create workspace
mkdir sekha-workspace
cd sekha-workspace

# Clone all repos
git clone https://github.com/sekha-ai/sekha-controller.git
git clone https://github.com/sekha-ai/sekha-llm-bridge.git
git clone https://github.com/sekha-ai/sekha-proxy.git  # optional
```

### Build Controller

```bash
cd sekha-controller

# Debug build (fast compile, slow runtime)
cargo build

# Release build (slow compile, fast runtime)
cargo build --release

# Run tests
cargo test

# Run
./target/release/sekha-controller --config config.toml
```

### Build LLM Bridge

```bash
cd sekha-llm-bridge

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run
python -m sekha_llm_bridge
```

### Build Proxy (Optional)

```bash
cd sekha-proxy

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python -m sekha_proxy
```

---

## Verification

### Health Checks

```bash
# Controller
curl http://localhost:8080/health
# Expected: {"status":"healthy",...}

# LLM Bridge
curl http://localhost:5001/health
# Expected: {"status":"healthy"}

# ChromaDB
curl http://localhost:8000/api/v1/heartbeat
# Expected: {"nanosecond heartbeat":...}

# Proxy (if running)
curl http://localhost:8081/health
# Expected: {"status":"healthy",...}
```

### Test Conversation

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-mcp-api-key" \
  -d '{
    "label": "Installation Test",
    "folder": "/test",
    "messages": [
      {
        "role": "user",
        "content": "Testing Sekha installation"
      },
      {
        "role": "assistant",
        "content": "Hello! Sekha is working correctly."
      }
    ]
  }'
```

**Expected Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Installation Test",
  "folder": "/test",
  "status": "active",
  "message_count": 2,
  "created_at": "2026-01-25T21:00:00"
}
```

### Check Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f controller
docker compose logs -f llm-bridge
docker compose logs -f chroma

# Last 100 lines
docker compose logs --tail=100 controller
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Change port in .env
CONTROLLER_PORT=8081

# Restart
docker compose down
docker compose up -d
```

### ChromaDB Connection Failed

```bash
# Verify ChromaDB is running
docker compose ps chroma

# Check health
curl http://localhost:8000/api/v1/heartbeat

# View logs
docker compose logs chroma

# Restart ChromaDB
docker compose restart chroma
```

### Ollama Not Accessible

**macOS/Windows:**

```bash
# Verify Ollama is running
curl http://localhost:11434/api/version

# Should return: {"version":"0.x.x"}

# Check .env has correct URL
OLLAMA_URL=http://host.docker.internal:11434
```

**Linux:**

```bash
# Use host IP instead of host.docker.internal
ip addr show docker0 | grep inet
# Use the IP shown (usually 172.17.0.1)

OLLAMA_URL=http://172.17.0.1:11434
```

### Missing Ollama Models

```bash
# List installed models
ollama list

# Pull required models
ollama pull nomic-embed-text
ollama pull llama3.1:8b

# Verify models loaded
ollama list
# Should show both models
```

### LLM Bridge Connection Failed

```bash
# Check if bridge is running
docker compose ps llm-bridge

# Test health endpoint
curl http://localhost:5001/health

# View logs
docker compose logs llm-bridge

# Check it can reach Ollama
docker compose exec llm-bridge curl http://host.docker.internal:11434/api/version
```

### Controller Can't Reach Services

```bash
# Verify network
docker network inspect sekha-docker_default

# Test from controller to chroma
docker compose exec controller curl http://chroma:8000/api/v1/heartbeat

# Test from controller to llm-bridge
docker compose exec controller curl http://llm-bridge:5001/health

# Check environment variables
docker compose exec controller env | grep SEKHA
```

### Permission Denied (Linux)

```bash
# Give Docker permission to data directory
sudo chown -R $USER:$USER ./data ./chroma_data
chmod -R 755 ./data ./chroma_data
```

See [Common Issues](../troubleshooting/common-issues.md) for more help.

---

## Next Steps

<div class="grid cards" markdown>

-   [:material-cog: **Configuration**](configuration.md)
    
    Customize Sekha settings

-   [:material-message-text: **First Conversation**](first-conversation.md)
    
    Store and retrieve your first conversation

-   [:material-api: **API Reference**](../api-reference/rest-api.md)
    
    Explore all 19 endpoints

-   [:material-rocket: **Production**](../deployment/production.md)
    
    Deploy for production use

</div>

---

*Installation guide updated: January 2026*
