# MCP Tools Reference

## Overview

Sekha provides native [Model Context Protocol (MCP)](https://modelcontextprotocol.io) support, enabling Claude Desktop and other MCP-compatible AI tools to access your memory seamlessly.

**What is MCP?** A protocol developed by Anthropic for connecting AI assistants to external tools and data sources.

**Sekha MCP Server** provides 7 tools that Claude can use to interact with your memory.

---

## Quick Setup (Claude Desktop)

### 1. Install Docker

The Sekha MCP server runs as a Docker container.

### 2. Configure Claude Desktop

Edit Claude Desktop's configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

Add the Sekha MCP server:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--network=host",
        "-e", "SEKHA_API_URL=http://localhost:8080",
        "-e", "SEKHA_API_KEY=your-api-key-here",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    }
  }
}
```

### 3. Restart Claude Desktop

You should see "Sekha" in the tools menu (hammer icon).

### 4. Test It

Ask Claude:

> "Store this conversation in Sekha with label 'Test Memory'"

Claude will use the `memory_store` tool automatically.

---

## Available Tools

### `memory_store`

**Purpose:** Store the current conversation in Sekha memory.

**When Claude Uses It:**

- User asks to "remember this" or "save this conversation"
- User wants to store context for future reference
- Manually invoked via tool selection

**Parameters:**

```json
{
  "label": "Project Planning Session",
  "folder": "/work/new-feature",
  "importance": 7,
  "messages": [
    {"role": "user", "content": "Let's plan the authentication feature"},
    {"role": "assistant", "content": "Great! Here's my recommendation..."}
  ]
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `label` | string | Yes | Human-readable label for this conversation |
| `folder` | string | No | Folder path (e.g., `/work/projects`) |
| `importance` | integer | No | 1-10 scale (default: 5) |
| `messages` | array | Yes | Conversation messages |

**Example Prompts:**

- "Remember this conversation as 'API Design Discussion'"
- "Store this in my work folder with label 'Sprint Planning'"
- "Save this conversation with high importance"

**Returns:**

```json
{
  "success": true,
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Project Planning Session",
  "message": "Conversation stored successfully with 2 messages"
}
```

---

### `memory_query`

**Purpose:** Search your memory using semantic search.

**When Claude Uses It:**

- User asks "What did we discuss about X?"
- User requests information from past conversations
- Claude needs context to answer a follow-up question

**Parameters:**

```json
{
  "query": "What decisions did we make about authentication?",
  "limit": 5,
  "folder": "/work"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `limit` | integer | No | Max results (default: 10, max: 50) |
| `folder` | string | No | Filter to specific folder |

**Example Prompts:**

- "What did we discuss about API design last week?"
- "Search my memory for OAuth discussions"
- "Find conversations about the new feature"

**Returns:**

```json
{
  "results": [
    {
      "conversation_id": "...",
      "label": "API Design Discussion",
      "folder": "/work/backend",
      "relevance_score": 0.92,
      "snippet": "We decided to use OAuth 2.0 with JWT tokens...",
      "created_at": "2026-01-20T15:30:00Z"
    }
  ],
  "total_found": 3
}
```

---

### `memory_get_context`

**Purpose:** Build optimal context for Claude's current conversation by retrieving relevant past conversations.

**When Claude Uses It:**

- User references past work ("continue where we left off")
- Claude needs background to answer complex questions
- User explicitly requests context assembly

**Parameters:**

```json
{
  "query": "Continue working on the authentication feature",
  "context_budget": 8000,
  "preferred_labels": ["API Design", "Authentication"]
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | What the user wants to do next |
| `context_budget` | integer | No | Max tokens (default: 4000) |
| `preferred_labels` | array | No | Prioritize these labels |

**Example Prompts:**

- "Load context about our API project"
- "What's the background on the authentication feature?"
- "Continue our discussion from yesterday"

**Returns:**

```json
{
  "context": [
    {
      "label": "API Design Discussion",
      "messages": [{"role": "user", "content": "..."}, ...],
      "relevance_score": 0.95
    }
  ],
  "total_tokens": 3200,
  "conversations_included": 4
}
```

Claude automatically incorporates this context into its understanding.

---

### `memory_create_label`

**Purpose:** Create or update conversation labels and folders.

**When Claude Uses It:**

- User wants to organize conversations
- User renames or moves a conversation
- Claude suggests better organization

**Parameters:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Completed: API Design",
  "folder": "/work/archive/2026-q1"
}
```

**Example Prompts:**

- "Rename that conversation to 'Completed Project'"
- "Move the API discussion to my archive folder"
- "Organize this conversation under /work/auth"

---

### `memory_prune_suggest`

**Purpose:** Get recommendations for cleaning up old or low-value conversations.

**When Claude Uses It:**

- User asks "what can I delete?"
- User wants to clean up memory
- Storage optimization needed

**Parameters:**

```json
{
  "threshold_days": 90,
  "min_importance": 3
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `threshold_days` | integer | No | Consider conversations older than X days |
| `min_importance` | integer | No | Consider conversations with importance ≤ X |

**Example Prompts:**

- "What old conversations can I archive?"
- "Find conversations I don't need anymore"
- "Suggest memory cleanup"

**Returns:**

```json
{
  "candidates": [
    {
      "conversation_id": "...",
      "label": "Random Chat",
      "age_days": 120,
      "importance": 2,
      "reason": "Low importance, not accessed in 90+ days"
    }
  ],
  "total_candidates": 8,
  "potential_space_saved_mb": 24
}
```

---

### `memory_export`

**Purpose:** Export conversations in various formats.

**When Claude Uses It:**

- User wants to export data
- User needs backup
- User wants to share conversations

**Parameters:**

```json
{
  "format": "markdown",
  "folder": "/work",
  "start_date": "2026-01-01",
  "end_date": "2026-01-31"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `json`, `markdown`, or `csv` |
| `folder` | string | No | Export specific folder only |
| `start_date` | string | No | ISO 8601 date (e.g., `2026-01-01`) |
| `end_date` | string | No | ISO 8601 date |

**Example Prompts:**

- "Export all my work conversations from January"
- "Give me a markdown export of this project"
- "Export my memory as JSON for backup"

**Returns:**

```json
{
  "download_url": "https://...",
  "format": "markdown",
  "conversations_exported": 23,
  "size_mb": 1.2
}
```

---

### `memory_stats`

**Purpose:** Get usage statistics about your memory.

**When Claude Uses It:**

- User asks "how much memory am I using?"
- User wants usage overview
- Automatic context gathering

**Parameters:** None

**Example Prompts:**

- "How many conversations do I have stored?"
- "Show me my memory usage statistics"
- "What's my memory status?"

**Returns:**

```json
{
  "total_conversations": 247,
  "active_conversations": 215,
  "archived_conversations": 32,
  "total_messages": 8432,
  "storage_mb": 45,
  "labels": 18,
  "folders": 6,
  "date_range": {
    "oldest": "2025-06-15T10:00:00Z",
    "newest": "2026-01-25T20:00:00Z"
  }
}
```

---

## Example Workflows

### Workflow 1: Project Planning

**User:** "I'm starting a new authentication feature. Search my memory for related discussions."

**Claude uses:** `memory_query`  
**Query:** `"authentication feature design"`  
**Result:** Claude finds 3 past conversations about OAuth, JWT, and security.

**User:** "Great! Let's continue based on those discussions."

**Claude uses:** `memory_get_context`  
**Query:** `"continue authentication feature based on past discussions"`  
**Result:** Claude loads 4,000 tokens of relevant context.

**User:** "Perfect. Store this conversation as we make progress."

**Claude uses:** `memory_store`  
**Label:** `"Authentication Feature - Planning Session"`  
**Folder:** `"/work/backend/auth"`

---

### Workflow 2: Knowledge Organization

**User:** "What's the status of my stored conversations?"

**Claude uses:** `memory_stats`  
**Result:** Shows 247 conversations, 45MB storage.

**User:** "I should clean up old stuff. What can I delete?"

**Claude uses:** `memory_prune_suggest`  
**Threshold:** 90 days, importance ≤ 3  
**Result:** 8 candidates for archiving, would save 24MB.

**User:** "Archive those conversations."

**Claude uses:** `memory_create_label` (bulk operation)  
**Action:** Moves 8 conversations to `/archive/2025`

---

### Workflow 3: Research Assistant

**User:** "I'm writing a paper on AI memory systems. Search everything we've discussed."

**Claude uses:** `memory_query`  
**Query:** `"AI memory systems architecture discussions"`  
**Result:** 12 relevant conversations found.

**User:** "Export those as markdown for my notes."

**Claude uses:** `memory_export`  
**Format:** `markdown`  
**Filters:** Based on query results  
**Result:** Download link with 12 conversations in markdown.

---

## Troubleshooting

### Claude can't see Sekha tools

**Check:**

1. Claude Desktop config file is valid JSON
2. Docker is running (`docker ps`)
3. Sekha Controller is running (`curl http://localhost:8080/health`)
4. Restart Claude Desktop after config changes

### Tools return errors

**Common causes:**

- **401 Unauthorized:** Wrong API key in config
- **Connection refused:** Sekha Controller not running
- **Timeout:** Increase Docker timeout in config

**Debug:**

```bash
# Test MCP server manually
docker run -i --rm --network=host \
  -e SEKHA_API_URL=http://localhost:8080 \
  -e SEKHA_API_KEY=your-key \
  ghcr.io/sekha-ai/sekha-mcp:latest
```

### Performance is slow

**Optimize:**

- Reduce `context_budget` (default: 4000 → try 2000)
- Use `limit` parameter in queries (default: 10 → try 5)
- Prune old conversations
- Index your database (`VACUUM` in SQLite)

---

## Advanced Configuration

### Custom API URL

If Sekha is running on a different host:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEKHA_API_URL=http://192.168.1.100:8080",
        "-e", "SEKHA_API_KEY=your-key",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    }
  }
}
```

### Multiple Sekha Instances

```json
{
  "mcpServers": {
    "sekha-personal": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEKHA_API_URL=http://localhost:8080",
        "-e", "SEKHA_API_KEY=personal-key",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    },
    "sekha-work": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEKHA_API_URL=http://work-server:8080",
        "-e", "SEKHA_API_KEY=work-key",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    }
  }
}
```

Claude will show both as separate tool sets.

---

## Security Considerations

### API Key Storage

Your API key is stored in Claude's config file in **plain text**. Protect it:

```bash
# macOS/Linux
chmod 600 ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Or use environment variables (more secure)
export SEKHA_API_KEY="your-key-here"
```

Then omit `-e SEKHA_API_KEY=...` from config (MCP server will read from environment).

### Network Security

For production deployments:

- Use HTTPS (`SEKHA_API_URL=https://sekha.yourcompany.com`)
- Enable firewall rules
- Consider VPN for remote access
- Rotate API keys periodically

---

## MCP Protocol Details

**Specification:** [Model Context Protocol](https://modelcontextprotocol.io)  
**Sekha Implementation:** [sekha-mcp repository](https://github.com/sekha-ai/sekha-mcp)  
**Protocol Version:** 1.0

**Supported Clients:**

- ✅ Claude Desktop (Anthropic)
- ✅ Cline (VS Code extension)
- 🔜 Other MCP-compatible AI tools

---

## Related Documentation

- **Claude Desktop Setup:** [Full Integration Guide](../integrations/claude-desktop.md)
- **REST API:** [REST API Reference](rest-api.md) (direct API access)
- **Python SDK:** [Python SDK](../sdks/python-sdk.md) (programmatic access)
- **Troubleshooting:** [FAQ](../troubleshooting/faq.md)

---

*Last updated: January 2026 - MCP Protocol v1.0*
