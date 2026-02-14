# JavaScript/TypeScript SDK

Official JavaScript and TypeScript client library for Sekha Memory System.

## Overview

The Sekha JavaScript SDK provides unified access to REST, MCP, and LLM Bridge APIs:

- ✅ **4 Client Interfaces** - Controller, MCP, Bridge, Unified
- ✅ **Full REST API** - 19 endpoints with complete coverage  
- ✅ **MCP Protocol** - 7 Model Context Protocol tools
- ✅ **LLM Bridge** - Direct completions, embeddings, streaming
- ✅ **TypeScript** - 50+ interfaces with complete type safety
- ✅ **Multi-Modal** - Text + image message support
- ✅ **Streaming** - Server-Sent Events for LLM completions
- ✅ **Node.js & Browser** - Works in both environments
- ✅ **Tree-shakeable** - ESM with selective imports
- ✅ **Zero Dependencies** - Lightweight with no external deps

**Status:** v0.2.0 - Production Ready

---

## Installation

### npm (coming soon)

```bash
npm install @sekha/sdk
```

### From Source (current)

```bash
git clone https://github.com/sekha-ai/sekha-js-sdk.git
cd sekha-js-sdk
npm install
npm run build
```

---

## Quick Start

### Unified Client (Recommended)

```typescript
import { SekhaClient } from '@sekha/sdk';

// Initialize with all services
const sekha = new SekhaClient({
  controllerURL: 'http://localhost:8080',
  bridgeURL: 'http://localhost:5001',
  apiKey: 'sk-your-api-key'
});

// One-line workflows
const response = await sekha.completeWithMemory(
  'Explain our TypeScript architecture',
  'TypeScript discussion'
);

console.log(response.choices[0].message.content);
```

### Individual Clients

```typescript
import { MemoryController, MCPClient, BridgeClient } from '@sekha/sdk';

// REST API client
const controller = new MemoryController({
  baseURL: 'http://localhost:8080',
  apiKey: 'sk-your-api-key'
});

// MCP protocol client
const mcp = new MCPClient({
  baseURL: 'http://localhost:8080',
  mcpApiKey: 'sk-your-mcp-key'
});

// LLM Bridge client
const bridge = new BridgeClient({
  baseURL: 'http://localhost:5001'
});

// Use individually
const conversations = await controller.list();
const stats = await mcp.memoryStats({ folder: '/work' });
const completion = await bridge.complete({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## Core Concepts

### 1. MemoryController - REST API

Direct HTTP access to Sekha Controller for conversation management (19 endpoints).

```typescript
import { MemoryController } from '@sekha/sdk';

const controller = new MemoryController({
  baseURL: 'http://localhost:8080',
  apiKey: 'sk-your-api-key'
});

// Store conversation
const conversation = await controller.create({
  label: 'Engineering Discussion',
  folder: '/work/engineering',
  messages: [
    { role: 'user', content: 'How should we structure our API?' },
    { role: 'assistant', content: 'Let me suggest a REST-first approach...' }
  ]
});

// Semantic search
const results = await controller.query('API architecture discussion');
console.log(`Found ${results.total} results`);

// Full-text search
const ftsResults = await controller.searchFTS('TypeScript');

// Assemble context for LLM
const context = await controller.assembleContext({
  query: 'Continue the API discussion',
  context_budget: 4000,
  preferred_labels: ['Engineering']
});
```

**All Methods:**
- **CRUD**: `create()`, `list()`, `get()`, `update()`, `delete()`
- **Search**: `query()`, `searchFTS()`, `count()`
- **Context**: `assembleContext()`
- **Management**: `pin()`, `archive()`, `updateLabel()`, `updateFolder()`
- **AI Features**: `suggestLabel()`, `summarize()`
- **Maintenance**: `getPruningSuggestions()`, `pruneExecute()`, `rebuildEmbeddings()`
- **Export**: `export()`
- **System**: `health()`, `getMetrics()`

---

### 2. MCPClient - Model Context Protocol

MCP protocol for standardized AI memory operations (7 tools).

```typescript
import { MCPClient } from '@sekha/sdk';

const mcp = new MCPClient({
  baseURL: 'http://localhost:8080',
  mcpApiKey: 'sk-your-mcp-key'
});

// Store via MCP
const result = await mcp.memoryStore({
  label: 'Meeting Notes',
  folder: '/meetings',
  messages: [/* ... */]
});

// Search via MCP
const searchResult = await mcp.memorySearch({
  query: 'quarterly planning',
  limit: 10
});

// Get statistics
const stats = await mcp.memoryStats({
  folder: '/work',
  label: 'Engineering'
});

console.log(`Total: ${stats.total_conversations}`);
console.log(`Messages: ${stats.total_messages}`);
```

**All Tools:**
- `memoryStore()` - Store conversations
- `memorySearch()` - Semantic search
- `memoryGetContext()` - Retrieve context
- `memoryUpdate()` - Update conversations
- `memoryPrune()` - Get pruning suggestions
- `memoryExport()` - Export data
- `memoryStats()` - Get statistics

---

### 3. BridgeClient - LLM Operations

Direct access to Sekha LLM Bridge for completions and embeddings (7 methods).

```typescript
import { BridgeClient } from '@sekha/sdk';

const bridge = new BridgeClient({
  baseURL: 'http://localhost:5001'
});

// Chat completion
const completion = await bridge.complete({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain TypeScript generics' }
  ],
  temperature: 0.7
});

console.log(completion.choices[0].message.content);

// Streaming completion
for await (const chunk of bridge.streamComplete({ messages })) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}

// Generate embeddings
const embedding = await bridge.embed({
  text: 'This text will be embedded',
  model: 'text-embedding-3-small'
});

// Generate summary
const summary = await bridge.summarize({
  text: 'Long text to summarize...',
  level: 'brief'
});
```

**All Methods:**
- `complete()` - Chat completions (OpenAI-compatible)
- `streamComplete()` - Streaming completions with SSE
- `embed()` - Generate embeddings
- `summarize()` - Hierarchical text summaries
- `extract()` - Entity extraction
- `score()` - Importance scoring
- `health()` - Health check with provider status

---

### 4. SekhaClient - Unified Interface

Combines all three clients with high-level convenience methods (6 workflows).

```typescript
import { SekhaClient } from '@sekha/sdk';

const sekha = new SekhaClient({
  controllerURL: 'http://localhost:8080',
  bridgeURL: 'http://localhost:5001',
  apiKey: 'sk-your-api-key'
});

// Access any client directly
await sekha.controller.list();
await sekha.mcp.memoryStats({});
await sekha.bridge.complete({ messages });

// High-level workflows:

// 1. Store conversation then search
const { conversation, results } = await sekha.storeAndQuery(
  messages,
  'search query',
  { label: 'Engineering', folder: '/work' }
);

// 2. LLM completion with assembled context
const response = await sekha.completeWithContext(
  'What were the main takeaways from our meeting?',
  'meeting notes',
  {
    context_budget: 4000,
    preferred_labels: ['Meetings'],
    temperature: 0.7
  }
);

// 3. LLM completion with search results
const response2 = await sekha.completeWithMemory(
  'Summarize our TypeScript discussions',
  'TypeScript architecture',
  { limit: 5 }
);

// 4. Generate custom embedding and store
const stored = await sekha.embedAndStore(
  messages,
  {
    label: 'Custom Embedded',
    folder: '/custom',
    model: 'text-embedding-3-large'
  }
);

// 5. Streaming with context
for await (const chunk of sekha.streamWithContext(
  'Continue our discussion',
  'previous conversation'
)) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

// 6. Check all services
const health = await sekha.healthCheck();
console.log(`Controller: ${health.controller.status}`);
console.log(`Bridge: ${health.bridge.status}`);
```

---

## Advanced Features

### Multi-Modal Messages (Text + Images)

```typescript
import { Message } from '@sekha/sdk';

// Vision message with image
const visionMessage: Message = {
  role: 'user',
  content: [
    { type: 'text', text: 'What is in this image?' },
    { 
      type: 'image_url',
      image_url: {
        url: 'https://example.com/chart.png',
        detail: 'high'  // 'low' | 'high' | 'auto'
      }
    }
  ]
};

// Store vision conversation
await controller.create({
  label: 'Chart Analysis',
  folder: '/vision',
  messages: [visionMessage]
});

// Use with bridge
const analysis = await bridge.complete({
  messages: [visionMessage]
});
```

### Type Guards & Utilities

```typescript
import {
  isMultiModalContent,
  extractText,
  extractImageUrls,
  hasImages,
  isValidStatus
} from '@sekha/sdk';

const message: Message = { /* ... */ };

// Check content type
if (isMultiModalContent(message.content)) {
  const text = extractText(message.content);
  const images = extractImageUrls(message.content);
  console.log(`Text: ${text}`);
  console.log(`Images: ${images.length}`);
}

// Check if message has images
if (hasImages(message)) {
  console.log('Message contains images');
}

// Validate conversation status
if (isValidStatus(conversation.status)) {
  // TypeScript knows: status is 'active' | 'archived' | 'pinned'
}
```

### Streaming with Server-Sent Events

```typescript
// Stream to console
for await (const chunk of bridge.streamComplete({
  messages: [{ role: 'user', content: 'Write a story' }],
  stream: true
})) {
  const delta = chunk.choices[0]?.delta;
  if (delta?.content) {
    process.stdout.write(delta.content);
  }
}

// Collect full response
let fullResponse = '';
for await (const chunk of bridge.streamComplete({ messages })) {
  const content = chunk.choices[0]?.delta?.content || '';
  fullResponse += content;
}
console.log('\nComplete response:', fullResponse);
```

---

## Complete API Reference

### MemoryController (REST API - 19 Endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `create()` | POST `/api/v1/conversations` | Store conversation |
| `list()` | GET `/api/v1/conversations` | List conversations (paginated) |
| `get()` | GET `/api/v1/conversations/:id` | Get single conversation |
| `update()` | PUT `/api/v1/conversations/:id` | Update conversation |
| `delete()` | DELETE `/api/v1/conversations/:id` | Delete conversation |
| `query()` | POST `/api/v1/query` | Semantic search |
| `searchFTS()` | POST `/api/v1/search/fts` | Full-text search |
| `count()` | GET `/api/v1/conversations/count` | Count conversations |
| `assembleContext()` | POST `/api/v1/context/assemble` | Assemble LLM context |
| `pin()` | PUT `/api/v1/conversations/:id/pin` | Pin conversation |
| `archive()` | PUT `/api/v1/conversations/:id/archive` | Archive conversation |
| `updateLabel()` | PUT `/api/v1/conversations/:id/label` | Update label |
| `updateFolder()` | PUT `/api/v1/conversations/:id/folder` | Update folder |
| `suggestLabel()` | POST `/api/v1/labels/suggest` | AI label suggestions |
| `summarize()` | POST `/api/v1/summarize` | Generate summary |
| `getPruningSuggestions()` | POST `/api/v1/prune/dry-run` | Get prune suggestions |
| `pruneExecute()` | POST `/api/v1/prune/execute` | Execute pruning |
| `rebuildEmbeddings()` | POST `/api/v1/rebuild-embeddings` | Rebuild embeddings |
| `export()` | POST `/api/v1/export` | Export conversations |
| `health()` | GET `/health` | Health check |
| `getMetrics()` | GET `/metrics` | System metrics |

### MCPClient (MCP Protocol - 7 Tools)

| Tool | Description |
|------|-------------|
| `memoryStore()` | Store conversation via MCP |
| `memorySearch()` | Semantic search via MCP |
| `memoryGetContext()` | Get conversation context |
| `memoryUpdate()` | Update conversation fields |
| `memoryPrune()` | Get pruning suggestions |
| `memoryExport()` | Export conversations |
| `memoryStats()` | Get statistics by folder/label |

### BridgeClient (LLM Bridge - 7 Methods)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `complete()` | POST `/v1/chat/completions` | Chat completions |
| `streamComplete()` | POST `/v1/chat/completions` | Streaming completions |
| `embed()` | POST `/api/v1/embed` | Generate embeddings |
| `summarize()` | POST `/api/v1/summarize` | Text summarization |
| `extract()` | POST `/api/v1/extract` | Entity extraction |
| `score()` | POST `/api/v1/score` | Importance scoring |
| `health()` | GET `/health` | Health check |

### SekhaClient (Unified - 6 Workflows)

| Method | Description |
|--------|-------------|
| `storeAndQuery()` | Store conversation then search |
| `completeWithContext()` | LLM completion with assembled context |
| `completeWithMemory()` | LLM completion with search results |
| `embedAndStore()` | Generate embedding then store |
| `streamWithContext()` | Streaming completion with context |
| `healthCheck()` | Check all services simultaneously |

---

## Error Handling

```typescript
import { SekhaError } from '@sekha/sdk';

try {
  const results = await controller.query('search');
} catch (error) {
  if (error instanceof SekhaError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
    console.error(`Details:`, error.details);
  }
}
```

---

## TypeScript Support

### Full Type Definitions (50+ interfaces)

```typescript
import type {
  MemoryController,
  MCPClient,
  BridgeClient,
  SekhaClient,
  Conversation,
  Message,
  MessageContent,
  ContentPart,
  SearchResult,
  QueryResponse,
  PruningSuggestion
} from '@sekha/sdk';

// All types are exported and fully documented
const query: QueryRequest = {
  query: 'test',
  limit: 10,
  filters: {
    folder: '/work',
    importanceMin: 7
  }
};
```

---

## Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Sekha SDK Browser Example</title>
</head>
<body>
  <script type="module">
    // Use from CDN (when published)
    import { SekhaClient } from 'https://unpkg.com/@sekha/sdk';
    
    const sekha = new SekhaClient({
      controllerURL: 'http://localhost:8080',
      apiKey: 'sk-your-api-key'
    });
    
    const response = await sekha.controller.query('search query');
    console.log('Results:', response);
  </script>
</body>
</html>
```

---

## Migration from v0.1.0

### Breaking Changes

**Response Types:**
```typescript
// BEFORE (v0.1.0)
const conversations = await controller.list();

// AFTER (v0.2.0)
const response = await controller.list();
const conversations = response.results;
console.log(`Total: ${response.total}`);
```

**Type Definitions:**
```typescript
// BEFORE
interface Conversation {
  folder?: string;  // Optional
  messageCount?: number;  // camelCase
}

// AFTER
interface Conversation {
  folder: string;  // Required!
  message_count: number;  // snake_case
}
```

**New Features:**
- Use `BridgeClient` for LLM operations
- Use `MCPClient` for MCP protocol
- Use `SekhaClient` for unified workflows
- Multi-modal messages (text + images)
- Streaming completions
- Type guards and utilities

---

## Examples

### React Integration

```typescript
import { useState } from 'react';
import { SekhaClient } from '@sekha/sdk';

const sekha = new SekhaClient({
  controllerURL: 'http://localhost:8080',
  apiKey: process.env.REACT_APP_SEKHA_KEY!
});

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const response = await sekha.controller.query(query);
    setResults(response.results);
  };

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      
      <ul>
        {results.map(result => (
          <li key={result.conversation_id}>
            <strong>{result.label}</strong> ({result.score.toFixed(2)})
            <p>{result.content.substring(0, 200)}...</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Development

### Building from Source

```bash
git clone https://github.com/sekha-ai/sekha-js-sdk.git
cd sekha-js-sdk

# Install dependencies
npm install

# Build (ESM + CJS)
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

---

## Next Steps

- **[Python SDK](python-sdk.md)** - Python client library
- **[REST API](../api-reference/rest-api.md)** - Full API reference
- **[MCP Protocol](../api-reference/mcp.md)** - MCP documentation
- **[Examples](../examples/)** - More code examples

---

## Support

- **Repository:** [sekha-js-sdk](https://github.com/sekha-ai/sekha-js-sdk)
- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-js-sdk/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
