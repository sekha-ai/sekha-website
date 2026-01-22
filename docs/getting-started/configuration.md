# Configuration

Customize Sekha Controller for your environment.

## Configuration File

Sekha auto-generates `~/.sekha/config.toml` on first run with sensible defaults.

### Default Configuration

```toml
[server]
# HTTP server configuration
port = 8080
host = "0.0.0.0"  # Bind to all interfaces

# IMPORTANT: Change this to a secure random string
# Minimum 32 characters
api_key = "dev-key-replace-in-production-min-32-chars"

[database]
# SQLite database URL
url = "sqlite://~/.sekha/data/sekha.db"
max_connections = 100

# Database performance tuning
connection_timeout_seconds = 30
idle_timeout_seconds = 600

[vector_store]
# ChromaDB connection
chroma_url = "http://localhost:8000"
collection_name = "sekha_memory"

# Vector store settings
embedding_dimension = 768  # nomic-embed-text dimension
distance_metric = "cosine"  # cosine | l2 | ip

[llm]
# LLM backend configuration
provider = "ollama"  # Currently only ollama supported
ollama_url = "http://localhost:11434"

# Model selection
embedding_model = "nomic-embed-text:latest"
summarization_model = "llama3.1:8b"

# LLM request settings
max_retries = 3
timeout_seconds = 60

[orchestration]
# Memory orchestration features
summarization_enabled = true
pruning_enabled = true
auto_embed = true  # Automatically embed new conversations
label_suggestions = true

# Context assembly
default_context_budget = 8000  # Tokens
max_context_messages = 100

[features]
# Optional features
metrics_enabled = true
audit_log_enabled = false  # Requires additional setup

[logging]
# Logging configuration
level = "info"  # trace | debug | info | warn | error
format = "json"  # json | pretty
output = "~/.sekha/logs/controller.log"

# Log rotation
max_size_mb = 100
max_age_days = 30
max_backups = 10

[rate_limiting]
# API rate limiting
enabled = true
requests_per_second = 100
burst_size = 200

# Per-endpoint overrides
[rate_limiting.endpoints]
"/api/v1/conversations" = 10  # Storage operations
"/api/v1/query" = 50  # Search operations

[cors]
# CORS configuration
enabled = true
allowed_origins = [
  "http://localhost:3000",
  "http://localhost:8080",
]
allowed_methods = ["GET", "POST", "PUT", "DELETE"]
allowed_headers = ["*"]

[security]
# Security settings
api_key_header = "Authorization"  # Header name
api_key_prefix = "Bearer "  # Prefix ("Bearer " or empty)

# TLS/SSL (future)
# tls_enabled = false
# tls_cert_path = "/path/to/cert.pem"
# tls_key_path = "/path/to/key.pem"
```

## Environment Variables

Environment variables override `config.toml` settings. Useful for containerized deployments.

### Server

```bash
export SEKHA_SERVER_PORT=8080
export SEKHA_SERVER_HOST="0.0.0.0"
export SEKHA_API_KEY="your-secure-api-key-32-chars-min"
```

### Database

```bash
export SEKHA_DATABASE_URL="sqlite:///opt/sekha/data/sekha.db"
export SEKHA_DATABASE_MAX_CONNECTIONS=100
```

### Vector Store

```bash
export SEKHA_CHROMA_URL="http://chroma:8000"
export SEKHA_VECTOR_COLLECTION="sekha_memory"
```

### LLM

```bash
export SEKHA_LLM_PROVIDER="ollama"
export SEKHA_OLLAMA_URL="http://ollama:11434"
export SEKHA_EMBEDDING_MODEL="nomic-embed-text:latest"
export SEKHA_SUMMARIZATION_MODEL="llama3.1:8b"
```

### Logging

```bash
export SEKHA_LOG_LEVEL="info"
export SEKHA_LOG_FORMAT="json"
export SEKHA_LOG_OUTPUT="/var/log/sekha/controller.log"
```

### Feature Flags

```bash
export SEKHA_SUMMARIZATION_ENABLED="true"
export SEKHA_PRUNING_ENABLED="true"
export SEKHA_AUTO_EMBED="true"
export SEKHA_METRICS_ENABLED="true"
```

## Docker Compose Configuration

When using Docker, configure via `docker-compose.yml`:

```yaml
services:
  sekha-controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    environment:
      - SEKHA_SERVER_PORT=8080
      - SEKHA_API_KEY=${SEKHA_API_KEY}
      - SEKHA_DATABASE_URL=sqlite:///data/sekha.db
      - SEKHA_CHROMA_URL=http://chroma:8000
      - SEKHA_OLLAMA_URL=http://ollama:11434
      - SEKHA_LOG_LEVEL=info
    volumes:
      - sekha_data:/data
      - sekha_logs:/var/log/sekha
    ports:
      - "8080:8080"
```

Use `.env` file:

```bash
# .env
SEKHA_API_KEY=your-secure-32-char-api-key
SEKHA_LOG_LEVEL=info
```

## Configuration Sections

### Server Configuration

#### Port & Host

```toml
[server]
port = 8080         # HTTP port
host = "0.0.0.0"    # Bind address (0.0.0.0 = all interfaces)
```

**Production recommendations:**
- Use reverse proxy (nginx, Caddy) for TLS
- Bind to `127.0.0.1` if reverse proxy is local
- Use firewall rules to restrict access

#### API Key

```toml
[server]
api_key = "your-secure-random-key-minimum-32-characters"
```

**Generate secure key:**

```bash
# macOS/Linux
openssl rand -base64 32

# Or using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Requirements:**
- Minimum 32 characters
- Use random, high-entropy string
- Rotate periodically
- Never commit to version control

### Database Configuration

```toml
[database]
url = "sqlite://~/.sekha/data/sekha.db"
max_connections = 100
connection_timeout_seconds = 30
```

**Connection pool sizing:**

| Use Case | max_connections |
|----------|----------------|
| Single user | 10 |
| Small team (5-10) | 50 |
| Production (100+) | 100+ |

**Future: PostgreSQL support**
```toml
url = "postgres://user:pass@host:5432/sekha"
max_connections = 20
```

### Vector Store Configuration

```toml
[vector_store]
chroma_url = "http://localhost:8000"
collection_name = "sekha_memory"
embedding_dimension = 768
distance_metric = "cosine"
```

**Distance metrics:**
- `cosine` - Recommended (default)
- `l2` - Euclidean distance
- `ip` - Inner product

### LLM Configuration

```toml
[llm]
provider = "ollama"
ollama_url = "http://localhost:11434"
embedding_model = "nomic-embed-text:latest"
summarization_model = "llama3.1:8b"
```

**Supported models:**

| Model | Purpose | Size | Speed |
|-------|---------|------|-------|
| nomic-embed-text | Embeddings | 274MB | Fast |
| llama3.1:8b | Summarization | 4.7GB | Medium |
| mistral:7b | Summarization | 4.1GB | Fast |
| llama3.1:70b | Summarization | 39GB | Slow |

**Model selection tips:**
- Embeddings: Stick with `nomic-embed-text` (purpose-built)
- Summarization: Larger models = better quality, slower speed

### Orchestration Configuration

```toml
[orchestration]
summarization_enabled = true
pruning_enabled = true
auto_embed = true
label_suggestions = true
default_context_budget = 8000
max_context_messages = 100
```

**Context budget:**
- GPT-4: 8000-32000 tokens
- Claude: 8000-100000 tokens
- Llama 3: 4000-8000 tokens

### Logging Configuration

```toml
[logging]
level = "info"
format = "json"
output = "~/.sekha/logs/controller.log"
max_size_mb = 100
max_age_days = 30
```

**Log levels:**
- `trace` - Very verbose (development)
- `debug` - Detailed (troubleshooting)
- `info` - Normal operations (production)
- `warn` - Warnings only
- `error` - Errors only

**Log formats:**
- `json` - Structured (machine-readable)
- `pretty` - Human-readable (development)

### Rate Limiting

```toml
[rate_limiting]
enabled = true
requests_per_second = 100
burst_size = 200

[rate_limiting.endpoints]
"/api/v1/conversations" = 10
"/api/v1/query" = 50
```

**Recommendations:**
- Single user: 10 req/s
- Small team: 50 req/s
- Production: 100+ req/s

### CORS Configuration

```toml
[cors]
enabled = true
allowed_origins = [
  "http://localhost:3000",
  "https://your-app.com",
]
allowed_methods = ["GET", "POST", "PUT", "DELETE"]
```

**Production:**
- List specific origins (no wildcards)
- Use HTTPS origins only
- Restrict methods to needed ones

## Configuration Precedence

Configuration is loaded in this order (later overrides earlier):

1. Default built-in values
2. `~/.sekha/config.toml`
3. `/etc/sekha/config.toml` (system-wide)
4. `--config` CLI argument
5. Environment variables

## Reloading Configuration

Sekha supports hot-reload for some settings:

```bash
# Send SIGHUP to reload
kill -HUP $(pgrep sekha-controller)

# Or via systemd
sudo systemctl reload sekha-controller
```

**Hot-reloadable:**
- ✅ Log level
- ✅ Rate limits
- ✅ CORS settings

**Requires restart:**
- ❌ Port/host
- ❌ Database URL
- ❌ API key (security)

## Configuration Validation

```bash
# Validate configuration
sekha-controller --validate-config

# Test configuration
sekha-controller --test-config --config ~/.sekha/config.toml
```

## Example Configurations

### Development

```toml
[server]
port = 8080
host = "127.0.0.1"
api_key = "dev-key"

[logging]
level = "debug"
format = "pretty"

[rate_limiting]
enabled = false
```

### Production

```toml
[server]
port = 8080
host = "0.0.0.0"
api_key = "${SEKHA_API_KEY}"  # From environment

[database]
max_connections = 100

[logging]
level = "info"
format = "json"
output = "/var/log/sekha/controller.log"

[rate_limiting]
enabled = true
requests_per_second = 100

[security]
tls_enabled = true  # Future feature
```

## Next Steps

- **[First Conversation](first-conversation.md)** - Complete tutorial
- **[API Reference](../api-reference/rest-api.md)** - Explore endpoints
- **[Deployment Guide](../deployment/index.md)** - Production setup
- **[Security Best Practices](../deployment/security.md)** - Harden your installation

## Troubleshooting

If configuration issues arise:

- [Common Issues](../troubleshooting/common-issues.md)
- [Debugging Guide](../troubleshooting/debugging.md)
- [Discord Community](https://discord.gg/sekha)