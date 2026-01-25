# Reference

Technical reference documentation.

## Performance

### Benchmarks

Comprehensive performance benchmarks:

[**Performance Benchmarks →**](benchmarks.md)

- Query latency (<100ms p95)
- Throughput (1000+ req/s)
- Memory usage profiles
- Scaling characteristics

## Configuration

### Server Configuration

All server settings are in `config.toml`:

```toml
[server]
host = "0.0.0.0"
port = 8080
api_key = "sk-sekha-your-secure-key-min-32-chars-long"

[database]
url = "sqlite:///data/sekha.db"
max_connections = 10

[vector_store]
host = "localhost"
port = 8000
collection_name = "sekha_embeddings"

[llm]
embedding_model = "nomic-embed-text"
summarization_model = "llama3.1:8b"

[rate_limiting]
requests_per_second = 100
burst_size = 200
```

See [Configuration Guide](../getting-started/configuration.md) for all options.

### Environment Variables

Alternatively, use environment variables:

```bash
SEKHA_HOST=0.0.0.0
SEKHA_PORT=8080
SEKHA_API_KEY=your-api-key
DATABASE_URL=sqlite:///data/sekha.db
CHROMA_HOST=localhost
CHROMA_PORT=8000
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
```

## Database Schema

### SQLite Tables

**conversations**
- `id` - Primary key
- `label` - Display name
- `folder` - Organization folder
- `importance` - 1-10 score
- `created_at` - Timestamp
- `updated_at` - Timestamp

**messages**
- `id` - Primary key
- `conversation_id` - Foreign key
- `role` - user/assistant/system
- `content` - Message text
- `timestamp` - Creation time

**embeddings**
- `id` - Primary key
- `message_id` - Foreign key
- `embedding_id` - ChromaDB ID
- `model` - Embedding model used

## Vector Store

### ChromaDB Collections

**sekha_embeddings**
- Embedding dimension: 768 (nomic-embed-text)
- Distance metric: Cosine similarity
- Metadata: conversation_id, timestamp, importance

## Metrics & Monitoring

### Available Metrics

Access via `/stats` endpoint:

```json
{
  "total_conversations": 150,
  "total_messages": 1250,
  "storage_size_mb": 45.2,
  "embeddings_count": 1250,
  "uptime_seconds": 86400,
  "requests_total": 5420,
  "errors_total": 12
}
```

### Health Checks

```bash
# Overall health
curl http://localhost:8080/health

# Component status
curl http://localhost:8080/health/detailed
```

## API Versioning

Current version: `v1`

Base path: `/api/v1`

Version strategy:
- Major versions for breaking changes
- Minor versions for new features
- Backward compatibility within major version

## Limits & Quotas

### Default Limits

- **Max message length:** 100,000 characters
- **Max messages per conversation:** 10,000
- **Max conversations:** Unlimited
- **Max query results:** 1,000
- **Rate limit:** 100 req/s (configurable)

### Storage

- **SQLite:** ~1KB per message average
- **ChromaDB:** ~3KB per embedding
- **Recommended:** 1GB per 100,000 messages

## Next Steps

- [Benchmarks](benchmarks.md) - Performance data
- [Configuration](../getting-started/configuration.md) - Setup guide
- [API Reference](../api-reference/rest-api.md) - Endpoint docs
- [Deployment](../deployment/production.md) - Production setup
