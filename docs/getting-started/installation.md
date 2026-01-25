# Installation

Complete installation guide for all deployment methods.

## Docker Compose (Recommended)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM recommended
- 20GB free disk space

### Quick Install

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # or your preferred editor

# Start all services
docker compose up -d

# Verify installation
curl http://localhost:8080/health
```

### Expected Output

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "checks": {
    "database": "ok",
    "vector_store": "ok",
    "llm_bridge": "ok"
  }
}
```

## Pre-Built Binaries

### Download

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

### Setup Dependencies

```bash
# Start ChromaDB
docker run -d --name chroma \
  -p 8000:8000 \
  -v chroma-data:/chroma-data \
  chromadb/chroma

# Start Ollama
docker run -d --name ollama \
  -p 11434:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama

# Pull embedding model
docker exec ollama ollama pull nomic-embed-text

# Pull summarization model
docker exec ollama ollama pull llama3.1:8b
```

### Run Sekha

```bash
# Create config
cp config.example.toml config.toml
nano config.toml

# Run controller
./sekha-controller --config config.toml
```

## Build from Source

### Prerequisites

- Rust 1.83+ ([rustup.rs](https://rustup.rs))
- Python 3.9+ for LLM Bridge
- Git
- Docker for dependencies

### Clone Repository

```bash
# Controller (Rust)
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# LLM Bridge (Python)
git clone https://github.com/sekha-ai/sekha-llm-bridge.git
cd sekha-llm-bridge
```

### Build Controller

```bash
cd sekha-controller

# Debug build (fast compile)
cargo build

# Release build (optimized)
cargo build --release

# Run
./target/release/sekha-controller
```

### Setup LLM Bridge

```bash
cd sekha-llm-bridge

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run
python -m sekha_llm_bridge
```

## Cloud Deployment (Coming Soon)

Managed deployment options planned for Q1 2026.

### Supported Platforms

- **AWS** - ECS, EKS, EC2
- **Azure** - Container Instances, AKS
- **GCP** - Cloud Run, GKE
- **DigitalOcean** - Droplets, App Platform

One-click deploy buttons and Terraform modules coming soon.

## Verification

### Health Check

```bash
curl http://localhost:8080/health
```

### Create Test Conversation

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "label": "Installation Test",
    "messages": [
      {
        "role": "user",
        "content": "Testing Sekha installation"
      }
    ]
  }'
```

### Check Logs

```bash
# Docker Compose
docker compose logs -f

# Specific service
docker compose logs -f controller
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080
lsof -i :8080

# Change port in .env
SEKHA_PORT=8081
```

### ChromaDB Connection Failed

```bash
# Verify ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Check logs
docker logs chroma
```

### Ollama Model Not Found

```bash
# Pull required models
docker exec ollama ollama pull nomic-embed-text
docker exec ollama ollama pull llama3.1:8b

# List installed models
docker exec ollama ollama list
```

See [Common Issues](../troubleshooting/common-issues.md) for more help.

## Next Steps

- [Configuration](configuration.md) - Configure Sekha
- [First Conversation](first-conversation.md) - Try it out
- [Production Guide](../deployment/production.md) - Deploy to production
