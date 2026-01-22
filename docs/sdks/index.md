# SDKs & Client Libraries

Official client libraries for integrating Sekha into your applications.

## Available SDKs

### [Python SDK](python-sdk.md)

**Installation:**
```bash
pip install sekha-sdk
```

**Features:**
- Fully typed with type hints
- Async/await support
- Automatic retries
- Built-in error handling

**Best for:** Data science, ML pipelines, backend services

### [JavaScript SDK](javascript-sdk.md)

**Installation:**
```bash
npm install sekha-js
# or
yarn add sekha-js
```

**Features:**
- TypeScript support
- Promise-based API
- Browser and Node.js compatible
- Tree-shakeable

**Best for:** Web applications, Node.js services, frontend integrations

## Quick Start Examples

=== "Python"

    ```python
    from sekha import SekhaClient

    # Initialize client
    client = SekhaClient(
        api_url="http://localhost:8080",
        api_key="your-api-key"
    )

    # Store conversation
    result = client.store_conversation(
        label="My Project",
        messages=[
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi!"}
        ]
    )

    # Query memory
    results = client.query("Hello", limit=5)
    ```

=== "JavaScript"

    ```javascript
    import { SekhaClient } from 'sekha-js';

    // Initialize client
    const client = new SekhaClient({
      apiUrl: 'http://localhost:8080',
      apiKey: 'your-api-key'
    });

    // Store conversation
    const result = await client.storeConversation({
      label: 'My Project',
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' }
      ]
    });

    // Query memory
    const results = await client.query('Hello', { limit: 5 });
    ```

## SDK Features Comparison

| Feature | Python SDK | JavaScript SDK |
|---------|------------|----------------|
| Conversation storage | ✅ | ✅ |
| Semantic query | ✅ | ✅ |
| Full-text search | ✅ | ✅ |
| Context assembly | ✅ | ✅ |
| Label management | ✅ | ✅ |
| Summarization | ✅ | ✅ |
| Pruning | ✅ | ✅ |
| Export | ✅ | ✅ |
| Async support | ✅ | ✅ (native) |
| Type safety | ✅ (hints) | ✅ (TypeScript) |
| Auto-retry | ✅ | ✅ |
| Error handling | ✅ | ✅ |

## Code Examples

Browse comprehensive code examples:

**[→ View All Examples](examples.md)**

Includes:
- Basic operations
- Advanced queries
- Context assembly
- Batch operations
- Error handling
- Real-world use cases

## Community SDKs

Community-maintained SDKs for other languages:

- **Ruby** - *Coming soon*
- **Go** - *Coming soon*
- **Rust** - *Coming soon*
- **.NET** - *Coming soon*

Want to contribute an SDK? Check our [Contributing Guide](../development/contributing.md).

## Need Help?

- [Python SDK Documentation](python-sdk.md)
- [JavaScript SDK Documentation](javascript-sdk.md)
- [API Reference](../api-reference/rest-api.md)
- [Discord Community](https://discord.gg/sekha)