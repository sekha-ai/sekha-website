# Performance Optimization

> Optimize Sekha for maximum performance

## Overview

Sekha is designed for sub-100ms query latency at scale. Here's how to achieve optimal performance.

## Database Optimization

### SQLite Tuning

```sql
-- Enable WAL mode (Write-Ahead Logging)
PRAGMA journal_mode=WAL;

-- Increase cache size (in pages, default 2000)
PRAGMA cache_size=10000;

-- Optimize for read performance
PRAGMA synchronous=NORMAL;

-- Memory-mapped I/O (faster reads)
PRAGMA mmap_size=268435456;  -- 256MB
```

### Connection Pooling

```bash
# Increase max connections
SEKHA_MAX_CONNECTIONS=100

# Connection timeout
SEKHA_CONNECTION_TIMEOUT=5000  # 5 seconds
```

## Vector Search Optimization

### ChromaDB Settings

```yaml
chroma:
  environment:
    - CHROMA_SEGMENT_CACHE_POLICY=LRU
    - CHROMA_SEGMENT_CACHE_SIZE=1000
```

### Embedding Batch Size

```bash
# LLM Bridge configuration
EMBEDDING_BATCH_SIZE=32  # Process 32 texts at once
```

### Index Optimization

Larger indexes = faster search:

```python
# When creating collection
collection.modify(
    name="sekha_memories",
    metadata={"hnsw:space": "cosine", "hnsw:construction_ef": 200}
)
```

## Caching

### Redis Cache (Coming Soon)

Cache frequent queries:

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"

services:
  sekha-controller:
    environment:
      - REDIS_URL=redis://redis:6379
      - CACHE_TTL=3600  # 1 hour
```

### In-Memory Cache

Currently using in-process LRU cache:

```bash
# Configure cache size
SEKHA_CACHE_SIZE=1000  # Cache 1000 queries
```

## Resource Allocation

### Memory

```yaml
services:
  sekha-controller:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
  
  chroma:
    deploy:
      resources:
        limits:
          memory: 4G  # Larger for embeddings
```

### CPU

```yaml
services:
  sekha-controller:
    deploy:
      resources:
        limits:
          cpus: '2'
        reservations:
          cpus: '1'
```

## Query Optimization

### Limit Results

```python
# Don't fetch more than needed
results = client.query(query="...", limit=10)  # Good
results = client.query(query="...", limit=1000)  # Wasteful
```

### Use Filters

```python
# Filter early to reduce search space
results = client.query(
    query="deployment",
    folder="work/infrastructure",  # Narrows search
    importance_min=7,
    limit=10
)
```

### Context Budget

```python
# Request only what you need
context = client.context.assemble(
    query="...",
    context_budget=4000  # Don't over-request
)
```

## Network Optimization

### HTTP/2 (Coming Soon)

Reduce latency with multiplexing:

```yaml
services:
  sekha-controller:
    environment:
      - HTTP_VERSION=2
```

### Compression

Enable gzip compression:

```bash
SEKHA_ENABLE_COMPRESSION=true
```

### Keep-Alive

```python
# Reuse connections
client = SekhaClient(
    base_url="http://localhost:8080",
    keep_alive=True  # Reuse TCP connections
)
```

## Monitoring

### Key Metrics

```prometheus
# Query latency (target: P95 < 100ms)
histogram_quantile(0.95, rate(sekha_query_duration_seconds_bucket[5m]))

# Database query time
histogram_quantile(0.95, rate(sekha_db_query_duration_seconds_bucket[5m]))

# Vector search time
histogram_quantile(0.95, rate(sekha_vector_search_duration_seconds_bucket[5m]))
```

### Alerts

```yaml
- alert: SlowQueries
  expr: histogram_quantile(0.95, rate(sekha_query_duration_seconds_bucket[5m])) > 0.1
  for: 10m
  labels:
    severity: warning
```

## Benchmarking

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run --vus 10 --duration 30s load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';

export default function() {
  http.post('http://localhost:8080/api/v1/query', JSON.stringify({
    query: 'performance test',
    limit: 10
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Results Target

- **Throughput:** 1000+ req/sec
- **Latency P50:** < 20ms
- **Latency P95:** < 100ms
- **Latency P99:** < 200ms

## Production Checklist

- [ ] WAL mode enabled for SQLite
- [ ] Connection pool sized appropriately
- [ ] ChromaDB cache configured
- [ ] Resource limits set
- [ ] Monitoring enabled
- [ ] Compression enabled
- [ ] Query limits enforced
- [ ] Load tested

## Related

- [Performance Benchmarks](../reference/benchmarks.md)
- [Production Guide](../deployment/production.md)
- [Monitoring](../deployment/monitoring.md)
