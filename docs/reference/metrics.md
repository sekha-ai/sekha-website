# Metrics & Monitoring

> Observability and performance metrics for Sekha

## Overview

Sekha exposes Prometheus-compatible metrics for monitoring system health and performance.

## Metrics Endpoint

```bash
GET /metrics
```

Returns metrics in Prometheus format.

## Available Metrics

### Request Metrics

```prometheus
# HTTP request duration
http_request_duration_seconds{method="POST", path="/api/v1/conversations"}

# Request count
http_requests_total{method="POST", path="/api/v1/conversations", status="200"}

# Requests in flight
http_requests_in_flight
```

### Database Metrics

```prometheus
# Query duration
sekha_db_query_duration_seconds{operation="insert"}

# Connection pool
sekha_db_connections{state="active"}
sekha_db_connections{state="idle"}

# Transaction count
sekha_db_transactions_total{status="committed"}
```

### Vector Database Metrics

```prometheus
# Embedding operations
sekha_embeddings_total{operation="create"}
sekha_embeddings_duration_seconds

# Vector search
sekha_vector_search_duration_seconds
sekha_vector_search_results{}
```

### Memory Metrics

```prometheus
# Conversations
sekha_conversations_total
sekha_conversations_active

# Messages
sekha_messages_total
sekha_messages_per_conversation

# Storage
sekha_storage_bytes{type="sqlite"}
sekha_storage_bytes{type="chroma"}
```

### LLM Bridge Metrics

```prometheus
# LLM requests
sekha_llm_requests_total{operation="summarize"}
sekha_llm_request_duration_seconds{operation="embed"}

# Tokens
sekha_llm_tokens_total{type="input"}
sekha_llm_tokens_total{type="output"}
```

## Prometheus Configuration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'sekha'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## Grafana Dashboard

Example queries for dashboards:

### Request Rate
```promql
rate(http_requests_total[5m])
```

### P95 Latency
```promql
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m])
)
```

### Error Rate
```promql
rate(http_requests_total{status=~"5.."}[5m])
```

### Database Connection Pool
```promql
sekha_db_connections{state="active"} / 
sekha_db_connections
```

## Health Checks

### Liveness Probe
```bash
curl http://localhost:8080/health
```

Returns `{"status":"ok"}` if server is running.

### Readiness Probe
```bash
curl http://localhost:8080/health/ready
```

Checks:
- Database connectivity
- ChromaDB connectivity
- LLM Bridge availability

## Alerting Rules

Example Prometheus alerts:

```yaml
groups:
  - name: sekha
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request latency"

      - alert: DatabaseDown
        expr: up{job="sekha"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Sekha controller is down"
```

## Logging

Structured JSON logs:

```json
{
  "timestamp": "2026-01-25T18:00:00Z",
  "level": "info",
  "message": "Request completed",
  "method": "POST",
  "path": "/api/v1/conversations",
  "status": 201,
  "duration_ms": 45,
  "user_id": "user_123"
}
```

## Related

- [Performance Benchmarks](benchmarks.md)
- [Production Deployment](../deployment/production.md)
