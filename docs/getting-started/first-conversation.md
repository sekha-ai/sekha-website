# First Conversation

A detailed guide to using Sekha for the first time.

## Overview

This guide walks you through:

1. Storing a conversation
2. Performing semantic search
3. Assembling context for an LLM
4. Understanding the results

## Prerequisites

Sekha should be running:

```bash
# Verify health
curl http://localhost:8080/health
```

If not running, see [Quickstart](quickstart.md).

## Step 1: Store a Conversation

### Create Your First Memory

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "label": "Learning About Embeddings",
    "messages": [
      {
        "role": "user",
        "content": "What are embeddings?"
      },
      {
        "role": "assistant",
        "content": "Embeddings are dense vector representations of text that capture semantic meaning. They allow us to find similar content by measuring distance in vector space."
      },
      {
        "role": "user",
        "content": "How are they used in search?"
      },
      {
        "role": "assistant",
        "content": "In semantic search, both the query and documents are converted to embeddings. We then find documents with embeddings closest to the query embedding, typically using cosine similarity."
      }
    ],
    "folder": "learning",
    "importance": 8
  }'
```

### Understanding the Request

- **label** - Human-readable name for the conversation
- **messages** - Array of user/assistant exchanges
- **folder** - Optional organization (like folders)
- **importance** - Score 1-10 for prioritization

### Response

```json
{
  "id": 1,
  "label": "Learning About Embeddings",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z",
  "message_count": 4
}
```

### What Happened Behind the Scenes?

1. **Stored** in SQLite database
2. **Sent to LLM Bridge** for embedding generation
3. **Embedded** using nomic-embed-text model (768 dimensions)
4. **Indexed** in ChromaDB vector store
5. **Ready** for semantic search

## Step 2: Perform Semantic Search

### Search by Meaning

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "How do I find similar documents?",
    "limit": 5
  }'
```

### Notice

The query "How do I find similar documents?" doesn't contain the exact words "embeddings" or "semantic search", but Sekha understands the *meaning* and finds relevant messages.

### Response

```json
{
  "results": [
    {
      "conversation_id": 1,
      "message": "In semantic search, both the query and documents are converted to embeddings...",
      "relevance_score": 0.87,
      "timestamp": "2025-01-01T12:00:05Z",
      "folder": "learning",
      "importance": 8
    },
    {
      "conversation_id": 1,
      "message": "Embeddings are dense vector representations of text...",
      "relevance_score": 0.72,
      "timestamp": "2025-01-01T12:00:00Z",
      "folder": "learning",
      "importance": 8
    }
  ]
}
```

### Understanding Relevance Scores

Scores range from 0 to 1:
- **0.9-1.0** - Highly relevant
- **0.7-0.9** - Relevant
- **0.5-0.7** - Moderately relevant
- **<0.5** - Low relevance

Scores combine:
- Semantic similarity (embedding distance)
- Recency (newer = higher)
- Importance (your 1-10 score)

## Step 3: Assemble Context

### Get Optimal Context for LLM

```bash
curl -X POST http://localhost:8080/api/v1/context/assemble \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "Explain embeddings and semantic search",
    "context_budget": 2000,
    "include_summaries": false
  }'
```

### Parameters

- **query** - What context you need
- **context_budget** - Max tokens (default: 8000)
- **include_summaries** - Use summaries for compression

### Response

```json
{
  "context": "Based on previous conversations:\n\n[Learning About Embeddings]\n\nUser: What are embeddings?\nAssistant: Embeddings are dense vector representations of text that capture semantic meaning. They allow us to find similar content by measuring distance in vector space.\n\nUser: How are they used in search?\nAssistant: In semantic search, both the query and documents are converted to embeddings. We then find documents with embeddings closest to the query embedding, typically using cosine similarity.",
  "token_count": 187,
  "sources": [1],
  "included_messages": 4,
  "excluded_messages": 0
}
```

### Use with Your LLM

```python
import openai

# Get context from Sekha
context_response = requests.post(
    "http://localhost:8080/api/v1/context/assemble",
    json={"query": "Explain embeddings", "context_budget": 2000}
).json()

# Use with OpenAI
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": context_response["context"]},
        {"role": "user", "content": "Can you explain this in simpler terms?"}
    ]
)
```

## Step 4: Organization

### Using Folders

Organize conversations by topic:

```bash
# Work conversations
POST /conversations {"folder": "work/project-a"}

# Personal learning
POST /conversations {"folder": "learning/ai"}

# Research
POST /conversations {"folder": "research/papers"}
```

### Filter by Folder

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -d '{
    "query": "machine learning",
    "folder": "learning"
  }'
```

## Best Practices

### 1. Use Descriptive Labels

```bash
# Good
"Architecture Discussion - Auth System"
"Research - Vector Databases Comparison"
"Bug Fix - Payment Processing Issue"

# Not ideal
"Chat 1"
"Conversation"
"Notes"
```

### 2. Set Importance Scores

- **9-10** - Critical decisions, breakthroughs
- **7-8** - Important discussions
- **5-6** - Regular conversations
- **3-4** - Minor notes
- **1-2** - Trivial or test data

### 3. Use Folders for Context

Separate work from personal, project A from project B:

```
work/
  project-a/
  project-b/
personal/
  learning/
  ideas/
```

## Next Steps

### Learn More

- [API Reference](../api-reference/rest-api.md) - All endpoints
- [Configuration](configuration.md) - Customize Sekha
- [Architecture](../architecture/overview.md) - How it works

### Build Something

- [AI Coding Assistant](../guides/ai-coding-assistant.md) - Code helper
- [Research Assistant](../guides/research-assistant.md) - Research tool

### Integrate

- [Claude Desktop](../integrations/claude-desktop.md) - MCP integration
- [Python SDK](../sdks/python-sdk.md) - Python client
- [JavaScript SDK](../sdks/javascript-sdk.md) - JS/TS client

## Questions?

See [FAQ](../troubleshooting/faq.md) or ask on [Discord](https://discord.gg/sekha).
