# Integrations

Connect Sekha with your favorite tools and workflows.

## Available Integrations

### Claude Desktop

Native Model Context Protocol (MCP) integration:

[**Claude Desktop Integration →**](claude-desktop.md)

- 7 MCP tools for memory management
- Seamless Claude Desktop experience
- Context-aware memory operations
- Auto-sync conversations

## Coming Soon

### VS Code Extension

Persistent memory for your code editor:

**Status:** 🚧 In Development

- Remember coding conversations
- Project-specific context
- Code snippet search
- Architecture decision tracking

### Obsidian Plugin

Sync Sekha with your knowledge base:

**Status:** 🚧 Planned for Q1 2026

- Bi-directional sync
- Semantic link suggestions
- Tag integration
- Daily notes enhancement

### CLI Tool

Terminal interface for Sekha:

**Status:** 🚧 Planned for Q1 2026

- Interactive conversation management
- Scriptable memory operations
- Batch imports/exports
- Search from terminal

### Custom Integrations

Build your own integration:

- Use the [REST API](../api-reference/rest-api.md)
- Use the [Python SDK](../sdks/python-sdk.md)
- Use the [JavaScript SDK](../sdks/javascript-sdk.md)
- Implement the [MCP Protocol](../api-reference/mcp-tools.md)

## Integration Examples

### Raycast Extension

```bash
# Coming Soon
npm install @sekha/raycast-extension
```

### Alfred Workflow

```bash
# Coming Soon
wget https://sekha.dev/downloads/alfred-workflow.zip
```

### Slack Bot

```python
# Example using Python SDK
from sekha import SekhaClient

client = SekhaClient(api_key="your-key")

# Store Slack conversation
client.conversations.create(
    label=f"Slack - {channel_name}",
    messages=slack_messages,
    folder="slack"
)
```

## Next Steps

- [Claude Desktop](claude-desktop.md) - Setup MCP integration
- [REST API](../api-reference/rest-api.md) - Build custom integrations
- [Python SDK](../sdks/python-sdk.md) - Python client
- [JavaScript SDK](../sdks/javascript-sdk.md) - JS/TS client
