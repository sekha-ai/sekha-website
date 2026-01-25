# Debugging Guide

> Troubleshoot issues with Sekha deployments

## Enable Debug Logging

### Controller

```bash
# Environment variable
export SEKHA_LOG_LEVEL=debug

# Or in docker-compose.yml
services:
  sekha-controller:
    environment:
      - SEKHA_LOG_LEVEL=debug
```

### LLM Bridge

```bash
export LOG_LEVEL=DEBUG
python -m sekha_llm_bridge
```

## Common Issues

### ChromaDB Connection Failed

**Symptoms:**
```
ERROR: Failed to connect to ChromaDB at localhost:8000
```

**Solutions:**

1. **Verify ChromaDB is running:**
   ```bash
   curl http://localhost:8000/api/v1/heartbeat
   ```

2. **Check network connectivity:**
   ```bash
   # If using Docker
   docker network inspect sekha_default
   ```

3. **Update host configuration:**
   ```yaml
   environment:
     - CHROMA_HOST=chroma  # Use service name, not localhost
   ```

### Database Locked Error

**Symptoms:**
```
SQLite error: database is locked
```

**Solutions:**

1. **Increase timeout:**
   ```bash
   SEKHA_DB_TIMEOUT=30000  # 30 seconds
   ```

2. **Check concurrent access:**
   - Only one writer at a time for SQLite
   - Consider PostgreSQL for high concurrency

3. **Enable WAL mode:**
   ```sql
   PRAGMA journal_mode=WAL;
   ```

### API Key Unauthorized

**Symptoms:**
```json
{"error": "Unauthorized", "status": 401}
```

**Solutions:**

1. **Check API key:**
   ```bash
   echo $SEKHA_API_KEY
   ```

2. **Verify header:**
   ```bash
   curl -H "Authorization: Bearer your-key" http://localhost:8080/health
   ```

3. **Reset API key:**
   ```bash
   export SEKHA_API_KEY="new-secure-key"
   docker compose restart sekha-controller
   ```

## Debugging Tools

### Check Service Health

```bash
# Controller
curl http://localhost:8080/health

# ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# LLM Bridge
curl http://localhost:8001/health
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f sekha-controller

# Last 100 lines
docker compose logs --tail=100 sekha-controller
```

### Inspect Database

```bash
# Access SQLite database
sqlite3 ./data/sekha.db

# Check tables
.tables

# View conversations
SELECT * FROM conversations LIMIT 5;

# Check schema
.schema conversations
```

### Test Vector Search

```bash
# Query ChromaDB directly
curl -X POST http://localhost:8000/api/v1/collections/sekha_memories/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_texts": ["test query"],
    "n_results": 5
  }'
```

## Performance Debugging

### Enable Request Tracing

```bash
export SEKHA_TRACE_REQUESTS=true
```

Logs will include:
- Request ID
- Duration
- Database query time
- Vector search time

### Measure Query Performance

```bash
# Time API request
time curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "limit": 10}'
```

### Database Query Analysis

```sql
-- Enable query profiling
EXPLAIN QUERY PLAN
SELECT * FROM conversations WHERE created_at > '2026-01-01';
```

## Network Debugging

### Check Port Bindings

```bash
# List listening ports
lsof -i :8080
lsof -i :8000
lsof -i :11434

# Or with netstat
netstat -tulpn | grep LISTEN
```

### Test Network Connectivity

```bash
# From host to container
ping sekha-controller

# DNS resolution
nslookup chroma

# Port connectivity
telnet localhost 8080
```

## Getting Help

### Gather Debug Information

```bash
# System info
docker version
docker compose version

# Service status
docker compose ps

# Resource usage
docker stats

# Recent logs
docker compose logs --tail=500 > sekha-logs.txt
```

### Report Issues

1. Create issue: [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
2. Include:
   - Debug logs
   - Docker compose config
   - Steps to reproduce
   - Expected vs actual behavior

### Community Support

- [Discord](https://discord.gg/sekha)
- [GitHub Discussions](https://github.com/sekha-ai/sekha-controller/discussions)

## Related

- [Common Issues](common-issues.md)
- [FAQ](faq.md)
- [Performance Guide](performance.md)
