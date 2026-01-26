# Troubleshooting

Common issues and solutions.

## Quick Diagnosis

### Health Check

First, check system health:

```bash
curl http://localhost:8080/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "vector_store": "ok",
    "llm_bridge": "ok"
  }
}
```

### Component Status

```bash
# Controller
curl http://localhost:8080/health

# ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Ollama
curl http://localhost:11434/api/version
```

## Common Issues

Comprehensive troubleshooting guide:

[**Common Issues →**](common-issues.md)

- Connection errors
- Database issues
- Embedding generation failures
- Performance problems
- Memory issues

## FAQ

Frequently asked questions:

[**FAQ →**](faq.md)

- General questions
- Configuration
- Performance
- Integrations
- Development

## Debug Mode

Enable verbose logging:

```bash
# Set log level
export RUST_LOG=debug

# Or in config.toml
[logging]
level = "debug"
```

## Performance Issues

If queries are slow:

1. **Check Database Size**
   ```bash
   ls -lh data/sekha.db
   ```

2. **Check ChromaDB**
   ```bash
   docker stats chroma
   ```

3. **Monitor Resources**
   ```bash
   docker stats
   ```

4. **Enable Query Logging**
   ```toml
   [logging]
   sql_queries = true
   ```

## Debugging Tips

### Enable Detailed Logs

```bash
# Full debug output
export RUST_LOG=sekha=debug,sea_orm=debug

# Restart service
docker compose restart controller
```

### Check Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f controller
docker compose logs -f chroma
docker compose logs -f llm-bridge
```

### Inspect Database

```bash
# Open SQLite
sqlite3 data/sekha.db

# Check tables
.tables

# Query conversations
SELECT COUNT(*) FROM conversations;
```

## Getting Help

### Community Support

- [Discord](https://discord.gg/gZb7U9deKH) - Real-time help
- [GitHub Discussions](https://github.com/sekha-ai/sekha-controller/discussions) - Q&A forum
- [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues) - Bug reports

### Before Asking

Include:

1. **System info**: OS, Docker version
2. **Logs**: Relevant error messages
3. **Config**: Sanitized configuration
4. **Steps**: How to reproduce
5. **Expected**: What should happen
6. **Actual**: What actually happens

## Next Steps

- [Common Issues](common-issues.md) - Detailed troubleshooting
- [FAQ](faq.md) - Quick answers
- [Configuration](../getting-started/configuration.md) - Config reference
- [Deployment](../deployment/docker-compose.md) - Setup guide
