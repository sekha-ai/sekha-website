# Monitoring & Observability

Monitor Sekha Controller health, performance, and resource usage in production deployments.

## Overview

Sekha Controller exposes health checks, metrics, and logs for comprehensive observability:

- ✅ **Health endpoints** - Service health status
- ✅ **Prometheus metrics** - Performance and usage metrics
- ✅ **Structured logging** - Debug and audit trails
- ✅ **Database monitoring** - PostgreSQL health
- ✅ **Vector DB monitoring** - ChromaDB status
- ✅ **Embedding service** - Ollama/model health

---

## Health Checks

### Health Endpoint

**GET `/health`**

Returns overall system health including all dependencies.

```bash
curl http://localhost:8080/health
```

**Response (healthy):**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T22:15:30Z",
  "checks": {
    "database": {
      "status": "ok"
    },
    "chroma": {
      "status": "ok"
    }
  }
}
```

**Response (unhealthy):**

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-25T22:15:30Z",
  "checks": {
    "database": {
      "status": "ok"
    },
    "chroma": {
      "status": "error",
      "error": "Connection refused"
    }
  }
}
```

**HTTP Status Codes:**

- `200 OK` - All systems healthy
- `503 Service Unavailable` - One or more systems unhealthy

---

### Liveness vs Readiness

**Liveness** - Is the process running?

- **Endpoint:** `/health`
- **Purpose:** Detect if the controller needs to be restarted
- **Kubernetes:** Used for `livenessProbe`

**Readiness** - Can the service accept traffic?

- **Endpoint:** `/health`
- **Purpose:** Detect if dependencies are available
- **Kubernetes:** Used for `readinessProbe`

---

## Prometheus Metrics

### Metrics Endpoint

**GET `/metrics`**

Exports metrics in Prometheus format.

```bash
curl http://localhost:8080/metrics
```

**Current Metrics:**

```prometheus
# HELP sekha_conversations_total Total number of conversations
# TYPE sekha_conversations_total gauge
sekha_conversations_total 0
```

**Planned Metrics (roadmap):**

```prometheus
# API Metrics
sekha_api_requests_total{method="POST",endpoint="/api/v1/conversations",status="200"} 1543
sekha_api_request_duration_seconds{method="POST",endpoint="/api/v1/conversations"} 0.023

# Storage Metrics
sekha_conversations_total 1543
sekha_messages_total 15430
sekha_storage_bytes_total 1048576

# Database Metrics
sekha_db_connections_active 5
sekha_db_connections_idle 10
sekha_db_query_duration_seconds{operation="select"} 0.005

# Vector DB Metrics
sekha_chroma_collections_total 1
sekha_chroma_embeddings_total 15430
sekha_chroma_query_duration_seconds 0.15

# Embedding Metrics
sekha_embedding_requests_total 523
sekha_embedding_duration_seconds 0.12
sekha_embedding_tokens_total 125000

# Memory Usage
sekha_memory_rss_bytes 134217728
sekha_memory_heap_bytes 104857600
```

---

### Prometheus Configuration

Add Sekha to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'sekha-controller'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

**Docker Compose Integration:**

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

volumes:
  prometheus_data:
```

---

## Logging

### Log Levels

Sekha uses structured logging with the following levels:

| Level | Description | Use Case |
|-------|-------------|----------|
| `TRACE` | Very detailed debugging | Development only |
| `DEBUG` | Detailed execution flow | Troubleshooting |
| `INFO` | General operational events | **Default** |
| `WARN` | Warning conditions | Production |
| `ERROR` | Error conditions | Production (always on) |

### Configuration

**Environment Variable:**

```bash
LOG_LEVEL=INFO
```

**Config File:**

```toml
[logging]
level = "info"
```

---

### Log Format

**JSON (structured):**

```json
{
  "timestamp": "2026-01-25T22:15:30.123Z",
  "level": "INFO",
  "target": "sekha_controller::api::routes",
  "message": "Semantic query: what is RAG?",
  "fields": {
    "query_length": 13,
    "user_ip": "127.0.0.1"
  }
}
```

**Plain text (development):**

```
2026-01-25 22:15:30 INFO sekha_controller::api::routes - Semantic query: what is RAG?
```

---

### Log Aggregation

**Ship logs to Loki:**

```yaml
services:
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

**Ship logs to Elasticsearch:**

```yaml
services:
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
```

---

## Alerting

### Prometheus Alertmanager

**`alerts.yml`:**

```yaml
groups:
  - name: sekha
    interval: 30s
    rules:
      - alert: SekhaDown
        expr: up{job="sekha-controller"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Sekha Controller is down"
          description: "Sekha has been down for more than 1 minute"

      - alert: SekhaUnhealthy
        expr: sekha_health_status == 0
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Sekha health check failing"

      - alert: HighResponseTime
        expr: sekha_api_request_duration_seconds{quantile="0.95"} > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Sekha API response time is high"
          description: "95th percentile response time is {{ $value }}s"

      - alert: DatabaseConnectionsLow
        expr: sekha_db_connections_idle < 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low database connection pool"

      - alert: HighMemoryUsage
        expr: sekha_memory_rss_bytes > 1073741824
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Sekha memory usage is high"
          description: "Memory usage is {{ $value | humanize }}B"
```

---

## Grafana Dashboards

### Quick Setup

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./dashboards:/etc/grafana/provisioning/dashboards
```

**Access:** [http://localhost:3000](http://localhost:3000)

---

### Dashboard Panels

**Key Metrics to Monitor:**

1. **Request Rate**
   - `rate(sekha_api_requests_total[5m])`

2. **Response Time (p50, p95, p99)**
   - `histogram_quantile(0.95, rate(sekha_api_request_duration_seconds_bucket[5m]))`

3. **Error Rate**
   - `rate(sekha_api_requests_total{status=~"5.."}[5m])`

4. **Conversations Created**
   - `increase(sekha_conversations_total[1h])`

5. **Database Latency**
   - `sekha_db_query_duration_seconds`

6. **Chroma Query Time**
   - `sekha_chroma_query_duration_seconds`

7. **Memory Usage**
   - `sekha_memory_rss_bytes`

---

## Tracing (OpenTelemetry)

**Coming in v1.1:**

- Distributed tracing with Jaeger/Tempo
- Request flow visualization
- Latency breakdown by operation
- Cross-service correlation

---

## Troubleshooting

### High CPU Usage

**Check embedding operations:**

```bash
# Monitor Ollama GPU usage
nvidia-smi -l 1

# Check Ollama logs
docker logs sekha-ollama
```

### High Memory Usage

**Check database connections:**

```bash
# PostgreSQL connection count
psql -U sekha -d sekha -c "SELECT count(*) FROM pg_stat_activity;"
```

### Slow Queries

**Enable query logging:**

```toml
[database]
log_queries = true
log_slow_threshold_ms = 100
```

### Health Check Failures

**Check each dependency:**

```bash
# Database
psql -U sekha -h localhost -c "SELECT 1;"

# ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Ollama
curl http://localhost:11434/api/tags
```

---

## Best Practices

### Production Monitoring

1. **Set up alerts** for critical metrics (health, errors, latency)
2. **Monitor resource usage** (CPU, memory, disk, network)
3. **Track business metrics** (conversations created, queries performed)
4. **Enable structured logging** for easy parsing and search
5. **Use distributed tracing** for complex debugging

### Retention Policies

- **Logs:** 30 days minimum
- **Metrics:** 90 days minimum
- **Traces:** 7 days minimum

### Dashboard Organization

- **Overview:** High-level health and performance
- **API:** Request rates, latency, errors
- **Storage:** Database and vector DB metrics
- **Resources:** CPU, memory, disk, network

---

## Next Steps

- **[Performance Tuning](../troubleshooting/performance.md)** - Optimize slow queries
- **[Debugging](../troubleshooting/debugging.md)** - Diagnose issues
- **[Configuration](../reference/configuration.md)** - Adjust settings
- **[REST API](../api-reference/rest-api.md)** - API documentation

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
- **Discord:** [Join Community](https://discord.gg/7RUTmdd2)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
