# Debugging Guide

Diagnose and resolve issues with Sekha Controller, embeddings, storage, and integrations.

## Overview

This guide covers:

- Common error patterns and solutions
- Log analysis and debugging workflows
- Health check interpretation
- Database and vector DB troubleshooting
- Integration debugging (MCP, SDKs, VS Code)

---

## Quick Diagnostics

### Health Check

```bash
curl http://localhost:8080/health
```

**Healthy response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T23:15:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"}
  }
}
```

**Unhealthy response:**

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-25T23:15:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {
      "status": "error",
      "error": "Connection refused"
    }
  }
}
```

→ **Action:** ChromaDB is down, restart it.

---

### Component Status

```bash
# Check all services (Docker)
docker compose -f docker-compose.yml -f docker-compose.full.yml ps

# Expected output:
NAME                STATUS
sekha-controller    Up (healthy)
sekha-postgres      Up (healthy)  
sekha-chroma        Up
sekha-ollama        Up
```

---

## Log Analysis

### Viewing Logs

**Docker:**

```bash
# Controller logs
docker logs sekha-controller -f

# PostgreSQL logs
docker logs sekha-postgres -f

# ChromaDB logs  
docker logs sekha-chroma -f

# Ollama logs
docker logs sekha-ollama -f

# All services
docker compose logs -f
```

**Binary deployment:**

```bash
# If running as service
sudo journalctl -u sekha-controller -f

# If running in terminal
./sekha-controller 2>&1 | tee sekha.log
```

---

### Log Levels

**Set log level:**

```bash
# Environment variable
export LOG_LEVEL=DEBUG

# Config file
echo 'log_level = "debug"' >> config.toml

# Docker
docker run -e LOG_LEVEL=DEBUG sekha/controller
```

**Levels:**

- `ERROR` - Errors only (production)
- `WARN` - Warnings + errors
- `INFO` - Standard operations (**default**)
- `DEBUG` - Detailed execution
- `TRACE` - Very verbose (development only)

---

### Common Log Patterns

**1. API Request:**

```
2026-01-25 23:15:30 INFO sekha_controller::api::routes - Semantic query: authentication
```

**2. Database Error:**

```
2026-01-25 23:15:31 ERROR sekha_controller::storage::repository - Database query failed: connection refused
```

**3. Embedding Generation:**

```
2026-01-25 23:15:32 DEBUG sekha_controller::services::embedding - Generating embedding for 512 tokens
2026-01-25 23:15:32 DEBUG sekha_controller::services::embedding - Embedding generated in 145ms
```

**4. ChromaDB Query:**

```
2026-01-25 23:15:33 DEBUG sekha_controller::storage::chroma - Searching ChromaDB: limit=10
2026-01-25 23:15:33 DEBUG sekha_controller::storage::chroma - Found 8 results in 52ms
```

---

## Common Errors

### 1. "Connection Refused" - Database

**Error:**

```
ERROR: Database connection failed: connection refused (os error 111)
```

**Cause:** PostgreSQL not running or wrong connection details.

**Debug:**

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection manually
psql -h localhost -U sekha -d sekha -c "SELECT 1;"

# Check DATABASE_URL
echo $DATABASE_URL
# Should be: postgresql://sekha:password@localhost:5432/sekha
```

**Fix:**

```bash
# Start PostgreSQL
docker compose up -d sekha-postgres

# Or check credentials in .env
cat docker/.env | grep DATABASE_URL
```

---

### 2. "Connection Refused" - ChromaDB

**Error:**

```
ERROR: ChromaDB connection failed: Connection refused
```

**Debug:**

```bash
# Check ChromaDB is running
docker ps | grep chroma

# Test connection
curl http://localhost:8000/api/v1/heartbeat

# Check CHROMA_URL
echo $CHROMA_URL
# Should be: http://localhost:8000
```

**Fix:**

```bash
# Start ChromaDB
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d chroma

# Check logs
docker logs sekha-chroma
```

---

### 3. "Unauthorized" - API Key

**Error:**

```
HTTP 401: Unauthorized
```

**Cause:** Missing or incorrect API key.

**Debug:**

```bash
# Check configured API key
cat docker/.env | grep REST_API_KEY

# Test with correct key
curl -H "X-API-Key: your-key-here" http://localhost:8080/health
```

**Fix:**

```bash
# Update .env file
echo "REST_API_KEY=your-correct-key-minimum-32-chars" >> docker/.env

# Restart controller
docker compose restart sekha-controller
```

---

### 4. "Model Not Found" - Ollama

**Error:**

```
ERROR: Embedding model not found: nomic-embed-text:latest
```

**Debug:**

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# List installed models
ollama list
```

**Fix:**

```bash
# Pull embedding model
ollama pull nomic-embed-text:latest

# Verify
ollama list | grep nomic
```

---

### 5. "No Such Table" - Database Migration

**Error:**

```
ERROR: relation "conversations" does not exist
```

**Cause:** Database not initialized.

**Fix:**

```bash
# Run migrations
cd sekha-controller
cargo run --bin migrate

# Or with Docker
docker compose exec sekha-controller /app/migrate
```

---

### 6. Slow Query Performance

**Symptom:**

```
DEBUG: Query completed in 5230ms  # Too slow!
```

**Debug:**

```bash
# Enable query logging
export LOG_LEVEL=DEBUG

# Check for missing indexes
psql -U sekha -d sekha -c "
  SELECT schemaname, tablename, indexname 
  FROM pg_indexes 
  WHERE schemaname = 'public';
"

# Check collection size
curl http://localhost:8000/api/v1/collections/sekha_memories/count
```

**Fix:**

See [Performance Tuning](performance.md) guide.

---

## Debugging Workflows

### Workflow 1: API Returns Error

```bash
# 1. Check HTTP status code
curl -i http://localhost:8080/api/v1/conversations

# 2. Check controller logs for error
docker logs sekha-controller --tail 100

# 3. Verify health of dependencies
curl http://localhost:8080/health

# 4. Test each dependency manually
psql -U sekha -c "SELECT 1;"  # Database
curl http://localhost:8000/api/v1/heartbeat  # ChromaDB
curl http://localhost:11434/api/tags  # Ollama

# 5. Check API key
curl -H "X-API-Key: $REST_API_KEY" http://localhost:8080/health
```

---

### Workflow 2: Search Returns No Results

```bash
# 1. Verify conversations exist
curl http://localhost:8080/api/v1/conversations/count

# 2. Check ChromaDB has embeddings
curl http://localhost:8000/api/v1/collections

# 3. Test with keyword search (not semantic)
curl "http://localhost:8080/api/v1/conversations?label=test"

# 4. Check embedding service
curl http://localhost:11434/api/tags | jq '.models[] | select(.name | contains("nomic"))'

# 5. Enable debug logging and search again
export LOG_LEVEL=DEBUG
curl -X POST http://localhost:8080/api/v1/query -d '{"query":"test"}'

# 6. Check logs for embedding generation
docker logs sekha-controller | grep -i embedding
```

---

### Workflow 3: Integration Not Working

**MCP (Claude Desktop):**

```bash
# 1. Check MCP server is running
cd sekha-mcp
python main.py  # Should output "MCP server started"

# 2. Check controller is accessible
curl http://localhost:8080/health

# 3. Verify API key
cat ~/.config/Claude/claude_desktop_config.json | jq '.mcpServers."sekha-memory".env.CONTROLLER_API_KEY'

# 4. Check Claude logs
cat ~/Library/Logs/Claude/mcp*.log  # macOS
cat ~/.config/Claude/logs/mcp*.log  # Linux
```

**VS Code Extension:**

```bash
# 1. Check extension is installed
code --list-extensions | grep sekha

# 2. Check settings
cat ~/Library/Application\ Support/Code/User/settings.json | grep sekha  # macOS
cat ~/.config/Code/User/settings.json | grep sekha  # Linux

# 3. Check Output panel in VS Code
# View > Output > Select "Sekha" from dropdown

# 4. Test API connection
curl -H "X-API-Key: $SEKHA_API_KEY" http://localhost:8080/health
```

**Python SDK:**

```python
import logging
from sekha import SekhaClient

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

try:
    client = SekhaClient(
        base_url="http://localhost:8080",
        api_key="your-key"
    )
    
    # Test connection
    health = client.health()
    print(f"Health: {health}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
```

---

## Docker-Specific Debugging

### Container Won't Start

```bash
# Check container status
docker ps -a | grep sekha

# View exit code and error
docker inspect sekha-controller | jq '.[0].State'

# Check logs
docker logs sekha-controller

# Try running interactively
docker run -it --rm sekha/controller /bin/sh
```

### Network Issues

```bash
# Check Docker network
docker network ls | grep sekha

# Inspect network
docker network inspect sekha_default

# Test connectivity between containers
docker exec sekha-controller ping sekha-postgres
docker exec sekha-controller ping sekha-chroma
```

### Port Conflicts

```bash
# Check if port is in use
lsof -i :8080  # Controller
lsof -i :5432  # PostgreSQL
lsof -i :8000  # ChromaDB
lsof -i :11434 # Ollama

# Change port in docker-compose.yml
ports:
  - "8081:8080"  # Map to different host port
```

---

## Database Debugging

### Connect to Database

```bash
# Via Docker
docker exec -it sekha-postgres psql -U sekha -d sekha

# Direct connection
psql postgresql://sekha:password@localhost:5432/sekha
```

### Common Queries

```sql
-- Count conversations
SELECT COUNT(*) FROM conversations;

-- Check recent conversations
SELECT id, label, created_at 
FROM conversations 
ORDER BY created_at DESC 
LIMIT 10;

-- Find large conversations
SELECT c.id, c.label, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY message_count DESC
LIMIT 10;

-- Check for orphaned messages
SELECT COUNT(*) 
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
WHERE c.id IS NULL;

-- Database size
SELECT pg_size_pretty(pg_database_size('sekha'));
```

### Reset Database

```bash
# ⚠️ WARNING: Deletes all data!

# Drop and recreate
psql -U sekha -c "DROP DATABASE IF EXISTS sekha;"
psql -U sekha -c "CREATE DATABASE sekha;"

# Run migrations
cd sekha-controller
cargo run --bin migrate
```

---

## ChromaDB Debugging

### Check Collections

```bash
# List collections
curl http://localhost:8000/api/v1/collections

# Get collection info
curl http://localhost:8000/api/v1/collections/sekha_memories

# Count embeddings
curl http://localhost:8000/api/v1/collections/sekha_memories/count
```

### Reset ChromaDB

```bash
# ⚠️ WARNING: Deletes all embeddings!

# Stop ChromaDB
docker compose stop sekha-chroma

# Remove volume
docker volume rm sekha_chroma_data

# Restart (creates new collection)
docker compose up -d sekha-chroma

# Rebuild embeddings
curl -X POST http://localhost:8080/api/v1/rebuild-embeddings
```

---

## Performance Profiling

### Enable Request Timing

```bash
export LOG_LEVEL=DEBUG
```

**Log output:**

```
DEBUG: Query started: authentication
DEBUG: Embedding generated in 145ms
DEBUG: ChromaDB search in 52ms
DEBUG: Database lookup in 8ms
DEBUG: Total query time: 205ms
```

### Identify Bottlenecks

- **Embedding >500ms** → Ollama slow (check GPU)
- **ChromaDB >200ms** → Large collection (optimize index)
- **Database >100ms** → Missing index or slow query

---

## Support & Escalation

### Gather Diagnostic Info

Before filing an issue, collect:

```bash
#!/bin/bash
# diagnostic.sh

echo "=== Sekha Diagnostic Report ==="
echo "Date: $(date)"
echo

echo "--- System Info ---"
uname -a
docker --version

echo
echo "--- Service Status ---"
docker compose ps

echo
echo "--- Health Check ---"
curl http://localhost:8080/health

echo
echo "--- Recent Logs (Controller) ---"
docker logs sekha-controller --tail 50

echo
echo "--- Database Connection ---"
psql -U sekha -d sekha -c "SELECT version();"

echo
echo "--- ChromaDB Status ---"
curl http://localhost:8000/api/v1/heartbeat

echo
echo "--- Ollama Models ---"
curl http://localhost:11434/api/tags
```

Run: `bash diagnostic.sh > diagnostic.txt`

### File an Issue

1. Run diagnostic script
2. Describe what you were trying to do
3. Include error messages and logs
4. Attach `diagnostic.txt`
5. Submit to: [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)

### Get Help

- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH) - Fastest response
- **GitHub Discussions:** [Ask Questions](https://github.com/sekha-ai/sekha-controller/discussions)
- **Email:** security@sekha.dev (for vulnerabilities only)

---

## Next Steps

- **[Performance Tuning](performance.md)** - Optimize slow operations
- **[Monitoring](../deployment/monitoring.md)** - Set up observability
- **[Configuration](../reference/configuration.md)** - Adjust settings
- **[Common Issues](common-issues.md)** - FAQ and solutions

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
