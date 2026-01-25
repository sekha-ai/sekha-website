# Configuration Reference

Complete guide to configuring Sekha Controller.

## Configuration File

Sekha reads configuration from `~/.sekha/config.toml` (or `/etc/sekha/config.toml` in production).

On first run, Sekha auto-generates a default config:

```bash
sekha-controller setup
```

This creates `~/.sekha/config.toml` with sensible defaults.

---

## Full Configuration Example

```toml
# ~/.sekha/config.toml

[server]
host = "0.0.0.0"  # Listen on all interfaces
port = 8080       # API server port
api_key = "sk-sekha-your-secure-key-min-32-chars-long"  # CHANGE THIS!

[database]
url = "sqlite://~/.sekha/data/sekha.db"  # SQLite for single-user
# url = "postgresql://user:pass@localhost:5432/sekha"  # Postgres for multi-user
max_connections = 100
connection_timeout_seconds = 5

[vector_store]
chroma_url = "http://localhost:8000"
collection_name = "sekha_memory"
batch_size = 100

[llm]
# Current: Ollama (local)
provider = "ollama"
ollama_url = "http://localhost:11434"
embedding_model = "nomic-embed-text:latest"
summarization_model = "llama3.1:8b"

# Future: OpenAI, Anthropic, Google
# provider = "openai"
# api_key = "sk-..."
# embedding_model = "text-embedding-3-small"

[orchestration]
summarization_enabled = true
pruning_enabled = true
auto_embed = true
label_suggestions = true

[logging]
level = "info"  # trace | debug | info | warn | error
format = "json"  # json | pretty
output = "~/.sekha/logs/controller.log"

[rate_limiting]
requests_per_second = 100
burst_size = 200

[cors]
allowed_origins = [
  "http://localhost:3000",
  "https://your-app.com"
]

[storage]
data_dir = "~/.sekha/data"
log_dir = "~/.sekha/logs"
max_log_size_mb = 100
max_log_files = 10
```

---

## Section Reference

### `[server]`

HTTP server configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `host` | string | `"0.0.0.0"` | Interface to bind (use `127.0.0.1` for local-only) |
| `port` | integer | `8080` | API server port |
| `api_key` | string | *required* | Bearer token for API auth (**min 32 chars**) |
| `request_timeout_seconds` | integer | `60` | Max request duration |
| `max_body_size_mb` | integer | `10` | Max request body size |

**Example:**
```toml
[server]
host = "127.0.0.1"  # Local-only
port = 9090
api_key = "sk-sekha-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
request_timeout_seconds = 120
```

---

### `[database]`

Primary database configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `url` | string | `sqlite://~/.sekha/data/sekha.db` | Database connection string |
| `max_connections` | integer | `100` | Connection pool size |
| `connection_timeout_seconds` | integer | `5` | Connection timeout |
| `pool_size` | integer | `10` | Min connections in pool |

**SQLite (single-user):**
```toml
[database]
url = "sqlite://~/.sekha/data/sekha.db"
```

**PostgreSQL (multi-user):**
```toml
[database]
url = "postgresql://sekha:password@localhost:5432/sekha"
max_connections = 200
pool_size = 20
```

---

### `[vector_store]`

ChromaDB vector database configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `chroma_url` | string | `http://localhost:8000` | ChromaDB endpoint |
| `collection_name` | string | `sekha_memory` | Collection for vectors |
| `batch_size` | integer | `100` | Batch size for embedding |
| `distance_metric` | string | `cosine` | Similarity metric (cosine, l2, ip) |

**Example:**
```toml
[vector_store]
chroma_url = "http://chroma.internal:8000"
collection_name = "production_memory"
batch_size = 200
```

---

### `[llm]`

LLM provider configuration.

#### Ollama (Current Implementation)

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `provider` | string | `"ollama"` | LLM provider |
| `ollama_url` | string | `http://localhost:11434` | Ollama server URL |
| `embedding_model` | string | `nomic-embed-text:latest` | Model for embeddings |
| `summarization_model` | string | `llama3.1:8b` | Model for summaries |
| `timeout_seconds` | integer | `120` | LLM request timeout |

**Example:**
```toml
[llm]
provider = "ollama"
ollama_url = "http://localhost:11434"
embedding_model = "nomic-embed-text:latest"
summarization_model = "llama3.1:8b"
timeout_seconds = 180
```

#### OpenAI (Future)

```toml
[llm]
provider = "openai"
api_key = "sk-..."
embedding_model = "text-embedding-3-small"
summarization_model = "gpt-4-turbo"
```

#### Anthropic (Future)

```toml
[llm]
provider = "anthropic"
api_key = "sk-ant-..."
embedding_model = "voyage-2"
summarization_model = "claude-3-sonnet"
```

---

### `[orchestration]`

Memory orchestration features.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `summarization_enabled` | boolean | `true` | Enable hierarchical summaries |
| `pruning_enabled` | boolean | `true` | Enable pruning suggestions |
| `auto_embed` | boolean | `true` | Auto-embed new conversations |
| `label_suggestions` | boolean | `true` | Enable AI label suggestions |
| `context_budget_tokens` | integer | `8000` | Default context budget |

**Example:**
```toml
[orchestration]
summarization_enabled = true
pruning_enabled = true
auto_embed = true
label_suggestions = true
context_budget_tokens = 16000
```

---

### `[logging]`

Logging configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `level` | string | `"info"` | Log level (trace, debug, info, warn, error) |
| `format` | string | `"json"` | Log format (json, pretty) |
| `output` | string | `~/.sekha/logs/controller.log` | Log file path |
| `max_size_mb` | integer | `100` | Max log file size before rotation |
| `max_files` | integer | `10` | Max rotated log files to keep |

**Development:**
```toml
[logging]
level = "debug"
format = "pretty"
output = "stdout"
```

**Production:**
```toml
[logging]
level = "info"
format = "json"
output = "/var/log/sekha/controller.log"
max_size_mb = 500
max_files = 30
```

---

### `[rate_limiting]`

API rate limiting.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | boolean | `true` | Enable rate limiting |
| `requests_per_second` | integer | `100` | Max requests per second |
| `burst_size` | integer | `200` | Max burst requests |
| `per_ip` | boolean | `true` | Rate limit per IP address |

**Example:**
```toml
[rate_limiting]
enabled = true
requests_per_second = 50
burst_size = 100
per_ip = true
```

---

### `[cors]`

CORS (Cross-Origin Resource Sharing) configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | boolean | `true` | Enable CORS |
| `allowed_origins` | array | `["*"]` | Allowed origins (domains) |
| `allowed_methods` | array | `["GET", "POST", "PUT", "DELETE"]` | Allowed HTTP methods |
| `max_age` | integer | `3600` | Preflight cache duration (seconds) |

**Example:**
```toml
[cors]
enabled = true
allowed_origins = [
  "https://app.example.com",
  "https://admin.example.com"
]
allowed_methods = ["GET", "POST", "PUT", "DELETE"]
max_age = 7200
```

---

## Environment Variables

Environment variables **override** config.toml settings.

**Naming convention:** `SEKHA_<SECTION>_<KEY>`

### Common Overrides

```bash
# Server
export SEKHA_SERVER_PORT=9090
export SEKHA_SERVER_API_KEY="sk-sekha-production-key"

# Database
export SEKHA_DATABASE_URL="postgresql://user:pass@db:5432/sekha"

# Vector Store
export SEKHA_VECTOR_STORE_CHROMA_URL="http://chroma:8000"

# LLM
export SEKHA_LLM_PROVIDER="ollama"
export SEKHA_LLM_OLLAMA_URL="http://ollama:11434"

# Logging
export SEKHA_LOGGING_LEVEL="debug"
export SEKHA_LOGGING_FORMAT="pretty"
```

### Docker Environment

In `docker-compose.yml`:

```yaml
services:
  sekha-controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    environment:
      - SEKHA_SERVER_PORT=8080
      - SEKHA_SERVER_API_KEY=${SEKHA_API_KEY}
      - SEKHA_DATABASE_URL=postgresql://sekha:${DB_PASSWORD}@postgres:5432/sekha
      - SEKHA_VECTOR_STORE_CHROMA_URL=http://chroma:8000
      - SEKHA_LLM_OLLAMA_URL=http://ollama:11434
      - RUST_LOG=info
```

---

## Security Best Practices

### 1. Strong API Keys

!!! danger "Critical"
    Never use default keys in production!

**Generate secure key:**
```bash
openssl rand -base64 32
```

**Use in config:**
```toml
[server]
api_key = "sk-sekha-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### 2. TLS/HTTPS

**Enable TLS:**
```toml
[server]
tls_enabled = true
tls_cert = "/path/to/cert.pem"
tls_key = "/path/to/key.pem"
```

**Or use reverse proxy (recommended):**
- nginx
- Caddy (auto-TLS)
- Traefik

### 3. Network Isolation

**Bind to localhost only:**
```toml
[server]
host = "127.0.0.1"  # Not accessible externally
```

**Use firewall:**
```bash
# Only allow from specific IPs
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

### 4. Read-Only Config

```bash
sudo chown root:root /etc/sekha/config.toml
sudo chmod 600 /etc/sekha/config.toml
```

---

## Configuration Validation

**Test configuration:**
```bash
sekha-controller validate-config
```

**Output:**
```
✓ Server configuration valid
✓ Database connection successful
✓ ChromaDB reachable
✓ Ollama reachable
✓ Embedding model available
✓ Configuration validated successfully
```

---

## Next Steps

- [First Conversation](first-conversation.md) - Test your configuration
- [API Reference](../api-reference/rest-api.md) - Start using the API
- [Deployment Guide](../deployment/docker-compose.md) - Deploy to production
- [Troubleshooting](../troubleshooting/common-issues.md) - Common configuration issues

---

!!! tip "Configuration Tips"

    1. **Start with defaults** - Only change what you need
    2. **Use environment variables** for secrets (never commit API keys)
    3. **Enable JSON logging** in production for easier parsing
    4. **Set appropriate rate limits** based on expected traffic
    5. **Monitor logs** to tune configuration over time