# Common Issues & Solutions

Quick solutions to the most frequently encountered problems.

---

## Installation Issues

### Docker Compose fails to start

**Error:**
```
Error response from daemon: Conflict. The container name "/sekha-controller" is already in use
```

**Solution:**

```bash
# Stop existing containers
docker compose down

# Remove old containers
docker rm -f sekha-controller sekha-llm-bridge sekha-chroma

# Start fresh
docker compose up -d
```

---

**Error:**
```
ERROR: no matching manifest for linux/arm64/v8 in the manifest list entries
```

**Solution:**

You're on ARM64 (Apple Silicon, Raspberry Pi). Use multi-arch images:

```yaml
# docker-compose.yml
services:
  sekha-controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    platform: linux/arm64  # Add this line
```

---

### Port 8080 already in use

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use
```

**Solution 1: Find and kill the conflicting process**

```bash
# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Solution 2: Change Sekha's port**

```yaml
# docker-compose.yml
ports:
  - "8081:8080"  # Use port 8081 instead
```

Then access at `http://localhost:8081`

---

### Rust build fails

**Error:**
```
error: linker `cc` not found
```

**Solution:**

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install

# Fedora/RHEL
sudo dnf install gcc
```

---

**Error:**
```
error: failed to compile `sekha-controller v0.1.0`
```

**Solution:**

Ensure you have Rust 1.83+:

```bash
rustc --version
# Should show: rustc 1.83.0 or higher

# Update if needed
rustup update stable
```

---

## Connection & Network Issues

### Cannot connect to Sekha at localhost:8080

**Error:**
```
curl: (7) Failed to connect to localhost port 8080: Connection refused
```

**Diagnosis:**

```bash
# Check if Sekha is running
docker ps | grep sekha

# Check logs for errors
docker logs sekha-controller

# Test health endpoint
curl http://localhost:8080/health
```

**Solutions:**

1. **Sekha not started:**
   ```bash
   docker compose up -d
   ```

2. **Wrong port:**
   ```bash
   # Check actual port mapping
   docker ps
   # Look for: 0.0.0.0:XXXX->8080/tcp
   ```

3. **Firewall blocking:**
   ```bash
   # macOS
   sudo pfctl -d  # Temporarily disable firewall
   
   # Linux
   sudo ufw allow 8080/tcp
   ```

---

### ChromaDB connection failed

**Error:**
```
Failed to connect to ChromaDB at http://localhost:8000
```

**Solution:**

```bash
# Check ChromaDB container
docker ps | grep chroma

# Restart ChromaDB
docker compose restart sekha-chroma

# Check ChromaDB logs
docker logs sekha-chroma
```

**Config fix:**

```toml
# config.toml
[chroma]
url = "http://sekha-chroma:8000"  # Use container name, not localhost
```

---

### LLM Bridge connection timeout

**Error:**
```
HTTP request to LLM bridge timed out after 30s
```

**Solution:**

Increase timeout for large summarization tasks:

```toml
# config.toml
[llm_bridge]
url = "http://sekha-llm-bridge:5000"
timeout_seconds = 120  # Increase from 30 to 120
```

---

## Authentication Issues

### 401 Unauthorized

**Error:**
```json
{"error": "Invalid or missing API key"}
```

**Solution:**

1. **Check API key in request:**
   ```bash
   curl -H "Authorization: Bearer your-api-key-here" \
     http://localhost:8080/api/v1/stats
   ```

2. **Verify API key in config:**
   ```toml
   # config.toml
   [server]
   api_key = "your-api-key-here"  # Must match request header
   ```

3. **Generate new API key:**
   ```bash
   openssl rand -base64 32
   # Update config.toml with output
   ```

4. **Restart Sekha after config changes:**
   ```bash
   docker compose restart sekha-controller
   ```

---

### Claude Desktop: "Sekha tools not available"

**Error:**
Claude says it doesn't have access to Sekha tools.

**Diagnosis:**

```bash
# Test MCP server manually
docker run -i --rm \
  -e SEKHA_API_URL=http://host.docker.internal:8080 \
  -e SEKHA_API_KEY=your-key \
  ghcr.io/sekha-ai/sekha-mcp:latest

# Should output: {"version": "1.0", ...}
```

**Solutions:**

1. **Fix API URL for macOS/Windows:**
   ```json
   {
     "mcpServers": {
       "sekha": {
         "command": "docker",
         "args": [
           "run", "-i", "--rm", "--network=host",
           "-e", "SEKHA_API_URL=http://host.docker.internal:8080",
           "-e", "SEKHA_API_KEY=your-key",
           "ghcr.io/sekha-ai/sekha-mcp:latest"
         ]
       }
     }
   }
   ```

2. **Linux users - use localhost:**
   ```json
   "-e", "SEKHA_API_URL=http://localhost:8080",
   ```

3. **Restart Claude Desktop** after config changes

---

## Data & Storage Issues

### Database is locked

**Error:**
```
database is locked (os error 5)
```

**Solution:**

```bash
# Stop all Sekha processes
docker compose down

# Remove lock file
rm ~/.sekha/data/sekha.db-wal
rm ~/.sekha/data/sekha.db-shm

# Restart
docker compose up -d
```

**Prevention:**

Don't access the database from multiple processes simultaneously.

---

### Out of disk space

**Error:**
```
No space left on device
```

**Check usage:**

```bash
# macOS/Linux
du -sh ~/.sekha/data
du -sh ~/.sekha/chroma

# Windows
dir ~/.sekha /s
```

**Solutions:**

1. **Prune old conversations:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/prune/dry-run \
     -H "Authorization: Bearer your-key" \
     -d '{"threshold_days": 90, "min_importance": 3}'
   
   # Review recommendations, then execute:
   curl -X POST http://localhost:8080/api/v1/prune/execute \
     -H "Authorization: Bearer your-key" \
     -d '{"conversation_ids": ["id1", "id2", ...]}'
   ```

2. **Export and archive:**
   ```bash
   # Export old conversations
   curl -X POST http://localhost:8080/api/v1/export \
     -H "Authorization: Bearer your-key" \
     -d '{"format": "json", "start_date": "2025-01-01", "end_date": "2025-12-31"}'
   
   # Delete from Sekha after backup
   ```

3. **Move data directory to larger disk:**
   ```bash
   # Stop Sekha
   docker compose down
   
   # Move data
   mv ~/.sekha /mnt/largerdisk/sekha
   ln -s /mnt/largerdisk/sekha ~/.sekha
   
   # Restart
   docker compose up -d
   ```

---

### Conversation not found

**Error:**
```json
{"error": "Conversation not found: abc123..."}
```

**Diagnosis:**

```bash
# List all conversations
curl -X POST http://localhost:8080/api/v1/query \
  -H "Authorization: Bearer your-key" \
  -d '{"query": "", "limit": 100}'

# Search by label
curl -X POST http://localhost:8080/api/v1/search/fts \
  -H "Authorization: Bearer your-key" \
  -d '{"query": "your label"}'
```

**Common causes:**

1. Wrong conversation ID (UUIDs must be exact)
2. Conversation was deleted/pruned
3. Database corruption

---

## Search & Query Issues

### Semantic search returns no results

**Problem:**
Query returns `{"results": [], "total": 0}`

**Solutions:**

1. **Need more data:**
   - Semantic search needs 10+ conversations to work well
   - Store more conversations first

2. **Embedding not generated yet:**
   ```bash
   # Check logs for embedding errors
   docker logs sekha-controller | grep "embedding"
   ```

3. **ChromaDB not populated:**
   ```bash
   # Restart to trigger re-indexing
   docker compose restart sekha-controller
   ```

4. **Try full-text search instead:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/search/fts \
     -d '{"query": "exact keywords"}'
   ```

---

### Search results are irrelevant

**Problem:**
Results don't match the query semantically.

**Solutions:**

1. **Make query more specific:**
   ```bash
   # Too vague
   {"query": "design"}
   
   # Better
   {"query": "API authentication design using OAuth 2.0"}
   ```

2. **Use filters:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/query \
     -d '{
       "query": "API design",
       "filters": {
         "folder": "/work/backend",
         "min_importance": 7
       }
     }'
   ```

3. **Try different embedding model:**
   ```toml
   # config.toml
   [embeddings]
   model = "all-mpnet-base-v2"  # Better for long documents
   # OR
   model = "all-MiniLM-L6-v2"   # Faster, good for short queries
   ```

---

### Query timeout

**Error:**
```
Request timeout after 30s
```

**Solution:**

```toml
# config.toml
[server]
request_timeout_seconds = 60  # Increase timeout
```

Or reduce result set:

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -d '{"query": "...", "limit": 5}'  # Reduce from 10 to 5
```

---

## Performance Issues

### Slow response times

**Symptoms:**
- API responses take 5+ seconds
- UI feels sluggish
- Search queries timeout

**Diagnosis:**

```bash
# Check resource usage
docker stats

# Check database size
du -sh ~/.sekha/data/sekha.db

# Run EXPLAIN QUERY PLAN
sqlite3 ~/.sekha/data/sekha.db "EXPLAIN QUERY PLAN SELECT * FROM conversations LIMIT 10;"
```

**Solutions:**

1. **Optimize database:**
   ```bash
   sqlite3 ~/.sekha/data/sekha.db "VACUUM;"
   sqlite3 ~/.sekha/data/sekha.db "ANALYZE;"
   ```

2. **Reduce context budget:**
   ```toml
   [context]
   default_budget = 2000  # Down from 4000
   ```

3. **Use SSD storage** (10x faster than HDD)

4. **Allocate more RAM:**
   ```yaml
   # docker-compose.yml
   services:
     sekha-controller:
       mem_limit: 4g  # Increase from 2g
   ```

5. **Limit search results:**
   ```bash
   curl -X POST .../query -d '{"limit": 5}'  # Down from 10
   ```

---

### High memory usage

**Symptoms:**
- Docker shows 4GB+ RAM usage
- System becomes slow
- OOM (out of memory) errors

**Solutions:**

1. **Set memory limits:**
   ```yaml
   # docker-compose.yml
   services:
     sekha-controller:
       mem_limit: 2g
       mem_reservation: 1g
   ```

2. **Reduce ChromaDB cache:**
   ```yaml
   sekha-chroma:
     environment:
       - CHROMA_CACHE_SIZE=100  # Reduce from default 1000
   ```

3. **Restart periodically** (in production, use orchestration):
   ```bash
   0 3 * * * docker compose restart sekha-controller
   ```

---

### High CPU usage

**Symptoms:**
- CPU at 100% constantly
- Fans running at full speed
- System sluggish

**Diagnosis:**

```bash
# Check which process
docker stats

# Check logs for errors
docker logs sekha-controller | tail -100
```

**Solutions:**

1. **Limit concurrent requests:**
   ```toml
   [server]
   max_concurrent_requests = 10  # Down from 50
   ```

2. **Reduce embedding batch size:**
   ```toml
   [embeddings]
   batch_size = 10  # Down from 32
   ```

3. **Use CPU limits:**
   ```yaml
   sekha-controller:
     cpus: "2.0"  # Limit to 2 CPU cores
   ```

---

## Integration Issues

### Python SDK import error

**Error:**
```python
ModuleNotFoundError: No module named 'sekha'
```

**Solution:**

```bash
# Install SDK
pip install sekha-sdk

# Or from source
git clone https://github.com/sekha-ai/sekha-python-sdk
cd sekha-python-sdk
pip install -e .
```

---

### VS Code extension not connecting

**Error:**
"Failed to connect to Sekha at localhost:8080"

**Solution:**

1. **Check Sekha is running:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Update VS Code settings:**
   ```json
   {
     "sekha.apiUrl": "http://localhost:8080",
     "sekha.apiKey": "your-api-key-here"
   }
   ```

3. **Reload VS Code window:**
   - Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)
   - Type: "Reload Window"

---

## Configuration Issues

### Config file not found

**Error:**
```
Configuration file not found at: ~/.sekha/config.toml
```

**Solution:**

```bash
# Create config directory
mkdir -p ~/.sekha

# Copy default config
curl -sSL https://raw.githubusercontent.com/sekha-ai/sekha-controller/main/config.example.toml \
  -o ~/.sekha/config.toml

# Edit as needed
vim ~/.sekha/config.toml
```

---

### Invalid TOML syntax

**Error:**
```
Failed to parse config.toml: expected `=`, found `:`
```

**Solution:**

TOML uses `=` not `:` for assignments:

```toml
# WRONG (JSON syntax)
server: {
  port: 8080
}

# CORRECT (TOML syntax)
[server]
port = 8080
```

Validate your TOML:
```bash
# Install TOML validator
pip install toml

# Validate
python -c "import toml; toml.load(open('~/.sekha/config.toml'))"
```

---

## Docker Issues

### "Cannot connect to Docker daemon"

**Error:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solution:**

```bash
# macOS
open -a Docker  # Start Docker Desktop

# Linux
sudo systemctl start docker

# Check status
docker ps
```

---

### Image pull fails

**Error:**
```
Error response from daemon: Get "https://ghcr.io/v2/": unauthorized
```

**Solution:**

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Or pull without authentication (public images)
docker pull ghcr.io/sekha-ai/sekha-controller:latest
```

---

## Still Having Issues?

### Next Steps

1. **Check logs:**
   ```bash
   # Docker
   docker logs sekha-controller --tail 100
   
   # Binary
   tail -f ~/.sekha/logs/sekha.log
   ```

2. **Enable debug logging:**
   ```toml
   # config.toml
   [logging]
   level = "debug"  # Change from "info"
   ```

3. **Search existing issues:**
   [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)

4. **Ask for help:**
   - [Discord Community](https://discord.gg/gZb7U9deKH)
   - [GitHub Discussions](https://github.com/sekha-ai/sekha-controller/discussions)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/sekha)

5. **File a bug report:**
   [New Issue](https://github.com/sekha-ai/sekha-controller/issues/new)

### Information to Include

When asking for help, provide:

- Sekha version (`docker images | grep sekha` or `sekha --version`)
- Operating system and version
- Docker version (`docker --version`)
- Error messages (full output)
- Steps to reproduce
- Config file (remove sensitive data)
- Logs (`docker logs sekha-controller`)

---

**Related Documentation:**

- [FAQ](faq.md) - Common questions
- [Debugging Guide](debugging.md) - Advanced troubleshooting
- [Performance Tuning](performance.md) - Optimization tips
- [Configuration Reference](../reference/configuration.md) - All config options

---

*Last updated: January 2026*
