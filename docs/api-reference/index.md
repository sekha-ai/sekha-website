# API Reference

Complete API documentation for Sekha Controller.

## Available APIs

### REST API

HTTP REST API for all memory operations.

[**REST API Documentation →**](rest-api.md)

- 17 endpoints for CRUD operations
- Full conversation lifecycle management
- Semantic search and filtering
- Statistics and analytics

### MCP Tools

Model Context Protocol tools for Claude Desktop and other LLM integrations.

[**MCP Tools Documentation →**](mcp-tools.md)

- 7 tools for memory management
- Native Claude Desktop integration
- Context-aware memory operations

## Quick Reference

### Key Endpoints

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Create conversation | `/conversations` | POST |
| Get conversation | `/conversations/{id}` | GET |
| Search conversations | `/conversations/search` | POST |
| Update conversation | `/conversations/{id}` | PUT |
| Delete conversation | `/conversations/{id}` | DELETE |
| Get statistics | `/stats` | GET |
| Health check | `/health` | GET |

### Authentication

All API requests require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.sekha.dev/conversations
```

Set your API key in config:

```toml
[server]
api_key = "sk-sekha-your-secure-key-min-32-chars-long"
```

### Rate Limiting

Default limits:
- **100 requests/second**
- **200 burst size**

Configure in `config.toml`:

```toml
[rate_limiting]
requests_per_second = 100
burst_size = 200
```

### Error Handling

Standard HTTP status codes:

| Code | Meaning |
|------|--------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

## Next Steps

- [REST API Reference](rest-api.md) - Complete endpoint documentation
- [MCP Tools Reference](mcp-tools.md) - Model Context Protocol tools
- [Configuration Guide](../getting-started/configuration.md) - API configuration
