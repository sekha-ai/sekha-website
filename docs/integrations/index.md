# Integrations

Integrate Sekha with your favorite tools and workflows.

## Official Integrations

### [Claude Desktop (MCP)](claude-desktop.md)

Use Sekha directly in Claude Desktop via Model Context Protocol.

**Status:** ✅ Production Ready

**Features:**
- 7 MCP tools available in Claude
- Automatic memory injection
- Seamless conversation storage

### [VS Code Extension](vscode.md)

Manage memory directly from your code editor.

**Status:** 🚧 Beta

**Features:**
- Inline memory search
- Context snippets
- Conversation sidebar
- Quick storage commands

### [Obsidian Plugin](obsidian.md)

Connect your Obsidian knowledge base to Sekha memory.

**Status:** 🚧 Early Stage

**Features:**
- Sync notes to Sekha
- Search from Obsidian
- Bidirectional linking

### [CLI Tool](cli.md)

Powerful command-line interface for terminal workflows.

**Status:** 🚧 Beta

**Features:**
- Query memory from terminal
- Store conversations
- Manage labels and folders
- Export and backup

## Integration Patterns

### Direct API Integration

Integrate via REST API from any application:

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d @conversation.json
```

**[→ REST API Reference](../api-reference/rest-api.md)**

### SDK Integration

Use official SDKs for Python or JavaScript:

```python
from sekha import SekhaClient

client = SekhaClient(api_key="your-key")
result = client.store_conversation(...)
```

**[→ SDK Documentation](../sdks/index.md)**

### MCP Protocol

Implement MCP in your application:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "sekha-mcp",
      "args": ["--config", "config.toml"]
    }
  }
}
```

**[→ MCP Tools Reference](../api-reference/mcp-tools.md)**

## Community Integrations

Community-built integrations:

- **Raycast Extension** - *Coming soon*
- **Alfred Workflow** - *Coming soon*
- **Emacs Package** - *Coming soon*
- **Vim Plugin** - *Coming soon*

## Building Custom Integrations

Want to build your own integration?

**[→ Custom Integration Guide](custom.md)**

Learn how to:
- Authenticate with Sekha API
- Handle conversation storage
- Implement semantic search
- Build context-aware features

## Need Help?

- [API Reference](../api-reference/index.md)
- [Discord Community](https://discord.gg/sekha)
- [Contributing Guide](../development/contributing.md)