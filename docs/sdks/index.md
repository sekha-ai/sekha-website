# SDKs

Official client libraries for Sekha.

## Available SDKs

### Python SDK

Official Python client with full API coverage:

[**Python SDK Documentation →**](python-sdk.md)

**Features:**
- ✅ Full REST API coverage
- ✅ Type hints & autocompletion
- ✅ Async/await support
- ✅ Pydantic models
- ✅ 100% test coverage

**Installation:**
```bash
pip install sekha-sdk  # Coming soon to PyPI
```

### JavaScript/TypeScript SDK

Official Node.js and browser client:

[**JavaScript SDK Documentation →**](javascript-sdk.md)

**Features:**
- ✅ Full TypeScript support
- ✅ Promise-based API
- ✅ Browser and Node.js compatible
- ✅ Auto-generated types
- ✅ ESM and CommonJS

**Installation:**
```bash
npm install @sekha/sdk  # Coming soon to npm
```

## Quick Examples

### Python

```python
from sekha import SekhaClient

client = SekhaClient(
    base_url="http://localhost:8080",
    api_key="your-api-key"
)

# Store conversation
convo = client.conversations.create(
    label="My Conversation",
    messages=[
        {"role": "user", "content": "Hello!"},
        {"role": "assistant", "content": "Hi there!"}
    ]
)

# Semantic search
results = client.query(
    query="What did we discuss?",
    limit=5
)

# Get context for LLM
context = client.context.assemble(
    query="Continue our chat",
    context_budget=8000
)
```

### JavaScript/TypeScript

```typescript
import { SekhaClient } from '@sekha/sdk';

const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: 'your-api-key'
});

// Store conversation
const convo = await client.conversations.create({
  label: 'My Conversation',
  messages: [
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi there!' }
  ]
});

// Semantic search
const results = await client.query({
  query: 'What did we discuss?',
  limit: 5
});

// Get context for LLM
const context = await client.context.assemble({
  query: 'Continue our chat',
  contextBudget: 8000
});
```

## Coming Soon

### Go SDK

**Status:** 🚧 Planned for Q2 2026

```go
import "github.com/sekha-ai/sekha-go"

client := sekha.NewClient("http://localhost:8080", "api-key")
```

### Rust SDK

**Status:** 🚧 Planned for Q2 2026

```rust
use sekha::Client;

let client = Client::new("http://localhost:8080", "api-key");
```

## SDK Code Examples

Comprehensive examples for common use cases:

### Storing Conversations

```python
# Python example
client.conversations.create(
    label="Project Meeting",
    messages=[
        {"role": "user", "content": "Let's discuss the roadmap"},
        {"role": "assistant", "content": "Sure! What aspects?"}  
    ],
    folder="work/project-a",
    importance=8
)
```

### Semantic Search

```typescript
// TypeScript example
const results = await client.query({
  query: "architecture decisions",
  folder: "work",
  limit: 10,
  threshold: 0.7
});

for (const result of results.results) {
  console.log(`${result.relevance_score}: ${result.message}`);
}
```

### Context Assembly

```python
# Get optimal context for next LLM call
context = client.context.assemble(
    query="Continue discussing the payment system",
    context_budget=8000,
    include_summaries=True
)

# Use with OpenAI
import openai
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": context.context},
        {"role": "user", "content": "What were our next steps?"}
    ]
)
```

## SDK Development

Contribute to SDK development:

- [Python SDK Repository](https://github.com/sekha-ai/sekha-python-sdk)
- [JavaScript SDK Repository](https://github.com/sekha-ai/sekha-js-sdk)

## Next Steps

- [Python SDK](python-sdk.md) - Full Python documentation
- [JavaScript SDK](javascript-sdk.md) - Full JS/TS documentation
- [API Reference](../api-reference/rest-api.md) - REST API docs
- [Guides](../guides/) - Use case examples
