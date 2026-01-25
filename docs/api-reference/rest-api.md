# REST API

Complete HTTP REST API documentation for Sekha Controller.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All requests require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8080/api/v1/conversations
```

Configure API key in `config.toml`:

```toml
[server]
api_key = "sk-sekha-your-secure-key-min-32-chars-long"
```

## Endpoints

### Conversations

#### Create Conversation

```http
POST /conversations
```

**Request:**

```json
{
  "label": "Project Discussion",
  "messages": [
    {
      "role": "user",
      "content": "Let's discuss the architecture"
    },
    {
      "role": "assistant",
      "content": "Sure! What aspects would you like to cover?"
    }
  ],
  "folder": "work",
  "importance": 8
}
```

**Response (201):**

```json
{
  "id": 1,
  "label": "Project Discussion",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z",
  "message_count": 2
}
```

#### Get Conversation

```http
GET /conversations/{id}
```

**Response (200):**

```json
{
  "id": 1,
  "label": "Project Discussion",
  "messages": [
    {
      "role": "user",
      "content": "Let's discuss the architecture",
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ],
  "folder": "work",
  "importance": 8,
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

#### List Conversations

```http
GET /conversations?limit=10&offset=0&folder=work
```

**Response (200):**

```json
{
  "conversations": [
    {
      "id": 1,
      "label": "Project Discussion",
      "message_count": 2,
      "created_at": "2025-01-01T12:00:00Z"
    }
  ],
  "total": 1
}
```

#### Update Conversation

```http
PUT /conversations/{id}
```

**Request:**

```json
{
  "label": "Updated Label",
  "importance": 9
}
```

#### Delete Conversation

```http
DELETE /conversations/{id}
```

**Response (204):** No content

### Search

#### Semantic Search

```http
POST /query
```

**Request:**

```json
{
  "query": "What did we discuss about architecture?",
  "limit": 5,
  "threshold": 0.7
}
```

**Response (200):**

```json
{
  "results": [
    {
      "conversation_id": 1,
      "message": "Let's discuss the architecture",
      "relevance_score": 0.95,
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ]
}
```

#### Full-Text Search

```http
POST /conversations/search
```

**Request:**

```json
{
  "query": "architecture",
  "folder": "work",
  "limit": 10
}
```

### Context Assembly

#### Get Optimized Context

```http
POST /context/assemble
```

**Request:**

```json
{
  "query": "Continue our architecture discussion",
  "context_budget": 8000,
  "include_summaries": true
}
```

**Response (200):**

```json
{
  "context": "Previously, we discussed...",
  "token_count": 450,
  "sources": [1, 2, 3]
}
```

### Labels & Folders

#### Create Label

```http
POST /labels
```

**Request:**

```json
{
  "name": "important",
  "color": "#ff0000"
}
```

#### List Labels

```http
GET /labels
```

### Statistics

#### Get Stats

```http
GET /stats
```

**Response (200):**

```json
{
  "total_conversations": 150,
  "total_messages": 1250,
  "storage_size_mb": 45.2,
  "embeddings_count": 1250,
  "uptime_seconds": 86400
}
```

### Health & Monitoring

#### Health Check

```http
GET /health
```

**Response (200):**

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

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": {
      "field": "messages",
      "issue": "Required field missing"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

Default limits:
- **100 requests/second**
- **200 burst size**

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDKs

Official SDKs available:

- [Python SDK](../sdks/python-sdk.md)
- [JavaScript SDK](../sdks/javascript-sdk.md)

## Next Steps

- [MCP Tools](mcp-tools.md) - Model Context Protocol integration
- [Configuration](../getting-started/configuration.md) - Server configuration
- [Deployment](../deployment/docker-compose.md) - Production deployment
