# Getting Started

Get Sekha up and running in minutes.

## Quick Navigation

### [1. Quickstart](quickstart.md)

Fastest way to try Sekha (5 minutes):

- Docker Compose one-liner
- Test with sample conversation
- Verify installation

[**Start here →**](quickstart.md)

### [2. Installation](installation.md)

Complete installation options:

- Docker Compose (recommended)
- Pre-built binaries
- Build from source
- Cloud deployment (coming soon)

[**Installation Guide →**](installation.md)

### [3. Configuration](configuration.md)

Configure Sekha for your needs:

- Environment variables
- Config file options
- LLM provider setup
- Storage configuration

[**Configuration Guide →**](configuration.md)

### [4. First Conversation](first-conversation.md)

Store and retrieve your first memory:

- Create a conversation
- Perform semantic search
- Assemble context for LLM

[**First Steps →**](first-conversation.md)

## What You Need

### Minimum Requirements

- **OS:** Linux, macOS, or Windows with WSL2
- **Docker:** 20.10+ with Docker Compose
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 10GB available
- **CPU:** 2 cores minimum

### Recommended Setup

- **RAM:** 16GB for Ollama models
- **Storage:** 50GB+ for models and data
- **CPU:** 4+ cores for better performance
- **GPU:** Optional, for faster embeddings

## Deployment Options

### Development (Local)

Best for:
- Learning Sekha
- Development
- Personal use

```bash
cd sekha-docker
docker compose up -d
```

### Production (Server)

Best for:
- Team deployments
- Public APIs
- High availability

```bash
cd sekha-docker
docker compose -f docker-compose.prod.yml up -d
```

See [Production Guide](../deployment/production.md) for details.

### Cloud (Coming Soon)

Managed deployment options:

- **AWS** - Coming Q1 2026
- **Azure** - Coming Q1 2026  
- **GCP** - Coming Q1 2026
- **DigitalOcean** - Coming Q2 2026

## Learning Path

### For Developers

1. [Quickstart](quickstart.md) - Get running
2. [First Conversation](first-conversation.md) - Basic usage
3. [API Reference](../api-reference/rest-api.md) - Learn the API
4. [Python SDK](../sdks/python-sdk.md) - Use the SDK
5. [AI Coding Assistant](../guides/ai-coding-assistant.md) - Build something

### For Users

1. [Quickstart](quickstart.md) - Installation
2. [Claude Desktop](../integrations/claude-desktop.md) - MCP setup
3. [First Conversation](first-conversation.md) - Try it out
4. [FAQ](../troubleshooting/faq.md) - Common questions

### For DevOps

1. [Installation](installation.md) - Deployment options
2. [Configuration](configuration.md) - Settings
3. [Production Guide](../deployment/production.md) - Production setup
4. [Security](../deployment/security.md) - Hardening

## Next Steps

**Start with the [Quickstart Guide](quickstart.md) →**

Or explore:

- [Architecture](../architecture/overview.md) - How it works
- [Integrations](../integrations/) - Connect to tools
- [Guides](../guides/) - Use case examples
