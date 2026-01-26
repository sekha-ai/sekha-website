# Claude Desktop Integration (MCP)

Integrate Sekha with Claude Desktop via the [Model Context Protocol](https://modelcontextprotocol.io) to give Claude persistent, searchable memory across all conversations.

## Overview

With Sekha MCP integration, Claude Desktop can:

- ✅ **Store conversations** automatically or on request
- ✅ **Search your entire memory** semantically
- ✅ **Retrieve past context** to continue work across sessions
- ✅ **Organize conversations** with labels and folders
- ✅ **Export data** to JSON or Markdown
- ✅ **Get insights** about memory usage

---

## Prerequisites

1. **Claude Desktop** installed ([download here](https://claude.ai/download))
2. **Sekha Controller** running at `http://localhost:8080`
3. **Python 3.11+** for the MCP server

---

## Installation

### Step 1: Install Sekha MCP Server

```bash
# Clone the Sekha MCP repository
git clone https://github.com/sekha-ai/sekha-mcp.git
cd sekha-mcp

# Install using pip
pip install -e .

# Or using uv (recommended)
uv pip install -e .
```

---

### Step 2: Get Your API Key

Your Sekha MCP API key is configured in the docker `.env` file or config:

```bash
# Check docker .env file
cat sekha-docker/docker/.env | grep MCP_API_KEY

# Or check config.toml
cat ~/.sekha/config.toml | grep mcp_api_key
```

Look for:

```env
MCP_API_KEY=your-api-key-here
```

Or:

```toml
mcp_api_key = "your-api-key-here"
```

!!! warning "Security Note"
    If you're still using the default key, change it to a secure random string (32+ characters) before proceeding.

---

### Step 3: Configure Claude Desktop

**macOS:** Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** Edit `%APPDATA%\Claude\claude_desktop_config.json`

**Linux:** Edit `~/.config/Claude/claude_desktop_config.json`

Add the Sekha MCP server:

```json
{
  "mcpServers": {
    "sekha-memory": {
      "command": "python",
      "args": ["/absolute/path/to/sekha-mcp/main.py"],
      "env": {
        "CONTROLLER_URL": "http://localhost:8080",
        "CONTROLLER_API_KEY": "your-mcp-api-key-here"
      }
    }
  }
}
```

!!! tip "Path Resolution"
    Use absolute paths. Run `pwd` in the `sekha-mcp` directory to get the full path.

---

### Step 4: Restart Claude Desktop

Quit and reopen Claude Desktop for the configuration to take effect.

---

### Step 5: Verify Setup

1. **Open Claude Desktop**
2. **Start a new conversation**
3. **Type:** "What MCP tools do you have available?"

Claude should list 7 Sekha memory tools:
- `memory_store`
- `memory_search`
- `memory_update`
- `memory_get_context`
- `memory_prune`
- `memory_export`
- `memory_stats`

If you see these tools, integration is successful! ✅

---

## Usage Examples

### Store a Conversation

```
You: "Save this conversation about database optimization as important."

Claude: "I'll store this in your memory with high importance."
[Uses memory_store tool]
✅ Stored in: /work/engineering/database-optimization
```

---

### Search Your Memory

```
You: "What did we discuss about API design last month?"

Claude: "Let me search your memory..."
[Uses memory_search tool]

"I found 5 conversations about API design:

1. **RESTful API Architecture** (Jan 15) - Similarity: 95%
   We discussed REST principles, endpoint naming...

2. **GraphQL vs REST** (Jan 10) - Similarity: 87%
   Comparison of query languages and when to use each...

[...]
"
```

---

### Continue Previous Work

```
Session 1 (Monday):
You: "Let's design the authentication system."
[Discussion happens]
You: "Save this for later."
Claude: [Stores conversation]

Session 2 (Wednesday):
You: "Continue working on authentication."
Claude: [Searches memory, finds previous context]
"Based on our discussion on Monday, we decided to use OAuth 2.0 with JWT tokens. 
Let's pick up where we left off with the refresh token implementation..."
```

---

### Export Conversations

```
You: "Export our database conversations to Markdown."

Claude: "I'll export those for you."
[Uses memory_search + memory_export]

"I've exported 12 database-related conversations to Markdown format.
Would you like me to show you the content or save it to a file?"
```

---

### Memory Cleanup

```
You: "What old conversations can I delete?"

Claude: [Uses memory_prune tool]

"I found 25 conversations that are candidates for deletion:

**Low Priority (15 conversations):**
- Daily standup notes from 6 months ago
- Casual discussions with low importance scores

**Old but Important (10 conversations):**
- Project planning from 8 months ago (importance: 8/10)
- Architecture decisions (importance: 9/10)

Would you like me to archive the low-priority ones?"
```

---

## Configuration

### Environment Variables

You can override settings in the MCP config:

```json
{
  "mcpServers": {
    "sekha-memory": {
      "command": "python",
      "args": ["/path/to/sekha-mcp/main.py"],
      "env": {
        "CONTROLLER_URL": "http://localhost:8080",
        "CONTROLLER_API_KEY": "your-key",
        "LOG_LEVEL": "INFO",
        "REQUEST_TIMEOUT": "30"
      }
    }
  }
}
```

### Available Options

| Variable | Description | Default |
|----------|-------------|----------|
| `CONTROLLER_URL` | Sekha Controller endpoint | `http://localhost:8080` |
| `CONTROLLER_API_KEY` | Authentication key | (required) |
| `LOG_LEVEL` | Logging verbosity | `INFO` |
| `REQUEST_TIMEOUT` | HTTP timeout (seconds) | `30` |

---

## Troubleshooting

### Claude doesn't show Sekha tools

**Check 1:** Verify the controller is running

```bash
curl http://localhost:8080/health
```

Expected: `{"status": "healthy", ...}`

**Check 2:** Test the MCP server directly

```bash
cd sekha-mcp
python main.py
```

You should see: `MCP server started successfully`

**Check 3:** Verify Claude Desktop config syntax

- Must be valid JSON (no trailing commas)
- Use absolute paths (not `~/` or relative paths)
- Check quotes are properly escaped

**Check 4:** View Claude Desktop logs

- **macOS:** `~/Library/Logs/Claude/`
- **Windows:** `%APPDATA%\Claude\logs\`
- **Linux:** `~/.config/Claude/logs/`

Look for MCP connection errors.

---

### Tools fail with "Unauthorized" error

**Problem:** API key mismatch

**Solution:**

1. Check your controller's API key:
   ```bash
   cat sekha-docker/docker/.env | grep MCP_API_KEY
   # Or
   cat ~/.sekha/config.toml | grep mcp_api_key
   ```

2. Update Claude Desktop config to match:
   ```json
   "CONTROLLER_API_KEY": "exact-key-from-config"
   ```

3. Restart Claude Desktop

---

### Tools fail with "Service Unavailable"

**Problem:** Controller or dependencies (Chroma/Ollama) are offline

**Solution:**

```bash
# Check controller status
curl http://localhost:8080/health

# If using Docker, check all services
cd sekha-docker/docker
docker compose -f docker-compose.yml -f docker-compose.full.yml ps

# Restart if needed
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d
```

---

### Slow semantic search

**Problem:** Embedding model is slow or not loaded

**Check:**

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Pull embedding model if missing
ollama pull nomic-embed-text:latest
```

**Expected performance:**
- First query: ~500ms (model loading)
- Subsequent queries: ~50-100ms

---

## Advanced Usage

### Custom Folder Organization

Ask Claude to organize conversations by project:

```
You: "From now on, store all engineering conversations in /work/engineering 
and label them by project name."

Claude: "I'll use that structure. For example:
- /work/engineering/project-alpha
- /work/engineering/database-migration
"
```

---

### Automatic Importance Scoring

```
You: "When storing conversations, automatically assign importance scores:
- 9-10 for critical decisions and architecture discussions
- 7-8 for feature planning and technical designs
- 4-6 for general work discussions
- 1-3 for casual conversations"

Claude: "I'll use those guidelines when storing future conversations."
```

---

### Weekly Summaries

```
You: "Every Friday, give me a summary of the week's important conversations."

Claude: [Uses memory_stats + memory_search]

"Here's your week in review (Jan 19-25, 2026):

**High Priority Discussions (9 conversations):**
- Database optimization strategy (3 discussions)
- API v2 architecture planning (2 discussions)
- Security audit findings (4 discussions)

**Key Decisions Made:**
1. Migrating to PostgreSQL by Q2
2. Implementing rate limiting on all public APIs
3. Adding OAuth 2.0 authentication

**Action Items for Next Week:**
[...]
"
```

---

## Best Practices

### When to Store Conversations

✅ **Do store:**
- Important decisions and rationale
- Technical designs and architecture
- Project planning and milestones
- Learning and research insights
- Recurring work patterns

❌ **Don't store:**
- Casual small talk
- Temporary queries ("What time is it?")
- Duplicate information
- Extremely sensitive data (use encryption first)

---

### Folder Naming Conventions

```
/work
  /[project-name]
    /planning
    /implementation
    /retrospectives
  /team
    /1-on-1s
    /meetings

/personal
  /learning
  /goals
  /health

/research
  /[topic]
```

---

### Label Best Practices

- **Be specific:** "API v2 Authentication" not "APIs"
- **Include context:** "Q1 2026 Goals" not "Goals"
- **Use hierarchy:** "Engineering/Backend/Database"
- **Add status:** "Project Alpha - Planning" → "Project Alpha - Completed"

---

## Limitations

- **Context window:** Claude still has a ~200K token context window per session. Sekha extends memory *across* sessions, not within a single conversation.
- **Semantic search accuracy:** Depends on the quality of embeddings. Very technical or domain-specific language may have lower similarity scores.
- **No automatic storage:** You must explicitly ask Claude to save conversations (or set up automation).

---

## Next Steps

- **[MCP Tools Reference](../api-reference/mcp-tools.md)** - Detailed tool documentation
- **[Organizing Memory](../guides/organizing-memory.md)** - Best practices
- **[Semantic Search Guide](../guides/semantic-search.md)** - Improve search quality
- **[VS Code Extension](vscode.md)** - Use Sekha in VS Code

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-mcp/issues)
- **Discord:** [Join our community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
