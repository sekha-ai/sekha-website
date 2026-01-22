# Quickstart Guide

Get Sekha running in 5 minutes with Docker Compose.

## What You'll Get

A complete Sekha stack including:

- **Sekha Controller** (port 8080) - Core memory engine
- **Sekha LLM Bridge** (port 5001) - LLM operations
- **ChromaDB** (port 8000) - Vector database
- **Ollama** (port 11434) - Local LLM runtime

## Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- 8GB RAM minimum (16GB recommended)
- 10GB disk space for models and data

### Verify Docker Installation

```bash
docker --version
# Expected: Docker version 20.10.0 or higher

docker compose version
# Expected: Docker Compose version 2.0.0 or higher
```

## Step 1: Clone Deployment Repository

```bash
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker
```

## Step 2: Start the Stack

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# This will:
# 1. Pull all Docker images
# 2. Create data volumes
# 3. Start services in dependency order
# 4. Download embedding model (nomic-embed-text)
```

**First-time startup takes 2-5 minutes** to download images and models.

## Step 3: Verify Installation

### Check Health

```bash
curl http://localhost:8080/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-21T...",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"},
    "llm_bridge": {"status": "ok"}
  }
}
```

### View Interactive API Docs

Open in your browser:
```
http://localhost:8080/swagger-ui/
```

## Step 4: Store Your First Conversation

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "label": "First Conversation",
    "folder": "/personal/test",
    "messages": [
      {
        "role": "user",
        "content": "Hello Sekha! This is my first message. I love building AI systems."
      },
      {
        "role": "assistant",
        "content": "Hello! I will remember this conversation forever. Your interest in AI systems has been noted."
      }
    ]
  }'
```

**Expected response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "First Conversation",
  "folder": "/personal/test",
  "status": "active",
  "message_count": 2,
  "created_at": "2026-01-21T22:00:00"
}
```

## Step 5: Query Your Memory

Semantic search (finds meaning, not just keywords):

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "What am I interested in?",
    "limit": 5
  }'
```

**Expected response:**
```json
{
  "results": [
    {
      "conversation_id": "123e4567...",
      "message_id": "456...",
      "content": "Hello! I will remember this conversation forever. Your interest in AI systems has been noted.",
      "score": 0.87,
      "label": "First Conversation",
      "folder": "/personal/test",
      "created_at": "2026-01-21T22:00:00"
    }
  ],
  "total": 1
}
```

✅ **Success!** Sekha found your conversation about AI systems semantically.

## Step 6: View Statistics

```bash
curl -X GET http://localhost:8080/api/v1/stats \
  -H "Authorization: Bearer dev-key-replace-in-production"
```

**Response:**
```json
{
  "total_conversations": 1,
  "total_messages": 2,
  "total_labels": 1,
  "storage_size_bytes": 4096,
  "oldest_conversation": "2026-01-21T22:00:00",
  "newest_conversation": "2026-01-21T22:00:00"
}
```

## Troubleshooting

### Services Not Healthy

```bash
# Check service logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### Port Already in Use

Edit `docker-compose.prod.yml` to change ports:
```yaml
ports:
  - "8081:8080"  # Change host port
```

### Embedding Model Not Downloaded

```bash
# Manually pull model
docker exec sekha-ollama ollama pull nomic-embed-text

# Verify
docker exec sekha-ollama ollama list
```

## Next Steps

1. **[Learn about configuration](configuration.md)** - Customize API keys, models, and settings
2. **[Follow first conversation tutorial](first-conversation.md)** - Build a complete workflow
3. **[Explore API reference](../api-reference/rest-api.md)** - See all 17 endpoints
4. **[Try the SDKs](../sdks/index.md)** - Use Python or JavaScript libraries
5. **[Set up Claude Desktop](../integrations/claude-desktop.md)** - Use MCP tools

## Stopping and Managing

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove data volumes (⚠️ deletes all conversations)
docker compose -f docker-compose.prod.yml down -v

# Restart services
docker compose -f docker-compose.prod.yml restart

# View logs
docker compose -f docker-compose.prod.yml logs -f sekha-controller
```

## Production Considerations

!!! warning "Change the API Key"
    The default API key `dev-key-replace-in-production` is for development only.
    
    Generate a secure key (32+ characters):
    ```bash
    openssl rand -base64 32
    ```
    
    Update in `docker-compose.prod.yml`:
    ```yaml
    environment:
      - SEKHA_API_KEY=your-secure-random-key-here
    ```

For production deployment, see:

- [Security Best Practices](../deployment/security.md)
- [Kubernetes Deployment](../deployment/kubernetes.md)
- [Cloud Deployment Guides](../deployment/aws.md)

---

**You now have Sekha running!** Continue with the [First Conversation Tutorial](first-conversation.md) to learn the complete workflow.