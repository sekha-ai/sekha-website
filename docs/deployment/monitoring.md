# Monitoring & Observability

> Monitor Sekha in production with metrics, logs, and traces

## Overview

Production Sekha deployments should include comprehensive monitoring.

## Metrics Collection

Sekha exposes Prometheus-compatible metrics:

```bash
# Metrics endpoint
curl http://localhost:8080/metrics
```

**See [Metrics Reference](../reference/metrics.md) for complete list.**

## Prometheus Setup

### 1. Add to docker-compose.yml

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

### 2. Configure prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sekha-controller'
    static_configs:
      - targets: ['sekha-controller:8080']
    metrics_path: '/metrics'

  - job_name: 'chroma'
    static_configs:
      - targets: ['chroma:8000']
```

## Grafana Dashboards

### 1. Add Grafana

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

volumes:
  grafana_data:
```

### 2. Import Dashboard

1. Access Grafana at `http://localhost:3000`
2. Add Prometheus data source (`http://prometheus:9090`)
3. Import Sekha dashboard (coming soon)

### 3. Key Panels

- Request rate & latency
- Error rates
- Database connection pool
- Memory usage
- LLM operation metrics

## Logging

### Structured Logging

Sekha outputs structured JSON logs:

```json
{
  "timestamp": "2026-01-25T18:00:00Z",
  "level": "info",
  "message": "Request completed",
  "method": "POST",
  "path": "/api/v1/conversations",
  "status": 201,
  "duration_ms": 45
}
```

### Log Aggregation (Loki)

```yaml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

## Alerting

### Critical Alerts

```yaml
groups:
  - name: sekha_critical
    rules:
      - alert: SekhaDown
        expr: up{job="sekha-controller"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Sekha controller is down"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
```

### Warning Alerts

```yaml
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning

      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: warning
```

## Health Checks

### Liveness
```bash
curl http://localhost:8080/health
# Returns: {"status":"ok"}
```

### Readiness
```bash
curl http://localhost:8080/health/ready
# Checks DB, ChromaDB, LLM Bridge
```

## Performance Monitoring

### Key Metrics to Watch

1. **Request Latency (P50, P95, P99)**
   - Target: P95 < 100ms
   - Alert: P95 > 1s

2. **Error Rate**
   - Target: < 0.1%
   - Alert: > 5%

3. **Database Connections**
   - Monitor pool utilization
   - Alert: > 90% utilized

4. **Memory Usage**
   - Track growth over time
   - Alert: > 90% of limit

## Related

- [Metrics Reference](../reference/metrics.md)
- [Production Guide](production.md)
- [Performance Benchmarks](../reference/benchmarks.md)
