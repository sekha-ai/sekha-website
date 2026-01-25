# Getting Started

Get Sekha Controller up and running in minutes.

## Quick Links

- [**Quickstart**](quickstart.md) - 5-minute setup with Docker
- [**Installation**](installation.md) - All installation methods
- [**Configuration**](configuration.md) - Configure Sekha for your needs
- [**First Conversation**](first-conversation.md) - Create your first memory

## What You'll Need

### Minimum Requirements

- **OS:** Linux, macOS, or Windows (with WSL2)
- **CPU:** 2+ cores
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 10GB free space
- **Docker:** 20.10+ (for Docker installation)

### Optional (for advanced features)

- **PostgreSQL** - For multi-user deployments
- **Kubernetes** - For high-availability deployments (Q2 2026)
- **Reverse Proxy** - nginx/Caddy for TLS termination

## Installation Options

### 1. Docker Compose (Recommended)

**Best for:** Quick start, development, single-server deployments

```bash
# Clone repository
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# Start all services
docker-compose up -d

# Verify
curl http://localhost:8080/health
```

**Includes:**
- Sekha Controller
- ChromaDB (vector store)
- Ollama (local LLM)
- SQLite (database)

[**Full Docker Compose Guide →**](../deployment/docker-compose.md)

### 2. Binary Installation

**Best for:** Lightweight deployments, custom setups

```bash
# Download latest release
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-linux-amd64

# Make executable
chmod +x sekha-controller-linux-amd64

# Run
./sekha-controller-linux-amd64
```

**Requires:**
- ChromaDB running separately
- Ollama running separately

[**Full Installation Guide →**](installation.md)

### 3. Cloud Deployments

**Best for:** Production, scalability, managed infrastructure

**Coming Soon** (Q2 2026):
- Kubernetes Helm charts
- AWS deployment guide
- Azure deployment guide
- GCP deployment guide

## Next Steps

After installation:

1. [**Configure Sekha**](configuration.md) - Set API keys, database, LLM providers
2. [**Create First Conversation**](first-conversation.md) - Test your installation
3. [**Integrate with Tools**](../integrations/index.md) - Claude Desktop, SDKs, APIs

## Learning Path

### For End Users

1. ✅ [Quickstart](quickstart.md) - Get running
2. ✅ [First Conversation](first-conversation.md) - Basic usage
3. ✅ [Claude Desktop Integration](../integrations/claude-desktop.md) - Use with Claude
4. ✅ [Guides](../guides/index.md) - Practical examples

### For Developers

1. ✅ [Installation](installation.md) - All install methods
2. ✅ [Configuration](configuration.md) - Detailed config
3. ✅ [REST API Reference](../api-reference/rest-api.md) - API docs
4. ✅ [SDK Documentation](../sdks/index.md) - Python/JavaScript SDKs
5. ✅ [Architecture](../architecture/index.md) - How it works

### For Operators

1. ✅ [Docker Compose](../deployment/docker-compose.md) - Deploy with Docker
2. ✅ [Production Guide](../deployment/production.md) - Production best practices
3. ✅ [Security](../deployment/security.md) - Harden your deployment
4. ✅ [Troubleshooting](../troubleshooting/index.md) - Fix common issues

## Support

Need help?

- **Discord:** [discord.gg/sekha](https://discord.gg/sekha)
- **GitHub Discussions:** [Ask questions](https://github.com/sekha-ai/sekha-controller/discussions)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
- **Email:** hello@sekha.dev
