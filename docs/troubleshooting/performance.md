# Performance Tuning

Optimize Sekha Controller for maximum throughput, low latency, and efficient resource usage.

## Overview

This guide covers:

- Query optimization and indexing
- Database performance tuning
- ChromaDB optimization
- Embedding service scaling
- Caching strategies
- Resource limits and scaling

**Expected Performance:**

| Operation | Target Latency | Notes |
|-----------|---------------|-------|
| **Health check** | <10ms | Simple connectivity test |
| **Create conversation** | <100ms | Without embedding |
| **Semantic search** | <150ms | After initial model load |
| **First search (cold start)** | <500ms | Model loading time |
| **List conversations** | <50ms | With indexes |
| **Context assembly** | <300ms | For 10 conversations |

---

## Database Optimization

### 1. Indexes

**Check existing indexes:**

```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Essential indexes:**

```sql
-- Conversations table
CREATE INDEX CONCURRENTLY idx_conversations_folder ON conversations(folder);
CREATE INDEX CONCURRENTLY idx_conversations_label ON conversations(label);
CREATE INDEX CONCURRENTLY idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX CONCURRENTLY idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX CONCURRENTLY idx_conversations_importance ON conversations(importance_score DESC);
CREATE INDEX CONCURRENTLY idx_conversations_status ON conversations(status);

-- Messages table
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messages_timestamp ON messages(timestamp DESC);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_conversations_folder_status ON conversations(folder, status);
CREATE INDEX CONCURRENTLY idx_conversations_label_importance ON conversations(label, importance_score DESC);
```

**Full-text search index:**

```sql
-- Add tsvector column for FTS
ALTER TABLE messages ADD COLUMN content_tsv tsvector;

-- Create trigger to maintain tsvector
CREATE TRIGGER messages_content_tsv_update
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(content_tsv, 'pg_catalog.english', content);

-- Update existing rows
UPDATE messages SET content_tsv = to_tsvector('english', content);

-- Create GIN index for fast FTS
CREATE INDEX CONCURRENTLY idx_messages_content_tsv ON messages USING GIN(content_tsv);
```

**Index maintenance:**

```sql
-- Reindex if fragmented (run monthly)
REINDEX TABLE CONCURRENTLY conversations;
REINDEX TABLE CONCURRENTLY messages;

-- Analyze for query planner
ANALYZE conversations;
ANALYZE messages;
```

---

### 2. Query Optimization

**Enable query logging:**

```sql
-- In postgresql.conf or via ALTER SYSTEM
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries >100ms
SELECT pg_reload_conf();
```

**Analyze slow queries:**

```sql
-- Find slowest queries
SELECT 
  calls,
  total_time,
  mean_time,
  query
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Use EXPLAIN ANALYZE:**

```sql
EXPLAIN ANALYZE
SELECT * FROM conversations
WHERE folder = '/work/projects' AND status = 'active'
ORDER BY created_at DESC
LIMIT 50;
```

**Optimize common patterns:**

```sql
-- BAD: Sequential scan
SELECT * FROM conversations WHERE label LIKE '%auth%';

-- GOOD: Use full-text search
SELECT * FROM conversations 
WHERE label_tsv @@ to_tsquery('auth');

-- BAD: COUNT(*) on large table
SELECT COUNT(*) FROM conversations;

-- GOOD: Approximate count
SELECT reltuples::bigint AS estimate
FROM pg_class
WHERE relname = 'conversations';
```

---

### 3. Connection Pooling

**Configure in config.toml:**

```toml
[database]
max_connections = 20
min_connections = 5
connect_timeout = 10
idle_timeout = 600
max_lifetime = 1800
```

**Monitor pool usage:**

```sql
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity
WHERE datname = 'sekha';
```

**Tune PostgreSQL:**

```ini
# postgresql.conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB
wal_buffers = 16MB
```

---

### 4. Vacuuming

**Auto-vacuum configuration:**

```sql
ALTER TABLE conversations SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE messages SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);
```

**Manual vacuum:**

```bash
# Full vacuum (requires downtime)
vacuumdb -U sekha -d sekha --full --analyze

# Concurrent vacuum (production-safe)
vacuumdb -U sekha -d sekha --analyze
```

---

## ChromaDB Optimization

### 1. Collection Settings

**Optimize HNSW parameters:**

```python
# When creating collection (not exposed in current API, roadmap)
collection = chroma_client.create_collection(
    name="sekha_memories",
    metadata={
        "hnsw:space": "cosine",
        "hnsw:construction_ef": 200,  # Higher = better recall, slower build
        "hnsw:search_ef": 100,        # Higher = better recall, slower search
        "hnsw:M": 16                  # Connections per layer
    }
)
```

**Trade-offs:**

- `construction_ef` (100-500): Build time vs. quality
- `search_ef` (50-200): Search speed vs. recall
- `M` (8-64): Memory usage vs. accuracy

---

### 2. Batch Operations

**Batch embedding inserts:**

```python
# BAD: Insert one at a time
for message in messages:
    chroma_client.add(
        ids=[message.id],
        embeddings=[embedding],
        metadatas=[metadata]
    )

# GOOD: Batch insert
chroma_client.add(
    ids=[m.id for m in messages],
    embeddings=embeddings_batch,
    metadatas=[m.metadata for m in messages]
)
```

**Optimal batch sizes:**

- **100-500 embeddings** per batch for inserts
- **10-50 queries** per batch for searches

---

### 3. Collection Compaction

**When to compact:**

- After large deletions
- Collection grows >100k embeddings
- Search performance degrades

**How to compact (manual):**

```bash
# Stop writes, backup, restart ChromaDB
docker compose stop sekha-chroma
cp -r chroma_data chroma_data.backup
docker compose up -d sekha-chroma
```

**Roadmap:** Auto-compaction in v1.1

---

### 4. Memory Management

**Configure ChromaDB memory:**

```yaml
# docker-compose.yml
services:
  chroma:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

**Estimate memory needs:**

```python
# Rough estimate
embedding_size = 768 * 4  # 768 dims * 4 bytes (float32) = 3KB
num_embeddings = 100000
total_memory = embedding_size * num_embeddings
# ~300MB for vectors + ~200MB overhead = 500MB minimum
```

---

## Embedding Service Optimization

### 1. Model Selection

**Performance comparison:**

| Model | Dimensions | Speed | Quality | Memory |
|-------|-----------|-------|---------|--------|
| all-MiniLM-L6-v2 | 384 | **Fastest** | Good | 90MB |
| **nomic-embed-text** | 768 | Fast | **High** | 270MB |
| bge-large-en | 1024 | Slow | Highest | 1.3GB |

**Benchmarks (RTX 3080):**

```
nomic-embed-text:
- Cold start: 450ms
- Warm: 45ms/query
- Batch (10): 120ms total (12ms each)

bge-large-en:
- Cold start: 800ms
- Warm: 95ms/query
- Batch (10): 280ms total (28ms each)
```

**Change model:**

```bash
# Pull faster model
ollama pull all-minilm

# Update config
echo 'embedding_model = "all-minilm"' >> config.toml

# Rebuild embeddings
curl -X POST http://localhost:8080/api/v1/rebuild-embeddings
```

---

### 2. GPU Acceleration

**Verify GPU usage:**

```bash
# Monitor GPU utilization
watch -n 1 nvidia-smi

# Should show Ollama process using GPU during embedding
```

**CPU fallback:**

If no GPU, expect 5-10x slower embeddings.

```bash
# CPU-only Ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 \
  --name ollama ollama/ollama
```

---

### 3. Batch Embedding

**Current implementation:**

Embeddings are generated one at a time (sequential).

**Roadmap (v1.1):**

Batch embedding API:

```rust
// Future API
let embeddings = embedding_service
    .generate_batch(&texts)
    .await?;

// 10x faster for bulk operations
```

---

### 4. Caching

**Current:** No embedding cache.

**Roadmap (v1.2):**

Redis-based embedding cache:

```python
# Pseudocode
embedding = cache.get(text_hash)
if not embedding:
    embedding = ollama.generate(text)
    cache.set(text_hash, embedding, ttl=86400)
```

**Benefits:**

- Skip re-embedding identical text
- Useful for repeated queries
- Reduces Ollama load

---

## API Layer Optimization

### 1. Rate Limiting

**Configure rate limits:**

```toml
[api]
rate_limit_requests = 100  # Requests per minute
rate_limit_burst = 10      # Burst allowance
```

**Per-endpoint limits:**

```rust
// Future: Custom limits per endpoint
#[rate_limit(requests = 10, per = 60)] // 10/min
async fn semantic_query(...) { ... }

#[rate_limit(requests = 100, per = 60)] // 100/min
async fn list_conversations(...) { ... }
```

---

### 2. Response Compression

**Enable gzip:**

```toml
[api]
compress_responses = true
compress_min_bytes = 1024
```

**Savings:**

- JSON responses: 70-80% smaller
- Large query results: 5-10x faster transfer

---

### 3. Pagination

**Use pagination for large results:**

```bash
# BAD: Fetch all 10,000 conversations
curl http://localhost:8080/api/v1/conversations

# GOOD: Paginate
curl "http://localhost:8080/api/v1/conversations?page=1&page_size=50"
curl "http://localhost:8080/api/v1/conversations?page=2&page_size=50"
```

**GraphQL-style cursor pagination (roadmap):**

```bash
curl "http://localhost:8080/api/v1/conversations?after=cursor123&limit=50"
```

---

## Scaling Strategies

### Vertical Scaling

**Resource allocation:**

```yaml
# docker-compose.yml
services:
  sekha-controller:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
  
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
  
  chroma:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
  
  ollama:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

### Horizontal Scaling

**Load balancing multiple controllers:**

```yaml
# docker-compose.scale.yml
services:
  sekha-controller:
    deploy:
      replicas: 3
  
  nginx:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**nginx.conf:**

```nginx
upstream sekha_backend {
    least_conn;
    server sekha-controller-1:8080;
    server sekha-controller-2:8080;
    server sekha-controller-3:8080;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://sekha_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Kubernetes HPA:**

See [Kubernetes Deployment](../deployment/kubernetes.md) for auto-scaling.

---

### Database Scaling

**Read replicas:**

```yaml
# docker-compose.yml
services:
  postgres-primary:
    image: postgres:16
    environment:
      POSTGRES_PRIMARY: true
  
  postgres-replica:
    image: postgres:16
    environment:
      POSTGRES_REPLICA_OF: postgres-primary
```

**Connection routing:**

```rust
// Pseudocode: Route reads to replica
match operation {
    Read => use replica_pool,
    Write => use primary_pool,
}
```

---

## Caching Layer

**Future: Redis integration (v1.2)**

```toml
[cache]
enabled = true
redis_url = "redis://localhost:6379"
ttl_seconds = 3600
```

**What to cache:**

1. **Frequent queries** - Cache top 100 queries
2. **Conversation metadata** - Cache list responses
3. **Health checks** - Cache for 10 seconds
4. **Embeddings** - Cache generated vectors

**Cache invalidation:**

- On conversation update/delete
- On new conversation creation
- TTL expiration

---

## Monitoring Performance

### Key Metrics

**Track these metrics:**

```python
import time
from statistics import mean, median

latencies = []

for i in range(100):
    start = time.time()
    client.query("test query")
    latencies.append(time.time() - start)

print(f"Mean: {mean(latencies)*1000:.0f}ms")
print(f"Median: {median(latencies)*1000:.0f}ms")
print(f"p95: {sorted(latencies)[94]*1000:.0f}ms")
print(f"p99: {sorted(latencies)[98]*1000:.0f}ms")
```

**Target SLOs:**

- **p50 < 100ms** - Half of requests fast
- **p95 < 300ms** - Most requests acceptable
- **p99 < 1000ms** - Outliers tolerable

---

### Load Testing

**Using wrk:**

```bash
# Install wrk
sudo apt install wrk

# Test search endpoint
wrk -t4 -c100 -d30s \
  -s search.lua \
  http://localhost:8080/api/v1/query
```

**search.lua:**

```lua
wrk.method = "POST"
wrk.body = '{"query":"test","limit":10}'
wrk.headers["Content-Type"] = "application/json"
wrk.headers["X-API-Key"] = "your-key"
```

**Using k6:**

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

export default function() {
  const res = http.post(
    'http://localhost:8080/api/v1/query',
    JSON.stringify({query: 'test', limit: 10}),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-key',
      },
    }
  );
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## Best Practices Summary

### Database

1. **Create indexes** on all frequently queried columns
2. **Use connection pooling** with appropriate limits
3. **Enable auto-vacuum** and run manual vacuum monthly
4. **Monitor slow queries** and optimize with EXPLAIN ANALYZE
5. **Use prepared statements** to reduce parsing overhead

### ChromaDB

1. **Batch operations** when possible (100-500 embeddings)
2. **Tune HNSW parameters** based on accuracy needs
3. **Compact collections** after large changes
4. **Allocate sufficient memory** (estimate: 3KB per embedding)

### Embeddings

1. **Choose right model** - Balance speed vs. quality
2. **Use GPU** for 10x faster embedding generation
3. **Batch embedding** in future versions
4. **Cache frequent queries** when available

### API

1. **Use pagination** for large result sets
2. **Enable compression** for responses >1KB
3. **Set rate limits** to prevent abuse
4. **Monitor response times** with p50/p95/p99

### Scaling

1. **Vertical first** - Increase resources before horizontal
2. **Load balance** multiple controllers when needed
3. **Read replicas** for database scaling
4. **Cache layer** for frequently accessed data

---

## Next Steps

- **[Monitoring](../deployment/monitoring.md)** - Set up observability
- **[Debugging](debugging.md)** - Diagnose performance issues
- **[Configuration](../reference/configuration.md)** - Tune settings
- **[Kubernetes](../deployment/kubernetes.md)** - Deploy at scale

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
