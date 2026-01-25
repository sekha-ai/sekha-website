# Memory Orchestration

How Sekha intelligently manages and retrieves memories.

## Overview

Memory orchestration is the core intelligence that makes Sekha useful. It's not just storage - it's about retrieving the *right* memories at the *right* time.

## Key Components

### 1. Semantic Search

**Purpose:** Find memories by meaning, not just keywords.

**How it works:**

1. **Query Embedding**
   ```python
   query = "What did we decide about the auth system?"
   query_embedding = embed(query)  # 768-dim vector
   ```

2. **Similarity Search**
   ```python
   results = chroma.query(
       embedding=query_embedding,
       n_results=20,
       where={"folder": "work"}  # Optional filter
   )
   ```

3. **Relevance Scoring**
   ```python
   for result in results:
       score = (
           result.similarity * 0.5 +      # Semantic match
           recency_score(result) * 0.3 +   # Time decay
           result.importance * 0.2         # User importance
       )
   ```

**Performance:**
- Query time: <50ms (p95)
- Accuracy: 95%+ for domain-specific queries
- Handles 1M+ embeddings efficiently

### 2. Context Assembly

**Purpose:** Build optimal context for LLM within token budget.

**Algorithm:**

```python
def assemble_context(query, budget=8000):
    # 1. Find relevant memories
    candidates = semantic_search(query, limit=50)
    
    # 2. Score and rank
    ranked = score_and_rank(candidates)
    
    # 3. Greedy packing within budget
    context = []
    tokens_used = 0
    
    for item in ranked:
        item_tokens = count_tokens(item)
        
        if tokens_used + item_tokens <= budget:
            context.append(item)
            tokens_used += item_tokens
        elif use_summary(item):
            summary = get_summary(item)
            summary_tokens = count_tokens(summary)
            
            if tokens_used + summary_tokens <= budget:
                context.append(summary)
                tokens_used += summary_tokens
    
    return assemble_final_context(context)
```

**Features:**
- Budget-aware selection
- Importance-weighted ranking
- Summary fallback for compression
- Deduplication
- Temporal ordering

### 3. Importance Scoring

**Multi-factor relevance:**

```python
def calculate_relevance(message, query, current_time):
    # Semantic similarity (0-1)
    semantic = cosine_similarity(
        embed(message),
        embed(query)
    )
    
    # Recency decay
    age_hours = (current_time - message.timestamp).hours
    recency = math.exp(-age_hours / 168)  # Half-life: 1 week
    
    # User importance (1-10 → 0-1)
    importance = message.importance / 10.0
    
    # Weighted combination
    score = (
        semantic * 0.50 +
        recency * 0.30 +
        importance * 0.20
    )
    
    return score
```

### 4. Folder Isolation

**Context separation:**

```python
# Work context
work_results = query(
    "architecture decisions",
    folder="work/project-a"
)

# Personal context  
personal_results = query(
    "architecture decisions",
    folder="personal/learning"
)
```

**Benefits:**
- Prevent context bleeding
- Improve relevance
- Privacy separation
- Faster search (smaller index)

## Optimization Strategies

### Token Budget Optimization

**Problem:** Limited context window (e.g., 8K tokens)

**Solution: Hierarchical context**

```
Level 1: Most relevant messages (full text)
Level 2: Moderately relevant (summaries)
Level 3: Tangentially related (titles only)
```

**Example:**

```python
context = [
    # High priority (500 tokens each)
    full_text(message_1),
    full_text(message_2),
    full_text(message_3),
    
    # Medium priority (100 tokens each)
    summary(message_4),
    summary(message_5),
    summary(message_6),
    
    # Low priority (20 tokens each)
    title(message_7),
    title(message_8),
    title(message_9)
]

total_tokens = 500*3 + 100*3 + 20*3 = 1860 tokens
```

### Deduplication

**Prevent redundant context:**

1. **Exact duplicates**
   ```python
   content_hash = sha256(message.content)
   if content_hash in seen:
       skip(message)
   ```

2. **Fuzzy duplicates**
   ```python
   similarity = cosine_similarity(new_msg, existing_msg)
   if similarity > 0.95:
       keep_highest_importance(new_msg, existing_msg)
   ```

3. **Temporal clustering**
   ```python
   # Same conversation, close in time
   if (same_conversation and 
       abs(msg1.time - msg2.time) < 5_minutes):
       combine_into_single_context(msg1, msg2)
   ```

### Caching Strategy

**Cache hot paths:**

```python
# Cache query embeddings (1 hour TTL)
@cache(ttl=3600)
def embed_query(text):
    return llm_bridge.embed(text)

# Cache assembled contexts (5 min TTL)
@cache(ttl=300)
def assemble_context(query, budget):
    return build_context(query, budget)
```

## Performance Characteristics

### Latency Breakdown

Typical query flow:

```
Total: 95ms
├── Embedding generation: 45ms
├── Vector search: 15ms
├── Database fetch: 20ms
├── Scoring & ranking: 10ms
└── Context assembly: 5ms
```

### Scaling Behavior

**Query performance by corpus size:**

| Messages | Query Time (p95) | Memory Usage |
|----------|------------------|-------------|
| 1,000 | 45ms | 100MB |
| 10,000 | 65ms | 500MB |
| 100,000 | 85ms | 2GB |
| 1,000,000 | 120ms | 8GB |

### Accuracy Metrics

**Relevance@K (semantic search):**

- Relevance@5: 92%
- Relevance@10: 88%
- Relevance@20: 82%

*Measured on 10,000 query test set*

## Advanced Features

### Time-Aware Queries

```python
# Recent discussions
results = query(
    "payment system",
    time_range="last_7_days"
)

# Historical analysis
results = query(
    "architecture evolution",
    time_range="all",
    order_by="timestamp"
)
```

### Multi-Query Fusion

```python
# Combine multiple query aspects
results = multi_query([
    "authentication design",
    "security requirements",
    "OAuth implementation"
], fusion="reciprocal_rank")
```

### Negative Filtering

```python
# Exclude certain topics
results = query(
    "machine learning",
    exclude_terms=["deployment", "infrastructure"]
)
```

## Next Steps

- [System Overview](overview.md) - Full architecture
- [API Reference](../api-reference/rest-api.md) - Use the query API
- [Benchmarks](../reference/benchmarks.md) - Performance data
