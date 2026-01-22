# Python SDK

Official Python client library for the Sekha AI Memory Controller.

[![PyPI](https://img.shields.io/pypi/v/sekha-python-sdk.svg)](https://pypi.org/project/sekha-python-sdk/)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org)
[![codecov](https://codecov.io/gh/sekha-ai/sekha-python-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-python-sdk)
[![CI](https://github.com/sekha-ai/sekha-python-sdk/workflows/CI/badge.svg)](https://github.com/sekha-ai/sekha-python-sdk/actions)

## Installation

```bash
pip install sekha-memory
```

## Quick Start

### Async Client (Recommended)

```python
import asyncio
from sekha import SekhaClient, ClientConfig, NewConversation, MessageDto

async def main():
    # Configure client
    config = ClientConfig(
        api_key="sk-sekha-your-api-key-here",
        base_url="http://localhost:8080"
    )
    
    async with SekhaClient(config) as client:
        # Create a conversation
        conv = NewConversation(
            label="Project:AI",
            folder="/work",
            messages=[
                MessageDto(role="user", content="What is token limit for Claude?"),
                MessageDto(role="assistant", content="200K tokens"),
            ]
        )
        
        result = await client.create_conversation(conv)
        print(f"Created: {result.id}")
        
        # Smart query
        response = await client.smart_query("token limits")
        for msg in response.results:
            print(f"- {msg.content} (from {msg.label})")

# Run
asyncio.run(main())
```

### Synchronous Client

```python
from sekha import SyncSekhaClient, ClientConfig

config = ClientConfig(
    api_key="sk-sekha-...",
    base_url="http://localhost:8080"
)

with SyncSekhaClient(config) as client:
    # All async methods available synchronously
    result = client.create_conversation(conv)
    response = client.smart_query("token limits")
```

## Configuration

```python
config = ClientConfig(
    api_key="sk-sekha-...",           # Required
    base_url="http://localhost:8080",  # Default
    timeout=30.0,                      # Request timeout (seconds)
    max_retries=3,                     # Retry attempts
    rate_limit_requests=1000,          # Per minute
)
```

## Core Operations

### Storing Conversations

```python
from sekha import NewConversation, MessageDto

conversation = NewConversation(
    label="Project Planning",
    folder="/work/new-feature",
    messages=[
        MessageDto(role="user", content="We need to build a new API endpoint"),
        MessageDto(role="assistant", content="I recommend starting with...")
    ],
    importance_score=8  # Optional: 1-10 scale
)

result = await client.create_conversation(conversation)
print(f"Stored as {result.id}")
```

### Searching Memory

**Semantic Search:**
```python
# Natural language search (finds meaning, not just keywords)
results = await client.smart_query(
    query="API design patterns",
    limit=10
)

for result in results:
    print(f"{result.label}: {result.content}")
    print(f"Similarity: {result.similarity:.2f}")
```

**Full-Text Search:**
```python
# Exact keyword matching
results = await client.search(
    query="JWT implementation",
    label="Security",  # Optional filter
    limit=20
)
```

### Building Context

```python
# Get the most relevant conversations for your next LLM prompt
context = await client.assemble_context(
    query="Continue working on the new feature",
    preferred_labels=["Project Planning", "Technical Design"],
    context_budget=8000  # Max tokens
)

print(context.formatted_context)
print(f"Estimated tokens: {context.estimated_tokens}")
print(f"Used {len(context.conversations)} conversations")
```

### Memory Management

**Pin Important Conversations:**
```python
await client.pin(conversation_id)
```

**Archive Old Conversations:**
```python
await client.archive(conversation_id)
```

**Update Labels:**
```python
await client.update_label(
    conversation_id,
    label="Completed Feature",
    folder="/work/archive"
)
```

### AI-Powered Features

**Get Label Suggestions:**
```python
suggestions = await client.suggest_labels(conversation_id)
for suggestion in suggestions:
    print(f"{suggestion.label} (confidence: {suggestion.confidence:.2f})")
```

**Get Pruning Recommendations:**
```python
suggestions = await client.get_pruning_suggestions(
    threshold_days=90,
    importance_threshold=5.0
)

for suggestion in suggestions:
    print(f"Consider archiving: {suggestion.id}")
    print(f"  Age: {suggestion.age_days} days")
    print(f"  Importance: {suggestion.importance_score}/10")
    print(f"  Reason: {suggestion.reason}")
```

### Exporting Data

**Export as Markdown:**
```python
markdown = await client.export(
    label="Project:AI",
    format="markdown"
)

with open("backup.md", "w") as f:
    f.write(markdown)
```

**Export as JSON:**
```python
json_data = await client.export(format="json")

with open("backup.json", "w") as f:
    f.write(json_data)
```

**Export All Conversations:**
```python
# No label filter = export everything
all_markdown = await client.export(format="markdown")
```

## Error Handling

```python
from sekha import (
    SekhaError,
    SekhaNotFoundError,
    SekhaAPIError,
    SekhaAuthError,
    SekhaConnectionError
)

try:
    conv = await client.get_conversation("invalid-id")
except SekhaNotFoundError:
    print("Conversation not found")
except SekhaAuthError:
    print("Invalid API key")
except SekhaConnectionError:
    print("Cannot connect to controller")
except SekhaAPIError as e:
    print(f"API Error {e.status_code}: {e.message}")
except SekhaError as e:
    print(f"Unexpected error: {e}")
```

## API Reference

### ClientConfig

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | str | Yes | - | API key (min 32 chars) |
| `base_url` | str | No | `http://localhost:8080` | Controller URL |
| `timeout` | float | No | 30.0 | Request timeout (seconds) |
| `max_retries` | int | No | 3 | Max retry attempts |
| `rate_limit_requests` | int | No | 1000 | Requests per minute |

### SekhaClient Methods

#### `create_conversation(conversation: NewConversation) -> Conversation`
Store a new conversation with messages.

#### `smart_query(query: str, limit: int = 10) -> QueryResponse`
Search conversations semantically.

#### `search(query: str, label: str = None, limit: int = 10) -> List[Conversation]`
Full-text search.

#### `get_conversation(conversation_id: str) -> Conversation`
Retrieve a specific conversation.

#### `list_conversations(label: str = None, limit: int = 50) -> List[Conversation]`
List all conversations, optionally filtered.

#### `update_label(conversation_id: str, label: str, folder: str = None) -> None`
Update conversation metadata.

#### `pin(conversation_id: str) -> None`
Pin a conversation (prevents pruning).

#### `archive(conversation_id: str) -> None`
Archive a conversation.

#### `assemble_context(query: str, preferred_labels: List[str] = None, context_budget: int = 8000) -> ContextAssembly`
Build optimal context for LLM prompts.

#### `suggest_labels(conversation_id: str) -> List[LabelSuggestion]`
Get AI-powered label suggestions.

#### `get_pruning_suggestions(threshold_days: int = 30, importance_threshold: float = 5.0) -> List[PruningSuggestion]`
Get cleanup recommendations.

#### `export(label: str = None, format: str = "json") -> str`
Export conversations as JSON or Markdown.

## Advanced Usage

### Custom Retry Logic

```python
from sekha import ClientConfig

config = ClientConfig(
    api_key="...",
    max_retries=5,
    timeout=60.0  # Longer timeout
)
```

### Rate Limiting

```python
# Adjust rate limit for high-volume applications
config = ClientConfig(
    api_key="...",
    rate_limit_requests=2000  # 2000 req/min
)
```

### Streaming Large Exports

For very large exports, consider chunking:

```python
# Export by time period
conversations_2024 = await client.list_conversations(
    label="2024",
    limit=1000
)

# Process in batches
for conv in conversations_2024:
    markdown = await client.export_single(conv.id, format="markdown")
    # Process or save
```

## Development

```bash
# Clone and install
git clone https://github.com/sekha-ai/sekha-python-sdk.git
cd sekha-python-sdk
pip install -e ".[dev]"

# Run tests
pytest

# Type checking
mypy sekha/

# Format
black sekha/
isort sekha/
```

## Examples

See the [examples directory](https://github.com/sekha-ai/sekha-python-sdk/tree/main/examples) for more:

- `basic_usage.py` - Simple CRUD operations
- `context_assembly.py` - Building LLM context
- `data_import.py` - Bulk importing conversations
- `intelligent_pruning.py` - Cleanup strategies

## Troubleshooting

### Import Error

Make sure you installed the correct package:
```bash
pip install sekha-memory  # Correct
# NOT: pip install sekha  # Wrong package
```

### Connection Refused

Verify the controller is running:
```bash
curl http://localhost:8080/health
```

### Authentication Failed

Check your API key in `~/.sekha/config.toml`:
```toml
[server]
api_key = "your-key-here"
```

## Resources

- **GitHub:** [sekha-ai/sekha-python-sdk](https://github.com/sekha-ai/sekha-python-sdk)
- **Issues:** [Report a bug](https://github.com/sekha-ai/sekha-python-sdk/issues)
- **Examples:** [Code samples](https://github.com/sekha-ai/sekha-python-sdk/tree/main/examples)

## License

AGPL-3.0 - See [LICENSE](https://github.com/sekha-ai/sekha-python-sdk/blob/main/LICENSE)
