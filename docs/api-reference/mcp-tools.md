# MCP Tools Reference

Sekha provides 7 powerful [Model Context Protocol](https://modelcontextprotocol.io) tools for persistent AI memory management.

## Overview

MCP tools allow AI assistants like Claude Desktop, Cline, Cursor, and Windsurf to interact with Sekha's memory system natively.

**Available Tools:**

1. `memory_store` - Store conversations with importance scoring
2. `memory_search` - Semantic search across all memory
3. `memory_update` - Update conversation metadata
4. `memory_get_context` - Retrieve full conversation with messages
5. `memory_prune` - Get AI-powered pruning suggestions
6. `memory_export` - Export conversations to JSON/Markdown
7. `memory_stats` - View memory usage statistics

---

## Prerequisites

1. **Sekha Controller** running at `http://localhost:8080`
2. **Sekha MCP Server** configured (see [Claude Desktop Integration](../integrations/claude-desktop.md))
3. **API Key** from your Sekha Controller `config.toml`

---

## Tool Definitions

### 1. memory_store

**Purpose:** Store a new conversation in Sekha memory with importance scoring.

**Parameters:**

```json
{
  "label": "string",            // Required: Conversation title
  "folder": "string",           // Required: Folder path like "/work/projects"
  "messages": [
    {
      "role": "user|assistant|system",
      "content": "string",
      "timestamp": "ISO 8601",   // Optional
      "metadata": {}             // Optional
    }
  ],
  "importance_score": 8.0      // Optional: 0.0-10.0 (higher = more important)
}
```

**Example Use in Claude:**

```
User: "Store our conversation about database optimization as important."

Claude: I'll store this conversation in your memory.
[Uses memory_store tool]
{
  "label": "Database Optimization Discussion",
  "folder": "/work/engineering",
  "messages": [
    {"role": "user", "content": "How can we optimize our database queries?"},
    {"role": "assistant", "content": "Here are several strategies..."}
  ],
  "importance_score": 9.0
}
```

**Response:**

```json
{
  "id": "conv-uuid",
  "conversation_id": "conv-uuid",
  "label": "Database Optimization Discussion",
  "status": "active",
  "message_count": 2,
  "created_at": "2026-01-25T16:30:00Z"
}
```

---

### 2. memory_search

**Purpose:** Search conversations semantically with similarity scoring.

**Parameters:**

```json
{
  "query": "string",           // Required: Natural language search query
  "limit": 10,                  // Optional: Max results (1-50)
  "filter_labels": ["label1"]  // Optional: Restrict to specific labels
}
```

**Example Use:**

```
User: "What did we discuss about API design?"

Claude: Let me search your memory.
[Uses memory_search tool]
{
  "query": "API design discussions",
  "limit": 10,
  "filter_labels": ["Engineering"]
}
```

**Response:**

```json
{
  "results": [
    {
      "id": "msg-uuid",
      "conversation_id": "conv-uuid",
      "label": "API Architecture Planning",
      "content": "We should use RESTful principles with...",
      "similarity": 0.92,
      "importance_score": 8,
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "total": 5
}
```

---

### 3. memory_update

**Purpose:** Update conversation metadata (label, folder, importance).

**Parameters:**

```json
{
  "conversation_id": "uuid",  // Required
  "label": "string",          // Optional: New title
  "folder": "string",         // Optional: New folder path
  "importance_score": 9.0     // Optional: New rating (0.0-10.0)
}
```

**Example Use:**

```
User: "Mark that database conversation as completed and archive it."

Claude: I'll update the conversation.
[Uses memory_update tool]
{
  "conversation_id": "conv-uuid",
  "label": "Database Optimization - Completed",
  "folder": "/work/archive",
  "importance_score": 7.0
}
```

---

### 4. memory_get_context

**Purpose:** Retrieve full conversation with all messages and metadata.

**Parameters:**

```json
{
  "conversation_id": "uuid"  // Required
}
```

**Example Use:**

```
User: "Show me the full conversation about database optimization."

Claude: Let me retrieve that for you.
[Uses memory_get_context tool]
{
  "conversation_id": "conv-uuid"
}
```

**Response:**

```json
{
  "id": "conv-uuid",
  "label": "Database Optimization Discussion",
  "folder": "/work/engineering",
  "status": "active",
  "importance_score": 9,
  "messages": [
    {
      "role": "user",
      "content": "How can we optimize our database queries?",
      "timestamp": "2026-01-20T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Here are several strategies...",
      "timestamp": "2026-01-20T10:00:05Z"
    }
  ],
  "message_count": 2,
  "word_count": 450,
  "created_at": "2026-01-20T10:00:00Z"
}
```

---

### 5. memory_prune

**Purpose:** Get AI-powered suggestions for pruning old or low-importance conversations.

**Parameters:**

```json
{
  "threshold_days": 30,           // Optional: Age threshold (default: 30)
  "importance_threshold": 5.0     // Optional: Min importance to keep (0.0-10.0)
}
```

**Example Use:**

```
User: "What conversations can I safely delete to free up space?"

Claude: Let me check for pruning candidates.
[Uses memory_prune tool]
{
  "threshold_days": 60,
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
      "age_days": 90,
      "importance_score": 3,
      "reason": "Low importance, no recent activity",
      "last_accessed": "2025-10-15T10:00:00Z"
    }
  ],
  "total_candidates": 15,
  "estimated_space_saved_mb": 25.5
}
```

---

### 6. memory_export

**Purpose:** Export conversation to JSON or Markdown format for backup, migration, or external analysis.

**Parameters:**

```json
{
  "conversation_id": "uuid",      // Required
  "format": "json|markdown",      // Optional: Default "json"
  "include_metadata": true        // Optional: Include word count, etc.
}
```

**Example Use:**

```
User: "Export the database optimization conversation as Markdown."

Claude: I'll export that for you.
[Uses memory_export tool]
{
  "conversation_id": "conv-uuid",
  "format": "markdown",
  "include_metadata": true
}
```

**Response (Markdown format):**

```markdown
# Database Optimization Discussion

**Folder:** /work/engineering  
**Importance:** 9/10  
**Created:** 2026-01-20  
**Messages:** 2  
**Words:** 450

---

## Conversation

**User** (2026-01-20 10:00:00):  
How can we optimize our database queries?

**Assistant** (2026-01-20 10:00:05):  
Here are several strategies:
1. Add indexes to frequently queried columns
2. Use query result caching
3. Optimize JOIN operations
...
```

**Use Cases:**
- Backup important conversations before pruning
- Migrate data between Sekha instances
- Analyze conversations in external tools
- Share with team members who don't use Sekha

---

### 7. memory_stats

**Purpose:** Get memory system statistics and usage analytics.

**Parameters:**

```json
{
  "folder": "string"  // Optional: Specific folder to analyze
}
```

**Example Use:**

```
User: "Show me statistics about my work-related conversations."

Claude: Let me get those stats.
[Uses memory_stats tool]
{
  "folder": "/work"
}
```

**Response:**

```json
{
  "total_conversations": 450,
  "total_messages": 12000,
  "total_words": 450000,
  "average_importance": 6.8,
  "folders": {
    "/work/engineering": 200,
    "/work/product": 150,
    "/work/archive": 100
  },
  "labels": {
    "API Design": 80,
    "Database": 60,
    "Security": 45
  },
  "status_breakdown": {
    "active": 350,
    "archived": 90,
    "pinned": 10
  },
  "storage_size_mb": 125.5,
  "date_range": {
    "oldest": "2025-06-01T00:00:00Z",
    "newest": "2026-01-25T16:30:00Z"
  }
}
```

---

## Common Workflows

### Workflow 1: Store and Organize Conversations

```
1. Have a valuable conversation with Claude
2. Ask: "Save this conversation as important"
3. Claude uses memory_store with high importance score
4. Later: "What did we discuss about [topic]?"
5. Claude uses memory_search to find relevant conversations
```

---

### Workflow 2: Context Continuity Across Sessions

```
Session 1:
User: "Let's plan the new feature."
[Conversation happens]
User: "Save this for later."
Claude: [Uses memory_store]

Session 2 (days later):
User: "Continue working on that feature we discussed."
Claude: [Uses memory_search to find context]
"Based on our previous discussion, here's where we left off..."
```

---

### Workflow 3: Memory Cleanup

```
User: "I want to clean up old conversations."
Claude: [Uses memory_prune]
"I found 15 conversations over 90 days old with low importance scores.
Would you like me to list them?"

User: "Yes, show me."
Claude: [Lists candidates with reasons]

User: "Delete the ones about daily standup notes."
Claude: [Uses memory_update to archive or API to delete]
```

---

## Error Handling

All tools return errors in this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid importance_score",
    "details": "Must be between 0.0 and 10.0"
  }
}
```

### Common Errors

| Code | Description | Solution |
|------|-------------|----------|
| `UNAUTHORIZED` | Invalid API key | Check MCP config API key |
| `NOT_FOUND` | Conversation doesn't exist | Verify conversation_id |
| `VALIDATION_ERROR` | Invalid parameters | Check parameter types/ranges |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `SERVICE_UNAVAILABLE` | Controller offline | Start Sekha Controller |

---

## Best Practices

### Importance Scoring Guidelines

- **1-3:** Low priority (daily notes, transient discussions)
- **4-6:** Normal conversations (general work discussions)
- **7-9:** High value (important decisions, key insights)
- **10:** Critical (must never be auto-pruned, pinned)

### Folder Organization

```
/work
  /engineering
  /product
  /meetings
  /archive
/personal
  /learning
  /health
  /finance
/research
  /ai-memory
  /papers
```

### Label Strategies

- Use descriptive labels: "API Design" not "APIs"
- Combine scope + topic: "Engineering/Database"
- Add status for long-running topics: "Project Alpha - Planning"
- Use dates for time-sensitive items: "Q1 2026 Goals"

---

## Performance Notes

- **Semantic search:** ~50-100ms for 10,000 conversations
- **Full-text search:** ~10-20ms
- **Context retrieval:** ~5-10ms
- **Store operation:** ~100-200ms (includes embedding generation)

---

## Next Steps

- **[Claude Desktop Integration](../integrations/claude-desktop.md)** - Setup guide
- **[REST API Reference](rest-api.md)** - Direct API access
- **[Organizing Memory Guide](../guides/organizing-memory.md)** - Best practices
