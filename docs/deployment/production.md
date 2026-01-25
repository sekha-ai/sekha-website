# Production Deployment

## Overview

This guide covers deploying Sekha to production with high availability, security, and performance.

**Production Checklist:**

- ✅ HTTPS/TLS encryption
- ✅ Secure API keys (32+ characters)
- ✅ Database backups
- ✅ Monitoring and alerting
- ✅ Rate limiting configured
- ✅ Resource limits set
- ✅ Log aggregation
- ✅ Health checks enabled

---

## Architecture Decisions

### Single Server (< 100K conversations)

**Recommended for:** Individuals, small teams, startups

```
┌─────────────────────────────────────┐
│   Single Docker Host / VM            │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Sekha Controller (Rust)        │ │
│  │  + SQLite + ChromaDB            │ │
│  │  + LLM Bridge (Python)          │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Reverse Proxy (Caddy/Nginx)   │ │
│  │  + TLS Termination             │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Specs:**
- CPU: 2-4 cores
- RAM: 4-8 GB
- Storage: 50-100 GB SSD
- Cost: ~$20-40/month (DigitalOcean, Linode, Hetzner)

---

### Multi-Node (100K+ conversations)

**Recommended for:** Enterprises, high-scale deployments

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer                       │
│           (HAProxy / AWS ALB / Cloudflare)          │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼───────┐
│  Controller 1   │   │  Controller 2   │
│  (Read/Write)   │   │  (Read/Write)   │
└───────┬────────┘   └────────┬───────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼───────┐
│  PostgreSQL     │   │  ChromaDB      │
│  (Primary)      │   │  Cluster       │
│                 │   │                │
│  + Replica      │   │  + Replicas    │
└────────────────┘   └────────────────┘
```

**Specs (per controller node):**
- CPU: 8+ cores
- RAM: 16-32 GB
- Storage: 500 GB+ SSD
- Cost: ~$200-500/month per node

---

## Deployment Methods

### Method 1: Docker Compose (Recommended)

**Best for:** Quick production deployments, single-server setups

#### Step 1: Create Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  sekha-controller:
    image: ghcr.io/sekha-ai/sekha-controller:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"  # Only localhost access
    volumes:
      - ./data:/data
      - ./config:/root/.sekha:ro
    environment:
      - RUST_LOG=info
      - SEKHA_DATABASE_PATH=/data/sekha.db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - sekha-controller

volumes:
  caddy_data:
  caddy_config:
```

#### Step 2: Configure Caddy (Reverse Proxy + TLS)

```caddyfile
# Caddyfile
sekha.yourdomain.com {
    # Automatic HTTPS via Let's Encrypt
    reverse_proxy sekha-controller:8080

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Rate limiting (100 req/s per IP)
    rate_limit {
        zone dynamic {
            key {remote_host}
            events 100
            window 1s
        }
    }

    # Logging
    log {
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 10
        }
    }
}
```

#### Step 3: Production Configuration

```toml
# config/config.toml
[server]
host = "0.0.0.0"
port = 8080
api_key = "your-production-key-min-32-chars-long-use-openssl-rand"

[database]
path = "/data/sekha.db"
max_connections = 50
connection_timeout_seconds = 30

[chroma]
host = "localhost"
port = 8000
collection_name = "sekha_embeddings"

[llm]
provider = "ollama"
model = "llama3.2:3b"
base_url = "http://ollama:11434"

[rate_limiting]
enabled = true
requests_per_second = 100
burst_size = 200

[logging]
level = "info"
format = "json"

[security]
cors_allowed_origins = ["https://yourdomain.com"]
max_request_size_mb = 10
```

#### Step 4: Deploy

```bash
# Generate secure API key
export SEKHA_API_KEY=$(openssl rand -base64 32)

# Update config with API key
sed -i "s/your-production-key-min-32-chars-long-use-openssl-rand/$SEKHA_API_KEY/" config/config.toml

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify health
curl https://sekha.yourdomain.com/health
```

---

### Method 2: Systemd Service

**Best for:** Running Sekha as a native Linux service

#### Step 1: Install Binary

```bash
# Download latest release
wget https://github.com/sekha-ai/sekha-controller/releases/latest/download/sekha-controller-linux-amd64
chmod +x sekha-controller-linux-amd64
sudo mv sekha-controller-linux-amd64 /usr/local/bin/sekha-controller

# Create user
sudo useradd -r -s /bin/false sekha

# Create directories
sudo mkdir -p /var/lib/sekha /etc/sekha
sudo chown sekha:sekha /var/lib/sekha
sudo chmod 700 /var/lib/sekha
```

#### Step 2: Configure

```bash
# Create config
sudo tee /etc/sekha/config.toml > /dev/null <<EOF
[server]
host = "127.0.0.1"
port = 8080
api_key = "$(openssl rand -base64 32)"

[database]
path = "/var/lib/sekha/sekha.db"

[logging]
level = "info"
format = "json"
file = "/var/log/sekha/sekha.log"
EOF

sudo chmod 600 /etc/sekha/config.toml
sudo chown sekha:sekha /etc/sekha/config.toml
```

#### Step 3: Create Systemd Service

```ini
# /etc/systemd/system/sekha.service
[Unit]
Description=Sekha Memory Controller
After=network.target

[Service]
Type=simple
User=sekha
Group=sekha
ExecStart=/usr/local/bin/sekha-controller --config /etc/sekha/config.toml
Restart=always
RestartSec=10

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/sekha /var/log/sekha

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

#### Step 4: Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable sekha
sudo systemctl start sekha
sudo systemctl status sekha

# View logs
sudo journalctl -u sekha -f
```

---

## Database Configuration

### SQLite (Default - Recommended for <1M conversations)

**Optimize for production:**

```sql
-- Run these pragmas on startup (automated in Sekha)
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 30000000000;  -- 30GB memory-mapped I/O
```

**Backup strategy:**

```bash
#!/bin/bash
# /usr/local/bin/sekha-backup.sh

BACKUP_DIR="/backups/sekha"
DB_PATH="/var/lib/sekha/sekha.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# SQLite backup (hot backup via WAL)
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/sekha_$DATE.db'"

# Compress
gzip "$BACKUP_DIR/sekha_$DATE.db"

# Retain last 30 days
find "$BACKUP_DIR" -name "sekha_*.db.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/sekha_$DATE.db.gz"
```

**Cron job (daily backups at 2 AM):**

```bash
0 2 * * * /usr/local/bin/sekha-backup.sh >> /var/log/sekha-backup.log 2>&1
```

---

### PostgreSQL (For >1M conversations)

**When to migrate:**
- Database size > 100 GB
- Concurrent writes > 10/sec
- Need replication
- Multi-region deployment

**Connection string:**

```toml
[database]
url = "postgresql://sekha:password@localhost:5432/sekha"
max_connections = 100
connection_timeout_seconds = 30
```

---

## Monitoring

### Health Checks

**Endpoint:** `GET /health`

```json
{
  "status": "healthy",
  "checks": {
    "database": {"status": "ok", "latency_ms": 2},
    "chroma": {"status": "ok", "latency_ms": 15},
    "llm_bridge": {"status": "ok", "latency_ms": 45}
  },
  "uptime_seconds": 86400
}
```

**UptimeRobot/Pingdom:**

```bash
# Monitor every 5 minutes
URL: https://sekha.yourdomain.com/health
Expected: status code 200
Alert if down for: 2 consecutive checks
```

---

### Metrics (Prometheus)

**Sekha exposes Prometheus metrics:**

```
GET /metrics
```

**Key metrics:**

```prometheus
# Request rate
rate(sekha_http_requests_total[5m])

# Error rate
rate(sekha_http_requests_total{status=~"5.."}[5m])

# Response time (p99)
histogram_quantile(0.99, rate(sekha_http_request_duration_seconds_bucket[5m]))

# Database size
sekha_database_size_bytes

# Active conversations
sekha_conversations_total{status="active"}
```

**Grafana Dashboard:** [Download](https://grafana.com/grafana/dashboards/sekha)

---

### Logging

**Structured JSON logs:**

```json
{
  "timestamp": "2026-01-25T20:00:00Z",
  "level": "INFO",
  "message": "Request completed",
  "request_id": "abc123",
  "method": "POST",
  "path": "/api/v1/conversations",
  "status": 201,
  "duration_ms": 45
}
```

**Log aggregation (Loki/Elasticsearch):**

```yaml
# promtail-config.yml (for Loki)
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: sekha
    static_configs:
      - targets:
          - localhost
        labels:
          job: sekha
          __path__: /var/log/sekha/*.log
```

---

## Security Hardening

### Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH (change default port!)
sudo ufw allow 80/tcp   # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Fail2Ban (Brute Force Protection)

```ini
# /etc/fail2ban/filter.d/sekha.conf
[Definition]
failregex = .*"status":401.*"ip":"<HOST>".*
ignoreregex =

# /etc/fail2ban/jail.d/sekha.conf
[sekha]
enabled = true
port = http,https
filter = sekha
logpath = /var/log/sekha/sekha.log
maxretry = 5
bantime = 3600
```

### API Key Rotation

```bash
#!/bin/bash
# Rotate API key quarterly

NEW_KEY=$(openssl rand -base64 32)

# Update config
sed -i "s/api_key = .*/api_key = \"$NEW_KEY\"/" /etc/sekha/config.toml

# Restart service
sudo systemctl restart sekha

# Notify users via email
echo "API key rotated. New key: $NEW_KEY" | mail -s "Sekha API Key Rotation" admin@yourdomain.com
```

---

## Performance Tuning

### OS-Level Optimizations

```bash
# /etc/sysctl.d/99-sekha.conf

# Network performance
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1

# File descriptor limits
fs.file-max = 2097152

# Apply
sudo sysctl -p /etc/sysctl.d/99-sekha.conf
```

### ChromaDB Optimization

```python
# Increase batch size for faster indexing
chroma_client.create_collection(
    name="sekha_embeddings",
    metadata={
        "hnsw:space": "cosine",
        "hnsw:construction_ef": 200,  # Higher = better recall
        "hnsw:M": 16  # Higher = more memory, better recall
    }
)
```

---

## Disaster Recovery

### Backup Verification

```bash
#!/bin/bash
# Test backup restoration weekly

BACKUP="/backups/sekha/latest.db.gz"
TEST_DB="/tmp/sekha_test.db"

# Restore backup
gunzip -c "$BACKUP" > "$TEST_DB"

# Verify integrity
sqlite3 "$TEST_DB" "PRAGMA integrity_check;"

# Test query
sqlite3 "$TEST_DB" "SELECT COUNT(*) FROM conversations;"

# Cleanup
rm "$TEST_DB"
```

### Restore Procedure

```bash
# 1. Stop Sekha
sudo systemctl stop sekha

# 2. Restore database
gunzip -c /backups/sekha/latest.db.gz > /var/lib/sekha/sekha.db

# 3. Fix permissions
sudo chown sekha:sekha /var/lib/sekha/sekha.db
sudo chmod 600 /var/lib/sekha/sekha.db

# 4. Start Sekha
sudo systemctl start sekha

# 5. Verify
curl http://localhost:8080/health
```

---

## Troubleshooting Production Issues

### High CPU Usage

**Diagnosis:**

```bash
# Check top processes
top -u sekha

# Profile with perf (if available)
sudo perf record -p $(pgrep sekha-controller) -g -- sleep 30
sudo perf report
```

**Common causes:**

- Inefficient queries (add indexes)
- Too many concurrent requests (increase rate limits)
- Large context assembly (reduce `context_budget`)

### High Memory Usage

**Diagnosis:**

```bash
# Check memory map
sudo pmap -x $(pgrep sekha-controller)

# Monitor over time
while true; do
  ps aux | grep sekha-controller | awk '{print $6}'
  sleep 5
done
```

**Solutions:**

- Reduce SQLite cache: `PRAGMA cache_size = -32000`
- Limit ChromaDB batch size
- Enable swap (as safety net)

### Database Lock Errors

**Error:** `database is locked`

**Solutions:**

1. Ensure WAL mode is enabled: `PRAGMA journal_mode = WAL;`
2. Increase busy timeout: `PRAGMA busy_timeout = 5000;`
3. Reduce concurrent writes
4. Consider PostgreSQL migration

---

## Cost Optimization

### Cloud Provider Comparison (Monthly costs for single-server deployment)

| Provider | Specs | Cost | Notes |
|----------|-------|------|-------|
| **Hetzner** | 4 vCPU, 8 GB, 160 GB SSD | $7 | Best value, EU-based |
| **DigitalOcean** | 4 vCPU, 8 GB, 160 GB SSD | $48 | Good UI, NYC/SF/EU |
| **Linode** | 4 vCPU, 8 GB, 160 GB SSD | $36 | Reliable, global |
| **AWS EC2 (t3.large)** | 2 vCPU, 8 GB + 100 GB EBS | $76 | Reserved instance pricing |
| **GCP (e2-standard-2)** | 2 vCPU, 8 GB + 100 GB disk | $68 | Sustained use discounts |

**Recommendation:** Start with Hetzner or Linode for best price/performance.

---

## Next Steps

- **[Security Guide](security.md)** - Advanced security hardening
- **[Monitoring Guide](monitoring.md)** - Comprehensive observability
- **[Kubernetes Deployment](kubernetes.md)** - Multi-node deployments
- **[Scaling Guide](../advanced/scaling.md)** - Handle millions of conversations

---

*Last updated: January 2026*
