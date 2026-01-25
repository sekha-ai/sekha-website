# JavaScript/TypeScript SDK

Official JavaScript/TypeScript SDK for Sekha AI Memory Controller - Persistent context management for AI applications.

## Installation

```bash
npm install @sekha/sdk
```

**Using Yarn:**
```bash
yarn add @sekha/sdk
```

**Using pnpm:**
```bash
pnpm add @sekha/sdk
```

!!! info "Package Status"
    Currently in beta. Package will be published to npm as `@sekha/sdk` soon.
    For now, use from source:
    ```bash
    git clone https://github.com/sekha-ai/sekha-js-sdk.git
    cd sekha-js-sdk
    npm install
    npm run build
    ```

---

## Features

- ✅ **Full TypeScript Support** - Complete type definitions for all API operations
- ✅ **Tree-Shakeable** - ESM and CJS builds for optimal bundle size
- ✅ **Zero Dependencies** - Built on native `fetch` API
- ✅ **AbortController Support** - Cancel requests and handle timeouts
- ✅ **Streaming Exports** - Efficiently export large datasets
- ✅ **Rate Limiting** - Built-in client-side throttling
- ✅ **Automatic Retries** - Exponential backoff for transient failures
- ✅ **Comprehensive Errors** - Typed error classes for all scenarios

---

## Quick Start

```typescript
import { MemoryController } from '@sekha/sdk';

// Initialize the client
const memory = new MemoryController({
  apiKey: process.env.SEKHA_API_KEY!, // or 'your-api-key'
  baseURL: 'http://localhost:8080',
  timeout: 30000, // optional
  maxRetries: 3, // optional
});

// Store a conversation
const conversation = await memory.store({
  messages: [
    { role: 'user', content: 'What are token limits in GPT-4?' },
    { role: 'assistant', content: 'GPT-4 has a context window of...' }
  ],
  label: 'AI:Token Limits',
  folder: '/research/2025',
  importanceScore: 8
});

console.log(`✅ Stored conversation: ${conversation.id}`);

// Query with semantic search
const results = await memory.query('token limits', {
  limit: 10,
  labels: ['AI']
});

results.forEach(result => {
  console.log(`${result.label}: ${result.similarity.toFixed(2)}`);
});
```

---

## API Reference

### Constructor

```typescript
const memory = new MemoryController({
  apiKey: string;          // Required: API key for authentication
  baseURL: string;         // Required: Sekha Controller URL
  timeout?: number;        // Optional: Request timeout (default: 30000ms)
  maxRetries?: number;     // Optional: Max retry attempts (default: 3)
  rateLimit?: number;      // Optional: Requests per minute (default: 1000)
});
```

---

## Core Operations

### store() / create()

Store a new conversation with messages.

```typescript
const conv = await memory.store({
  messages: Message[],
  label: string,
  folder?: string,
  importanceScore?: number,
  metadata?: Record<string, any>
});
```

**Parameters:**

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
```

**Returns:** `Promise<Conversation>`

**Example:**

```typescript
const conversation = await memory.store({
  messages: [
    { role: 'user', content: 'How do I implement authentication?' },
    { role: 'assistant', content: 'Here are the best practices...' }
  ],
  label: 'Authentication Implementation',
  folder: '/work/security',
  importanceScore: 8,
  metadata: {
    project: 'SecureApp',
    sprint: 'Q1-2026'
  }
});

console.log(`Stored: ${conversation.id}`);
```

---

### query() / search()

Search conversations using semantic similarity.

```typescript
const results = await memory.query('API design patterns', {
  limit: 10,
  labels: ['Engineering', 'Architecture']
});
```

**Parameters:**

```typescript
interface QueryOptions {
  limit?: number;          // Max results (default: 10)
  labels?: string[];       // Filter by labels
}
```

**Returns:** `Promise<SearchResult[]>`

**Example:**

```typescript
const results = await memory.search('database optimization', {
  limit: 5,
  labels: ['Engineering']
});

results.forEach(result => {
  console.log(`${result.label} (${(result.similarity * 100).toFixed(0)}% match)`);
  console.log(`  ${result.content.substring(0, 100)}...`);
});
```

---

### get() / getConversation()

Retrieve a specific conversation by ID.

```typescript
const conv = await memory.get('conversation-uuid');
```

**Returns:** `Promise<Conversation>`

**Example:**

```typescript
const conversation = await memory.get('123e4567-e89b-12d3-a456-426614174000');

console.log(`Label: ${conversation.label}`);
console.log(`Messages: ${conversation.messages.length}`);
console.log(`Importance: ${conversation.importanceScore}/10`);
```

---

### list() / listConversations()

List conversations with optional filters.

```typescript
const convs = await memory.list({
  label: 'Engineering',
  status: 'active',
  limit: 50,
  offset: 0
});
```

**Parameters:**

```typescript
interface ListOptions {
  label?: string;
  status?: 'active' | 'archived' | 'pinned';
  limit?: number;
  offset?: number;
}
```

**Returns:** `Promise<Conversation[]>`

---

### update()

Update conversation metadata.

```typescript
await memory.update('conversation-uuid', {
  label: 'New Label',
  folder: '/new/folder',
  importanceScore: 9,
  status: 'archived'
});
```

**Returns:** `Promise<Conversation>`

---

### updateLabel()

Update conversation label and optionally folder.

```typescript
await memory.updateLabel('conversation-uuid', 'Updated Label', '/new/folder');
```

**Returns:** `Promise<void>`

---

### delete()

Permanently delete a conversation.

```typescript
await memory.delete('conversation-uuid');
```

**Returns:** `Promise<void>`

!!! danger "Permanent Deletion"
    This cannot be undone. Consider archiving instead.

---

## Advanced Operations

### pin()

Pin a conversation (prevents auto-pruning).

```typescript
await memory.pin('conversation-uuid');
```

**Example:**

```typescript
// Pin critical conversations
const criticalConvs = await memory.list({ label: 'Critical Decision' });
for (const conv of criticalConvs) {
  await memory.pin(conv.id);
}
```

---

### archive()

Archive a conversation.

```typescript
await memory.archive('conversation-uuid');
```

---

### getPruningSuggestions()

Get AI-powered pruning suggestions based on age and importance.

```typescript
const suggestions = await memory.getPruningSuggestions(60, 5.0);

suggestions.forEach(s => {
  console.log(`Can prune: ${s.label}`);
  console.log(`  Age: ${s.ageDays} days, Importance: ${s.importanceScore}/10`);
  console.log(`  Reason: ${s.reason}`);
});
```

**Parameters:**
- `thresholdDays` - Age threshold in days (default: 30)
- `importanceThreshold` - Minimum importance to keep (default: 5.0)

**Returns:** `Promise<PruningSuggestion[]>`

---

### suggestLabels()

Get AI-powered label suggestions for a conversation.

```typescript
const suggestions = await memory.suggestLabels('conversation-uuid');

suggestions.forEach(s => {
  console.log(`${s.label} (confidence: ${s.confidence.toFixed(2)})`);
});
```

**Returns:** `Promise<LabelSuggestion[]>`

---

### autoLabel()

Automatically apply the best label if AI confidence exceeds threshold.

```typescript
const appliedLabel = await memory.autoLabel('conversation-uuid', 0.8);

if (appliedLabel) {
  console.log(`Applied label: ${appliedLabel}`);
} else {
  console.log('No label met confidence threshold');
}
```

**Returns:** `Promise<string | null>`

---

### assembleContext()

Assemble context for LLM with token budget management.

```typescript
const context = await memory.assembleContext({
  query: 'API design decisions',
  tokenBudget: 8000,
  labels: ['Engineering', 'Architecture']
});

console.log(`Context: ${context.formattedContext}`);
console.log(`Estimated tokens: ${context.estimatedTokens}`);
```

**Returns:** `Promise<ContextAssembly>`

---

### export()

Export conversations to Markdown or JSON.

```typescript
// Export all conversations as Markdown
const markdown = await memory.export({ format: 'markdown' });

// Export specific label as JSON
const json = await memory.export({
  label: 'Project:AI',
  format: 'json'
});
```

**Returns:** `Promise<string>`

---

### exportStream()

Stream large exports to avoid memory issues.

```typescript
const stream = memory.exportStream({
  label: 'Project:AI',
  format: 'markdown'
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

**Returns:** `AsyncIterable<string>`

**Example with file writing:**

```typescript
import { createWriteStream } from 'fs';

const stream = memory.exportStream({
  label: 'Engineering',
  format: 'markdown'
});

const writeStream = createWriteStream('./engineering-export.md');

for await (const chunk of stream) {
  writeStream.write(chunk);
}

writeStream.end();
console.log('Export complete!');
```

---

### health()

Check Sekha Controller health status.

```typescript
const status = await memory.health();

console.log(`Status: ${status.status}`);
console.log(`Database OK: ${status.databaseOk}`);
console.log(`Vector DB OK: ${status.vectorDbOk}`);
```

**Returns:** `Promise<HealthStatus>`

---

## Error Handling

The SDK provides typed error classes for all failure scenarios:

```typescript
import {
  SekhaError,
  SekhaAuthError,
  SekhaNotFoundError,
  SekhaValidationError,
  SekhaAPIError,
  SekhaConnectionError
} from '@sekha/sdk';

try {
  await memory.get('invalid-id');
} catch (error) {
  if (error instanceof SekhaNotFoundError) {
    console.log('Conversation not found');
  } else if (error instanceof SekhaAuthError) {
    console.log('Invalid API key');
  } else if (error instanceof SekhaValidationError) {
    console.log('Validation error:', error.details);
  } else if (error instanceof SekhaConnectionError) {
    console.log('Network error:', error.message);
  } else if (error instanceof SekhaAPIError) {
    console.log(`API error (${error.statusCode}):`, error.message);
  }
}
```

---

## AbortController Support

Cancel requests or implement timeouts:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const results = await memory.search('authentication', {
    limit: 10,
    signal: controller.signal
  });
  clearTimeout(timeout);
  console.log('Search completed:', results);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled or timed out');
  }
}
```

---

## TypeScript Types

Full TypeScript definitions are included:

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  label: string;
  folder?: string;
  messages: Message[];
  status: 'active' | 'archived' | 'pinned';
  importanceScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  id: string;
  conversationId: string;
  label: string;
  content: string;
  score: number;
  similarity: number;
  importanceScore: number;
}

interface PruningSuggestion {
  id: string;
  label: string;
  ageDays: number;
  importanceScore: number;
  reason: string;
  lastAccessed: string;
}

interface LabelSuggestion {
  label: string;
  confidence: number;
  reason: string;
}

interface ContextAssembly {
  formattedContext: string;
  estimatedTokens: number;
  selectedConversations: Array<{
    id: string;
    label: string;
    excerpt: string;
    relevanceScore: number;
    tokenCount: number;
  }>;
}
```

---

## Configuration Options

```typescript
interface MemoryConfig {
  apiKey: string;           // Required: API key (32+ characters)
  baseURL: string;          // Required: Sekha Controller URL
  timeout?: number;         // Optional: Request timeout in ms (default: 30000)
  maxRetries?: number;      // Optional: Max retry attempts (default: 3)
  rateLimit?: number;       // Optional: Requests per minute (default: 1000)
  defaultLabel?: string;    // Optional: Default label for conversations
}
```

---

## Examples

### Build a Chat Interface

```typescript
import { MemoryController } from '@sekha/sdk';

class ChatApp {
  private memory: MemoryController;
  private currentSession: string;
  private messages: Message[] = [];

  constructor() {
    this.memory = new MemoryController({
      apiKey: process.env.SEKHA_API_KEY!,
      baseURL: 'http://localhost:8080'
    });
    this.currentSession = `session-${Date.now()}`;
  }

  async sendMessage(content: string): Promise<string> {
    // Add user message
    this.messages.push({ role: 'user', content });

    // Get relevant context from memory
    const pastContext = await this.memory.query(content, { limit: 5 });

    // Generate AI response (pseudo-code)
    const aiResponse = await this.generateAIResponse(content, pastContext);
    this.messages.push({ role: 'assistant', content: aiResponse });

    return aiResponse;
  }

  async saveSession(label: string): Promise<void> {
    await this.memory.store({
      messages: this.messages,
      label,
      folder: '/sessions',
      importanceScore: this.calculateImportance(this.messages)
    });
  }

  private calculateImportance(messages: Message[]): number {
    // Logic to determine conversation importance
    const wordCount = messages.reduce((sum, m) => sum + m.content.split(' ').length, 0);
    return Math.min(10, Math.floor(wordCount / 100) + 5);
  }
}
```

---

### Memory-Aware Agent

```typescript
class MemoryAgent {
  private memory: MemoryController;

  async executeTask(task: string): Promise<void> {
    // Check if we've done this before
    const similarTasks = await this.memory.query(task, { limit: 3 });

    if (similarTasks.length > 0 && similarTasks[0].similarity > 0.9) {
      console.log('Found similar task - reusing approach');
      // Reuse previous approach
      return this.reuseApproach(similarTasks[0]);
    }

    // New task - execute and learn
    const result = await this.executeNewTask(task);

    // Store for future reference
    await this.memory.store({
      messages: [
        { role: 'user', content: `Task: ${task}` },
        { role: 'assistant', content: `Result: ${result}` }
      ],
      label: `Task: ${task.substring(0, 50)}`,
      folder: '/agent/tasks',
      importanceScore: 7
    });
  }
}
```

---

## Next Steps

- **[REST API Reference](../api-reference/rest-api.md)** - Direct API access
- **[Python SDK](python-sdk.md)** - Python client library
- **[Examples Repository](https://github.com/sekha-ai/examples)** - More code examples
- **[TypeScript Best Practices](https://github.com/sekha-ai/sekha-js-sdk/wiki/Best-Practices)** - Advanced patterns
