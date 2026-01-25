# Quickstart: Sekha in 5 Minutes

Get Sekha running with Docker Compose in under 5 minutes. By the end of this guide, you'll have:

- ✅ Sekha Controller running and healthy
- ✅ ChromaDB for semantic search
- ✅ Ollama for local embeddings
- ✅ Your first conversation stored
- ✅ Semantic search working

---

## Step 1: Clone and Start (2 minutes)

```bash
# Clone the deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker

# Start all services
docker compose up -d

# Wait ~30 seconds for services to initialize
```

**What this starts:**
- `sekha-controller` on port 8080
- `sekha-bridge` on port 5001
- `chromadb` on port 8000
- `ollama` on port 11434

---

## Step 2: Verify Health (30 seconds)

```bash
# Check controller health
curl http://localhost:8080/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T14:30:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"},
    "bridge": {"status": "ok"}
  }
}
```

---

## Step 3: Store Your First Conversation (1 minute)

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
        "content": "Hello Sekha! This is my first message."
      },
      {
        "role": "assistant",
        "content": "Hello! I will remember this conversation forever."
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "First Conversation",
  "folder": "/personal/test",
  "status": "active",
  "message_count": 2,
  "created_at": "2026-01-25T14:30:00Z"
}
```

!!! success "Congratulations!"
    You just stored your first AI conversation in Sekha!

---

## Step 4: Search Semantically (1 minute)

Now search for your conversation using natural language:

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "What was my first message?",
    "limit": 5
  }'
```

**Response:**
```json
{
  "results": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "label": "First Conversation",
      "similarity_score": 0.94,
      "messages": [
        {
          "role": "user",
          "content": "Hello Sekha! This is my first message.",
          "timestamp": "2026-01-25T14:30:00Z"
        }
      ]
    }
  ]
}
```

!!! tip "Semantic Search"
    Notice how Sekha understood "first message" even though your query didn't use those exact words. This is semantic search in action!

---

## Step 5: Explore the API (Optional)

Open your browser to view interactive API documentation:

```
http://localhost:8080/swagger-ui/
```

You can try all 17 API endpoints directly in your browser!

---

## What's Next?

**Learn the full API:**  
→ [REST API Reference](../api-reference/rest-api.md)

**Integrate with Claude:**  
→ [Claude Desktop MCP Setup](../integrations/claude-desktop.md)

**Organize your memory:**  
→ [Memory Organization Guide](../guides/organizing-memory.md)

**Deploy to production:**  
→ [Deployment Guides](../deployment/docker-compose.md)

---

## Common Next Steps

=== "Store More Conversations"

    ```bash
    curl -X POST http://localhost:8080/api/v1/conversations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer dev-key-replace-in-production" \
      -d '{
        "label": "Project Planning",
        "folder": "/work/projects",
        "importance_score": 8,
        "messages": [
          {"role": "user", "content": "Let'\'s plan the new API"},
          {"role": "assistant", "content": "Great! Here'\'s my suggestion..."}
        ]
      }'
    ```

=== "Update Labels"

    ```bash
    # Get conversation ID from previous response
    CONV_ID="123e4567-e89b-12d3-a456-426614174000"
    
    curl -X PUT http://localhost:8080/api/v1/conversations/$CONV_ID/label \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer dev-key-replace-in-production" \
      -d '{
        "label": "Completed Planning",
        "folder": "/work/completed"
      }'
    ```

=== "Get Context"

    ```bash
    curl -X POST http://localhost:8080/api/v1/context/assemble \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer dev-key-replace-in-production" \
      -d '{
        "query": "Continue working on the API project",
        "context_budget": 8000
      }'
    ```

---

## Troubleshooting

??? question "Health check fails?"

    **Check if services are running:**
    ```bash
    docker compose ps
    ```
    
    **View logs:**
    ```bash
    docker compose logs sekha-controller
    ```
    
    **Common fix - restart services:**
    ```bash
    docker compose restart
    ```

??? question "Embedding takes too long?"

    **First-time setup downloads the embedding model (~500MB).**
    
    Check Ollama progress:
    ```bash
    docker compose logs ollama
    ```
    
    Wait for "successfully pulled nomic-embed-text"

??? question "API returns 401 Unauthorized?"

    **The default API key is `dev-key-replace-in-production`.**
    
    Change it in `config.toml`:
    ```toml
    [server]
    api_key = "your-secure-key-min-32-chars-long"
    ```
    
    Then restart:
    ```bash
    docker compose restart sekha-controller
    ```

---

## Clean Up (Optional)

To stop and remove all services:

```bash
# Stop services (keeps data)
docker compose down

# Stop and DELETE all data (destructive)
docker compose down -v
```

---

!!! success "You're All Set!"
    
    Sekha is now running and you've stored your first conversation. 
    
    **Next recommended steps:**
    
    1. [Configure for your needs](configuration.md)
    2. [Set up Claude Desktop integration](../integrations/claude-desktop.md)
    3. [Explore the full API](../api-reference/rest-api.md)

---

[:octicons-arrow-right-24: Full Installation Guide](installation.md){ .md-button }
[:octicons-arrow-right-24: Configuration](configuration.md){ .md-button }