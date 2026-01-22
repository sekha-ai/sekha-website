# Installation Guide

Complete installation options for Sekha AI Memory Controller.

## Choose Your Installation Method

=== "Docker (Recommended)"

    **Best for:** Most users, production deployments
    
    - ✅ All dependencies included
    - ✅ Easy upgrades
    - ✅ Consistent across platforms
    - ✅ Production-ready configuration

=== "From Source"

    **Best for:** Developers, contributors
    
    - ✅ Latest code
    - ✅ Customization
    - ✅ Learning the codebase
    - ⚠️ Requires Rust toolchain

=== "Pre-built Binary"

    **Best for:** Single-user, minimal setup
    
    - ✅ Fastest installation
    - ✅ No build required
    - ✅ Portable
    - ⚠️ Manual dependency management

## Method 1: Docker (Recommended)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM (16GB recommended)
- 10GB disk space

### Installation Steps

```bash
# 1. Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker

# 2. Review configuration
cat docker-compose.prod.yml

# 3. (Optional) Customize environment
cp .env.example .env
edit .env  # Update API keys, ports, etc.

# 4. Start services
docker compose -f docker-compose.prod.yml up -d

# 5. Verify installation
curl http://localhost:8080/health
```

### What Gets Installed

- **Sekha Controller** - Rust binary in Alpine Linux container
- **Sekha LLM Bridge** - Python service with Ollama integration
- **ChromaDB** - Vector database for semantic search
- **Ollama** - Local LLM runtime with nomic-embed-text model

### Docker Image Variants

```bash
# Latest stable
docker pull ghcr.io/sekha-ai/sekha-controller:latest

# Specific version
docker pull ghcr.io/sekha-ai/sekha-controller:v0.1.1

# Development (latest main)
docker pull ghcr.io/sekha-ai/sekha-controller:edge

# Multi-arch support (amd64/arm64)
docker pull ghcr.io/sekha-ai/sekha-controller:latest
```

## Method 2: From Source

### Prerequisites

- **Rust 1.83+** - Install from [rustup.rs](https://rustup.rs/)
- **Git**
- **SQLite3** development libraries
- **pkg-config**

#### Install Prerequisites

=== "macOS"

    ```bash
    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    
    # Install dependencies
    brew install pkg-config sqlite
    ```

=== "Ubuntu/Debian"

    ```bash
    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    
    # Install dependencies
    sudo apt update
    sudo apt install -y build-essential pkg-config libsqlite3-dev
    ```

=== "Fedora/RHEL"

    ```bash
    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    
    # Install dependencies
    sudo dnf install -y gcc pkg-config sqlite-devel
    ```

=== "Windows"

    ```powershell
    # Install Rust from https://rustup.rs/
    
    # Install Visual Studio Build Tools
    # Or use MSVC from Visual Studio
    
    # SQLite will be handled by cargo
    ```

### Build from Source

```bash
# 1. Clone repository
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# 2. Build release binary
cargo build --release

# 3. Binary location
./target/release/sekha-controller

# 4. (Optional) Install globally
cargo install --path .

# 5. Verify installation
sekha-controller --version
```

### Install Dependencies

Sekha Controller requires external services:

```bash
# Start ChromaDB
docker run -d \
  --name chroma \
  -p 8000:8000 \
  -v chroma_data:/chroma/chroma \
  chromadb/chroma:latest

# Start Ollama
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:latest

# Download embedding model
docker exec ollama ollama pull nomic-embed-text
```

### Configuration

Create `~/.sekha/config.toml`:

```toml
[server]
port = 8080
host = "0.0.0.0"
api_key = "your-secure-32-plus-character-api-key"

[database]
url = "sqlite://~/.sekha/data/sekha.db"

[vector_store]
chroma_url = "http://localhost:8000"
collection_name = "sekha_memory"

[llm]
ollama_url = "http://localhost:11434"
embedding_model = "nomic-embed-text:latest"
```

### Run

```bash
# Run directly
cargo run --release

# Or if installed globally
sekha-controller

# Run with custom config
sekha-controller --config /path/to/config.toml

# Run in background
nohup sekha-controller > ~/.sekha/logs/controller.log 2>&1 &
```

## Method 3: Pre-built Binary

### Download Binary

Download from [GitHub Releases](https://github.com/sekha-ai/sekha-controller/releases):

```bash
# Linux x86_64
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-linux-x86_64
chmod +x sekha-controller-linux-x86_64
sudo mv sekha-controller-linux-x86_64 /usr/local/bin/sekha-controller

# macOS (Intel)
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-macos-x86_64
chmod +x sekha-controller-macos-x86_64
sudo mv sekha-controller-macos-x86_64 /usr/local/bin/sekha-controller

# macOS (Apple Silicon)
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-macos-aarch64
chmod +x sekha-controller-macos-aarch64
sudo mv sekha-controller-macos-aarch64 /usr/local/bin/sekha-controller
```

### Install Dependencies

Same as "From Source" method - you need:
- ChromaDB
- Ollama with nomic-embed-text model

### Verify

```bash
sekha-controller --version
# Expected: sekha-controller 0.1.1
```

## Install LLM Bridge (All Methods)

The LLM Bridge handles embeddings and summarization:

```bash
# Clone bridge repository
git clone https://github.com/sekha-ai/sekha-llm-bridge.git
cd sekha-llm-bridge

# Install dependencies
pip install -r requirements.txt

# Run bridge
python -m sekha_llm_bridge.main

# Or use Docker
docker run -d \
  --name sekha-llm-bridge \
  -p 5001:5001 \
  --network host \
  ghcr.io/sekha-ai/sekha-llm-bridge:latest
```

## Verification Checklist

After installation, verify all components:

```bash
# 1. Controller health
curl http://localhost:8080/health
# Expected: {"status":"healthy"}

# 2. ChromaDB health
curl http://localhost:8000/api/v1/heartbeat
# Expected: {"nanosecond heartbeat": ...}

# 3. Ollama health
curl http://localhost:11434/api/tags
# Expected: {"models": [{"name": "nomic-embed-text", ...}]}

# 4. LLM Bridge health
curl http://localhost:5001/health
# Expected: {"status":"healthy"}

# 5. Test conversation storage
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"label":"Test","messages":[{"role":"user","content":"Test"}]}'
# Expected: {"id":"...","conversation_id":"..."}
```

## System Service (Optional)

### systemd Service (Linux)

Create `/etc/systemd/system/sekha-controller.service`:

```ini
[Unit]
Description=Sekha Controller
After=network.target

[Service]
Type=simple
User=sekha
WorkingDirectory=/opt/sekha
ExecStart=/usr/local/bin/sekha-controller
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable sekha-controller
sudo systemctl start sekha-controller
sudo systemctl status sekha-controller
```

### launchd Service (macOS)

Create `~/Library/LaunchAgents/dev.sekha.controller.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>dev.sekha.controller</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/sekha-controller</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
```

Load service:
```bash
launchctl load ~/Library/LaunchAgents/dev.sekha.controller.plist
launchctl start dev.sekha.controller
```

## Upgrading

### Docker

```bash
# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Restart with new images
docker compose -f docker-compose.prod.yml up -d
```

### From Source

```bash
cd sekha-controller
git pull origin main
cargo build --release
sudo systemctl restart sekha-controller
```

### Binary

Download latest release and replace binary, then restart service.

## Uninstalling

### Docker

```bash
cd sekha-docker
docker compose -f docker-compose.prod.yml down -v  # ⚠️ Removes data
```

### Manual

```bash
# Stop service
sudo systemctl stop sekha-controller
sudo systemctl disable sekha-controller

# Remove binary
sudo rm /usr/local/bin/sekha-controller

# Remove data (⚠️ cannot be undone)
rm -rf ~/.sekha
```

## Next Steps

- **[Configure Sekha](configuration.md)** - Customize settings
- **[First Conversation](first-conversation.md)** - Complete tutorial
- **[API Reference](../api-reference/rest-api.md)** - Explore endpoints
- **[Deployment Guide](../deployment/index.md)** - Production deployment

## Troubleshooting

If you encounter issues, see:

- [Common Issues](../troubleshooting/common-issues.md)
- [Debugging Guide](../troubleshooting/debugging.md)
- [Discord Community](https://discord.gg/sekha)