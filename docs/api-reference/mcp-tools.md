# MCP Tools Reference

Sekha provides native [Model Context Protocol (MCP)](https://modelcontextprotocol.io) support through **7 tools** that enable Claude Desktop and other MCP-compatible AI assistants to access your memory seamlessly.

## Quick Setup (Claude Desktop)

### 1. Install Sekha

Follow the [installation guide](../getting-started/installation.md) to get Sekha running.

### 2. Configure Claude Desktop

Edit Claude Desktop's configuration file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add the Sekha MCP server:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--network=host",
        "-e", "SEKHA_API_URL=http://localhost:8080",
        "-e", "SEKHA_API_KEY=your-api-key-here",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    }
  }
}
```

### 3. Restart Claude Desktop

You should see "Sekha" in the tools menu (🔨 hammer icon).

### 4. Test It

Ask Claude: _"Store this conversation in Sekha with label 'Test Memory'"_

Claude will use the `memory_store` tool automatically.

---

## Available Tools (7 Total)

### 1. `memory_store`

**Purpose:** Store the current conversation in Sekha memory with automatic labeling and embedding.

**When Claude Uses It:**

- User asks to "remember this" or "save this conversation"
- User wants to store context for future reference
- Manual tool invocation

**Request:**

```json
{
  "label": "API Design Discussion",
  "folder": "/work/backend",
  "messages": [
    {"role": "user", "content": "Let's design the authentication API"},
    {"role": "assistant", "content": "Great! I recommend OAuth 2.0..."}
  ],
  "importance_score": 7
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `label` | string | Yes | - | Human-readable conversation label |
| `folder` | string | Yes | `/` | Folder path for organization |
| `messages` | array | Yes | - | Array of `{role, content}` objects |
| `importance_score` | integer | No | `5` | 1-10 scale for pruning decisions |

**Response:**

```json
{
  "success": true,
  "data": {
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "label": "API Design Discussion",
    "folder": "/work/backend"
  },
  "error": null
}
```

**Example Prompts:**

- "Remember this conversation as 'Sprint Planning'"
- "Store this in /work/projects with high importance"
- "Save this discussion for future reference"

---

### 2. `memory_search`

**Purpose:** Search stored conversations using semantic similarity search.

**When Claude Uses It:**

- User asks "What did we discuss about X?"
- User needs information from past conversations
- Claude needs context for follow-up questions

**Request:**

```json
{
  "query": "What decisions did we make about authentication?",
  "filters": {"folder": "/work"},
  "limit": 10,
  "offset": 0
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Natural language search query |
| `filters` | object | No | `null` | JSON filters (folder, label, etc.) |
| `limit` | integer | No | `10` | Max results to return |
| `offset` | integer | No | `0` | Pagination offset |

**Response:**

```json
{
  "success": true,
  "data": {
    "query": "authentication decisions",
    "total_results": 3,
    "limit": 10,
    "results": [
      {
        "conversation_id": "...",
        "message_id": "...",
        "score": 0.92,
        "content": "We decided to use OAuth 2.0 with JWT tokens...",
        "label": "API Design Discussion",
        "folder": "/work/backend",
        "timestamp": "2026-01-20T15:30:00",
        "metadata": {}
      }
    ]
  },
  "error": null
}
```

**Example Prompts:**

- "Search for conversations about Python type hints"
- "What did we discuss about authentication last week?"
- "Find all mentions of OAuth in my work folder"

---

### 3. `memory_update`

**Purpose:** Update conversation metadata (label, folder, status, importance).

**When Claude Uses It:**

- User wants to rename or reorganize conversations
- User changes importance or status
- Conversation needs to be archived

**Request:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Completed: API Design",
  "folder": "/work/archive/2026-q1",
  "status": "archived",
  "importance_score": 8
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | UUID | Yes | Conversation to update |
| `label` | string | No | New label |
| `folder` | string | No | New folder path |
| `status` | string | No | `active` or `archived` |
| `importance_score` | integer | No | 1-10 scale |

**Response:**

```json
{
  "success": true,
  "data": {
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "updated_fields": ["label/folder"],
    "message": "Conversation updated successfully"
  },
  "error": null
}
```

**Example Prompts:**

- "Rename that conversation to 'Completed Project'"
- "Move the API discussion to my archive folder"
- "Mark this conversation as high importance"

---

### 4. `memory_prune`

**Purpose:** Get intelligent suggestions for archiving or removing old conversations.

**When Claude Uses It:**

- User asks "what can I delete?"
- User wants to free up space
- Memory optimization needed

**Request:**

```json
{
  "threshold_days": 90,
  "importance_threshold": 5.0
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `threshold_days` | integer | No | `30` | Consider conversations older than X days |
| `importance_threshold` | float | No | `5.0` | Consider conversations with score ≤ X |

**Response:**

```json
{
  "success": true,
  "data": {
    "threshold_days": 90,
    "importance_threshold": 5.0,
    "total_suggestions": 8,
    "estimated_token_savings": 12500,
    "suggestions": [
      {
        "conversation_id": "...",
        "conversation_label": "Random Chat",
        "last_accessed": "2025-10-15T10:00:00",
        "message_count": 15,
        "token_estimate": 2500,
        "importance_score": 3.0,
        "preview": "First 100 chars of conversation...",
        "recommendation": "archive"
      }
    ]
  },
  "error": null
}
```

**Example Prompts:**

- "What old conversations can I archive?"
- "Find conversations I don't need anymore"
- "Suggest memory cleanup for the past 6 months"

---

### 5. `memory_get_context`

**Purpose:** Retrieve full context for a specific conversation.

**When Claude Uses It:**

- User references a specific conversation ID
- Claude needs complete metadata
- Context assembly for related tools

**Request:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | UUID | Yes | Conversation ID to retrieve |

**Response:**

```json
{
  "success": true,
  "data": {
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "label": "API Design Discussion",
    "status": "active",
    "folder": "/work/backend",
    "importance_score": 7,
    "word_count": 2500,
    "session_count": 3,
    "created_at": "2026-01-20T15:30:00",
    "updated_at": "2026-01-25T10:00:00"
  },
  "error": null
}
```

**Example Prompts:**

- "Show me details for conversation 123e4567..."
- "What's the metadata for that API discussion?"
- "Get context for the planning conversation"

---

### 6. `memory_export`

**Purpose:** Export conversations in JSON or Markdown format.

**When Claude Uses It:**

- User wants to backup data
- User needs to share conversations
- Data export for analysis

**Request:**

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "format": "markdown",
  "include_metadata": true
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `conversation_id` | UUID | Yes | - | Conversation to export |
| `format` | string | No | `"json"` | Export format: `json` or `markdown` |
| `include_metadata` | boolean | No | `true` | Include metadata in export |

**Response:**

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "label": "API Design Discussion",
      "folder": "/work/backend",
      "status": "active",
      "importance_score": 7,
      "word_count": 2500,
      "session_count": 3,
      "created_at": "2026-01-20T15:30:00",
      "updated_at": "2026-01-25T10:00:00"
    },
    "messages": [
      {"role": "user", "content": "...", "timestamp": "..."},
      {"role": "assistant", "content": "...", "timestamp": "..."}
    ],
    "format": "markdown",
    "include_metadata": true
  },
  "error": null
}
```

**Example Prompts:**

- "Export this conversation as markdown"
- "Give me a JSON backup of the API discussion"
- "Export conversation 123e4567 without metadata"

---

### 7. `memory_stats`

**Purpose:** Get statistics about stored conversations (global or filtered by folder/label).

**When Claude Uses It:**

- User asks about memory usage
- User wants overview of conversations
- Dashboard-style information needed

**Request (Global Stats):**

```json
{}
```

**Request (Folder Stats):**

```json
{
  "folder": "/work"
}
```

**Request (Label Stats):**

```json
{
  "label": "API Design"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `folder` | string | No | Get stats for specific folder |
| `label` | string | No | Get stats for specific label |

!!! warning "Mutual Exclusivity"
    Cannot specify both `folder` and `label` - choose one or neither for global stats.

**Response (Global):**

```json
{
  "success": true,
  "data": {
    "total_conversations": 247,
    "average_importance": 5.8,
    "folders": ["/", "/work", "/work/backend", "/personal"]
  },
  "error": null
}
```

**Response (Folder/Label):**

```json
{
  "success": true,
  "data": {
    "total_conversations": 42,
    "average_importance": 6.5,
    "folders": ["/work"]  // or "labels": ["API Design"]
  },
  "error": null
}
```

**Example Prompts:**

- "How many conversations do I have?"
- "Show stats for my work folder"
- "What's my memory usage?"

---

## Example Workflows

### Workflow 1: Store and Retrieve

**User:** _"Remember this conversation about OAuth implementation"_

**Claude uses:** `memory_store`
```json
{
  "label": "OAuth Implementation Discussion",
  "folder": "/work/backend/auth",
  "messages": [...],
  "importance_score": 8
}
```

**Later...**

**User:** _"What did we decide about OAuth?"_

**Claude uses:** `memory_search`
```json
{
  "query": "OAuth implementation decisions",
  "filters": {"folder": "/work"},
  "limit": 5
}
```

Claude retrieves the stored conversation and references the decisions.

---

### Workflow 2: Memory Organization

**User:** _"How many conversations do I have in my work folder?"_

**Claude uses:** `memory_stats`
```json
{"folder": "/work"}
```

**User:** _"What can I clean up?"_

**Claude uses:** `memory_prune`
```json
{
  "threshold_days": 90,
  "importance_threshold": 4.0
}
```

**User:** _"Archive those 8 old conversations"_

**Claude uses:** `memory_update` (for each)
```json
{
  "conversation_id": "...",
  "folder": "/archive/2025",
  "status": "archived"
}
```

---

### Workflow 3: Data Export

**User:** _"Export my January work conversations as markdown"_

**Claude:**
1. Uses `memory_search` to find January conversations in `/work`
2. For each result, uses `memory_export` with `format: "markdown"`
3. Combines exports into a single document

---

## Troubleshooting

### Claude Can't See Sekha Tools

**Check:**

1. ✅ Claude Desktop config file is valid JSON (use a JSON validator)
2. ✅ Docker is running: `docker ps`
3. ✅ Sekha Controller is running: `curl http://localhost:8080/health`
4. ✅ Restart Claude Desktop after config changes

### Tools Return Errors

**Common Issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Wrong API key | Check `SEKHA_API_KEY` in config |
| `Connection refused` | Controller not running | Start Sekha: `docker compose up -d` |
| `Timeout` | Slow response | Increase Docker timeout in config |
| `404 Not Found` | Wrong conversation ID | Verify ID with `memory_search` |

**Debug MCP Server:**

```bash
# Test manually
docker run -i --rm --network=host \
  -e SEKHA_API_URL=http://localhost:8080 \
  -e SEKHA_API_KEY=your-key \
  ghcr.io/sekha-ai/sekha-mcp:latest

# Check logs
docker logs sekha-mcp
```

### Performance is Slow

**Optimization Tips:**

- Reduce `limit` in searches (10 → 5)
- Use specific `filters` to narrow results
- Prune old conversations with `memory_prune`
- Run `VACUUM` on SQLite database

---

## Security Best Practices

### API Key Protection

Your API key is stored in Claude's config as **plain text**. Protect it:

```bash
# macOS/Linux - restrict file permissions
chmod 600 ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Or use environment variables (more secure)
export SEKHA_API_KEY="your-secure-key-here"
```

Then configure without embedding the key:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--network=host",
        "-e", "SEKHA_API_URL=http://localhost:8080",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ],
      "env": {
        "SEKHA_API_KEY": "${SEKHA_API_KEY}"
      }
    }
  }
}
```

### Network Security

For production:

- ✅ Use HTTPS: `SEKHA_API_URL=https://sekha.yourcompany.com`
- ✅ Enable firewall rules
- ✅ Use VPN for remote access
- ✅ Rotate API keys regularly
- ✅ Monitor access logs

---

## Advanced Configuration

### Multiple Sekha Instances

Manage separate work and personal memories:

```json
{
  "mcpServers": {
    "sekha-work": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--network=host",
        "-e", "SEKHA_API_URL=http://localhost:8080",
        "-e", "SEKHA_API_KEY=work-key",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    },
    "sekha-personal": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEKHA_API_URL=http://personal-server:8080",
        "-e", "SEKHA_API_KEY=personal-key",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    }
  }
}
```

Claude will show both as separate tool sets.

### Remote Sekha Server

Connect to Sekha running on another machine:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEKHA_API_URL=https://sekha.company.com",
        "-e", "SEKHA_API_KEY=prod-key",
        "ghcr.io/sekha-ai/sekha-mcp:latest"
      ]
    }
  }
}
```

---

## Protocol Details

**Specification:** [Model Context Protocol](https://modelcontextprotocol.io)  
**Sekha Implementation:** [sekha-ai/sekha-mcp](https://github.com/sekha-ai/sekha-mcp)  
**Protocol Version:** 1.0  
**Controller Endpoints:** `POST /mcp/tools/{tool_name}`

**Supported Clients:**

- ✅ Claude Desktop (Anthropic)
- ✅ Cline (VS Code extension)
- ✅ Any MCP 1.0 compatible client

**Authentication:**

All MCP tool requests require Bearer token authentication:

```http
POST /mcp/tools/memory_search
Authorization: Bearer your-api-key-here
Content-Type: application/json

{"query": "test"}
```

---

## Related Documentation

- **[Claude Desktop Integration Guide](../integrations/claude-desktop.md)** - Complete setup walkthrough
- **[REST API Reference](rest-api.md)** - Direct API access (without MCP)
- **[Architecture Overview](../architecture/overview.md)** - How MCP tools work internally
- **[Troubleshooting](../troubleshooting/faq.md)** - Common issues and solutions

---

*Documentation updated: January 2026 | Based on sekha-controller v1.0*
