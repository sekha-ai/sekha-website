# Integrations

Integrate Sekha with your tools and workflows.

## Available Integrations

### Official Integrations

- [**Claude Desktop**](claude-desktop.md) - Native MCP integration for Claude

### Coming Soon

Planned integrations for Q1-Q2 2026:

- **VS Code Extension** - Memory-aware coding assistant
- **Obsidian Plugin** - Sync notes with Sekha memory
- **CLI Tool** - Command-line memory management
- **Custom Integrations** - Build your own with SDKs

## Integration Methods

### 1. Model Context Protocol (MCP)

**Best for:** LLM applications (Claude, ChatGPT, etc.)

MCP provides standardized tools that LLMs can call:

```json
{
  "mcpServers": {
    "sekha": {
      "command": "node",
      "args": ["/path/to/sekha-mcp-server/build/index.js"],
      "env": {
        "SEKHA_API_URL": "http://localhost:8080",
        "SEKHA_API_KEY": "your-api-key"
      }
    }
  }
}
```

**Available MCP Tools:**
- `create_memory` - Store new conversation
- `search_memory` - Semantic search
- `get_memory` - Retrieve by ID
- `assemble_context` - Get relevant context
- `list_labels` - Browse memory organization
- `get_statistics` - Memory stats
- `delete_memory` - Remove conversation

See [MCP Tools Reference](../api-reference/mcp-tools.md) for details.

### 2. REST API

**Best for:** Web applications, mobile apps, custom tools

Direct HTTP integration:

```bash
curl -X POST http://localhost:8080/conversations/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning projects",
    "limit": 10
  }'
```

See [REST API Reference](../api-reference/rest-api.md) for all endpoints.

### 3. SDKs

**Best for:** Python and JavaScript applications

**Python:**

```python
from sekha_sdk import SekhaClient

client = SekhaClient(
    api_url="http://localhost:8080",
    api_key="your-api-key"
)

results = client.search(query="authentication", limit=5)
```

**JavaScript:**

```javascript
import { SekhaClient } from '@sekha/sdk';

const client = new SekhaClient({
  apiUrl: 'http://localhost:8080',
  apiKey: 'your-api-key'
});

const results = await client.search('authentication', { limit: 5 });
```

See [SDK Documentation](../sdks/index.md) for complete guides.

## Example Integrations

### Slack Bot

```python
from slack_bolt import App
from sekha_sdk import SekhaClient

app = App(token=os.environ["SLACK_BOT_TOKEN"])
sekha = SekhaClient(api_url="http://localhost:8080")

@app.message("search")
def search_memory(message, say):
    query = message["text"].replace("search", "").strip()
    results = sekha.search(query, limit=3)
    
    response = "Found:\n"
    for r in results:
        response += f"\u2022 {r.title}\n"
    
    say(response)
```

### Jupyter Notebook

```python
import sekha_sdk
import pandas as pd

# Connect to Sekha
client = sekha_sdk.SekhaClient(api_url="http://localhost:8080")

# Get research notes
notes = client.search("experiment results", limit=50)

# Convert to DataFrame for analysis
df = pd.DataFrame([{
    'title': n.title,
    'content': n.content,
    'created_at': n.created_at,
    'importance': n.importance
} for n in notes])

# Analyze
df.describe()
```

### Chrome Extension

```javascript
// background.js
import { SekhaClient } from '@sekha/sdk';

const sekha = new SekhaClient({
  apiUrl: 'http://localhost:8080',
  apiKey: await getApiKey()
});

// Save current page to memory
chrome.action.onClicked.addListener(async (tab) => {
  await sekha.conversations.create({
    title: tab.title,
    content: `Saved from: ${tab.url}`,
    labels: ['web', 'research']
  });
  
  alert('Saved to Sekha!');
});
```

## Building Custom Integrations

### Authentication

All integrations must authenticate:

```bash
Authorization: Bearer YOUR_API_KEY
```

Generate a secure API key:

```bash
openssl rand -base64 32
```

Configure in `~/.sekha/config.toml`:

```toml
[server]
api_key = "sk-sekha-generated-key-here"
```

### Rate Limiting

Default limits:
- 100 requests/second
- 200 burst size

Handle rate limit errors (HTTP 429):

```python
import time
from requests.exceptions import HTTPError

def safe_request(func):
    max_retries = 3
    for i in range(max_retries):
        try:
            return func()
        except HTTPError as e:
            if e.response.status_code == 429:
                time.sleep(2 ** i)  # Exponential backoff
            else:
                raise
```

### Error Handling

Handle common errors:

```python
try:
    result = client.search(query)
except sekha_sdk.AuthenticationError:
    print("Invalid API key")
except sekha_sdk.RateLimitError:
    print("Too many requests, slow down")
except sekha_sdk.ServerError:
    print("Sekha server error")
except sekha_sdk.NetworkError:
    print("Cannot reach Sekha server")
```

## Integration Checklist

Before deploying:

- [ ] API key stored securely (environment variable)
- [ ] Error handling implemented
- [ ] Rate limiting respected
- [ ] HTTPS used in production
- [ ] Logging configured
- [ ] Health check endpoint monitored
- [ ] Backup/retry logic in place

## Community Integrations

Share your integration:

- [GitHub Discussions](https://github.com/sekha-ai/sekha-controller/discussions)
- [Discord #integrations](https://discord.gg/sekha)

## Next Steps

- [**Claude Desktop Integration**](claude-desktop.md) - Set up Claude with Sekha
- [**REST API Reference**](../api-reference/rest-api.md) - All endpoints
- [**MCP Tools Reference**](../api-reference/mcp-tools.md) - MCP tool details
- [**SDK Documentation**](../sdks/index.md) - Python and JavaScript SDKs
