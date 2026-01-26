# JavaScript/TypeScript SDK

Official JavaScript and TypeScript client library for Sekha Controller.

## Overview

The Sekha JavaScript SDK provides:

- ✅ **Full REST API coverage** - All 19 endpoints
- ✅ **TypeScript support** - Complete type definitions
- ✅ **Node.js & Browser** - Works in both environments
- ✅ **Promise-based** - Modern async/await API
- ✅ **Automatic retries** - Exponential backoff
- ✅ **Error handling** - Rich error types
- ✅ **Tree-shakeable** - Import only what you need

**Status:** Beta - Ready for testing

---

## Installation

### npm

```bash
npm install @sekha/sdk
```

### yarn

```bash
yarn add @sekha/sdk
```

### pnpm

```bash
pnpm add @sekha/sdk
```

### From Source

```bash
git clone https://github.com/sekha-ai/sekha-js-sdk.git
cd sekha-js-sdk
npm install
npm run build
```

---

## Quick Start

### Node.js

```typescript
import { SekhaClient } from '@sekha/sdk';

// Initialize
const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: 'your-rest-api-key-here'
});

// Create conversation
const conversation = await client.conversations.create({
  label: 'My First Conversation',
  folder: '/work/projects',
  messages: [
    { role: 'user', content: 'What is RAG?' },
    { role: 'assistant', content: 'RAG stands for...' }
  ]
});

console.log(`Created: ${conversation.id}`);

// Search semantically
const results = await client.query({
  query: 'retrieval augmented generation',
  limit: 5
});

results.forEach(result => {
  console.log(`${result.label}: ${result.score.toFixed(2)}`);
});
```

### Browser

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { SekhaClient } from 'https://esm.sh/@sekha/sdk';
    
    const client = new SekhaClient({
      baseUrl: 'http://localhost:8080',
      apiKey: 'your-key'
    });
    
    const results = await client.query({ query: 'test' });
    console.log(results);
  </script>
</head>
</html>
```

### CommonJS

```javascript
const { SekhaClient } = require('@sekha/sdk');

const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: 'your-key'
});

// All methods return Promises
client.query({ query: 'test' })
  .then(results => console.log(results))
  .catch(err => console.error(err));
```

---

## API Reference

### Client Initialization

```typescript
import { SekhaClient } from '@sekha/sdk';

const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',  // Required
  apiKey: 'your-api-key',             // Required
  timeout: 30000,                     // Request timeout (ms)
  maxRetries: 3,                      // Retry failed requests
  retryDelay: 1000,                   // Initial retry delay (ms)
  headers: {}                         // Additional headers
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | string | **required** | Sekha Controller URL |
| `apiKey` | string | **required** | REST API key (min 32 chars) |
| `timeout` | number | `30000` | Request timeout in milliseconds |
| `maxRetries` | number | `3` | Number of retries for failed requests |
| `retryDelay` | number | `1000` | Initial retry delay (exponential backoff) |
| `headers` | object | `{}` | Additional HTTP headers |

---

### Conversations

#### Create Conversation

```typescript
const conversation = await client.conversations.create({
  label: 'API Design Discussion',
  folder: '/work/engineering',
  importanceScore: 8,
  messages: [
    {
      role: 'user',
      content: 'How should we design the REST API?'
    },
    {
      role: 'assistant',
      content: 'Consider RESTful principles...'
    }
  ]
});

console.log(conversation.id);          // UUID
console.log(conversation.label);       // "API Design Discussion"
console.log(conversation.createdAt);   // Date object
```

**Type:**

```typescript
interface CreateConversationRequest {
  label: string;
  folder?: string;
  importanceScore?: number;  // 1-10
  messages: Message[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

interface Conversation {
  id: string;              // UUID
  label: string;
  folder: string;
  status: 'active' | 'archived';
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### Get Conversation

```typescript
const conversation = await client.conversations.get(
  '550e8400-e29b-41d4-a716-446655440000'
);

console.log(conversation.label);
console.log(conversation.messageCount);
```

---

#### List Conversations

```typescript
const response = await client.conversations.list({
  folder: '/work',
  pinned: true,
  archived: false,
  page: 1,
  pageSize: 50
});

console.log(`Total: ${response.total}`);
response.results.forEach(conv => {
  console.log(`${conv.label} - ${conv.folder}`);
});
```

**Parameters:**

```typescript
interface ListConversationsParams {
  label?: string;
  folder?: string;
  pinned?: boolean;
  archived?: boolean;
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 50, Max: 100
}

interface ListConversationsResponse {
  results: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

#### Update Label/Folder

```typescript
// Update label and folder
await client.conversations.updateLabel(conversationId, {
  label: 'Updated Label',
  folder: '/new/folder'
});

// Update folder only
await client.conversations.updateFolder(
  conversationId,
  '/work/archived'
);
```

---

#### Pin/Archive

```typescript
// Pin (sets importance to 10)
await client.conversations.pin(conversationId);

// Unpin
await client.conversations.unpin(conversationId);

// Archive
await client.conversations.archive(conversationId);

// Unarchive
await client.conversations.unarchive(conversationId);
```

---

#### Delete Conversation

```typescript
await client.conversations.delete(conversationId);
```

---

#### Count Conversations

```typescript
// Count all
const total = await client.conversations.count();

// Count by label
const count = await client.conversations.count({ label: 'API Design' });

// Count by folder
const count = await client.conversations.count({ folder: '/work/engineering' });
```

---

### Search & Query

#### Semantic Query

```typescript
const results = await client.query({
  query: 'How to implement authentication?',
  limit: 10,
  filters: {
    folder: '/work/engineering',
    importanceMin: 7,
    dateFrom: '2026-01-01T00:00:00Z'
  }
});

results.forEach(result => {
  console.log(`[${result.score.toFixed(2)}] ${result.label}`);
  console.log(`  Folder: ${result.folder}`);
  console.log(`  Content: ${result.content.substring(0, 100)}...`);
});
```

**Type:**

```typescript
interface QueryRequest {
  query: string;
  limit?: number;       // Default: 10
  offset?: number;      // Default: 0
  filters?: QueryFilters;
}

interface QueryFilters {
  folder?: string;
  label?: string;
  importanceMin?: number;
  importanceMax?: number;
  dateFrom?: string;    // ISO 8601
  dateTo?: string;      // ISO 8601
}

interface SearchResult {
  conversationId: string;
  messageId: string;
  score: number;        // 0-1
  content: string;
  label: string;
  folder: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

---

#### Full-Text Search

```typescript
const results = await client.search.fulltext({
  query: 'authentication oauth jwt',
  limit: 20
});

results.forEach(result => {
  console.log(result.content);
});
```

---

### Context Assembly

```typescript
const context = await client.context.assemble({
  query: 'Continue our API design discussion',
  preferredLabels: ['API Design', 'Architecture'],
  contextBudget: 8000,  // Max tokens
  excludedFolders: ['/personal']
});

// Use in LLM prompt
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  ...context,  // Insert assembled context
  { role: 'user', content: 'What should we do next?' }
];
```

**Returns:** `Message[]` ready for LLM input

---

### Summarization

```typescript
// Daily summary
const summary = await client.summarize({
  conversationId,
  level: 'daily'
});

console.log(summary.summary);
console.log(summary.generatedAt);

// Weekly summary
const weeklySummary = await client.summarize({
  conversationId,
  level: 'weekly'
});

// Monthly summary
const monthlySummary = await client.summarize({
  conversationId,
  level: 'monthly'
});
```

**Levels:** `'daily'`, `'weekly'`, `'monthly'`

---

### Pruning

#### Dry Run

```typescript
const suggestions = await client.prune.dryRun({
  thresholdDays: 90
});

console.log(`Found ${suggestions.total} candidates for pruning`);

suggestions.suggestions.forEach(suggestion => {
  console.log(suggestion.conversationLabel);
  console.log(`  Last accessed: ${suggestion.lastAccessed}`);
  console.log(`  Importance: ${suggestion.importanceScore}`);
  console.log(`  Recommendation: ${suggestion.recommendation}`);
});
```

**Type:**

```typescript
interface PruningSuggestion {
  conversationId: string;
  conversationLabel: string;
  lastAccessed: Date;
  messageCount: number;
  tokenEstimate: number;
  importanceScore: number;
  preview: string;
  recommendation: 'DELETE' | 'ARCHIVE';
}

interface PruneResponse {
  suggestions: PruningSuggestion[];
  total: number;
}
```

---

#### Execute Pruning

```typescript
// Archive low-priority conversations
const toArchive = suggestions.suggestions
  .filter(s => s.importanceScore <= 3)
  .map(s => s.conversationId);

await client.prune.execute(toArchive);
```

---

### Label Suggestions

```typescript
const suggestions = await client.labels.suggest({
  conversationId
});

suggestions.forEach(suggestion => {
  console.log(`${suggestion.label} (${(suggestion.confidence * 100).toFixed(0)}%)`);
  console.log(`  Reason: ${suggestion.reason}`);
  console.log(`  Existing: ${suggestion.isExisting}`);
});
```

---

### Rebuild Embeddings

```typescript
// Trigger async rebuild
await client.embeddings.rebuild();

console.log('Embedding rebuild started (async)');
```

---

### Health & Stats

```typescript
// Health check
const health = await client.health();
console.log(health.status);  // 'healthy' or 'unhealthy'
console.log(health.checks.database);
console.log(health.checks.chroma);

// Metrics (Prometheus format)
const metrics = await client.metrics();
console.log(metrics);  // Raw Prometheus text
```

---

## Error Handling

```typescript
import {
  SekhaError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError
} from '@sekha/sdk';

try {
  const conversation = await client.conversations.get(conversationId);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Conversation not found');
  } else if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof ServerError) {
    console.error(`Server error: ${error.message}`);
  } else if (error instanceof SekhaError) {
    console.error(`Unknown error: ${error.message}`);
  } else {
    throw error;
  }
}
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

## TypeScript Support

### Full Type Definitions

```typescript
import type {
  SekhaClient,
  Conversation,
  Message,
  SearchResult,
  QueryRequest,
  QueryFilters,
  PruningSuggestion,
  SummaryLevel
} from '@sekha/sdk';

// All types are exported and documented
const query: QueryRequest = {
  query: 'test',
  limit: 10,
  filters: {
    folder: '/work',
    importanceMin: 7
  }
};
```

### Generic Methods

```typescript
// Type-safe response
const conversation: Conversation = await client.conversations.create({
  label: 'Test',
  messages: []
});

// Typed filters
const results: SearchResult[] = await client.query({
  query: 'test',
  filters: {
    importanceMin: 7  // TypeScript validates this is a number
  }
});
```

---

## Advanced Usage

### Custom Timeout

```typescript
// Per-client timeout
const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: 'key',
  timeout: 60000  // 60 seconds
});

// Per-request timeout (future)
const results = await client.query({
  query: 'slow query',
  _timeout: 120000  // 120 seconds
});
```

### Retry Configuration

```typescript
const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: 'key',
  maxRetries: 5,
  retryDelay: 2000  // 2 seconds initial delay
});
```

### Custom Headers

```typescript
const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: 'key',
  headers: {
    'X-Custom-Header': 'value',
    'User-Agent': 'MyApp/1.0'
  }
});
```

### Axios Instance Access

```typescript
// Access underlying axios instance
client._axios.interceptors.request.use(config => {
  console.log(`Request: ${config.method} ${config.url}`);
  return config;
});

client._axios.interceptors.response.use(response => {
  console.log(`Response: ${response.status}`);
  return response;
});
```

---

## Examples

### Store Daily Standup

```typescript
const standup = await client.conversations.create({
  label: `Standup ${new Date().toISOString().split('T')[0]}`,
  folder: '/work/meetings/standup',
  importanceScore: 5,
  messages: [
    {
      role: 'user',
      content: `
        Yesterday:
        - Fixed authentication bug
        - Reviewed PR #234
        
        Today:
        - Implement rate limiting
        - Update documentation
        
        Blockers:
        - Waiting on database migration approval
      `
    }
  ]
});
```

### Weekly Review

```typescript
// Get last week's conversations
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const results = await client.query({
  query: 'important decisions and action items',
  filters: {
    dateFrom: weekAgo.toISOString(),
    importanceMin: 7
  }
});

console.log(`Found ${results.length} important conversations`);
results.forEach(result => {
  console.log(`- ${result.label}`);
});
```

### Backup Conversations

```typescript
import * as fs from 'fs';

// Export all conversations
const conversations = await client.conversations.list({ pageSize: 100 });

const backup = [];
for (const conv of conversations.results) {
  const fullConv = await client.conversations.get(conv.id);
  backup.push({
    id: fullConv.id,
    label: fullConv.label,
    folder: fullConv.folder,
    createdAt: fullConv.createdAt
  });
}

fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
```

### React Integration

```typescript
import { useState, useEffect } from 'react';
import { SekhaClient } from '@sekha/sdk';

const client = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.SEKHA_API_KEY!
});

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await client.query({ query, limit: 10 });
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      <ul>
        {results.map(result => (
          <li key={result.messageId}>
            <strong>{result.label}</strong> ({result.score.toFixed(2)})
            <p>{result.content.substring(0, 200)}...</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Express.js API

```typescript
import express from 'express';
import { SekhaClient } from '@sekha/sdk';

const app = express();
app.use(express.json());

const sekha = new SekhaClient({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.SEKHA_API_KEY!
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    const results = await sekha.query({ query, limit: 10 });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save conversation endpoint
app.post('/api/conversations', async (req, res) => {
  try {
    const conversation = await sekha.conversations.create(req.body);
    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

## Development

### Building from Source

```bash
git clone https://github.com/sekha-ai/sekha-js-sdk.git
cd sekha-js-sdk

# Install dependencies
npm install

# Build
npm run build

# Build types
npm run build:types
```

### Running Tests

```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# Specific test
npm test -- conversations.test.ts

# Watch mode
npm test -- --watch
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

---

## Browser Support

### Module Formats

- **ESM** - `dist/index.esm.js`
- **CommonJS** - `dist/index.cjs.js`
- **UMD** - `dist/index.umd.js`

### CDN Usage

```html
<!-- Via esm.sh -->
<script type="module">
  import { SekhaClient } from 'https://esm.sh/@sekha/sdk@latest';
</script>

<!-- Via unpkg -->
<script type="module">
  import { SekhaClient } from 'https://unpkg.com/@sekha/sdk@latest/dist/index.esm.js';
</script>

<!-- UMD (global) -->
<script src="https://unpkg.com/@sekha/sdk@latest/dist/index.umd.js"></script>
<script>
  const client = new Sekha.SekhaClient({
    baseUrl: 'http://localhost:8080',
    apiKey: 'your-key'
  });
</script>
```

### CORS Configuration

If using from browser, ensure Sekha Controller allows CORS:

```toml
# config.toml
[api]
cors_enabled = true
cors_origins = ["http://localhost:3000", "https://myapp.com"]
```

---

## Migration from v0.x

### Breaking Changes

```typescript
// v0.x
const results = await client.search({ query: 'test' });

// v1.x (current)
const results = await client.query({ query: 'test' });
```

```typescript
// v0.x
await client.conversations.update(id, { label: 'New' });

// v1.x
await client.conversations.updateLabel(id, { label: 'New' });
```

### Upgrade Guide

1. Update package: `npm install @sekha/sdk@latest`
2. Rename `search()` → `query()`
3. Update `conversations.update()` → `conversations.updateLabel()`
4. Check TypeScript errors and fix

---

## Next Steps

- **[Python SDK](python-sdk.md)** - Python client library
- **[REST API](../api-reference/rest-api.md)** - Full API reference
- **[Integrations](../integrations/index.md)** - Use with React, Vue, etc.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-js-sdk/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
