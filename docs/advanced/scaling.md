# Scaling Guide

## Overview

Scale Sekha from thousands to millions of conversations with horizontal scaling, database optimization, and distributed architecture.

**This guide covers:**
- Horizontal scaling strategies
- Database sharding
- Load balancing
- Performance benchmarks at scale
- Cost optimization

---

## Scaling Thresholds

| Conversations | Users | Architecture | Monthly Cost |
|---------------|-------|--------------|-------------|
| < 10K | < 10 | Single server + SQLite | $20-40 |
| 10K - 100K | 10-100 | Single server + PostgreSQL | $50-100 |
| 100K - 1M | 100-1000 | Multi-node + Postgres + Redis | $200-500 |
| 1M - 10M | 1000-10000 | Kubernetes cluster + sharding | $1000-5000 |
| 10M+ | 10000+ | Multi-region + CDN + caching | $5000+ |

---

## Horizontal Scaling Architecture

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │  (HAProxy/ALB)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
        │Controller │  │Controller│  │Controller│
        │  Node 1   │  │  Node 2  │  │  Node 3  │
        └─────┬─────┘  └────┬─────┘  └────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
        ┌─────▼────────┐           ┌───────▼──────┐
        │  PostgreSQL  │           │   ChromaDB   │
        │   Primary    │           │   Cluster    │
        │              │           │              │
        │  + Replicas  │           │  + Replicas  │
        └──────────────┘           └──────────────┘
```

---

## Database Scaling

### PostgreSQL Configuration

**Optimize for high concurrency:**

```sql
-- postgresql.conf
max_connections = 200
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

### Read Replicas

```toml
[database]
primary_url = "postgresql://sekha:pw@primary:5432/sekha"
replica_urls = [
  "postgresql://sekha:pw@replica1:5432/sekha",
  "postgresql://sekha:pw@replica2:5432/sekha"
]
read_weight = 0.8  # 80% reads go to replicas
```

---

## Redis Caching Layer

**Cache frequently accessed conversations:**

```toml
[cache]
enabled = true
redis_url = "redis://localhost:6379/0"
ttl_seconds = 3600
max_size_mb = 2048

[cache.policies]
conversations = { ttl = 3600 }  # 1 hour
summaries = { ttl = 86400 }     # 24 hours
embeddings = { ttl = 604800 }   # 7 days
```

**Performance gain:** 10-50x faster for cached queries

---

## Load Balancing Strategies

### Round Robin (Simple)

```nginx
upstream sekha_backend {
  server controller1:8080;
  server controller2:8080;
  server controller3:8080;
}
```

### Least Connections (Better)

```nginx
upstream sekha_backend {
  least_conn;
  server controller1:8080;
  server controller2:8080;
  server controller3:8080;
}
```

### Sticky Sessions (Best for long contexts)

```nginx
upstream sekha_backend {
  ip_hash;  # Same user → same server
  server controller1:8080;
  server controller2:8080;
  server controller3:8080;
}
```

---

## Performance Benchmarks

### Single Node (4 vCPU, 8GB RAM)

| Metric | SQLite | PostgreSQL |
|--------|--------|------------|
| **Writes/sec** | 500 | 2000 |
| **Reads/sec** | 5000 | 15000 |
| **Query latency (p99)** | 50ms | 20ms |
| **Max conversations** | 1M | 10M+ |
| **Max concurrent users** | 100 | 500 |

### Multi-Node (3x 8 vCPU, 16GB RAM)

| Metric | With Redis Cache | No Cache |
|--------|------------------|----------|
| **Writes/sec** | 5000 | 5000 |
| **Reads/sec** | 100000 | 30000 |
| **Query latency (p99)** | 5ms | 25ms |
| **Max conversations** | 50M+ | 50M+ |
| **Max concurrent users** | 5000+ | 2000 |

---

## Cost Optimization

### Tiered Storage

```toml
[storage.tiers]
active = { ttl_days = 30, storage = "ssd" }
archived = { ttl_days = 365, storage = "hdd" }
cold = { ttl_days = null, storage = "s3" }
```

**Savings:** 60-80% reduction in storage costs

---

## Kubernetes Deployment

See **[Kubernetes Guide](../deployment/kubernetes.md)** for full setup.

---

*This is a living document. Scaling strategies evolve with Sekha.*
