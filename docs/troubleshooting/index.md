# Troubleshooting

Solutions to common problems and debugging tips.

## Quick Links

- [**Common Issues**](common-issues.md) - Solutions to frequent problems
- [**FAQ**](faq.md) - Frequently asked questions

## Quick Checks

### Is Sekha Running?

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "ok",
  "vector_store": "ok",
  "llm": "ok"
}
```

### Check Logs

```bash
# Docker
docker logs sekha-controller

# Binary
tail -f ~/.sekha/logs/controller.log
```

### Check Dependencies

```bash
# ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Ollama
curl http://localhost:11434/api/version
```

## Common Error Messages

### "Connection refused"

**Cause:** Sekha controller not running or wrong port

**Solution:**
```bash
# Check if running
docker ps | grep sekha-controller

# Check config
cat ~/.sekha/config.toml | grep port

# Restart
docker-compose restart sekha-controller
```

### "Unauthorized" (HTTP 401)

**Cause:** Missing or invalid API key

**Solution:**
```bash
# Check your API key in config
cat ~/.sekha/config.toml | grep api_key

# Use in requests
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8080/conversations
```

### "Too Many Requests" (HTTP 429)

**Cause:** Rate limit exceeded

**Solution:**
```bash
# Increase limits in config.toml
[rate_limiting]
requests_per_second = 200  # Increase from 100
burst_size = 400           # Increase from 200

# Restart controller
docker-compose restart sekha-controller
```

### "ChromaDB connection failed"

**Cause:** ChromaDB not running or wrong URL

**Solution:**
```bash
# Check if running
docker ps | grep chroma

# Test connection
curl http://localhost:8000/api/v1/heartbeat

# Check config
cat ~/.sekha/config.toml | grep chroma_url

# Restart ChromaDB
docker-compose restart chroma
```

### "Ollama model not found"

**Cause:** Embedding model not pulled

**Solution:**
```bash
# Pull the model
docker exec sekha-ollama ollama pull nomic-embed-text

# Verify
docker exec sekha-ollama ollama list
```

## Performance Issues

### Slow Searches

**Diagnosis:**
```bash
# Check vector store size
curl http://localhost:8000/api/v1/collections/sekha_memory

# Check database size
ls -lh ~/.sekha/data/sekha.db
```

**Solutions:**
1. **Archive old conversations** - Reduce active dataset
2. **Increase resources** - More RAM for ChromaDB
3. **Optimize queries** - Use filters to narrow search

### High Memory Usage

**Diagnosis:**
```bash
# Check container stats
docker stats sekha-controller sekha-chroma sekha-ollama
```

**Solutions:**
1. **Limit Docker memory** - Set in docker-compose.yml
2. **Reduce batch size** - Lower embedding batch_size in config
3. **Enable swap** - If on limited RAM system

### Slow Embedding Generation

**Diagnosis:**
```bash
# Check Ollama performance
time docker exec sekha-ollama ollama run nomic-embed-text "test"
```

**Solutions:**
1. **Use GPU** - Configure Ollama with GPU support
2. **Reduce batch size** - Process fewer embeddings at once
3. **Use remote embeddings** - OpenAI API (faster but costs money)

## Data Issues

### Missing Conversations

**Check database:**
```bash
# Enter SQLite shell
sqlite3 ~/.sekha/data/sekha.db

# Count conversations
SELECT COUNT(*) FROM conversations;

# Check specific conversation
SELECT * FROM conversations WHERE title LIKE '%search term%';
```

### Corrupted Database

**Recovery steps:**
```bash
# 1. Stop controller
docker-compose stop sekha-controller

# 2. Check integrity
sqlite3 ~/.sekha/data/sekha.db "PRAGMA integrity_check;"

# 3. Restore from backup
cp ~/.sekha/backups/sekha-2026-01-25.db ~/.sekha/data/sekha.db

# 4. Restart
docker-compose start sekha-controller
```

### Vector Embeddings Missing

**Regenerate embeddings:**
```bash
# Via API
curl -X POST http://localhost:8080/admin/reindex \
  -H "Authorization: Bearer YOUR_API_KEY"

# Or manually
docker exec sekha-controller sekha-cli reindex-all
```

## Debugging

### Enable Debug Logging

**In config.toml:**
```toml
[logging]
level = "debug"  # Change from "info"
format = "pretty" # Easier to read than JSON
```

**Restart:**
```bash
docker-compose restart sekha-controller
```

### Test API Manually

```bash
# Create test conversation
curl -X POST http://localhost:8080/conversations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "content": "Testing 123",
    "labels": ["test"],
    "importance": 5
  }' | jq

# Search for it
curl -X POST http://localhost:8080/conversations/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "testing", "limit": 5}' | jq
```

### Check Database Schema

```bash
sqlite3 ~/.sekha/data/sekha.db ".schema conversations"
```

## Getting Help

### Before Asking

1. Check [Common Issues](common-issues.md)
2. Check [FAQ](faq.md)
3. Search [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
4. Enable debug logging and capture error messages

### Where to Ask

- **Discord:** [discord.gg/sekha](https://discord.gg/sekha) - Quick help
- **GitHub Discussions:** [Discussions](https://github.com/sekha-ai/sekha-controller/discussions) - Q&A
- **GitHub Issues:** [Issues](https://github.com/sekha-ai/sekha-controller/issues) - Bug reports

### What to Include

```
**Environment:**
- OS: 
- Sekha version: 
- Docker version: 
- Deployment method: 

**Issue:**
- What you're trying to do:
- What happens instead:
- Error messages:

**Logs:**
```
(paste relevant logs here)
```

**Config:**
```toml
(paste config.toml, remove api_key)
```
```

## Next Steps

- [**Common Issues**](common-issues.md) - Detailed solutions
- [**FAQ**](faq.md) - Frequently asked questions
- [**Configuration Guide**](../getting-started/configuration.md) - Config reference
- [**Deployment Guide**](../deployment/production.md) - Production best practices
