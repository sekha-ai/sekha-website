# Python SDK

Official Python client library for Sekha Controller.

## Overview

The Sekha Python SDK provides:

- ✅ **Full REST API coverage** - All 19 endpoints
- ✅ **Type hints** - Full autocomplete in IDEs
- ✅ **Async/await support** - Both sync and async clients
- ✅ **Pydantic models** - Validated request/response objects
- ✅ **Retry logic** - Automatic retry with exponential backoff
- ✅ **Error handling** - Rich exception types
- ✅ **Streaming support** - For large exports

**Status:** Beta - Ready for testing

---

## Installation

### From PyPI (Coming Soon)

```bash
pip install sekha-sdk
```

### From Source

```bash
git clone https://github.com/sekha-ai/sekha-python-sdk.git
cd sekha-python-sdk
pip install -e .
```

### Requirements

- Python 3.9+
- requests (sync client)
- httpx (async client)
- pydantic (data validation)

---

## Quick Start

### Sync Client

```python
from sekha import SekhaClient

# Initialize
client = SekhaClient(
    base_url="http://localhost:8080",
    api_key="your-rest-api-key-here"
)

# Create conversation
conversation = client.conversations.create(
    label="My First Conversation",
    folder="/work/projects",
    messages=[
        {"role": "user", "content": "What is RAG?"},
        {"role": "assistant", "content": "RAG stands for..."}
    ]
)

print(f"Created: {conversation.id}")

# Search semantically
results = client.query(
    query="retrieval augmented generation",
    limit=5
)

for result in results:
    print(f"{result.label}: {result.score:.2f}")
```

### Async Client

```python
from sekha import AsyncSekhaClient
import asyncio

async def main():
    async with AsyncSekhaClient(
        base_url="http://localhost:8080",
        api_key="your-key"
    ) as client:
        # Create
        conversation = await client.conversations.create(
            label="Async Conversation",
            messages=[{"role": "user", "content": "Hello"}]
        )
        
        # Search
        results = await client.query("hello")
        print(f"Found {len(results)} results")

asyncio.run(main())
```

---

## API Reference

### Client Initialization

```python
from sekha import SekhaClient

client = SekhaClient(
    base_url="http://localhost:8080",  # Required
    api_key="your-api-key",             # Required
    timeout=30,                         # Request timeout (seconds)
    max_retries=3,                      # Retry failed requests
    verify_ssl=True                     # SSL verification
)
```

**Parameters:**

- `base_url` (str): Sekha Controller URL
- `api_key` (str): REST API key (min 32 characters)
- `timeout` (int): Request timeout in seconds (default: 30)
- `max_retries` (int): Number of retries for failed requests (default: 3)
- `verify_ssl` (bool): Verify SSL certificates (default: True)

---

### Conversations

#### Create Conversation

```python
conversation = client.conversations.create(
    label="API Design Discussion",
    folder="/work/engineering",
    importance_score=8,
    messages=[
        {
            "role": "user",
            "content": "How should we design the REST API?"
        },
        {
            "role": "assistant",
            "content": "Consider RESTful principles..."
        }
    ]
)

print(conversation.id)          # UUID
print(conversation.label)       # "API Design Discussion"
print(conversation.created_at)  # datetime
```

**Returns:** `Conversation` object

**Fields:**
- `id` (UUID): Conversation ID
- `label` (str): Conversation label
- `folder` (str): Folder path
- `status` (str): "active" or "archived"
- `message_count` (int): Number of messages
- `created_at` (datetime): Creation timestamp

---

#### Get Conversation

```python
from uuid import UUID

conversation = client.conversations.get(
    UUID("550e8400-e29b-41d4-a716-446655440000")
)

print(conversation.label)
print(conversation.message_count)
```

---

#### List Conversations

```python
conversations = client.conversations.list(
    folder="/work",
    pinned=True,
    archived=False,
    page=1,
    page_size=50
)

print(f"Total: {conversations.total}")
for conv in conversations.results:
    print(f"{conv.label} - {conv.folder}")
```

**Parameters:**

- `label` (str, optional): Filter by label
- `folder` (str, optional): Filter by folder
- `pinned` (bool, optional): Filter by pinned status
- `archived` (bool, optional): Filter by archived status
- `page` (int): Page number (default: 1)
- `page_size` (int): Results per page (default: 50, max: 100)

**Returns:** `QueryResponse` with:
- `results` (List[SearchResult]): Conversations
- `total` (int): Total count
- `page` (int): Current page
- `page_size` (int): Page size

---

#### Update Label/Folder

```python
# Update label and folder
client.conversations.update_label(
    conversation_id=UUID("..."),
    label="Updated Label",
    folder="/new/folder"
)

# Update folder only
client.conversations.update_folder(
    conversation_id=UUID("..."),
    folder="/work/archived"
)
```

---

#### Pin/Archive

```python
# Pin (sets importance to 10)
client.conversations.pin(UUID("..."))

# Archive
client.conversations.archive(UUID("..."))
```

---

#### Delete Conversation

```python
client.conversations.delete(UUID("..."))
```

---

#### Count Conversations

```python
# Count all
total = client.conversations.count()

# Count by label
count = client.conversations.count(label="API Design")

# Count by folder
count = client.conversations.count(folder="/work/engineering")
```

---

### Search & Query

#### Semantic Query

```python
results = client.query(
    query="How to implement authentication?",
    limit=10,
    filters={
        "folder": "/work/engineering",
        "importance_min": 7,
        "date_from": "2026-01-01T00:00:00Z"
    }
)

for result in results:
    print(f"[{result.score:.2f}] {result.label}")
    print(f"  Folder: {result.folder}")
    print(f"  Content: {result.content[:100]}...")
    print()
```

**Parameters:**

- `query` (str): Search query
- `limit` (int): Max results (default: 10)
- `offset` (int): Pagination offset (default: 0)
- `filters` (dict, optional):
  - `folder` (str): Path filter
  - `label` (str): Label filter
  - `importance_min` (int): Min importance score
  - `importance_max` (int): Max importance score
  - `date_from` (str): ISO 8601 timestamp
  - `date_to` (str): ISO 8601 timestamp

**Returns:** `List[SearchResult]`

**SearchResult fields:**
- `conversation_id` (UUID): Conversation ID
- `message_id` (UUID): Message ID
- `score` (float): Similarity score (0-1)
- `content` (str): Message content
- `label` (str): Conversation label
- `folder` (str): Folder path
- `timestamp` (datetime): Message timestamp
- `metadata` (dict): Additional metadata

---

#### Full-Text Search

```python
results = client.search.fulltext(
    query="authentication oauth jwt",
    limit=20
)

for result in results:
    print(f"{result.content}")
```

---

### Context Assembly

```python
context = client.context.assemble(
    query="Continue our API design discussion",
    preferred_labels=["API Design", "Architecture"],
    context_budget=8000,  # Max tokens
    excluded_folders=["/personal"]
)

# Use in LLM prompt
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    *context,  # Insert assembled context
    {"role": "user", "content": "What should we do next?"}
]
```

**Returns:** `List[Message]` ready for LLM input

---

### Summarization

```python
# Daily summary
summary = client.summarize(
    conversation_id=UUID("..."),
    level="daily"
)

print(summary.summary)
print(summary.generated_at)

# Weekly summary
summary = client.summarize(
    conversation_id=UUID("..."),
    level="weekly"
)

# Monthly summary
summary = client.summarize(
    conversation_id=UUID("..."),
    level="monthly"
)
```

**Levels:** `"daily"`, `"weekly"`, `"monthly"`

---

### Pruning

#### Dry Run

```python
suggestions = client.prune.dry_run(
    threshold_days=90
)

print(f"Found {suggestions.total} candidates for pruning")

for suggestion in suggestions.suggestions:
    print(f"{suggestion.conversation_label}")
    print(f"  Last accessed: {suggestion.last_accessed}")
    print(f"  Importance: {suggestion.importance_score}")
    print(f"  Recommendation: {suggestion.recommendation}")
    print()
```

**Returns:** `PruneResponse` with:
- `suggestions` (List[PruningSuggestion])
- `total` (int): Number of suggestions

---

#### Execute Pruning

```python
# Archive low-priority conversations
to_archive = [
    s.conversation_id 
    for s in suggestions.suggestions
    if s.importance_score <= 3
]

client.prune.execute(to_archive)
```

---

### Label Suggestions

```python
suggestions = client.labels.suggest(
    conversation_id=UUID("...")
)

for suggestion in suggestions:
    print(f"{suggestion.label} ({suggestion.confidence:.0%})")
    print(f"  Reason: {suggestion.reason}")
    print(f"  Existing: {suggestion.is_existing}")
```

---

### Rebuild Embeddings

```python
# Trigger async rebuild
client.embeddings.rebuild()

print("Embedding rebuild started (async)")
```

Use after changing embedding model or fixing corrupted embeddings.

---

### Health & Stats

```python
# Health check
health = client.health()
print(health["status"])  # "healthy" or "unhealthy"
print(health["checks"]["database"])
print(health["checks"]["chroma"])

# Metrics (Prometheus format)
metrics = client.metrics()
print(metrics)  # Raw Prometheus text
```

---

## Error Handling

```python
from sekha.exceptions import (
    SekhaError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ServerError
)

try:
    conversation = client.conversations.get(UUID("..."))
except NotFoundError:
    print("Conversation not found")
except AuthenticationError:
    print("Invalid API key")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after} seconds")
except ServerError as e:
    print(f"Server error: {e.message}")
except SekhaError as e:
    print(f"Unknown error: {e}")
```

**Exception hierarchy:**

```
SekhaError (base)
├── ClientError (4xx)
│   ├── AuthenticationError (401)
│   ├── NotFoundError (404)
│   ├── ValidationError (400)
│   └── RateLimitError (429)
└── ServerError (5xx)
```

---

## Async Client

### Usage

```python
from sekha import AsyncSekhaClient
import asyncio

async def example():
    async with AsyncSekhaClient(
        base_url="http://localhost:8080",
        api_key="your-key"
    ) as client:
        # All methods are async
        conversation = await client.conversations.create(
            label="Async Test",
            messages=[{"role": "user", "content": "Hello"}]
        )
        
        results = await client.query("test")
        
        # Concurrent requests
        tasks = [
            client.conversations.get(id1),
            client.conversations.get(id2),
            client.conversations.get(id3)
        ]
        conversations = await asyncio.gather(*tasks)

asyncio.run(example())
```

### Performance

**Sync vs Async:**

```python
import time

# Sync: Sequential (slow)
start = time.time()
for i in range(10):
    client.query("test")
print(f"Sync: {time.time() - start:.2f}s")  # ~3.0s

# Async: Concurrent (fast)
start = time.time()
tasks = [client.query("test") for i in range(10)]
await asyncio.gather(*tasks)
print(f"Async: {time.time() - start:.2f}s")  # ~0.3s
```

---

## Advanced Usage

### Custom Timeout

```python
# Per-client timeout
client = SekhaClient(
    base_url="http://localhost:8080",
    api_key="key",
    timeout=60  # 60 seconds
)

# Per-request timeout
results = client.query(
    "slow query",
    _timeout=120  # Override for this request
)
```

### Retry Configuration

```python
client = SekhaClient(
    base_url="http://localhost:8080",
    api_key="key",
    max_retries=5,
    retry_backoff=2.0  # Exponential backoff factor
)
```

### Logging

```python
import logging

# Enable SDK logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("sekha")
logger.setLevel(logging.DEBUG)

# SDK will log:
# - Request URLs and headers
# - Response status codes
# - Retry attempts
# - Errors
```

### Streaming Responses

```python
# Future: Stream large exports
for chunk in client.export.stream(conversation_id):
    process(chunk)
```

---

## Examples

### Store Daily Standup

```python
from datetime import datetime

standup = client.conversations.create(
    label=f"Standup {datetime.now().strftime('%Y-%m-%d')}",
    folder="/work/meetings/standup",
    importance_score=5,
    messages=[
        {
            "role": "user",
            "content": """
            Yesterday:
            - Fixed authentication bug
            - Reviewed PR #234
            
            Today:
            - Implement rate limiting
            - Update documentation
            
            Blockers:
            - Waiting on database migration approval
            """
        }
    ]
)
```

### Weekly Review

```python
from datetime import datetime, timedelta

# Get last week's conversations
week_ago = (datetime.now() - timedelta(days=7)).isoformat()

results = client.query(
    query="important decisions and action items",
    filters={
        "date_from": week_ago,
        "importance_min": 7
    }
)

print(f"Found {len(results)} important conversations")
for result in results:
    print(f"- {result.label}")
```

### Backup Conversations

```python
import json

# Export all conversations
conversations = client.conversations.list(page_size=100)

backup = []
for conv in conversations.results:
    full_conv = client.conversations.get(conv.conversation_id)
    backup.append({
        "id": str(full_conv.id),
        "label": full_conv.label,
        "folder": full_conv.folder,
        "created_at": full_conv.created_at.isoformat()
    })

with open("backup.json", "w") as f:
    json.dump(backup, f, indent=2)
```

---

## Development

### Building from Source

```bash
git clone https://github.com/sekha-ai/sekha-python-sdk.git
cd sekha-python-sdk

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install in development mode
pip install -e ".[dev]"
```

### Running Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=sekha --cov-report=html

# Specific test
pytest tests/test_conversations.py::test_create
```

### Type Checking

```bash
mypy sekha/
```

### Linting

```bash
ruff check sekha/
black --check sekha/
```

---

## Next Steps

- **[JavaScript SDK](javascript-sdk.md)** - Node.js and browser client
- **[REST API](../api-reference/rest-api.md)** - Full API reference
- **[Integrations](../integrations/index.md)** - Use with VS Code, Claude, etc.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-python-sdk/issues)
- **Discord:** [Join Community](https://discord.gg/7RUTmdd2)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
