# Reference

Technical reference documentation for Sekha.

## Configuration

### [Configuration Reference](configuration.md)
Complete reference for `config.toml` - every option explained.

### [Environment Variables](environment.md)
All environment variables supported by Sekha components.

## Data Storage

### [Database Schema](database.md)
Complete SQLite schema with ERD diagrams and table descriptions.

### [Vector Store](vector-store.md)
ChromaDB configuration, collection structure, and embedding details.

## Monitoring

### [Metrics & Monitoring](metrics.md)
Prometheus metrics exposed by Sekha for monitoring and alerting.

## API Specifications

- [REST API Reference](../api-reference/rest-api.md)
- [MCP Tools Reference](../api-reference/mcp-tools.md)
- [OpenAPI Spec](https://github.com/sekha-ai/sekha-controller/blob/main/openapi.yaml)

## Data Formats

### Conversation JSON Format

```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "label": "string",
  "folder": "/path/to/folder",
  "status": "active" | "archived",
  "importance": 1-10,
  "messages": [
    {
      "role": "user" | "assistant" | "system",
      "content": "string",
      "timestamp": "ISO8601"
    }
  ]
}
```

### Query Response Format

```json
{
  "results": [
    {
      "conversation_id": "uuid",
      "message_id": "uuid",
      "content": "string",
      "score": 0.95,
      "metadata": {...}
    }
  ],
  "total": 42,
  "page": 1
}
```

## Performance Benchmarks

| Operation | Avg Latency | P95 | P99 |
|-----------|-------------|-----|-----|
| Store conversation | 45ms | 80ms | 120ms |
| Semantic query (1M vectors) | 65ms | 95ms | 150ms |
| Full-text search | 15ms | 25ms | 40ms |
| Context assembly | 85ms | 140ms | 200ms |

*Benchmarks on: AMD Ryzen 9 5950X, 32GB RAM, NVMe SSD*

## Limits & Quotas

### Default Limits

- **Max conversation size**: 1MB
- **Max messages per conversation**: 10,000
- **Max query results**: 1,000
- **Rate limit**: 100 req/s per IP
- **API key length**: 32-512 characters

### Recommended Limits

- **Conversations per user**: 100,000+
- **Total messages**: 10,000,000+
- **Vector dimensions**: 768 (nomic-embed-text)
- **Database size**: 100GB+ tested

## Version Compatibility

| Component | Version | Rust | Python | Node |
|-----------|---------|------|--------|------|
| Controller | 0.1.x | 1.83+ | - | - |
| LLM Bridge | 0.1.x | - | 3.11+ | - |
| Python SDK | 0.1.x | - | 3.8+ | - |
| JS SDK | 0.1.x | - | - | 18+ |
| MCP Server | 0.1.x | - | 3.11+ | - |

## Need Help?

- [Troubleshooting](../troubleshooting/index.md)
- [Discord Community](https://discord.gg/sekha)
- [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)