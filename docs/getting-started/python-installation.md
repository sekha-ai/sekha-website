# Python Package Installation

Install Sekha components as Python packages for development, testing, or standalone deployments.

## Available Packages

### sekha-llm-bridge

The universal LLM adapter that enables the Controller to work with any LLM provider.

[![PyPI](https://img.shields.io/pypi/v/sekha-llm-bridge.svg)](https://pypi.org/project/sekha-llm-bridge/)
[![Python Versions](https://img.shields.io/pypi/pyversions/sekha-llm-bridge.svg)](https://pypi.org/project/sekha-llm-bridge/)

**Installation:**

```bash
pip install sekha-llm-bridge
```

**Requirements:**
- Python 3.12+
- Redis (for Celery task queue)
- Ollama or other LLM provider

**Quick Start:**

```bash
# Install
pip install sekha-llm-bridge

# Configure
export OLLAMA_URL=http://localhost:11434
export REDIS_URL=redis://localhost:6379/0

# Run
python -m sekha_llm_bridge.main
```

### sekha-mcp

MCP (Model Context Protocol) server that exposes Sekha memory tools to Claude Desktop, Claude Code, and any MCP-compatible client.

[![PyPI](https://img.shields.io/pypi/v/sekha-mcp.svg)](https://pypi.org/project/sekha-mcp/)
[![Python Versions](https://img.shields.io/pypi/pyversions/sekha-mcp.svg)](https://pypi.org/project/sekha-mcp/)

**Installation:**

```bash
pip install sekha-mcp
```

**Requirements:**
- Python 3.11+
- Sekha Controller running (localhost:8080)
- Valid Controller API key

**Quick Start:**

```bash
# Install
pip install sekha-mcp

# Configure
export CONTROLLER_URL=http://localhost:8080
export CONTROLLER_API_KEY=your-api-key-here

# Run
python -m sekha_mcp
```

---

## Use Cases

### Development

Install packages locally for development and debugging:

```bash
# Clone repositories
git clone https://github.com/sekha-ai/sekha-llm-bridge.git
git clone https://github.com/sekha-ai/sekha-mcp.git

# Install in editable mode
cd sekha-llm-bridge
pip install -e ".[dev]"

cd ../sekha-mcp
pip install -e ".[dev]"

# Run tests
pytest
```

### Standalone Deployment

Run Python components outside of Docker:

```bash
# Install both packages
pip install sekha-llm-bridge sekha-mcp

# Configure environment
cat > .env << 'EOF'
# LLM Bridge
OLLAMA_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text:latest
SUMMARIZATION_MODEL=llama3.1:8b
REDIS_URL=redis://localhost:6379/0

# MCP Server
CONTROLLER_URL=http://localhost:8080
CONTROLLER_API_KEY=your-secure-key-here
EOF

# Source environment
export $(cat .env | xargs)

# Run services
python -m sekha_llm_bridge.main &  # LLM Bridge on :5001
python -m sekha_mcp &               # MCP server (stdio)
```

### Custom Integration

Use as libraries in your Python applications:

```python
from sekha_llm_bridge.services.embedding_service import EmbeddingService
from sekha_mcp.server import create_mcp_server

# Use embedding service
embedding_service = EmbeddingService()
embedding = await embedding_service.generate_embedding(
    text="Hello, world!",
    model="nomic-embed-text:latest"
)

# Create custom MCP server
server = create_mcp_server(
    controller_url="http://localhost:8080",
    api_key="your-key"
)
```

### Testing

Install for integration testing:

```python
# test_integration.py
import pytest
from sekha_llm_bridge.services import EmbeddingService

@pytest.mark.asyncio
async def test_embedding_generation():
    service = EmbeddingService()
    result = await service.generate_embedding(
        text="Test message",
        model="nomic-embed-text:latest"
    )
    assert len(result["embedding"]) == 768
    assert result["model"] == "nomic-embed-text:latest"
```

---

## Installation Options

### Standard Installation

```bash
# Base package
pip install sekha-llm-bridge
pip install sekha-mcp
```

### With Development Tools

```bash
# Include pytest, ruff, black, mypy
pip install sekha-llm-bridge[dev]
pip install sekha-mcp[dev]
```

### From Source (Latest)

```bash
# Install directly from GitHub
pip install git+https://github.com/sekha-ai/sekha-llm-bridge.git
pip install git+https://github.com/sekha-ai/sekha-mcp.git

# Or specific branch/tag
pip install git+https://github.com/sekha-ai/sekha-llm-bridge.git@main
pip install git+https://github.com/sekha-ai/sekha-mcp.git@v0.2.0
```

### Poetry

```bash
# Add to pyproject.toml
poetry add sekha-llm-bridge
poetry add sekha-mcp

# Or with groups
poetry add --group dev sekha-llm-bridge[dev]
poetry add --group dev sekha-mcp[dev]
```

---

## Configuration

### LLM Bridge Environment Variables

```bash
# Server
HOST=0.0.0.0
PORT=5001

# Ollama (local LLMs)
OLLAMA_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text:latest
SUMMARIZATION_MODEL=llama3.1:8b

# Redis (Celery task queue)
REDIS_URL=redis://localhost:6379/0

# Cloud Providers (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Logging
LOG_LEVEL=INFO
```

### MCP Server Environment Variables

```bash
# Controller connection
CONTROLLER_URL=http://localhost:8080
CONTROLLER_API_KEY=your-secure-key-here

# Logging
LOG_LEVEL=INFO
```

---

## Systemd Service Example

For production Linux deployments:

**LLM Bridge Service** (`/etc/systemd/system/sekha-llm-bridge.service`):

```ini
[Unit]
Description=Sekha LLM Bridge
After=network.target redis.service
Requires=redis.service

[Service]
Type=simple
User=sekha
Group=sekha
WorkingDirectory=/opt/sekha
EnvironmentFile=/opt/sekha/.env
ExecStart=/opt/sekha/venv/bin/python -m sekha_llm_bridge.main
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**MCP Server Service** (`/etc/systemd/system/sekha-mcp.service`):

```ini
[Unit]
Description=Sekha MCP Server
After=network.target sekha-controller.service
Requires=sekha-controller.service

[Service]
Type=simple
User=sekha
Group=sekha
WorkingDirectory=/opt/sekha
EnvironmentFile=/opt/sekha/.env
ExecStart=/opt/sekha/venv/bin/python -m sekha_mcp
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
sudo systemctl enable sekha-llm-bridge sekha-mcp
sudo systemctl start sekha-llm-bridge sekha-mcp
sudo systemctl status sekha-llm-bridge sekha-mcp
```

---

## Troubleshooting

### Import Errors

```bash
# Verify installation
pip list | grep sekha

# Should show:
sekha-llm-bridge    0.2.0
sekha-mcp           0.2.0

# If missing, reinstall
pip install --force-reinstall sekha-llm-bridge sekha-mcp
```

### Module Not Found

```python
# Verify Python path
import sys
print(sys.path)

# Check package location
import sekha_llm_bridge
print(sekha_llm_bridge.__file__)
```

### Version Conflicts

```bash
# Check dependencies
pip check

# Update all dependencies
pip install --upgrade sekha-llm-bridge sekha-mcp

# Use virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install sekha-llm-bridge sekha-mcp
```

---

## Next Steps

<div class="grid cards" markdown>

-   [:material-docker: **Docker Deployment**](quickstart.md)
    
    Recommended for production use

-   [:material-api: **API Reference**](../api-reference/rest-api.md)
    
    Explore all endpoints

-   [:simple-claude: **Claude Desktop**](../integrations/claude-desktop.md)
    
    Use with MCP tools

-   [:material-github: **Contributing**](../development/contributing.md)
    
    Develop on Sekha

</div>

---

## Resources

- **PyPI Pages**: [sekha-llm-bridge](https://pypi.org/project/sekha-llm-bridge/) | [sekha-mcp](https://pypi.org/project/sekha-mcp/)
- **GitHub Repos**: [llm-bridge](https://github.com/sekha-ai/sekha-llm-bridge) | [mcp](https://github.com/sekha-ai/sekha-mcp)
- **Changelogs**: [LLM Bridge](https://github.com/sekha-ai/sekha-llm-bridge/blob/main/CHANGELOG.md) | [MCP](https://github.com/sekha-ai/sekha-mcp/blob/main/CHANGELOG.md)
- **Discord**: [Join our community](https://discord.gg/gZb7U9deKH)
