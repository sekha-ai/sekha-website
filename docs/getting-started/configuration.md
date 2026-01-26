# Configuration Reference

Complete guide to configuring Sekha Controller based on actual implementation.

## Configuration File

Sekha loads configuration from three sources (in order of precedence):

1. **Environment variables** (highest priority) - Prefix: `SEKHA__`
2. **User config** - `~/.sekha/config.toml`
3. **Project config** - `./config.toml` (current directory)
4. **Built-in defaults** (lowest priority)

---

## Minimal Configuration

Create `~/.sekha/config.toml` with only the API key:

```toml
mcp_api_key = "your-secure-key-min-32-characters-long"
```

All other settings use sensible defaults.

---

## Complete Configuration Example

```toml
# Server Settings
server_host = "0.0.0.0"              # Listen on all interfaces
server_port = 8080                    # API server port

# Authentication
mcp_api_key = "sk-sekha-your-mcp-key-min-32-chars"          # Required: MCP protocol key
rest_api_key = "sk-sekha-your-rest-key-min-32-chars"        # Optional: REST API key (defaults to mcp_api_key)
additional_api_keys = ["key1", "key2"]  # Optional: Additional valid API keys

# Database
database_url = "sqlite://sekha.db"    # SQLite (local) or PostgreSQL connection string
max_connections = 10                  # Database connection pool size (1-100)

# Vector Store (ChromaDB)
chroma_url = "http://localhost:8000"  # ChromaDB endpoint

# LLM Configuration
ollama_url = "http://localhost:11434"           # Ollama server
llm_bridge_url = "http://localhost:5001"        # LLM Bridge (Python service)
embedding_model = "nomic-embed-text:latest"     # Embedding model name
summarization_model = "llama3.1:8b"             # Summarization model name

# Features
summarization_enabled = true          # Enable conversation summarization
pruning_enabled = true                # Enable pruning suggestions

# Logging
log_level = "info"                    # trace | debug | info | warn | error

# Rate Limiting
rate_limit_per_minute = 1000          # Max requests per minute

# CORS
cors_enabled = true                   # Enable Cross-Origin Resource Sharing
```

---

## Configuration Options Reference

### Server Settings

| Option | Type | Default | Validation | Description |
|--------|------|---------|------------|-------------|
| `server_host` | string | `"0.0.0.0"` | - | Interface to bind (use `"127.0.0.1"` for localhost-only) |
| `server_port` | integer | `8080` | 1024-65535 | Port for API server |

**Example: Localhost only**
```toml
server_host = "127.0.0.1"
server_port = 9090
```

---

### Authentication

| Option | Type | Default | Validation | Description |
|--------|------|---------|------------|-------------|
| `mcp_api_key` | string | `"dev_default_key_change_me_1234567890"` | min 32 chars | **Required** - API key for MCP protocol |
| `rest_api_key` | string | *(optional)* | - | Optional REST API key (defaults to `mcp_api_key`) |
| `additional_api_keys` | array | `[]` | - | Additional valid API keys for multi-user access |

**Example: Multiple API keys**
```toml
mcp_api_key = "sk-sekha-primary-key-12345678901234567890"
rest_api_key = "sk-sekha-rest-key-09876543210987654321"
additional_api_keys = [
  "sk-sekha-user1-key-11111111111111111111",
  "sk-sekha-user2-key-22222222222222222222"
]
```

!!! danger "Security: API Key Requirements"
    - **Minimum length:** 32 characters
    - **Never use default key in production!**
    - **Generate secure keys:** `openssl rand -base64 32`

---

### Database

| Option | Type | Default | Validation | Description |
|--------|------|---------|------------|-------------|
| `database_url` | string | `"sqlite://sekha.db"` | - | Database connection string |
| `max_connections` | integer | `10` | 1-100 | Connection pool size |

**SQLite (Single-user, local)**
```toml
database_url = "sqlite://~/.sekha/data/sekha.db"
max_connections = 10
```

**PostgreSQL (Multi-user, production)**
```toml
database_url = "postgresql://sekha:password@localhost:5432/sekha"
max_connections = 50
```

---

### Vector Store (ChromaDB)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `chroma_url` | string | `"http://localhost:8000"` | ChromaDB HTTP endpoint |

**Example: Remote ChromaDB**
```toml
chroma_url = "http://chroma.internal:8000"
```

---

### LLM Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ollama_url` | string | `"http://localhost:11434"` | Ollama server endpoint |
| `llm_bridge_url` | string | `"http://localhost:5001"` | LLM Bridge service endpoint |
| `embedding_model` | string | `"nomic-embed-text:latest"` | Model for generating embeddings |
| `summarization_model` | string | `"llama3.1:8b"` | Model for conversation summarization |

**Example: Custom models**
```toml
ollama_url = "http://ollama-server:11434"
llm_bridge_url = "http://llm-bridge:5001"
embedding_model = "nomic-embed-text:latest"
summarization_model = "llama3.1:8b"
```

!!! note "Required Models"
    Both models must be available in Ollama:
    ```bash
    ollama pull nomic-embed-text:latest
    ollama pull llama3.1:8b
    ```

---

### Features

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `summarization_enabled` | boolean | `true` | Enable automatic conversation summarization |
| `pruning_enabled` | boolean | `true` | Enable pruning suggestions for old conversations |

**Example: Disable features**
```toml
summarization_enabled = false  # Disable summarization to save compute
pruning_enabled = false         # Disable pruning suggestions
```

---

### Logging

| Option | Type | Default | Options | Description |
|--------|------|---------|---------|-------------|
| `log_level` | string | `"info"` | `trace`, `debug`, `info`, `warn`, `error` | Logging verbosity |

**Development:**
```toml
log_level = "debug"
```

**Production:**
```toml
log_level = "info"
```

!!! tip "Log Output"
    Logs are written to stdout. Use systemd, Docker, or your orchestrator to capture and rotate logs.

---

### Rate Limiting

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rate_limit_per_minute` | integer | `1000` | Maximum requests per minute |

**Example: Higher rate limit**
```toml
rate_limit_per_minute = 5000
```

---

### CORS (Cross-Origin Resource Sharing)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cors_enabled` | boolean | `true` | Enable CORS headers for browser access |

**Example: Disable CORS**
```toml
cors_enabled = false  # API-only access, no browser clients
```

---

## Environment Variables

Environment variables **override** all config file settings.

**Naming convention:** `SEKHA__<option>` (double underscore)

### Common Environment Variables

```bash
# Server
export SEKHA__SERVER_HOST="0.0.0.0"
export SEKHA__SERVER_PORT=8080

# Authentication
export SEKHA__MCP_API_KEY="your-secure-key"
export SEKHA__REST_API_KEY="your-rest-key"

# Database
export SEKHA__DATABASE_URL="postgresql://user:pass@db:5432/sekha"
export SEKHA__MAX_CONNECTIONS=50

# Vector Store
export SEKHA__CHROMA_URL="http://chroma:8000"

# LLM
export SEKHA__OLLAMA_URL="http://ollama:11434"
export SEKHA__LLM_BRIDGE_URL="http://llm-bridge:5001"
export SEKHA__EMBEDDING_MODEL="nomic-embed-text:latest"
export SEKHA__SUMMARIZATION_MODEL="llama3.1:8b"

# Logging
export SEKHA__LOG_LEVEL="debug"

# Features
export SEKHA__SUMMARIZATION_ENABLED=true
export SEKHA__PRUNING_ENABLED=true

# Rate Limiting
export SEKHA__RATE_LIMIT_PER_MINUTE=2000

# CORS
export SEKHA__CORS_ENABLED=true
```

### Docker Environment

In `docker-compose.yml`:

```yaml
services:
  sekha-controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    environment:
      - SEKHA__SERVER_PORT=8080
      - SEKHA__MCP_API_KEY=${MCP_API_KEY}
      - SEKHA__DATABASE_URL=postgresql://sekha:${DB_PASSWORD}@postgres:5432/sekha
      - SEKHA__CHROMA_URL=http://chroma:8000
      - SEKHA__OLLAMA_URL=http://ollama:11434
      - SEKHA__LLM_BRIDGE_URL=http://llm-bridge:5001
      - SEKHA__LOG_LEVEL=info
```

---

## Configuration Priority

**Precedence (highest to lowest):**

1. **Environment variables** - `SEKHA__*`
2. **User config** - `~/.sekha/config.toml`
3. **Project config** - `./config.toml`
4. **Built-in defaults** - Hardcoded in `src/config.rs`

**Example:** If you set `SEKHA__SERVER_PORT=9090`, it overrides the port in both config files.

---

## Security Best Practices

### 1. Generate Strong API Keys

```bash
# Generate a secure 32+ character key
openssl rand -base64 32
```

**Output example:**
```
X9k2Lm4Np7Qr1Sv8Tw6Yz3Bc5Df0Gh9J+
```

**Use in config:**
```toml
mcp_api_key = "sk-sekha-X9k2Lm4Np7Qr1Sv8Tw6Yz3Bc5Df0Gh9J"
```

### 2. Protect Configuration Files

```bash
# Make config readable only by owner
chmod 600 ~/.sekha/config.toml

# For system-wide config
sudo chown root:root /etc/sekha/config.toml
sudo chmod 600 /etc/sekha/config.toml
```

### 3. Use Environment Variables for Secrets

**Never commit secrets to version control!**

```bash
# .env file (add to .gitignore)
MCP_API_KEY=sk-sekha-...
REST_API_KEY=sk-sekha-...
DB_PASSWORD=...

# Load in shell
export $(cat .env | xargs)

# Or use docker-compose
docker compose --env-file .env up
```

### 4. Bind to Localhost in Development

```toml
server_host = "127.0.0.1"  # Only accessible from this machine
```

### 5. Use Separate Keys for MCP and REST

```toml
mcp_api_key = "sk-sekha-mcp-..."
rest_api_key = "sk-sekha-rest-..."
```

This allows you to:
- Rotate keys independently
- Grant different access levels
- Audit usage by protocol

---

## Validation

The controller validates configuration on startup:

### API Key Validation

- ✅ **Minimum length:** 32 characters
- ❌ **Fails if shorter:** Server won't start

### Port Validation

- ✅ **Valid range:** 1024-65535
- ❌ **Fails outside range:** Server won't start

### Connection Pool Validation

- ✅ **Valid range:** 1-100 connections
- ❌ **Fails outside range:** Server won't start

**Check startup logs for validation errors:**

```bash
# Start controller and check logs
sekha-controller

# Look for validation errors
[ERROR] Configuration validation failed: ...
```

---

## Common Configuration Patterns

### Development (Local)

```toml
server_host = "127.0.0.1"
server_port = 8080
mcp_api_key = "dev-key-for-local-testing-only-32char"
database_url = "sqlite://sekha.db"
ollama_url = "http://localhost:11434"
chroma_url = "http://localhost:8000"
llm_bridge_url = "http://localhost:5001"
log_level = "debug"
```

### Production (Docker)

```toml
server_host = "0.0.0.0"
server_port = 8080
mcp_api_key = "sk-sekha-production-key-min-32-chars"
database_url = "postgresql://sekha:${DB_PASSWORD}@postgres:5432/sekha"
ollama_url = "http://ollama:11434"
chroma_url = "http://chroma:8000"
llm_bridge_url = "http://llm-bridge:5001"
max_connections = 50
log_level = "info"
rate_limit_per_minute = 5000
```

### Multi-User (Team)

```toml
mcp_api_key = "sk-sekha-team-admin-key-1234567890abcdef"
additional_api_keys = [
  "sk-sekha-alice-key-11111111111111111111",
  "sk-sekha-bob-key-22222222222222222222",
  "sk-sekha-charlie-key-33333333333333333333"
]
database_url = "postgresql://sekha:password@postgres:5432/sekha"
max_connections = 100
rate_limit_per_minute = 10000
```

---

## Troubleshooting

### "API key validation failed"

**Problem:** API key is shorter than 32 characters

**Solution:**
```bash
# Generate a new key
openssl rand -base64 32

# Update config.toml
mcp_api_key = "sk-sekha-new-key-..."
```

### "Port already in use"

**Problem:** Another service is using port 8080

**Solution:**
```toml
server_port = 9090  # Use a different port
```

Or stop the conflicting service:
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill <PID>
```

### "Failed to connect to database"

**Problem:** Database URL is incorrect or database is unreachable

**Solution:**
```bash
# For PostgreSQL, verify connection
psql postgresql://sekha:password@localhost:5432/sekha

# For SQLite, check file path and permissions
ls -la ~/.sekha/data/sekha.db
```

### "ChromaDB unreachable"

**Problem:** ChromaDB isn't running or URL is wrong

**Solution:**
```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Expected: {"nanosecond heartbeat": <timestamp>}

# Start ChromaDB if needed
cd sekha-docker/docker
docker compose up -d chroma
```

### "Ollama connection failed"

**Problem:** Ollama isn't running or URL is incorrect

**Solution:**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Start Ollama if needed
ollama serve

# Pull required models
ollama pull nomic-embed-text:latest
ollama pull llama3.1:8b
```

---

## Next Steps

- **[First Conversation](first-conversation.md)** - Test your configuration
- **[Quickstart Guide](quickstart.md)** - Get started quickly
- **[Deployment](../deployment/docker-compose.md)** - Deploy to production
- **[API Reference](../api-reference/rest-api.md)** - Use the API

---

!!! tip "Configuration Tips"
    1. **Start minimal** - Only set `mcp_api_key`, use defaults for everything else
    2. **Use environment variables for secrets** - Never commit API keys to git
    3. **Validate on startup** - Check logs for configuration errors
    4. **Separate dev/prod configs** - Different security requirements
    5. **Document team keys** - Track which key belongs to which user
