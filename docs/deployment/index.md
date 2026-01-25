# Deployment

Deploy Sekha to production environments.

## Deployment Options

### Docker Compose (Recommended)

Quickest way to deploy the full stack:

[**Docker Compose Guide →**](docker-compose.md)

- Complete stack in one command
- Development and production configs
- Auto-restart and health checks
- Volume persistence

### Production Deployment

Enterprise-grade deployment:

[**Production Guide →**](production.md)

- High availability setup
- Load balancing
- Monitoring and logging
- Backup strategies
- Resource requirements

### Security Hardening

Secure your deployment:

[**Security Guide →**](security.md)

- API key management
- Network isolation
- Rate limiting
- TLS/SSL configuration
- Secret management

## Infrastructure Platforms

### Cloud Deployments

While we currently provide Docker Compose deployment, Sekha can be deployed to any cloud platform:

- **AWS** - EC2, ECS, or EKS
- **Azure** - VM, Container Instances, or AKS
- **GCP** - Compute Engine, Cloud Run, or GKE
- **DigitalOcean** - Droplets or App Platform

**Coming Soon:** Kubernetes manifests and cloud-specific guides

## Quick Deploy

### Minimum Requirements

- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 20GB
- **OS:** Linux, macOS, or Windows with Docker

### One-Command Deploy

```bash
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

### Verify Deployment

```bash
# Check health
curl http://localhost:8080/health

# Check logs
docker compose logs -f
```

## Environment Variables

Key configuration options:

```bash
# Server
SEKHA_HOST=0.0.0.0
SEKHA_PORT=8080
SEKHA_API_KEY=sk-sekha-your-secure-key

# Database
DATABASE_URL=sqlite:///data/sekha.db

# Vector Store
CHROMA_HOST=chroma
CHROMA_PORT=8000

# LLM
OLLAMA_HOST=ollama
OLLAMA_PORT=11434
```

See [Configuration Guide](../getting-started/configuration.md) for all options.

## Monitoring

### Health Checks

```bash
# Controller health
curl http://localhost:8080/health

# Chroma health  
curl http://localhost:8000/api/v1/heartbeat

# Ollama health
curl http://localhost:11434/api/version
```

### Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Backup & Recovery

### Backup Data

```bash
# Backup SQLite database
docker compose exec controller sqlite3 /data/sekha.db ".backup /data/backup.db"

# Backup ChromaDB
docker compose exec chroma tar czf /chroma-data-backup.tar.gz /chroma-data
```

### Restore Data

```bash
# Restore SQLite
docker cp backup.db container_name:/data/sekha.db

# Restore ChromaDB
docker cp chroma-data-backup.tar.gz container_name:/
docker compose exec chroma tar xzf /chroma-data-backup.tar.gz
```

## Scaling

### Horizontal Scaling

For high-traffic deployments:

- Deploy multiple controller instances behind a load balancer
- Use PostgreSQL instead of SQLite for shared state
- Scale ChromaDB with distributed deployment
- Add Redis for caching and rate limiting

**Coming Soon:** Detailed scaling guide

## Next Steps

- [Docker Compose](docker-compose.md) - Full stack deployment
- [Production Guide](production.md) - Enterprise deployment
- [Security](security.md) - Hardening your installation
- [Configuration](../getting-started/configuration.md) - All config options
