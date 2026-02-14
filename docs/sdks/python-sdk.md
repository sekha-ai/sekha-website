# Python SDK

Official Python client library for Sekha AI Memory System with unified access to Controller, MCP, and Bridge services.

## Overview

The Sekha Python SDK v0.2.0 provides:

- ✅ **Unified Client Interface** - Single client for all services (Controller, MCP, Bridge)
- ✅ **Complete API Coverage** - 19 Controller + 4 Bridge + 2 MCP endpoints
- ✅ **5 Convenience Workflows** - High-level methods for common patterns
- ✅ **Type Safety** - Full type hints with runtime validation
- ✅ **Async/Await Support** - Built on httpx with connection pooling
- ✅ **Streaming Support** - Server-sent events for LLM completions
- ✅ **Automatic Retries** - Exponential backoff with jitter
- ✅ **Rate Limiting** - Built-in token bucket rate limiter
- ✅ **90%+ Test Coverage** - Comprehensive test suite (2,000+ lines)

**Status:** v0.2.0 - Production Ready

---

## Installation

### From PyPI (Coming Soon)

```bash
pip install sekha-python-sdk
```

### From Source

```bash
git clone https://github.com/sekha-ai/sekha-python-sdk.git
cd sekha-python-sdk
pip install -e .
```

### Requirements

- Python 3.9+
- httpx (async HTTP client)
- pydantic (data validation)
- python-dotenv (environment variables)
- aiofiles (async file operations)
- backoff (retry logic)

---

## Quick Start

### Unified Client (Recommended)

```python
from sekha import SekhaClient

# Initialize with all services
client = SekhaClient(
    controller_url="http://localhost:8080",
    api_key="sk-your-api-key-here",
    bridge_url="http://localhost:5001",  # Optional
)

# ===== CONTROLLER: Memory Operations =====
await client.controller.create_conversation({
    "label": "My Conversation",
    "messages": [
        {"role": "user", "content": "Hello Sekha!"},
        {"role": "assistant", "content": "Hello! I'll remember this."}
    ]
})

# ===== BRIDGE: LLM Completions =====
response = await client.bridge.complete(
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    model="gpt-4",
    temperature=0.7
)
print(response["choices"][0]["message"]["content"])

# ===== MCP: Memory Statistics =====
stats = await client.mcp.memory_stats({
    "labels": ["important"],
    "start_date": "2026-01-01T00:00:00Z"
})
print(f"Total conversations: {stats['total_conversations']}")
```

### Convenience Workflows (NEW in v0.2.0)

High-level methods that coordinate multiple services:

```python
# 1. Store conversation and immediately search
results = await client.store_and_query(
    messages=[
        {"role": "user", "content": "Discussed project timeline"},
        {"role": "assistant", "content": "2 week sprint cycle"}
    ],
    query="timeline",
    label="Planning"
)

# 2. Assemble context from memory + generate LLM completion
response = await client.complete_with_context(
    prompt="Continue our architecture discussion",
    context_query="architecture decisions",
    model="gpt-4",
    context_budget=4000
)

# 3. Search memory + use results in LLM prompt
response = await client.complete_with_memory(
    prompt="Summarize our past discussions about:",
    search_query="architecture microservices",
    model="gpt-4",
    limit=5
)

# 4. Stream LLM response with assembled context
async for chunk in await client.stream_with_context(
    prompt="Explain our deployment strategy",
    context_query="deployment docker kubernetes",
    model="gpt-4"
):
    print(chunk["choices"][0]["delta"].get("content", ""), end="")

# 5. Health check all services concurrently
health = await client.health_check()
print(f"Controller: {health['controller']['status']}")
print(f"Bridge: {health['bridge']['status']}")
```

### Async Context Manager

```python
from sekha import SekhaClient

async with SekhaClient(
    controller_url="http://localhost:8080",
    api_key="sk-your-api-key",
    bridge_url="http://localhost:5001"
) as client:
    # All clients automatically close on exit
    await client.controller.create_conversation({...})
    await client.bridge.complete(messages=[...])
    await client.mcp.memory_stats({})
```

---

## API Reference

### Client Initialization

#### SekhaClient (Unified)

```python
from sekha import SekhaClient, SekhaConfig

# Option 1: Direct initialization
client = SekhaClient(
    controller_url="http://localhost:8080",
    api_key="sk-your-api-key",
    bridge_url="http://localhost:5001",
    bridge_api_key="bridge-key",  # Optional
    timeout=30.0,
    max_retries=3
)

# Option 2: Config object
config = SekhaConfig(
    controller_url="http://localhost:8080",
    api_key="sk-your-api-key",
    bridge_url="http://localhost:5001",
    timeout=30.0
)
client = SekhaClient(config)

# Option 3: Factory function
from sekha import create_sekha_client

client = create_sekha_client(
    controller_url="http://localhost:8080",
    api_key="sk-your-api-key",
    bridge_url="http://localhost:5001"
)
```

#### MemoryController (Controller Only)

```python
from sekha import MemoryController

client = MemoryController(
    base_url="http://localhost:8080",
    api_key="sk-your-api-key-here",
    timeout=30.0,
    max_retries=3
)
```

---

### Controller API (Memory Operations)

#### Create Conversation

```python
conversation = await client.controller.create_conversation({
    "label": "API Design Discussion",
    "folder": "/work/engineering",
    "importance_score": 8,
    "messages": [
        {
            "role": "user",
            "content": "How should we design the REST API?"
        },
        {
            "role": "assistant",
            "content": "Consider RESTful principles..."
        }
    ]
})

print(conversation["id"])          # UUID
print(conversation["label"])       # "API Design Discussion"
print(conversation["created_at"])  # ISO timestamp
```

#### Query (Semantic Search)

```python
results = await client.controller.query(
    query="How to implement authentication?",
    limit=10
)

for result in results["results"]:
    print(f"[{result['score']:.2f}] {result['label']}")
    print(f"  Content: {result['content'][:100]}...")
```

#### Assemble Context

```python
context = await client.controller.assemble_context(
    query="Continue our API design discussion",
    context_budget=8000,  # Max tokens
    preferred_labels=["API Design", "Architecture"]
)

# Use in LLM prompt
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    *context,  # Insert assembled context
    {"role": "user", "content": "What should we do next?"}
]
```

#### List Conversations

```python
conversations = await client.controller.list_conversations(
    folder="/work",
    pinned=True,
    page=1,
    page_size=50
)

print(f"Total: {conversations['total']}")
for conv in conversations['results']:
    print(f"{conv['label']} - {conv['folder']}")
```

#### Get Conversation

```python
conversation = await client.controller.get_conversation(
    "550e8400-e29b-41d4-a716-446655440000"
)

print(conversation["label"])
print(conversation["message_count"])
```

#### Update Label/Folder

```python
# Update label and folder
await client.controller.update_label(
    conversation_id="...",
    label="Updated Label",
    folder="/new/folder"
)

# Update folder only
await client.controller.update_folder(
    conversation_id="...",
    folder="/work/archived"
)
```

#### Pin/Archive/Delete

```python
# Pin (sets importance to 10)
await client.controller.pin_conversation("...")

# Archive
await client.controller.archive_conversation("...")

# Delete
await client.controller.delete_conversation("...")
```

#### Summarize

```python
# Daily summary
summary = await client.controller.summarize(
    conversation_id="...",
    level="daily"
)

print(summary["summary"])
print(summary["generated_at"])
```

#### Prune (Dry Run and Execute)

```python
# Get pruning suggestions
suggestions = await client.controller.prune_dry_run(
    threshold_days=90
)

print(f"Found {len(suggestions['suggestions'])} candidates")

# Execute pruning
to_archive = [
    s["conversation_id"]
    for s in suggestions["suggestions"]
    if s["importance_score"] <= 3
]

await client.controller.prune_execute(to_archive)
```

#### Suggest Labels

```python
suggestions = await client.controller.suggest_labels(
    conversation_id="..."
)

for suggestion in suggestions:
    print(f"{suggestion['label']} ({suggestion['confidence']:.0%})")
    print(f"  Reason: {suggestion['reason']}")
```

---

### Bridge API (LLM Integration)

#### Complete (Chat Completion)

```python
response = await client.bridge.complete(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing"}
    ],
    model="gpt-4",
    temperature=0.7,
    max_tokens=1000
)

print(response["choices"][0]["message"]["content"])
print(f"Tokens used: {response['usage']['total_tokens']}")
```

#### Stream Complete (Streaming)

```python
# Get async generator
stream = await client.bridge.stream_complete(
    messages=[
        {"role": "user", "content": "Tell me a story"}
    ],
    model="gpt-4"
)

# Iterate over chunks
async for chunk in stream:
    if "choices" in chunk:
        delta = chunk["choices"][0].get("delta", {})
        content = delta.get("content", "")
        if content:
            print(content, end="", flush=True)
```

#### Embed (Text Embeddings)

```python
response = await client.bridge.embed(
    input="Semantic search query text",
    model="text-embedding-ada-002"
)

embedding = response["data"][0]["embedding"]
print(f"Embedding dimension: {len(embedding)}")
```

#### Health Check

```python
health = await client.bridge.health()
print(health["status"])  # "healthy" or "unhealthy"
print(health["checks"])
```

---

### MCP API (Model Context Protocol)

#### Memory Stats

```python
# All conversations
stats = await client.mcp.memory_stats({})

# Filtered by labels
stats = await client.mcp.memory_stats({
    "labels": ["important", "work"],
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-12-31T23:59:59Z"
})

print(f"Total: {stats['total_conversations']}")
print(f"Total messages: {stats['total_messages']}")
print(f"Labels: {stats['labels']}")
```

#### Memory Search

```python
results = await client.mcp.memory_search({
    "query": "project architecture decisions",
    "limit": 10,
    "labels": ["technical"],
    "min_importance": 7
})

for result in results["results"]:
    print(f"{result['label']} (score: {result['score']:.2f})")
    print(f"  {result['content'][:100]}...")
```

---

### Unified Workflows

#### 1. Store and Query

Store conversation and immediately search:

```python
results = await client.store_and_query(
    messages=[
        {"role": "user", "content": "Discussed project timeline"},
        {"role": "assistant", "content": "2 week sprint cycle"}
    ],
    query="timeline sprint",
    label="Planning Meeting",
    folder="/work/meetings"
)

print(f"Stored conversation and found {len(results)} related items")
```

#### 2. Complete with Context

Assemble context from memory + generate LLM completion:

```python
response = await client.complete_with_context(
    prompt="Continue our architecture discussion",
    context_query="architecture microservices decisions",
    model="gpt-4",
    context_budget=4000,
    temperature=0.7
)

print(response["choices"][0]["message"]["content"])
```

#### 3. Complete with Memory

Search memory + use results directly in LLM prompt:

```python
response = await client.complete_with_memory(
    prompt="Summarize our past discussions about:",
    search_query="deployment strategies docker kubernetes",
    model="gpt-4",
    limit=5
)

print(response["choices"][0]["message"]["content"])
```

#### 4. Stream with Context

Stream LLM response with assembled context:

```python
async for chunk in await client.stream_with_context(
    prompt="Explain our deployment strategy in detail",
    context_query="deployment infrastructure",
    model="gpt-4",
    context_budget=3000
):
    if "choices" in chunk:
        content = chunk["choices"][0].get("delta", {}).get("content", "")
        if content:
            print(content, end="", flush=True)
```

#### 5. Health Check

Check health of all services concurrently:

```python
health = await client.health_check()

for service, status in health.items():
    print(f"{service.capitalize()}: {status['status']}")
    if status.get("error"):
        print(f"  Error: {status['error']}")
```

---

## Error Handling

```python
from sekha import (
    SekhaError,              # Base error
    SekhaAPIError,           # API errors (4xx, 5xx)
    SekhaAuthError,          # Authentication failures (401)
    SekhaConnectionError,    # Connection/timeout errors
    SekhaNotFoundError,      # Resource not found (404)
    SekhaValidationError,    # Invalid input (400)
)

try:
    conversation = await client.controller.get_conversation("...")
except SekhaNotFoundError:
    print("Conversation not found")
except SekhaAuthError:
    print("Invalid API key")
except SekhaConnectionError:
    print("Controller unreachable")
except SekhaAPIError as e:
    print(f"API error: {e.message} (status: {e.status_code})")
except SekhaError as e:
    print(f"Unexpected error: {e}")
```

**Exception Hierarchy:**

```
SekhaError (base)
├── SekhaAPIError (4xx, 5xx)
│   ├── SekhaAuthError (401)
│   ├── SekhaNotFoundError (404)
│   └── SekhaValidationError (400)
└── SekhaConnectionError (timeout, network)
```

---

## Configuration

### Environment Variables

```bash
# .env file
SEKHA_CONTROLLER_URL=http://localhost:8080
SEKHA_API_KEY=sk-your-api-key-here
SEKHA_BRIDGE_URL=http://localhost:5001
SEKHA_TIMEOUT=30.0
SEKHA_MAX_RETRIES=3
```

```python
from sekha import SekhaClient
import os

client = SekhaClient(
    controller_url=os.getenv("SEKHA_CONTROLLER_URL"),
    api_key=os.getenv("SEKHA_API_KEY"),
    bridge_url=os.getenv("SEKHA_BRIDGE_URL"),
    timeout=float(os.getenv("SEKHA_TIMEOUT", "30.0")),
    max_retries=int(os.getenv("SEKHA_MAX_RETRIES", "3"))
)
```

### Rate Limiting

```python
from sekha.types import ClientConfig

config = ClientConfig(
    base_url="http://localhost:8080",
    api_key="sk-your-api-key",
    rate_limit_requests=1000,  # Max requests per window
    rate_limit_window=60.0     # Window in seconds
)
```

### Retry Configuration

```python
client = SekhaClient(
    controller_url="http://localhost:8080",
    api_key="sk-your-api-key",
    max_retries=5,        # Retry up to 5 times
    timeout=60.0          # 60 second timeout
)
```

---

## Type Safety

### Type Hints

```python
from sekha.types import (
    # Core Models
    Message,
    MessageContent,
    ContentPart,
    Conversation,
    ConversationStatus,
    MessageRole,
    
    # Request Types
    CreateConversationRequest,
    QueryRequest,
    ContextAssembleRequest,
    PruneRequest,
    
    # Response Types
    QueryResponse,
    SearchResult,
    PruneResponse,
    SummaryResponse,
    LabelSuggestion,
    
    # Enums
    SummaryLevel,
    PruneRecommendation,
)
```

### Type Guards

```python
from sekha.type_guards import (
    is_string_content,
    is_multi_modal_content,
    is_valid_role,
    extract_text,
    extract_image_urls,
    has_images,
    has_text,
)

# Runtime validation
if is_valid_role("user"):
    message = {"role": "user", "content": "Hello"}

# Extract text from content
text = extract_text(message["content"])

# Check for images
if has_images(message["content"]):
    urls = extract_image_urls(message["content"])
```

---

## Examples

### Store Daily Standup

```python
from datetime import datetime

standup = await client.controller.create_conversation({
    "label": f"Standup {datetime.now().strftime('%Y-%m-%d')}",
    "folder": "/work/meetings/standup",
    "importance_score": 5,
    "messages": [
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
})
```

### AI-Powered Code Review

```python
# Search for past code review discussions
response = await client.complete_with_memory(
    prompt="Review this code for security issues:",
    search_query="security code review best practices",
    model="gpt-4",
    limit=5
)

print(response["choices"][0]["message"]["content"])
```

### Weekly Review

```python
from datetime import datetime, timedelta

week_ago = (datetime.now() - timedelta(days=7)).isoformat()

results = await client.controller.query(
    query="important decisions and action items"
)

# Filter last week's results
recent = [
    r for r in results["results"]
    if r["timestamp"] >= week_ago
]

print(f"Found {len(recent)} important conversations this week")
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

# Specific test file
pytest tests/test_unified_workflows.py
```

### Type Checking

```bash
mypy sekha/
```

### Linting and Formatting

```bash
# Check formatting
black --check sekha/
ruff check sekha/

# Auto-format
black sekha/
ruff check --fix sekha/
```

---

## Migration from v0.1.x

### Breaking Changes

**v0.1.x (Old):**
```python
# Bridge and MCP were stubs
client = SekhaClient(...)
await client.bridge.complete(...)  # NotImplementedError
await client.mcp.memory_stats({})  # NotImplementedError
```

**v0.2.0 (New):**
```python
# All clients fully implemented
client = SekhaClient(...)
await client.bridge.complete(...)  # ✅ Works!
await client.mcp.memory_stats({})  # ✅ Works!

# New: Convenience workflows
await client.complete_with_memory(...)  # ✅ New!
await client.health_check()            # ✅ New!
```

---

## Next Steps

- **[JavaScript SDK](javascript-sdk.md)** - Node.js and browser client
- **[REST API Reference](../api-reference/rest-api.md)** - Complete API docs
- **[MCP Tools](../api-reference/mcp-tools.md)** - Model Context Protocol
- **[Integrations](../integrations/index.md)** - VS Code, Claude Desktop
- **[Deployment](../deployment/index.md)** - Production deployment guide

---

## Resources

- **GitHub:** [sekha-ai/sekha-python-sdk](https://github.com/sekha-ai/sekha-python-sdk)
- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-python-sdk/issues)
- **Changelog:** [CHANGELOG.md](https://github.com/sekha-ai/sekha-python-sdk/blob/main/CHANGELOG.md)
- **PyPI:** Coming soon
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
