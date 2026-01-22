# Troubleshooting

Solutions to common issues and debugging strategies.

## Quick Fixes

### Controller Won't Start

1. **Check API key length** (must be 32+ characters)
2. **Verify database path** exists and is writable
3. **Check port availability** (default 8080)
4. **Review logs**: `tail -f ~/.sekha/logs/controller.log`

### Connection Errors

1. **ChromaDB not running**: `curl http://localhost:8000/api/v1/heartbeat`
2. **Ollama not available**: `curl http://localhost:11434/api/tags`
3. **Database locked**: Close other connections, check WAL mode

### Performance Issues

1. **Slow queries**: Check indexes, vacuum database
2. **High memory**: Reduce connection pool, limit concurrent requests
3. **Embedding timeouts**: Increase timeout in config, check Ollama

## Common Issues

Detailed solutions for frequent problems:

**[→ Common Issues Guide](common-issues.md)**

## Performance Tuning

Optimize Sekha for your workload:

**[→ Performance Tuning Guide](performance.md)**

## Debugging

Step-by-step debugging strategies:

**[→ Debugging Guide](debugging.md)**

## FAQ

Frequently asked questions:

**[→ FAQ](faq.md)**

## Getting Help

### Self-Service

1. Check logs: `~/.sekha/logs/controller.log`
2. Verify health: `curl http://localhost:8080/health`
3. Review configuration: `~/.sekha/config.toml`
4. Search [existing issues](https://github.com/sekha-ai/sekha-controller/issues)

### Community Support

- **Discord**: Real-time help from community
- **GitHub Discussions**: Design questions, RFC feedback
- **GitHub Issues**: Bug reports, feature requests

### Commercial Support

For commercial support inquiries: **hello@sekha.dev**

## Diagnostic Information

When reporting issues, include:

```bash
# System info
uname -a

# Sekha version
sekha-controller --version

# Component health
curl http://localhost:8080/health
curl http://localhost:8000/api/v1/heartbeat
curl http://localhost:11434/api/tags

# Recent logs (last 50 lines)
tail -50 ~/.sekha/logs/controller.log

# Configuration (redact API keys!)
cat ~/.sekha/config.toml | grep -v api_key
```