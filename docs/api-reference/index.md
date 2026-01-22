# API Reference

Complete API documentation for Sekha AI Memory Controller.

## Available APIs

Sekha provides two primary API interfaces:

### [REST API](rest-api.md)
17 HTTP endpoints for all memory operations. Use from any programming language.

**Quick Links:**
- [Store Conversations](rest-api.md#store-conversations)
- [Query Memory](rest-api.md#semantic-query)
- [Update Conversations](rest-api.md#update-conversation)
- [Health & Stats](rest-api.md#health-checks)

### [MCP Tools](mcp-tools.md)
7 Model Context Protocol tools for Claude Desktop and compatible applications.

**Available Tools:**
- `memory_store` - Save conversations
- `memory_query` - Search memory
- `memory_get_context` - Retrieve context
- `memory_create_label` - Organize
- `memory_prune_suggest` - Cleanup
- `memory_export` - Export data
- `memory_stats` - View statistics

## API Features

### [Authentication](authentication.md)
Bearer token authentication with configurable API keys.

### [Rate Limiting](rate-limiting.md)
Configurable rate limits per IP and per endpoint.

### [Error Codes](error-codes.md)
Standardized error responses with detailed messages.

## Interactive Documentation

When running locally, access interactive API documentation at:

```
http://localhost:8080/swagger-ui/
```

## Quick Examples

### cURL

```bash
# Store a conversation
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "label": "Test",
    "messages": [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi there!"}
    ]
  }'
```

### Python

```python
from sekha import SekhaClient

client = SekhaClient(api_key="your-api-key")
result = client.store_conversation(
    label="Test",
    messages=[
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ]
)
```

### JavaScript

```javascript
import { SekhaClient } from 'sekha-js';

const client = new SekhaClient({ apiKey: 'your-api-key' });
const result = await client.storeConversation({
  label: 'Test',
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' }
  ]
});
```

## SDK Documentation

Prefer using SDKs over raw API calls:

- [Python SDK Documentation](../sdks/python-sdk.md)
- [JavaScript SDK Documentation](../sdks/javascript-sdk.md)

## API Versioning

All endpoints are versioned with `/api/v1/` prefix. Breaking changes will increment the version number.

Current version: **v1**

## Need Help?

- [Common Issues](../troubleshooting/common-issues.md)
- [Discord Community](https://discord.gg/sekha)
- [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)