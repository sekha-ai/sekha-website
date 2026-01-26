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

Expected response:
```json
{
  "status": "healthy",
  "database": "ok",
  "chroma": "ok",
  "llm_bridge": "ok"
}
```

If not running, see [Quickstart](quickstart.md).

---

## Step 1: Store a Conversation

### Create Your First Memory

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-mcp-api-key-from-env" \
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

!!! tip "API Key"
    Replace `your-mcp-api-key-from-env` with the actual `MCP_API_KEY` from your `.env` file in `sekha-docker/docker/`.

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
  "created_at": "2026-01-25T20:00:00Z",
  "updated_at": "2026-01-25T20:00:00Z",
  "message_count": 4,
  "folder": "learning",
  "importance": 8
}
```

### What Happened Behind the Scenes?

1. **Stored** in SQLite database (or PostgreSQL if configured)
2. **Sent to LLM Bridge** for embedding generation
3. **Embedded** using nomic-embed-text model (768 dimensions)
4. **Indexed** in ChromaDB vector store
5. **Ready** for semantic search

---

## Step 2: Perform Semantic Search

### Search by Meaning

```bash
curl -X POST http://localhost:8080/api/v1/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-mcp-api-key-from-env" \
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
      "message_index": 3,
      "role": "assistant",
      "content": "In semantic search, both the query and documents are converted to embeddings. We then find documents with embeddings closest to the query embedding, typically using cosine similarity.",
      "similarity_score": 0.87,
      "timestamp": "2026-01-25T20:00:05Z",
      "conversation_label": "Learning About Embeddings",
      "folder": "learning",
      "importance": 8
    },
    {
      "conversation_id": 1,
      "message_index": 1,
      "role": "assistant",
      "content": "Embeddings are dense vector representations of text that capture semantic meaning. They allow us to find similar content by measuring distance in vector space.",
      "similarity_score": 0.72,
      "timestamp": "2026-01-25T20:00:00Z",
      "conversation_label": "Learning About Embeddings",
      "folder": "learning",
      "importance": 8
    }
  ],
  "total_results": 2
}
```

### Understanding Similarity Scores

Scores range from 0 to 1:
- **0.9-1.0** - Highly relevant (near-identical meaning)
- **0.7-0.9** - Relevant (same topic/concept)
- **0.5-0.7** - Moderately relevant (related concepts)
- **<0.5** - Low relevance (different topics)

Scores combine:
- **Semantic similarity** - Embedding distance (cosine similarity)
- **Recency** - Newer messages score slightly higher
- **Importance** - Your 1-10 score provides a boost

---

## Step 3: Assemble Context

### Get Optimal Context for LLM

The `/context/assemble` endpoint retrieves relevant conversation history and formats it for your LLM.

```bash
curl -X POST http://localhost:8080/api/v1/context/assemble \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-mcp-api-key-from-env" \
  -d '{
    "query": "Explain embeddings and semantic search",
    "max_tokens": 2000,
    "include_metadata": true
  }'
```

### Parameters

- **query** - What context you need
- **max_tokens** - Maximum tokens to return (default: 8000)
- **include_metadata** - Include conversation labels, timestamps (default: false)

### Response

```json
{
  "context": "Based on previous conversations:\n\n[Learning About Embeddings - 2026-01-25]\n\nUser: What are embeddings?\nAssistant: Embeddings are dense vector representations of text that capture semantic meaning. They allow us to find similar content by measuring distance in vector space.\n\nUser: How are they used in search?\nAssistant: In semantic search, both the query and documents are converted to embeddings. We then find documents with embeddings closest to the query embedding, typically using cosine similarity.",
  "token_count": 187,
  "conversation_ids": [1],
  "message_count": 4,
  "sources": [
    {
      "conversation_id": 1,
      "label": "Learning About Embeddings",
      "messages_included": 4
    }
  ]
}
```

### Use with Your LLM

**Python example:**

```python
import requests
import openai

# Get context from Sekha
context_response = requests.post(
    "http://localhost:8080/api/v1/context/assemble",
    headers={"X-API-Key": "your-mcp-api-key"},
    json={"query": "Explain embeddings", "max_tokens": 2000}
).json()

# Use with OpenAI
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": context_response["context"]},
        {"role": "user", "content": "Can you explain this in simpler terms?"}
    ]
)

print(response.choices[0].message.content)
```

**Node.js example:**

```javascript
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI();

// Get context from Sekha
const { data } = await axios.post(
  'http://localhost:8080/api/v1/context/assemble',
  { query: 'Explain embeddings', max_tokens: 2000 },
  { headers: { 'X-API-Key': 'your-mcp-api-key' } }
);

// Use with OpenAI
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: data.context },
    { role: 'user', content: 'Can you explain this in simpler terms?' }
  ]
});

console.log(completion.choices[0].message.content);
```

---

## Step 4: Organization

### Using Folders

Organize conversations by topic:

```bash
# Work conversations
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{"folder": "work/project-a", ...}'

# Personal learning
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{"folder": "learning/ai", ...}'

# Research
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{"folder": "research/papers", ...}'
```

### Filter by Folder

```bash
curl -X POST http://localhost:8080/api/v1/search \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{
    "query": "machine learning",
    "folder": "learning",
    "limit": 10
  }'
```

This returns only results from the `learning` folder (and its subfolders like `learning/ai`).

---

## Step 5: View Your Conversations

### List All Conversations

```bash
curl -X GET "http://localhost:8080/api/v1/conversations?limit=10&offset=0" \
  -H "X-API-Key: your-mcp-api-key"
```

### Get a Specific Conversation

```bash
curl -X GET http://localhost:8080/api/v1/conversations/1 \
  -H "X-API-Key: your-mcp-api-key"
```

### Response

```json
{
  "id": 1,
  "label": "Learning About Embeddings",
  "messages": [
    {
      "role": "user",
      "content": "What are embeddings?",
      "timestamp": "2026-01-25T20:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Embeddings are dense vector representations...",
      "timestamp": "2026-01-25T20:00:01Z"
    }
  ],
  "folder": "learning",
  "importance": 8,
  "created_at": "2026-01-25T20:00:00Z",
  "updated_at": "2026-01-25T20:00:00Z"
}
```

---

## Best Practices

### 1. Use Descriptive Labels

```bash
# ✅ Good - Clear and specific
"Architecture Discussion - Auth System"
"Research - Vector Databases Comparison"
"Bug Fix - Payment Processing Issue #123"

# ❌ Not ideal - Too vague
"Chat 1"
"Conversation"
"Notes"
```

### 2. Set Importance Scores Thoughtfully

- **9-10** - Critical decisions, major breakthroughs, important architecture
- **7-8** - Important discussions, feature planning
- **5-6** - Regular work conversations
- **3-4** - Minor notes, casual discussions
- **1-2** - Trivial conversations, test data

### 3. Use Folders for Context Separation

Separate different contexts to improve search relevance:

```
work/
  project-alpha/
  project-beta/
  team-meetings/
personal/
  learning/
    ai/
    programming/
  ideas/
research/
  papers/
  experiments/
```

### 4. Regular Cleanup

Periodically review and delete low-importance, old conversations:

```bash
# Delete conversation
curl -X DELETE http://localhost:8080/api/v1/conversations/123 \
  -H "X-API-Key: your-mcp-api-key"
```

---

## Common Patterns

### Pattern 1: Daily Standup Notes

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{
    "label": "Standup - 2026-01-25",
    "messages": [
      {"role": "user", "content": "What did I work on today?"},
      {"role": "assistant", "content": "- Fixed auth bug\n- Reviewed 3 PRs\n- Started API documentation"}
    ],
    "folder": "work/standups",
    "importance": 3
  }'
```

### Pattern 2: Learning Session

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{
    "label": "Learning Rust Async - Chapter 3",
    "messages": [...],
    "folder": "learning/rust",
    "importance": 7
  }'
```

### Pattern 3: Project Planning

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "X-API-Key: your-mcp-api-key" \
  -d '{
    "label": "Project Alpha - Q1 Roadmap",
    "messages": [...],
    "folder": "work/project-alpha/planning",
    "importance": 9
  }'
```

---

## Next Steps

### Learn More

- [REST API Reference](../api-reference/rest-api.md) - All endpoints documented
- [MCP Tools Reference](../api-reference/mcp-tools.md) - MCP protocol tools
- [Configuration](configuration.md) - Customize Sekha settings
- [Architecture](../architecture/overview.md) - How it works under the hood

### Build Something

- [AI Coding Assistant](../guides/ai-coding-assistant.md) - Build a code helper with memory
- [Research Assistant](../guides/research-assistant.md) - Create a research tool

### Integrate

- [Claude Desktop](../integrations/claude-desktop.md) - MCP integration for Claude
- [Python SDK](../sdks/python-sdk.md) - Python client library
- [JavaScript SDK](../sdks/javascript-sdk.md) - JS/TS client library

### Troubleshooting

- [FAQ](../troubleshooting/faq.md) - Common questions
- [Common Issues](../troubleshooting/common-issues.md) - Debugging guide

---

## Questions?

Join our [Discord community](https://discord.gg/sekha) or open an issue on [GitHub](https://github.com/sekha-ai/sekha-controller/issues).
