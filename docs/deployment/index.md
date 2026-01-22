# Deployment Guide

Deploy Sekha AI Memory Controller using your preferred method and platform.

## Deployment Tiers

Choose the right deployment method for your needs:

| Tier | Method | Complexity | Best For |
|------|--------|------------|----------|
| 1 | [Local Binary](local-binary.md) | ⭐ Easy | Testing, individual use |
| 2 | [Docker Compose](docker-compose.md) | ⭐⭐ Medium | Teams, development |
| 3 | [Kubernetes](kubernetes.md) | ⭐⭐⭐ Advanced | Production, scale |
| 4 | [Cloud](aws.md) | ⭐⭐⭐ Advanced | Managed production |

## Quick Comparison

=== "Local Binary"

    **Pros:**
    - Fastest to get started
    - Minimal dependencies
    - Direct control
    
    **Cons:**
    - Manual dependency management
    - No automatic restarts
    - Harder to scale
    
    **[→ Local Binary Guide](local-binary.md)**

=== "Docker Compose"

    **Pros:**
    - All services included
    - Easy management
    - Reproducible environments
    
    **Cons:**
    - Requires Docker knowledge
    - Not for large scale
    
    **[→ Docker Compose Guide](docker-compose.md)**

=== "Kubernetes"

    **Pros:**
    - Production-grade
    - Auto-scaling
    - High availability
    
    **Cons:**
    - Complex setup
    - Requires K8s expertise
    - Higher resource usage
    
    **[→ Kubernetes Guide](kubernetes.md)**

=== "Cloud"

    **Pros:**
    - Managed infrastructure
    - Auto-scaling
    - High availability
    
    **Cons:**
    - Ongoing costs
    - Vendor lock-in
    - Network latency
    
    **[→ Cloud Guides](aws.md)**

## Cloud Provider Guides

Deploy on major cloud platforms:

- **[AWS](aws.md)** - ECS Fargate, RDS, ElastiCache
- **[Azure](azure.md)** - Container Instances, PostgreSQL
- **[GCP](gcp.md)** - Cloud Run, Cloud SQL

## Security Considerations

Before deploying to production, review:

- **[Security Best Practices](security.md)**
- [Authentication](../api-reference/authentication.md)
- [Configuration Reference](../reference/configuration.md)

## Need Help?

- [Troubleshooting Guide](../troubleshooting/index.md)
- [Discord Community](https://discord.gg/sekha)
- [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)