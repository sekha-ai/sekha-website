# REST API Reference

Sekha Controller provides a comprehensive REST API for managing AI memory. All endpoints require authentication via Bearer token.

## Authentication

Include your API key in the `Authorization` header:

```bash
Authorization: Bearer your-api-key-here
```

Get your API key from `~/.sekha/config.toml` (look for `api_key` under `[server]`).

!!! warning "Production Security"
    Change the default API key before deploying to production. Use a random 32+ character string.

---

## Base URL

```
http://localhost:8080/api/v1
```

For production, replace `localhost` with your server's hostname.

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/conversations` | Store a new conversation |
| `GET` | `/conversations/:id` | Get a specific conversation |
| `PUT` | `/conversations/:id` | Update conversation metadata |
| `DELETE` | `/conversations/:id` | Delete a conversation |
| `POST` | `/query` | Semantic search across conversations |
| `POST` | `/search/fts` | Full-text keyword search |
| `POST` | `/context/assemble` | Build LLM context from memory |
| `POST` | `/labels/suggest` | Get AI-powered label suggestions |
| `PUT` | `/conversations/:id/label` | Update label and folder |
| `PUT` | `/conversations/:id/pin` | Pin conversation (prevent pruning) |
| `PUT` | `/conversations/:id/archive` | Archive conversation |
| `POST` | `/summarize` | Generate hierarchical summary |
| `POST` | `/prune/dry-run` | Get pruning recommendations |
| `POST` | `/prune/execute` | Execute pruning |
| `GET` | `/stats` | Get memory statistics |
| `POST` | `/export` | Export conversations |
| `GET` | `/health` | Health check |

---

## Conversation Management

### Store a Conversation

Store a new conversation with messages.

**Endpoint:** `POST /api/v1/conversations`

**Request:**

```json
{
  "label": "Project Planning",
  "folder": "/work/new-feature",
  "messages": [
    {
      "role": "user",
      "content": "We need to build a new API endpoint"
    },
    {
      "role": "assistant",
      "content": "I recommend starting with the following architecture..."
    }
  ],
  "importance_score": 8,
  "metadata": {
    "project": "SecureAPI",
    "sprint": "2026-Q1"
  }
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Project Planning",
  "folder": "/work/new-feature",
  "status": "active",
  "importance_score": 8,
  "message_count": 2,
  "word_count": 45,
  "created_at": "2026-01-25T16:30:00Z",
  "updated_at": "2026-01-25T16:30:00Z"
}
```

---

### Get a Conversation

Retrieve a specific conversation with all messages.

**Endpoint:** `GET /api/v1/conversations/:id`

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Project Planning",
  "folder": "/work/new-feature",
  "status": "active",
  "importance_score": 8,
  "messages": [
    {
      "role": "user",
      "content": "We need to build a new API endpoint",
      "timestamp": "2026-01-25T16:30:00Z"
    },
    {
      "role": "assistant",
      "content": "I recommend starting with the following architecture...",
      "timestamp": "2026-01-25T16:30:01Z"
    }
  ],
  "message_count": 2,
  "word_count": 45,
  "created_at": "2026-01-25T16:30:00Z",
  "updated_at": "2026-01-25T16:30:00Z"
}
```

---

### Update Conversation Metadata

Update label, folder, importance score, or status.

**Endpoint:** `PUT /api/v1/conversations/:id`

**Request:**

```json
{
  "label": "Completed Feature",
  "folder": "/work/archive",
  "importance_score": 9,
  "status": "archived"
}
```

**Response:** Same as GET conversation

---

### Delete a Conversation

Permanently delete a conversation and all its messages.

**Endpoint:** `DELETE /api/v1/conversations/:id`

**Response:** `204 No Content`

!!! danger "Permanent Deletion"
    This cannot be undone. Consider archiving instead.

---

## Search & Retrieval

### Semantic Search

Search conversations using natural language and semantic similarity.

**Endpoint:** `POST /api/v1/query`

**Request:**

```json
{
  "query": "What did we discuss about API design?",
  "limit": 10,
  "filter_labels": ["Engineering", "Architecture"],
  "filter_folder": "/work",
  "min_importance": 5.0
}
```

**Response:**

```json
{
  "results": [
    {
      "id": "msg-uuid",
      "conversation_id": "conv-uuid",
      "label": "API Design Discussion",
      "content": "We should use RESTful principles...",
      "similarity": 0.92,
      "importance_score": 8,
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "total": 25,
  "query_time_ms": 45
}
```

---

### Full-Text Search

Search for exact keywords using SQLite FTS5.

**Endpoint:** `POST /api/v1/search/fts`

**Request:**

```json
{
  "query": "API endpoint",
  "limit": 20,
  "folder": "/work"
}
```

**Response:** Same structure as semantic search

---

## Context Assembly

### Assemble Context for LLM

Build optimized context within a token budget, prioritizing semantic relevance, recency, and importance.

**Endpoint:** `POST /api/v1/context/assemble`

**Request:**

```json
{
  "query": "Continue working on the authentication system",
  "context_budget": 8000,
  "preferred_labels": ["Authentication", "Security"],
  "preferred_folder": "/work",
  "include_recent_days": 7,
  "min_importance": 6.0
}
```

**Response:**

```json
{
  "formatted_context": "# Recent Relevant Conversations\n\n## Authentication System [2026-01-20]\n...",
  "selected_conversations": [
    {
      "id": "conv-uuid",
      "label": "Auth Architecture",
      "excerpt": "We decided to use OAuth 2.0 with...",
      "relevance_score": 0.95,
      "token_count": 1200
    }
  ],
  "estimated_tokens": 7800,
  "conversations_considered": 150,
  "conversations_selected": 5
}
```

---

## Organization

### Update Label and Folder

**Endpoint:** `PUT /api/v1/conversations/:id/label`

**Request:**

```json
{
  "label": "New Label",
  "folder": "/new/path"
}
```

---

### Pin a Conversation

Prevent conversation from being auto-pruned.

**Endpoint:** `PUT /api/v1/conversations/:id/pin`

**Response:** `200 OK`

---

### Archive a Conversation

Mark conversation as archived (hidden from active search).

**Endpoint:** `PUT /api/v1/conversations/:id/archive`

**Response:** `200 OK`

---

## AI-Powered Features

### Suggest Labels

Get AI-generated label suggestions based on conversation content.

**Endpoint:** `POST /api/v1/labels/suggest`

**Request:**

```json
{
  "conversation_id": "conv-uuid"
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "label": "API Design",
      "confidence": 0.92,
      "reason": "Conversation focuses on REST API architecture and best practices"
    },
    {
      "label": "Engineering/Backend",
      "confidence": 0.85,
      "reason": "Technical discussion about server-side implementation"
    }
  ]
}
```

---

### Generate Summary

Create hierarchical summaries (daily/weekly/monthly).

**Endpoint:** `POST /api/v1/summarize`

**Request:**

```json
{
  "conversation_id": "conv-uuid",
  "level": "weekly"
}
```

**Levels:**
- `daily` - Single day summary
- `weekly` - 7-day digest
- `monthly` - 30-day report

**Response:**

```json
{
  "summary": "This week focused on API design decisions. Key outcomes: ...",
  "key_topics": ["REST API", "Authentication", "Rate Limiting"],
  "messages_summarized": 45,
  "compression_ratio": 0.15
}
```

---

## Memory Management

### Pruning Recommendations

Get suggestions for conversations to prune based on age and importance.

**Endpoint:** `POST /api/v1/prune/dry-run`

**Request:**

```json
{
  "threshold_days": 90,
  "importance_threshold": 5.0
}
```

**Response:**

```json
{
  "candidates": [
    {
      "id": "conv-uuid",
      "label": "Old Discussion",
      "age_days": 120,
      "importance_score": 3,
      "reason": "Low importance, no recent activity",
      "last_accessed": "2025-10-15T10:00:00Z"
    }
  ],
  "total_candidates": 15,
  "estimated_space_saved_mb": 45.2
}
```

---

### Execute Pruning

**Endpoint:** `POST /api/v1/prune/execute`

**Request:** Same as dry-run

**Response:**

```json
{
  "pruned_count": 15,
  "space_freed_mb": 45.2,
  "pruned_ids": ["conv-uuid-1", "conv-uuid-2"]
}
```

---

## Analytics

### Memory Statistics

Get insights about your memory usage.

**Endpoint:** `GET /api/v1/stats`

**Response:**

```json
{
  "total_conversations": 1234,
  "total_messages": 45678,
  "total_words": 1234567,
  "average_importance": 6.5,
  "folders": {
    "/work": 800,
    "/personal": 300,
    "/research": 134
  },
  "labels": {
    "Engineering": 450,
    "AI": 200,
    "Personal": 300
  },
  "status_breakdown": {
    "active": 1000,
    "archived": 200,
    "pinned": 34
  },
  "storage_size_mb": 450.5,
  "oldest_conversation": "2025-06-01T10:00:00Z",
  "newest_conversation": "2026-01-25T16:30:00Z"
}
```

---

## Export

### Export Conversations

Export to JSON or Markdown format.

**Endpoint:** `POST /api/v1/export`

**Request:**

```json
{
  "format": "markdown",
  "filter_folder": "/work",
  "filter_labels": ["Important"],
  "include_metadata": true
}
```

**Response:** File download with appropriate Content-Type

---

## System

### Health Check

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T16:30:00Z",
  "version": "0.1.0",
  "checks": {
    "database": {"status": "ok", "response_time_ms": 2},
    "chroma": {"status": "ok", "response_time_ms": 15},
    "ollama": {"status": "ok", "response_time_ms": 100}
  },
  "uptime_seconds": 86400
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "importance_score",
      "issue": "Must be between 0.0 and 10.0"
    }
  }
}
```

### Common Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| `400` | `VALIDATION_ERROR` | Invalid request parameters |
| `401` | `UNAUTHORIZED` | Missing or invalid API key |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Resource already exists |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Server error |
| `503` | `SERVICE_UNAVAILABLE` | Dependency (Chroma/Ollama) unavailable |

---

## Rate Limiting

Default limits:
- **100 requests/second** per IP
- **200 burst** capacity

Configure in `config.toml`:

```toml
[rate_limiting]
requests_per_second = 100
burst_size = 200
```

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1706198430
```

---

## Interactive Documentation

When Sekha is running, visit:

```
http://localhost:8080/swagger-ui/
```

For interactive API exploration with:
- Request/response examples
- "Try it out" functionality
- Full schema documentation

---

## Next Steps

- **[MCP Tools Reference](mcp-tools.md)** - Use Sekha via Model Context Protocol
- **[Python SDK](../sdks/python-sdk.md)** - Python client library
- **[JavaScript SDK](../sdks/javascript-sdk.md)** - JS/TS client library
- **[Authentication Guide](authentication.md)** - Secure your API
