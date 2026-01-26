# Semantic Search Guide

Master semantic search in Sekha to find conversations by meaning, not just keywords.

## Overview

Semantic search uses AI embeddings to understand the **meaning** of your query, not just exact word matches.

**Traditional keyword search:**
```
Query: "database"
Finds: Conversations with word "database"
Misses: "PostgreSQL setup", "SQL optimization"
```

**Semantic search:**
```
Query: "database"
Finds: "PostgreSQL setup" (95% match)
       "SQL query optimization" (87% match)
       "database connection pooling" (92% match)
       "NoSQL vs relational" (78% match)
```

---

## How It Works

### 1. Embedding Generation

When you store a conversation, Sekha:

1. Sends text to **embedding model** (Ollama + nomic-embed-text)
2. Receives **vector representation** (768-dimensional)
3. Stores vectors in **ChromaDB**

**Example:**

```
Text: "Implement OAuth2 authentication with JWT tokens"
↓
Embedding Model (nomic-embed-text)
↓
Vector: [0.023, -0.145, 0.891, ..., 0.234]  # 768 dimensions
↓
Stored in ChromaDB collection
```

### 2. Query Processing

When you search:

1. Query is converted to same 768-dimensional vector
2. ChromaDB computes **cosine similarity** to all stored vectors
3. Returns top N most similar conversations

**Similarity scores:**
- **0.95-1.00** - Nearly identical meaning
- **0.85-0.94** - Very relevant
- **0.75-0.84** - Moderately relevant  
- **0.65-0.74** - Somewhat relevant
- **<0.65** - Weakly related

---

## API Usage

### Basic Search

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "query": "how to handle authentication",
    "limit": 10
  }'
```

**Response:**

```json
{
  "results": [
    {
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "score": 0.92,
      "content": "Implementing OAuth2 with JWT tokens...",
      "label": "Authentication Implementation",
      "folder": "/work/api-design",
      "timestamp": "2026-01-20T14:30:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 10
}
```

### With Filters

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database optimization",
    "limit": 5,
    "filters": {
      "folder": "/work/engineering",
      "importance_min": 7
    }
  }'
```

**Available filters:**
- `folder` - Path filter
- `label` - Label filter  
- `importance_min` - Minimum importance score
- `importance_max` - Maximum importance score
- `date_from` - Start date (ISO 8601)
- `date_to` - End date (ISO 8601)

---

## Improving Search Quality

### 1. Write Better Queries

**✅ Good Queries:**

```
✅ "How did I implement user authentication?"
✅ "Performance optimization for database queries"
✅ "React hooks usage patterns"
✅ "Kubernetes deployment configuration"
```

**❌ Bad Queries:**

```
❌ "auth"  # Too short
❌ "stuff about databases"  # Too vague
❌ "???"  # Non-descriptive
❌ "meeting"  # Too generic
```

**Tips:**

1. **Use natural language** - "How to..." instead of single keywords
2. **Be specific** - "PostgreSQL connection pooling" not "database"
3. **Include context** - "React hooks in TypeScript" not "hooks"
4. **Add qualifiers** - "production deployment" vs "local development"

---

### 2. Store Content Properly

**High-quality input = better search:**

```python
# ✅ Good: Descriptive, contextual
client.conversations.create(
    label="OAuth2 Implementation with JWT Tokens",
    folder="/work/api-design/authentication",
    messages=[
        {
            "role": "user",
            "content": "How do I implement OAuth2 authentication using JWT tokens for API access?"
        },
        {
            "role": "assistant",
            "content": """To implement OAuth2 with JWT:
            
            1. Set up authorization server
            2. Generate JWT tokens on successful auth
            3. Validate tokens on each request
            4. Implement token refresh flow
            
            [detailed implementation]
            """
        }
    ]
)

# ❌ Bad: No context, vague
client.conversations.create(
    label="Code",
    folder="/work",
    messages=[{"role": "user", "content": "some code"}]
)
```

---

### 3. Choose Right Embedding Model

Sekha defaults to **nomic-embed-text** (768 dimensions).

**Model comparison:**

| Model | Dimensions | Speed | Quality | Use Case |
|-------|-----------|-------|---------|----------|
| **nomic-embed-text** | 768 | Fast | High | **Default - Recommended** |
| all-MiniLM-L6-v2 | 384 | Fastest | Good | Low-resource environments |
| bge-large-en | 1024 | Slow | Highest | Maximum accuracy needed |

**Changing model:**

```toml
# config.toml
[embedding]
model = "nomic-embed-text:latest"
url = "http://localhost:11434"
```

**Pull new model:**

```bash
ollama pull bge-large-en
```

**Trade-offs:**
- Larger models = better quality but slower
- Smaller models = faster but may miss nuance
- Change affects ALL future embeddings

---

### 4. Tune Similarity Threshold

**Filter by minimum score:**

```python
results = client.query(
    query="authentication patterns",
    limit=50
)

# Only show high-confidence matches
high_confidence = [
    r for r in results 
    if r.score >= 0.80
]
```

**Threshold recommendations:**

- **0.90+** - Nearly exact matches only
- **0.80-0.89** - High relevance (recommended default)
- **0.70-0.79** - Moderate relevance
- **0.60-0.69** - Exploratory searches
- **<0.60** - May include noise

---

## Common Search Patterns

### Time-Based Search

```python
# Conversations from last month
from datetime import datetime, timedelta

one_month_ago = datetime.now() - timedelta(days=30)

results = client.query(
    query="database optimization",
    filters={
        "date_from": one_month_ago.isoformat()
    }
)
```

### Project-Scoped Search

```python
# Only search within specific project
results = client.query(
    query="API endpoint design",
    filters={
        "folder": "/work/projects/alpha"
    }
)
```

### High-Priority Search

```python
# Only important conversations
results = client.query(
    query="architecture decisions",
    filters={
        "importance_min": 8
    }
)
```

### Multi-Topic Search

```python
# Search for multiple related topics
topics = [
    "database indexing",
    "query performance",
    "connection pooling"
]

all_results = []
for topic in topics:
    results = client.query(topic, limit=5)
    all_results.extend(results)

# Deduplicate by conversation_id
seen = set()
unique = []
for r in all_results:
    if r.conversation_id not in seen:
        seen.add(r.conversation_id)
        unique.append(r)
```

---

## Troubleshooting

### Search Returns No Results

**1. Check if conversations exist:**

```bash
curl http://localhost:8080/api/v1/conversations/count
```

**2. Verify embeddings are generated:**

```bash
# Check ChromaDB
curl http://localhost:8000/api/v1/collections
```

**3. Test with exact label match:**

```bash
curl "http://localhost:8080/api/v1/conversations?label=exact-label-here"
```

**4. Check Ollama is running:**

```bash
curl http://localhost:11434/api/tags
```

---

### Search Returns Irrelevant Results

**Causes:**

1. **Query too vague** - Add more context
2. **Low-quality stored content** - Improve labels and messages
3. **Wrong embedding model** - Consider switching models
4. **Not enough data** - Semantic search needs 10+ conversations minimum

**Fix:**

```python
# Before: Vague query
results = client.query("code")

# After: Specific query with context
results = client.query(
    "React functional component with useState hook",
    filters={"folder": "/work/frontend"}
)
```

---

### Slow Search Performance

**Expected latency:**

- First query: ~500ms (model loading)
- Subsequent queries: ~50-150ms
- Large collections (10k+): ~200-500ms

**If slower:**

**1. Check Ollama performance:**

```bash
# Monitor GPU usage
nvidia-smi -l 1

# Check Ollama logs
docker logs sekha-ollama
```

**2. Check ChromaDB performance:**

```bash
# Check collection size
curl http://localhost:8000/api/v1/collections/sekha_memories/count

# Monitor resource usage
docker stats sekha-chroma
```

**3. Optimize ChromaDB:**

```bash
# Rebuild index (if collection is huge)
curl -X POST http://localhost:8000/api/v1/collections/sekha_memories/rebuild
```

---

## Advanced Techniques

### Hybrid Search (Semantic + Keyword)

```python
# Semantic search
semantic_results = client.query(
    query="authentication implementation",
    limit=20
)

# Keyword filter on results  
filtered = [
    r for r in semantic_results
    if "oauth" in r.content.lower() or "jwt" in r.content.lower()
]
```

### Re-Ranking Results

```python
# Get initial results
results = client.query(
    query="database optimization",
    limit=50
)

# Re-rank by importance and recency
from datetime import datetime

def score_result(r):
    # Combine similarity, importance, and recency
    age_days = (datetime.now() - r.timestamp).days
    recency_score = max(0, 1 - (age_days / 365))  # Decay over 1 year
    
    return (
        r.score * 0.5 +  # Semantic similarity: 50%
        (r.importance / 10) * 0.3 +  # Importance: 30%
        recency_score * 0.2  # Recency: 20%
    )

ranked = sorted(results, key=score_result, reverse=True)
```

### Context Assembly

Use the context assembly endpoint for LLM-ready context:

```bash
curl -X POST http://localhost:8080/api/v1/context/assemble \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Continue our authentication discussion",
    "preferred_labels": ["authentication", "security"],
    "context_budget": 8000,
    "excluded_folders": ["/personal"]
  }'
```

**Returns:**

Messages array ready to insert into LLM prompt, optimized to fit within token budget.

---

## Best Practices

### Query Writing

1. **Use 5-15 words** - Not too short, not too long
2. **Ask questions naturally** - "How do I..." works well  
3. **Include key entities** - Names, technologies, project names
4. **Add context when needed** - "production" vs "development"
5. **Iterate queries** - Refine based on initial results

### Content Storage

1. **Write clear labels** - Descriptive, keyword-rich
2. **Add sufficient detail** - More context = better embeddings
3. **Use consistent terminology** - Helps clustering
4. **Include code + explanation** - Not just raw code
5. **Store conversations, not snippets** - Full context matters

### System Tuning

1. **Monitor search quality** - Track relevance of top results
2. **Adjust similarity threshold** - Based on your use case
3. **Consider model upgrade** - If accuracy is critical
4. **Prune low-quality content** - Bad data hurts search
5. **Rebuild embeddings** - If you change models

---

## Metrics & Monitoring

### Track Search Quality

```python
import statistics

# Run test queries
test_queries = [
    "authentication implementation",
    "database optimization",
    "API design patterns"
]

scores = []
for query in test_queries:
    results = client.query(query, limit=10)
    if results:
        scores.append(results[0].score)  # Top result score

avg_score = statistics.mean(scores)
print(f"Average top result score: {avg_score:.3f}")

if avg_score < 0.75:
    print("WARNING: Search quality may be low")
```

### Monitor Performance

```python
import time

start = time.time()
results = client.query("test query")
latency = time.time() - start

print(f"Search latency: {latency*1000:.0f}ms")

if latency > 1.0:
    print("WARNING: Search is slow")
```

---

## Next Steps

- **[Organizing Memory](organizing-memory.md)** - Structure your conversations
- **[REST API](../api-reference/rest-api.md)** - Full API reference
- **[Configuration](../reference/configuration.md)** - Tune embedding settings
- **[Performance](../troubleshooting/performance.md)** - Optimize search speed

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
- **Discord:** [Join Community](https://discord.gg/7RUTmdd2)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
