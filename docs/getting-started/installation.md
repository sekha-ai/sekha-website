# Installation Guide

Sekha supports multiple installation methods. Choose the one that best fits your needs.

## Recommended: Docker Compose

**Best for:** Most users, teams, consistent environment, production

### Prerequisites

- Docker Desktop 24.0+ or Docker Engine 24.0+
- Docker Compose 2.0+
- 4GB free disk space
- 2GB available RAM

### Quick Install

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker

# Copy example configuration
cp config.example.toml config.toml

# Edit configuration (see Configuration section below)
nano config.toml

# Start all services
docker compose up -d

# Verify installation
curl http://localhost:8080/health
```

### What Gets Installed

The default `docker-compose.yml` includes:

| Service | Port | Description |
|---------|------|-------------|
| `sekha-controller` | 8080 | Main API server (Rust) |
| `sekha-bridge` | 5001 | LLM operations (Python) |
| `chromadb` | 8000 | Vector database |
| `ollama` | 11434 | Local LLM runtime |

**Optional services** (in `docker-compose.full.yml`):

- PostgreSQL (port 5432) - For multi-user deployments
- Redis (port 6379) - For caching and scaling

### Variants

```bash
# Development (hot reload, debug)
docker compose -f docker-compose.dev.yml up

# Production (optimized)
docker compose -f docker-compose.prod.yml up -d

# Full stack (includes monitoring)
docker compose -f docker-compose.full.yml up -d
```

---

## Local Binary

**Best for:** Developers, minimal setup, offline use

### Option A: Pre-built Binary

```bash
# Download latest release
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-linux-x86_64

# Make executable
chmod +x sekha-controller-linux-x86_64

# Move to PATH
sudo mv sekha-controller-linux-x86_64 /usr/local/bin/sekha-controller

# Initialize configuration
sekha-controller setup

# Start server
sekha-controller start
```

**Supported platforms:**
- Linux (x86_64, ARM64)
- macOS (x86_64, Apple Silicon)
- Windows (x86_64)

### Option B: Cargo Install

!!! note "Not Yet Available"
    
    The Rust crate is not yet published to crates.io due to upstream dependencies.
    Use GitHub installation instead:
    
    ```bash
    cargo install --git https://github.com/sekha-ai/sekha-controller
    ```

### Option C: Install Script

```bash
curl -sSL https://install.sekha.dev | bash
```

This script:
1. Detects your OS and architecture
2. Downloads the correct binary
3. Installs to `/usr/local/bin`
4. Creates `~/.sekha/config.toml`
5. Sets up systemd service (Linux)

### Dependencies

You'll need **Ollama** for embeddings:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull embedding model
ollama pull nomic-embed-text

# Start Ollama (runs on localhost:11434)
ollama serve
```

---

## Build from Source

**Best for:** Contributors, custom builds

### Prerequisites

- Rust 1.83+ (`rustup` recommended)
- SQLite3 development headers
- Build tools (gcc, make)

=== "Ubuntu/Debian"

    ```bash
    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    
    # Install dependencies
    sudo apt install build-essential libsqlite3-dev pkg-config
    ```

=== "macOS"

    ```bash
    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    
    # SQLite comes pre-installed
    # Install build tools if needed
    xcode-select --install
    ```

=== "Windows"

    1. Install [Rust](https://www.rust-lang.org/tools/install)
    2. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
    3. Install [SQLite](https://www.sqlite.org/download.html)

### Build Steps

```bash
# Clone repository
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# Build release binary
cargo build --release

# Binary location
./target/release/sekha-controller

# Optional: Install globally
cargo install --path .
```

### Development Build

```bash
# Clone with all submodules
git clone --recursive https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# Start dependencies (ChromaDB + Ollama)
docker compose -f docker-compose.dev.yml up -d

# Run in development mode (auto-reload)
cargo watch -x run

# Run tests
cargo test

# Check code coverage
cargo tarpaulin --out Html
```

---

## Kubernetes

**Best for:** Production, enterprises, high availability

### Prerequisites

- Kubernetes cluster 1.25+
- `kubectl` configured
- Helm 3.x (optional but recommended)

### Helm Installation (Recommended)

```bash
# Add Sekha Helm repository
helm repo add sekha https://charts.sekha.dev
helm repo update

# Install with default values
helm install my-sekha sekha/sekha-controller

# Install with custom values
helm install my-sekha sekha/sekha-controller \
  --set replicaCount=3 \
  --set storage.size=100Gi \
  --namespace sekha \
  --create-namespace
```

### Raw Manifests

```bash
# Clone deployment repo
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker/k8s

# Create namespace
kubectl create namespace sekha

# Apply manifests
kubectl apply -f configmap.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods -n sekha
```

See [Kubernetes Deployment Guide](../deployment/kubernetes.md) for details.

---

## Cloud Platforms

### AWS (ECS + Fargate)

```bash
cd cloud/aws
terraform init
terraform apply
```

See [AWS Deployment Guide](../deployment/aws.md)

### Azure (Container Instances)

```bash
cd cloud/azure
./deploy.sh
```

See [Azure Deployment Guide](../deployment/azure.md)

### GCP (Cloud Run)

```bash
cd cloud/gcp
./deploy.sh
```

See [GCP Deployment Guide](../deployment/gcp.md)

---

## Post-Installation

### 1. Verify Installation

```bash
# Check health
curl http://localhost:8080/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2026-01-25T14:30:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"}
  }
}
```

### 2. Change API Key

!!! warning "Security"
    The default API key `dev-key-replace-in-production` should be changed immediately!

Edit `config.toml`:

```toml
[server]
api_key = "sk-sekha-your-secure-key-min-32-chars-long"
```

Generate a secure key:

```bash
openssl rand -base64 32
```

### 3. Configure LLM Provider

=== "Ollama (Default)"

    ```toml
    [llm]
    provider = "ollama"
    ollama_url = "http://localhost:11434"
    embedding_model = "nomic-embed-text"
    ```

=== "OpenAI (Future)"

    ```toml
    [llm]
    provider = "openai"
    api_key = "sk-..."
    embedding_model = "text-embedding-3-small"
    ```

=== "Anthropic (Future)"

    ```toml
    [llm]
    provider = "anthropic"
    api_key = "sk-ant-..."
    embedding_model = "voyage-2"
    ```

### 4. Test First Conversation

See [First Conversation Tutorial](first-conversation.md)

---

## Upgrading

### Docker

```bash
cd sekha-docker

# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d
```

### Binary

```bash
# Download new version
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-linux-x86_64

# Stop old version
sudo systemctl stop sekha-controller

# Replace binary
sudo mv sekha-controller-linux-x86_64 /usr/local/bin/sekha-controller
chmod +x /usr/local/bin/sekha-controller

# Start new version
sudo systemctl start sekha-controller
```

### Kubernetes

```bash
# Update Helm chart
helm upgrade my-sekha sekha/sekha-controller

# Or update image directly
kubectl set image deployment/sekha-controller \
  sekha-controller=ghcr.io/sekha-ai/sekha-controller:v1.2.0 \
  -n sekha
```

---

## Uninstalling

### Docker

```bash
# Stop and remove containers
docker compose down

# Remove data volumes (DESTRUCTIVE)
docker compose down -v
```

### Binary

```bash
# Stop service
sudo systemctl stop sekha-controller
sudo systemctl disable sekha-controller

# Remove binary
sudo rm /usr/local/bin/sekha-controller

# Remove data (optional)
rm -rf ~/.sekha
```

### Kubernetes

```bash
# Helm
helm uninstall my-sekha -n sekha

# Raw manifests
kubectl delete namespace sekha
```

---

## Troubleshooting

??? question "Port 8080 already in use?"

    **Change the port in config.toml:**
    
    ```toml
    [server]
    port = 9090
    ```
    
    Or use environment variable:
    ```bash
    export SEKHA_SERVER_PORT=9090
    ```

??? question "ChromaDB connection fails?"

    **Ensure ChromaDB is running:**
    
    ```bash
    docker run -d -p 8000:8000 chromadb/chroma
    ```
    
    **Or install locally:**
    ```bash
    pip install chromadb
    chroma run --host 0.0.0.0 --port 8000
    ```

??? question "Ollama not found?"

    **Install Ollama:**
    
    ```bash
    curl -fsSL https://ollama.com/install.sh | sh
    ollama serve
    ollama pull nomic-embed-text
    ```

---

## Next Steps

- [Configure Sekha](configuration.md) - Customize for your needs
- [First Conversation](first-conversation.md) - Store your first memory
- [API Reference](../api-reference/rest-api.md) - Full API documentation
- [Deployment Guides](../deployment/docker-compose.md) - Production deployment

---

!!! question "Need Help?"

    - [:material-github: GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
    - [:simple-discord: Discord Community](https://discord.gg/sekha)
    - [:material-email: Email Support](mailto:hello@sekha.dev)