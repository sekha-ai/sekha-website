# REST API Reference

Complete HTTP REST API documentation for Sekha Controller.

## Base URL

```
http://localhost:8080
```

All API endpoints are prefixed with `/api/v1` unless otherwise specified.

## Authentication

All requests (except `/health` and `/metrics`) require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8080/api/v1/conversations
```

### Setting API Key

Configure in `config.toml`:

```toml
[auth]
api_key = "your-secure-key-min-32-chars-long"
```

Or via environment variable:

```bash
export SEKHA_API_KEY="your-secure-key-min-32-chars-long"
```

## Endpoints Overview

Sekha Controller provides **19 total endpoints**:

### Conversation Management (9 endpoints)

- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/{id}` - Get conversation by ID
- `GET /api/v1/conversations` - List conversations with filters
- `PUT /api/v1/conversations/{id}/label` - Update label/folder
- `PUT /api/v1/conversations/{id}/folder` - Update folder
- `PUT /api/v1/conversations/{id}/pin` - Pin conversation (importance=10)
- `PUT /api/v1/conversations/{id}/archive` - Archive conversation
- `DELETE /api/v1/conversations/{id}` - Delete conversation
- `GET /api/v1/conversations/count` - Count conversations

### Search & Query (3 endpoints)

- `POST /api/v1/query` - Semantic search (vector similarity)
- `POST /api/v1/search/fts` - Full-text search (SQLite FTS5)
- `POST /api/v1/rebuild-embeddings` - Rebuild vector index

### Memory Orchestration (5 endpoints)

- `POST /api/v1/context/assemble` - Intelligent context assembly
- `POST /api/v1/summarize` - Generate hierarchical summaries
- `POST /api/v1/prune/dry-run` - Get pruning suggestions
- `POST /api/v1/prune/execute` - Execute pruning
- `POST /api/v1/labels/suggest` - AI-powered label suggestions

### System (2 endpoints)

- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

---

## Conversation Management

### Create Conversation

Store a new conversation with messages and automatic embedding generation.

```http
POST /api/v1/conversations
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "label": "API Design Discussion",
  "folder": "/work/backend",
  "messages": [
    {
      "role": "user",
      "content": "Let's design the authentication API"
    },
    {
      "role": "assistant",
      "content": "Great! I recommend OAuth 2.0 with JWT tokens..."
    }
  ]
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Human-readable conversation label |
| `folder` | string | Yes | Folder path (e.g., `/work/backend`) |
| `messages` | array | Yes | Array of message objects |
| `messages[].role` | string | Yes | `"user"` or `"assistant"` |
| `messages[].content` | string | Yes | Message text content |

**Response (201 Created):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "API Design Discussion",
  "folder": "/work/backend",
  "status": "active",
  "message_count": 2,
  "created_at": "2026-01-25T20:30:00"
}
```

**Notes:**

- Embeddings are generated asynchronously via LLM Bridge
- Word count and importance score (default: 5) are auto-calculated
- Conversation ID is a UUID v4

---

### Get Conversation

Retrieve a specific conversation by ID.

```http
GET /api/v1/conversations/{id}
Authorization: Bearer YOUR_API_KEY
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Conversation UUID |

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "API Design Discussion",
  "folder": "/work/backend",
  "status": "active",
  "message_count": 2,
  "created_at": "2026-01-25T20:30:00"
}
```

**Response (404 Not Found):**

```json
{
  "error": "Conversation not found",
  "code": 404
}
```

---

### List Conversations

List conversations with optional filtering and pagination.

```http
GET /api/v1/conversations?page=1&page_size=50&folder=/work&label=API+Design
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-indexed) |
| `page_size` | integer | `50` | Results per page |
| `label` | string | - | Filter by label |
| `folder` | string | - | Filter by folder |
| `pinned` | boolean | - | Filter by pinned status |
| `archived` | boolean | - | Filter by archived status |

**Response (200 OK):**

```json
{
  "results": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "message_id": "00000000-0000-0000-0000-000000000000",
      "score": 1.0,
      "content": "API Design Discussion",
      "metadata": {
        "folder": "/work/backend",
        "status": "active",
        "importance_score": 7
      },
      "label": "API Design Discussion",
      "folder": "/work/backend",
      "timestamp": "2026-01-25T20:30:00"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 50
}
```

---

### Update Conversation Label

Update the label and/or folder for a conversation.

```http
PUT /api/v1/conversations/{id}/label
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "label": "Completed: API Design",
  "folder": "/work/archive/2026-q1"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | New label |
| `folder` | string | Yes | New folder path |

**Response (200 OK):** Empty body

**Response (404 Not Found):**

```json
{
  "error": "Conversation not found",
  "code": 404
}
```

---

### Update Conversation Folder

Update only the folder for a conversation.

```http
PUT /api/v1/conversations/{id}/folder
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "folder": "/personal/ideas"
}
```

**Response (200 OK):** Empty body

---

### Pin Conversation

Pin a conversation by setting its importance score to 10.

```http
PUT /api/v1/conversations/{id}/pin
Authorization: Bearer YOUR_API_KEY
```

**No request body required.**

**Response (200 OK):** Empty body

**Effect:** Sets `importance_score = 10`, which:

- Prioritizes this conversation in context assembly
- Protects from pruning suggestions
- Boosts in search rankings

---

### Archive Conversation

Archive a conversation (sets status to "archived").

```http
PUT /api/v1/conversations/{id}/archive
Authorization: Bearer YOUR_API_KEY
```

**No request body required.**

**Response (200 OK):** Empty body

**Effect:** Changes `status` from `"active"` to `"archived"`

---

### Delete Conversation

Permanently delete a conversation and all its messages.

```http
DELETE /api/v1/conversations/{id}
Authorization: Bearer YOUR_API_KEY
```

**Response (200 OK):** Empty body

**Response (404 Not Found):**

```json
{
  "error": "Conversation not found",
  "code": 404
}
```

!!! warning "Irreversible Operation"
    This permanently deletes the conversation and all associated messages and embeddings. Cannot be undone.

---

### Count Conversations

Count conversations globally or filtered by label/folder.

```http
GET /api/v1/conversations/count?label=API+Design
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `label` | string | Count conversations with this label |
| `folder` | string | Count conversations in this folder |

**Constraints:** Cannot specify both `label` and `folder` simultaneously.

**Response (200 OK):**

```json
{
  "count": 15,
  "label": "API Design",
  "folder": null
}
```

**Global Count (no parameters):**

```http
GET /api/v1/conversations/count
```

```json
{
  "count": 247,
  "label": null,
  "folder": null
}
```

---

## Search & Query

### Semantic Search

Search conversations using vector similarity (powered by ChromaDB).

```http
POST /api/v1/query
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "query": "What did we discuss about OAuth implementation?",
  "limit": 10,
  "offset": 0,
  "filters": {
    "folder": "/work"
  }
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | Natural language search query |
| `limit` | integer | No | `10` | Max results to return |
| `offset` | integer | No | `0` | Pagination offset |
| `filters` | object | No | `null` | Optional JSON filters |

**Response (200 OK):**

```json
{
  "results": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "message_id": "789e4567-e89b-12d3-a456-426614174111",
      "score": 0.92,
      "content": "We decided to use OAuth 2.0 with JWT tokens for stateless authentication...",
      "metadata": {},
      "label": "API Design Discussion",
      "folder": "/work/backend",
      "timestamp": "2026-01-20T15:30:00"
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 10
}
```

**How It Works:**

1. Query text is embedded via LLM Bridge (nomic-embed-text)
2. ChromaDB performs cosine similarity search
3. Results sorted by similarity score (0.0-1.0)
4. Message content and metadata fetched from SQLite

---

### Full-Text Search

Fast exact phrase matching using SQLite FTS5.

```http
POST /api/v1/search/fts
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "query": "OAuth JWT",
  "limit": 20
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | Exact phrase or keywords |
| `limit` | integer | No | `10` | Max results |

**Response (200 OK):**

```json
{
  "results": [
    {
      "id": "789e4567-e89b-12d3-a456-426614174111",
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "role": "assistant",
      "content": "OAuth 2.0 uses JWT tokens for authentication...",
      "timestamp": "2026-01-20T15:30:00",
      "embedding_id": "chroma-vector-id",
      "metadata": {}
    }
  ],
  "total": 5
}
```

**Use Cases:**

- ✅ Exact keyword matching
- ✅ Fast searches (< 10ms)
- ✅ Boolean operators (AND, OR, NOT)
- ❌ Not semantic (won't find synonyms)

---

### Rebuild Embeddings

Trigger asynchronous rebuild of all vector embeddings.

```http
POST /api/v1/rebuild-embeddings
Authorization: Bearer YOUR_API_KEY
```

**No request body required.**

**Response (202 Accepted):** Empty body

**When to Use:**

- After changing embedding model
- After importing large dataset
- To fix corrupted vector index

**Process:**

1. Background job spawned
2. Fetches all messages from SQLite
3. Generates embeddings via LLM Bridge
4. Upserts to ChromaDB
5. Logs completion

---

## Memory Orchestration

### Assemble Context

Intelligent 4-phase context assembly for optimal LLM input.

```http
POST /api/v1/context/assemble
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "query": "Continue our API authentication discussion",
  "preferred_labels": ["API Design", "Security"],
  "context_budget": 4000,
  "excluded_folders": ["/personal"]
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | User's current goal/question |
| `preferred_labels` | array | No | `[]` | Boost conversations with these labels |
| `context_budget` | integer | No | `4000` | Max tokens to return |
| `excluded_folders` | array | No | `[]` | Exclude these folders |

**Response (200 OK):**

```json
[
  {
    "id": "789e4567-e89b-12d3-a456-426614174111",
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "assistant",
    "content": "OAuth 2.0 uses JWT tokens...",
    "timestamp": "2026-01-20T15:30:00",
    "embedding_id": "chroma-id",
    "metadata": {
      "label": "API Design Discussion",
      "folder": "/work/backend",
      "relevance_score": 0.95
    }
  }
]
```

**4-Phase Algorithm:**

1. **Recall** - Semantic search (top 200) + pinned + recent labeled
2. **Ranking** - `score = 50% importance + 30% recency + 20% label_match`
3. **Assembly** - Greedy packing within token budget
4. **Enhancement** - Add metadata citations

---

### Generate Summary

Generate hierarchical summaries (daily/weekly/monthly).

```http
POST /api/v1/summarize
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "level": "daily"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversation_id` | UUID | Yes | Conversation to summarize |
| `level` | string | Yes | `"daily"`, `"weekly"`, or `"monthly"` |

**Response (200 OK):**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "level": "daily",
  "summary": "Today's discussions focused on OAuth 2.0 implementation...",
  "generated_at": "2026-01-25T20:30:00"
}
```

**Summary Levels:**

- **Daily**: Last 24 hours (≈200 words)
- **Weekly**: Aggregates 7 daily summaries (≈500 words)
- **Monthly**: Aggregates 4 weekly summaries (≈1000 words)

---

### Prune (Dry Run)

Get intelligent suggestions for archiving old/low-value conversations.

```http
POST /api/v1/prune/dry-run
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "threshold_days": 90
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `threshold_days` | integer | No | `30` | Consider conversations older than X days |

**Response (200 OK):**

```json
{
  "suggestions": [
    {
      "conversation_id": "old-conv-uuid",
      "conversation_label": "Random Chat",
      "last_accessed": "2025-10-15T10:00:00",
      "message_count": 15,
      "token_estimate": 2500,
      "importance_score": 3.0,
      "preview": "First 100 chars of conversation...",
      "recommendation": "archive"
    }
  ],
  "total": 8
}
```

**Recommendation Types:**

- `"archive"` - Low importance, old, inactive
- `"keep"` - High importance or recent activity
- `"delete"` - (Future) Very low value

---

### Execute Pruning

Archive conversations based on IDs.

```http
POST /api/v1/prune/execute
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "conversation_ids": [
    "123e4567-e89b-12d3-a456-426614174000",
    "234e5678-e89b-12d3-a456-426614174001"
  ]
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversation_ids` | array | Yes | UUIDs to archive |

**Response (200 OK):** Empty body

**Effect:** Sets `status = "archived"` for all provided IDs.

---

### Suggest Labels

AI-powered label suggestions for a conversation.

```http
POST /api/v1/labels/suggest
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (200 OK):**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "suggestions": [
    {
      "label": "API Design",
      "confidence": 0.95,
      "is_existing": true,
      "reason": "Conversation contains detailed API architecture discussion"
    },
    {
      "label": "OAuth Implementation",
      "confidence": 0.87,
      "is_existing": false,
      "reason": "Focus on OAuth 2.0 authentication flow"
    }
  ]
}
```

**How It Works:**

1. Extracts entities from conversation messages
2. Analyzes topics and themes
3. Checks existing labels in database
4. Returns ranked suggestions with confidence scores

---

## System Endpoints

### Health Check

Check system health and component status.

```http
GET /health
```

**No authentication required.**

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T20:30:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"}
  }
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-25T20:30:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {
      "status": "error",
      "error": "Connection refused"
    }
  }
}
```

**Use Cases:**

- Docker health checks
- Load balancer monitoring
- Deployment verification

---

### Prometheus Metrics

Expose metrics in Prometheus format.

```http
GET /metrics
```

**No authentication required.**

**Response (200 OK):**

```
# HELP sekha_conversations_total Total number of conversations
# TYPE sekha_conversations_total gauge
sekha_conversations_total 247

# HELP sekha_messages_total Total number of messages
# TYPE sekha_messages_total gauge
sekha_messages_total 1843

# Future metrics planned:
# - Request latency histogram
# - Error rates
# - Vector search performance
```

---

## Error Responses

All errors follow this standard format:

```json
{
  "error": "Detailed error message",
  "code": 500
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Request succeeded |
| `201` | Created | Conversation created successfully |
| `202` | Accepted | Async operation started |
| `400` | Bad Request | Invalid JSON or missing required fields |
| `401` | Unauthorized | Missing or invalid API key |
| `404` | Not Found | Conversation ID doesn't exist |
| `500` | Internal Server Error | Database error, ChromaDB unavailable |
| `503` | Service Unavailable | System unhealthy (health check failed) |

### Common Errors

**Invalid API Key:**

```json
{
  "error": "Unauthorized: Invalid API key",
  "code": 401
}
```

**Conversation Not Found:**

```json
{
  "error": "Conversation not found",
  "code": 404
}
```

**Database Error:**

```json
{
  "error": "Database query failed: ...",
  "code": 500
}
```

---

## Rate Limiting

**Default Limits:**

- 100 requests/second per API key
- 200 burst capacity

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706218800
```

**429 Too Many Requests Response:**

```json
{
  "error": "Rate limit exceeded. Retry after 60 seconds.",
  "code": 429
}
```

**Configuration:**

Adjust in `config.toml`:

```toml
[server]
rate_limit_per_second = 100
rate_limit_burst = 200
```

---

## SDKs & Libraries

Official SDKs handle authentication, retries, and provide typed interfaces:

- **[Python SDK](../sdks/python-sdk.md)** - `pip install sekha`
- **[JavaScript SDK](../sdks/javascript-sdk.md)** - `npm install sekha`

### Example with Python SDK

```python
from sekha import SekhaClient

client = SekhaClient(api_key="your-key", base_url="http://localhost:8080")

# Create conversation
conv = client.conversations.create(
    label="Python Discussion",
    folder="/work/python",
    messages=[
        {"role": "user", "content": "Explain type hints"},
        {"role": "assistant", "content": "Type hints in Python..."}
    ]
)

# Semantic search
results = client.query("type hints", limit=5)

# Context assembly
context = client.assemble_context("Continue Python discussion", context_budget=4000)
```

---

## Related Documentation

- **[MCP Tools](mcp-tools.md)** - Claude Desktop integration (7 tools)
- **[Architecture](../architecture/overview.md)** - How the API works internally
- **[Deployment](../deployment/docker-compose.md)** - Running Sekha in production
- **[Configuration](../reference/configuration.md)** - Complete config reference

---

*Documentation updated: January 2026 | Sekha Controller v1.0*
