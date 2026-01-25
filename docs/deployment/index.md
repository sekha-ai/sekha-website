# Deployment

Deploy Sekha Controller in various environments.

## Deployment Options

### Quick Start (Development)

For testing and development:

- [**Docker Compose**](docker-compose.md) - Easiest way to get started
- Includes all dependencies (ChromaDB, Ollama)
- Perfect for local development

### Production Deployments

For production use:

- [**Production Guide**](production.md) - Best practices for production
- [**Security Hardening**](security.md) - Secure your deployment

### Cloud Deployments (Coming Soon)

Planned for Q2 2026:

- **Kubernetes** - Container orchestration
- **AWS** - EC2, ECS, Fargate
- **Azure** - AKS, Container Instances
- **GCP** - GKE, Cloud Run

## Deployment Comparison

| Method | Best For | Complexity | Scalability |
|--------|----------|------------|--------------|
| Docker Compose | Development, single server | Low | Vertical only |
| Binary | Lightweight deployments | Low | Vertical only |
| Kubernetes | Multi-node, high availability | High | Horizontal |
| Managed Cloud | Hands-off operation | Medium | Auto-scaling |

## Prerequisites

### All Deployments

- Linux, macOS, or Windows (WSL2)
- 2+ CPU cores
- 4GB+ RAM
- 10GB+ disk space

### For Docker Deployments

- Docker 20.10+
- Docker Compose 2.0+

### For Production

- Reverse proxy (nginx, Caddy, Traefik)
- TLS certificates
- Monitoring solution (Prometheus, Grafana)

## Architecture Tiers

### Single Server (Recommended Start)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Single Server Deployment   ┃
┃                              ┃
┃  Sekha Controller (Docker)   ┃
┃  ChromaDB (Docker)           ┃
┃  Ollama (Docker)             ┃
┃  SQLite (volume)             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**Suitable for:**
- Personal use
- Small teams (<10 users)
- Development/staging

### Multi-Server (Production)

```
┏━━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━━┓
┃  Controller 1  ┃     ┃  Controller 2  ┃     ┃  Controller 3  ┃
┗━━━━━━━━┳━━━━━━┛     ┗━━━━━━━━┳━━━━━━┛     ┗━━━━━━━━┳━━━━━━┛
        ┃                    ┃                    ┃
        ┗━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━┛
                      ┃
               ┏━━━━━━┴━━━━━━┓
               ┃  PostgreSQL  ┃
               ┗━━━━━━━━━━━━━┛

     ┏━━━━━━━━━━━━┓          ┏━━━━━━━━━━━━┓
     ┃   ChromaDB   ┃          ┃    Ollama   ┃
     ┗━━━━━━━━━━━━┛          ┗━━━━━━━━━━━━┛
```

**Suitable for:**
- Enterprise deployments
- High availability requirements
- Multi-team organizations

## Configuration

All deployments use the same configuration file format:

```toml
# ~/.sekha/config.toml

[server]
host = "0.0.0.0"
port = 8080
api_key = "sk-sekha-your-secure-key-min-32-chars-long"

[database]
url = "sqlite://~/.sekha/data/sekha.db"
# url = "postgresql://user:pass@localhost:5432/sekha"  # Production

[vector_store]
chroma_url = "http://localhost:8000"

[llm]
provider = "ollama"
ollama_url = "http://localhost:11434"
```

See [Configuration Guide](../getting-started/configuration.md) for full reference.

## Security Checklist

Before deploying to production:

- [ ] Generate strong API key (32+ characters)
- [ ] Enable TLS/HTTPS
- [ ] Configure firewall rules
- [ ] Set up reverse proxy
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up monitoring and alerts
- [ ] Regular backups configured
- [ ] Log rotation enabled
- [ ] Security updates automated

See [Security Guide](security.md) for details.

## Monitoring

### Health Checks

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "database": "ok",
  "vector_store": "ok",
  "llm": "ok"
}
```

### Metrics (Coming Soon)

Prometheus metrics will be available at `/metrics`:

- Request rates and latencies
- Database connection pool stats
- Vector store query performance
- LLM operation timings

## Next Steps

- [**Docker Compose**](docker-compose.md) - Quick start deployment
- [**Production Guide**](production.md) - Production best practices
- [**Security Hardening**](security.md) - Secure your deployment
- [**Configuration Reference**](../getting-started/configuration.md) - Complete config guide
