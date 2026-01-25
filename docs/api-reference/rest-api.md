# REST API Reference

## Overview

The Sekha Controller exposes a RESTful API for all memory operations. All endpoints return JSON and use standard HTTP status codes.

**Base URL:** `http://localhost:8080/api/v1` (default local deployment)

**Authentication:** Bearer token in Authorization header

**API Version:** v1 (current)

---

## Authentication

All API requests require authentication via Bearer token:

```bash
Authorization: Bearer your-api-key-here
```

**Configure your API key** in `~/.sekha/config.toml`:

```toml
[server]
api_key = "your-production-api-key-min-32-chars-long"
```

!!! warning "Security"
    The default key `dev-key-replace-in-production` is for development only. Always use a secure random key (32+ characters) in production.

**Generate a secure key:**

```bash
openssl rand -base64 32
```

---

## Rate Limiting

**Default Limits:**

- 100 requests/second
- 200 burst capacity

Configurable in `config.toml`:

```toml
[rate_limiting]
requests_per_second = 100
burst_size = 200
```

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642533600
```

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Missing or invalid API key |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error (check logs) |

---

## Endpoints

### Health Check

#### `GET /health`

Check if the Sekha Controller is running and healthy.

**Authentication:** Not required

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T20:00:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"},
    "llm_bridge": {"status": "ok"}
  }
}
```

**Example:**

```bash
curl http://localhost:8080/health
```

---

### Conversations

#### `POST /api/v1/conversations`

Store a new conversation in Sekha memory.

**Request Body:**

```json
{
  "label": "Project Planning",
  "folder": "/work/new-feature",
  "messages": [
    {
      "role": "user",
      "content": "We need to build a new API endpoint for user authentication"
    },
    {
      "role": "assistant",
      "content": "I recommend starting with OAuth 2.0. Here's the architecture..."
    }
  ],
  "importance": 7,
  "metadata": {
    "project": "auth-service",
    "sprint": "2026-Q1"
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Human-readable conversation label |
| `folder` | string | No | Hierarchical folder path (e.g., `/work/project`) |
| `messages` | array | Yes | Array of message objects |
| `messages[].role` | string | Yes | `user` or `assistant` |
| `messages[].content` | string | Yes | Message text content |
| `importance` | integer | No | 1-10 scale (default: 5) |
| `metadata` | object | No | Custom key-value metadata |

**Response (201 Created):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Project Planning",
  "folder": "/work/new-feature",
  "status": "active",
  "importance": 7,
  "message_count": 2,
  "word_count": 45,
  "created_at": "2026-01-25T20:00:00Z",
  "updated_at": "2026-01-25T20:00:00Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "label": "Project Planning",
    "folder": "/work/new-feature",
    "messages": [
      {"role": "user", "content": "We need to build a new API endpoint"},
      {"role": "assistant", "content": "I recommend starting with..."}
    ]
  }'
```

---

#### `GET /api/v1/conversations/{id}`

Retrieve a specific conversation by ID.

**Path Parameters:**

- `id` - Conversation UUID

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Project Planning",
  "folder": "/work/new-feature",
  "status": "active",
  "importance": 7,
  "messages": [
    {
      "role": "user",
      "content": "We need to build a new API endpoint",
      "timestamp": "2026-01-25T20:00:00Z"
    },
    {
      "role": "assistant",
      "content": "I recommend starting with...",
      "timestamp": "2026-01-25T20:00:05Z"
    }
  ],
  "metadata": {"project": "auth-service"},
  "created_at": "2026-01-25T20:00:00Z",
  "updated_at": "2026-01-25T20:00:00Z"
}
```

**Example:**

```bash
curl -H "Authorization: Bearer your-api-key" \
  http://localhost:8080/api/v1/conversations/123e4567-e89b-12d3-a456-426614174000
```

---

#### `PUT /api/v1/conversations/{id}/label`

Update conversation label and/or folder.

**Request Body:**

```json
{
  "label": "Completed Feature",
  "folder": "/work/archive/2026"
}
```

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Completed Feature",
  "folder": "/work/archive/2026",
  "updated_at": "2026-01-25T20:30:00Z"
}
```

---

#### `PUT /api/v1/conversations/{id}/importance`

Update conversation importance score (1-10).

**Request Body:**

```json
{
  "importance": 9
}
```

---

#### `PUT /api/v1/conversations/{id}/pin`

Pin a conversation (sets importance to 10).

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "importance": 10,
  "pinned": true
}
```

---

#### `PUT /api/v1/conversations/{id}/archive`

Archive a conversation (sets status to `archived`).

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "archived",
  "archived_at": "2026-01-25T20:30:00Z"
}
```

---

#### `DELETE /api/v1/conversations/{id}`

Permanently delete a conversation.

!!! danger "Permanent Deletion"
    This operation cannot be undone. Consider archiving instead.

**Response (204 No Content)**

---

### Search & Query

#### `POST /api/v1/query`

Semantic search across all conversations using vector similarity.

**Request Body:**

```json
{
  "query": "What did we discuss about API design?",
  "limit": 10,
  "filters": {
    "folder": "/work",
    "min_importance": 5,
    "status": "active"
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `limit` | integer | No | Max results (default: 10, max: 100) |
| `filters.folder` | string | No | Filter by folder path |
| `filters.min_importance` | integer | No | Minimum importance score |
| `filters.status` | string | No | `active` or `archived` |

**Response:**

```json
{
  "results": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "label": "Project Planning",
      "folder": "/work/new-feature",
      "relevance_score": 0.92,
      "matched_content": "I recommend starting with OAuth 2.0...",
      "created_at": "2026-01-25T20:00:00Z"
    }
  ],
  "total": 15,
  "query_time_ms": 45
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "query": "API design patterns",
    "limit": 5
  }'
```

---

#### `POST /api/v1/search/fts`

Full-text keyword search using SQLite FTS5.

**Request Body:**

```json
{
  "query": "OAuth authentication",
  "limit": 10
}
```

**Response:** Same format as semantic query

**Difference from Semantic Query:**

- **Semantic (`/query`)**: Finds similar meanings ("authentication" matches "login", "sign-in")
- **Full-text (`/search/fts`)**: Exact keyword matching

---

### Context Assembly

#### `POST /api/v1/context/assemble`

Build optimal context for an LLM prompt by intelligently selecting relevant past conversations.

**Request Body:**

```json
{
  "query": "Continue working on the authentication feature",
  "context_budget": 8000,
  "preferred_labels": ["Project Planning", "Technical Design"],
  "recency_weight": 0.3,
  "relevance_weight": 0.5,
  "importance_weight": 0.2
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | User's next prompt/question |
| `context_budget` | integer | No | Max tokens to include (default: 4000) |
| `preferred_labels` | array | No | Prioritize these labels |
| `recency_weight` | float | No | Weight for recent messages (0-1) |
| `relevance_weight` | float | No | Weight for semantic similarity (0-1) |
| `importance_weight` | float | No | Weight for importance score (0-1) |

!!! tip "Weights"
    Weights must sum to 1.0. Default: `{recency: 0.3, relevance: 0.5, importance: 0.2}`

**Response:**

```json
{
  "context": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "label": "Project Planning",
      "messages": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
      ],
      "score": 0.87,
      "token_count": 250
    }
  ],
  "total_tokens": 3450,
  "budget_used": 0.86,
  "conversations_included": 5
}
```

**Use this context** in your LLM prompt:

```python
context_data = response['context']
prompt = build_prompt(context_data, user_query)
llm_response = call_llm(prompt)
```

---

### Labels & Organization

#### `POST /api/v1/labels/suggest`

Get AI-powered label suggestions for a conversation.

**Request Body:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**

```json
{
  "suggestions": [
    {"label": "OAuth Implementation", "confidence": 0.92},
    {"label": "API Security", "confidence": 0.85},
    {"label": "Backend Development", "confidence": 0.78}
  ],
  "recommended_folder": "/work/auth-service"
}
```

---

#### `GET /api/v1/labels`

List all labels in use.

**Response:**

```json
{
  "labels": [
    {"label": "Project Planning", "count": 15},
    {"label": "Technical Design", "count": 8},
    {"label": "Code Review", "count": 22}
  ]
}
```

---

### Summarization

#### `POST /api/v1/summarize`

Generate hierarchical summaries of conversations.

**Request Body:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "level": "daily"
}
```

**Levels:**

- `daily` - Summarize single conversation
- `weekly` - Summarize week's conversations
- `monthly` - Summarize month's conversations

**Response:**

```json
{
  "summary": "Discussed implementing OAuth 2.0 for authentication. Key decisions: use JWT tokens, implement refresh tokens, add rate limiting. Next steps: design database schema, set up Redis for token storage.",
  "key_points": [
    "OAuth 2.0 chosen for authentication",
    "JWT tokens for stateless auth",
    "Redis for token storage"
  ],
  "action_items": [
    "Design database schema",
    "Set up Redis instance"
  ],
  "summary_tokens": 85,
  "original_tokens": 3400,
  "compression_ratio": 0.025
}
```

---

### Pruning

#### `POST /api/v1/prune/dry-run`

Get recommendations for pruning old/low-value conversations (does not delete).

**Request Body:**

```json
{
  "threshold_days": 90,
  "min_importance": 3
}
```

**Response:**

```json
{
  "candidates": [
    {
      "conversation_id": "...",
      "label": "Random Chat",
      "importance": 2,
      "age_days": 120,
      "reason": "Low importance, not accessed in 90+ days"
    }
  ],
  "total_candidates": 15,
  "potential_space_saved_mb": 45
}
```

---

#### `POST /api/v1/prune/execute`

Execute pruning based on recommendations.

!!! warning "Permanent Action"
    This archives conversations. They can be restored from archives.

**Request Body:**

```json
{
  "conversation_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**

```json
{
  "archived": 3,
  "space_freed_mb": 12
}
```

---

### Statistics

#### `GET /api/v1/stats`

Get usage statistics.

**Response:**

```json
{
  "total_conversations": 1543,
  "active_conversations": 1402,
  "archived_conversations": 141,
  "total_messages": 45230,
  "total_tokens": 12500000,
  "storage_mb": 234,
  "labels": 45,
  "folders": 12,
  "oldest_conversation": "2025-06-15T10:00:00Z",
  "newest_conversation": "2026-01-25T20:00:00Z"
}
```

---

### Export

#### `POST /api/v1/export`

Export conversations in various formats.

**Request Body:**

```json
{
  "format": "json",
  "filters": {
    "folder": "/work",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  }
}
```

**Formats:**

- `json` - JSON export
- `markdown` - Markdown files
- `csv` - CSV (metadata only)

**Response:** Returns download URL or direct file

---

## Interactive API Explorer

**Swagger UI** is available when running Sekha locally:

**URL:** [http://localhost:8080/swagger-ui/](http://localhost:8080/swagger-ui/)

**Features:**

- Interactive endpoint testing
- Request/response examples
- Schema validation
- Authentication configuration

---

## Code Examples

### Python

```python
import requests

BASE_URL = "http://localhost:8080/api/v1"
HEADERS = {"Authorization": "Bearer your-api-key"}

# Store a conversation
response = requests.post(
    f"{BASE_URL}/conversations",
    headers=HEADERS,
    json={
        "label": "Planning Session",
        "messages": [
            {"role": "user", "content": "Let's plan the new feature"},
            {"role": "assistant", "content": "Great! Here's what I recommend..."}
        ]
    }
)
conversation_id = response.json()["id"]

# Query memory
results = requests.post(
    f"{BASE_URL}/query",
    headers=HEADERS,
    json={"query": "feature planning", "limit": 5}
)
print(results.json())
```

### JavaScript

```javascript
const BASE_URL = 'http://localhost:8080/api/v1';
const HEADERS = {
  'Authorization': 'Bearer your-api-key',
  'Content-Type': 'application/json'
};

// Store a conversation
const response = await fetch(`${BASE_URL}/conversations`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    label: 'Planning Session',
    messages: [
      {role: 'user', content: 'Let\'s plan the new feature'},
      {role: 'assistant', content: 'Great! Here\'s what I recommend...'}
    ]
  })
});

const {id} = await response.json();
console.log('Conversation ID:', id);
```

### cURL

```bash
# Store conversation
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"label": "Test", "messages": [{"role": "user", "content": "Hello"}]}'

# Query memory
curl -X POST http://localhost:8080/api/v1/query \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "hello", "limit": 5}'
```

---

## Next Steps

- **SDKs:** Use our [Python SDK](../sdks/python-sdk.md) or [JavaScript SDK](../sdks/javascript-sdk.md)
- **MCP Integration:** See [MCP Tools](mcp-tools.md) for Claude Desktop
- **Error Handling:** Check [Error Codes](error-codes.md)
- **Authentication:** Read [Authentication Guide](authentication.md)

---

*API Version: v1 - Last Updated: January 2026*
