# Quickstart

Get Sekha running in 5 minutes.

## Prerequisites

- Docker 20.10+ with Docker Compose
- 8GB RAM
- 20GB free disk space

## 1. Deploy Sekha

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker

# Start all services
docker compose up -d

# Wait ~30 seconds for services to initialize
```

## 2. Verify Installation

```bash
# Check health
curl http://localhost:8080/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "checks": {
    "database": "ok",
    "vector_store": "ok",
    "llm_bridge": "ok"
  }
}
```

## 3. Store Your First Conversation

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "label": "My First Conversation",
    "messages": [
      {
        "role": "user",
        "content": "What is Sekha?"
      },
      {
        "role": "assistant",
        "content": "Sekha is a universal memory system for AI that never forgets. It stores, indexes, and retrieves conversations with semantic search."
      },
      {
        "role": "user",
        "content": "How does it work?"
      },
      {
        "role": "assistant",
        "content": "Sekha uses embeddings to understand the meaning of conversations, stores them in a vector database, and can retrieve relevant context when you need it."
      }
    ]
  }'
```

**Response:**
```json
{
  "id": 1,
  "label": "My First Conversation",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z",
  "message_count": 4
}
```

## 4. Search Semantically

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "How does semantic search work?",
    "limit": 3
  }'
```

**Response:**
```json
{
  "results": [
    {
      "conversation_id": 1,
      "message": "Sekha uses embeddings to understand the meaning...",
      "relevance_score": 0.92,
      "timestamp": "2025-01-01T12:00:05Z"
    }
  ]
}
```

## 5. Get Context for LLM

```bash
curl -X POST http://localhost:8080/api/v1/context/assemble \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "Tell me more about Sekha",
    "context_budget": 2000
  }'
```

**Response:**
```json
{
  "context": "Previously, we discussed:\n\nWhat is Sekha?\nSekha is a universal memory system for AI that never forgets...\n\nHow does it work?\nSekha uses embeddings to understand the meaning...",
  "token_count": 145,
  "sources": [1]
}
```

## What Just Happened?

1. **Stored** - Your conversation was saved to SQLite
2. **Embedded** - Each message was converted to a 768-dim vector
3. **Indexed** - Vectors stored in ChromaDB for fast similarity search
4. **Retrieved** - Semantic search found relevant messages
5. **Assembled** - Context built within your token budget

## Next Steps

### Continue Learning

- [First Conversation Guide](first-conversation.md) - Detailed walkthrough
- [Configuration](configuration.md) - Customize Sekha
- [API Reference](../api-reference/rest-api.md) - All endpoints

### Integrate with Tools

- [Claude Desktop](../integrations/claude-desktop.md) - MCP integration
- [Python SDK](../sdks/python-sdk.md) - Build with Python
- [JavaScript SDK](../sdks/javascript-sdk.md) - Build with JS/TS

### Build Something

- [AI Coding Assistant](../guides/ai-coding-assistant.md) - Coding helper
- [Research Assistant](../guides/research-assistant.md) - Research tool

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs -f

# Restart services
docker compose restart
```

### Health Check Fails

```bash
# Check individual services
curl http://localhost:8000/api/v1/heartbeat  # ChromaDB
curl http://localhost:11434/api/version      # Ollama

# View controller logs
docker compose logs controller
```

### API Returns 401

Check your API key in `.env`:
```bash
SEKHA_API_KEY=dev-key-replace-in-production
```

See [Common Issues](../troubleshooting/common-issues.md) for more help.
