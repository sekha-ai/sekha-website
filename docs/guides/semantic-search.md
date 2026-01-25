# Semantic Search Guide

> Master semantic search to find exactly what you need

## Overview

Sekha uses vector embeddings for semantic search - find memories by meaning, not just keywords.

## Basic Search

### Simple Query

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What did we discuss about deployment?",
    "limit": 5
  }'
```

### Response

```json
{
  "results": [
    {
      "conversation_id": "conv_123",
      "label": "Docker Deployment Planning",
      "relevance": 0.89,
      "preview": "We discussed using Docker Compose..."
    }
  ]
}
```

## Advanced Search

### With Filters

```json
{
  "query": "kubernetes setup",
  "limit": 10,
  "folder": "work/infrastructure",
  "importance_min": 7,
  "date_from": "2026-01-01"
}
```

### Similarity Threshold

```json
{
  "query": "AI coding assistant",
  "limit": 20,
  "min_relevance": 0.7
}
```

## Search Strategies

### 1. Question-Based Queries

**Best for:** Finding specific information

✅ **Good:**
- "How do I configure authentication?"
- "What was the decision about database choice?"
- "When did we discuss the API design?"

### 2. Concept-Based Queries

**Best for:** Exploring topics

✅ **Good:**
- "semantic search implementation"
- "vector database performance"
- "memory optimization strategies"

### 3. Context Assembly

Get curated context for LLM prompts:

```json
{
  "query": "Continue working on the authentication system",
  "context_budget": 8000
}
```

Returns optimally assembled context within token budget.

## Improving Search Quality

### Store Rich Conversations

✅ **Good:**
```json
{
  "label": "Authentication Implementation Strategy",
  "messages": [
    {
      "role": "user",
      "content": "I need to implement JWT authentication for the API. What approach should I take?"
    },
    {
      "role": "assistant",
      "content": "For JWT authentication, I recommend..."
    }
  ]
}
```

❌ **Avoid:**
```json
{
  "label": "chat",
  "messages": [
    {"role": "user", "content": "yes"},
    {"role": "assistant", "content": "ok"}
  ]
}
```

### Use Descriptive Labels

Labels improve search:

- ✅ `"label": "Docker Compose Configuration for Production"`
- ❌ `"label": "config"`

### Set Importance

Highlight critical conversations:

```json
{
  "importance": 9,
  "label": "Security Vulnerability Fix - CRITICAL"
}
```

## Search Tips

### Be Specific

- ✅ "PostgreSQL connection pooling configuration"
- ❌ "database"

### Use Natural Language

- ✅ "How did we solve the memory leak?"
- ❌ "memory leak solution"

### Combine with Filters

```json
{
  "query": "performance optimization",
  "folder": "work/sekha",
  "importance_min": 7,
  "limit": 5
}
```

## SDK Examples

### Python

```python
from sekha import SekhaClient

client = SekhaClient(base_url="http://localhost:8080")

# Simple search
results = client.query(
    query="kubernetes deployment",
    limit=10
)

# Advanced search
results = client.query(
    query="API authentication design",
    folder="work/projects",
    importance_min=7,
    min_relevance=0.75
)

# Context assembly
context = client.context.assemble(
    query="Continue building the API",
    context_budget=8000
)
```

### JavaScript

```javascript
import { SekhaClient } from '@sekha/sdk';

const client = new SekhaClient({
  baseUrl: 'http://localhost:8080'
});

// Search
const results = await client.query({
  query: 'docker compose setup',
  limit: 10,
  folder: 'infrastructure'
});
```

## Related

- [Organizing Memory](organizing-memory.md)
- [API Reference](../api-reference/rest-api.md)
- [Context Assembly](../architecture/memory-orchestration.md)
