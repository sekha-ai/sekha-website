# Guides

Practical guides and tutorials for using Sekha effectively.

## Available Guides

### Use Case Guides

Learn how to use Sekha for specific workflows:

- [**AI Coding Assistant**](ai-coding-assistant.md) - Build a coding assistant with perfect project memory
- [**Research Assistant**](research-assistant.md) - Manage research papers and notes with semantic search

## Common Workflows

### Creating and Managing Conversations

**Create a conversation:**

```bash
curl -X POST http://localhost:8080/conversations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Planning",
    "content": "Initial meeting notes...",
    "labels": ["work", "planning"],
    "importance": 8
  }'
```

**Search conversations:**

```bash
curl -X POST http://localhost:8080/conversations/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication bugs",
    "limit": 10
  }'
```

### Organizing Memory

**Using Labels:**

Organize conversations with hierarchical labels:

```
work/
  ├── projects/project-alpha
  ├── meetings/standup
  └── decisions/architecture

personal/
  ├── learning/rust
  └── ideas/app-concepts
```

**Using Importance Scores:**

- **1-3:** Low priority, can be archived
- **4-6:** Medium priority, keep accessible
- **7-9:** High priority, frequently referenced
- **10:** Critical, never archive

### Semantic Search

Search by meaning, not just keywords:

```python
from sekha_sdk import SekhaClient

client = SekhaClient(api_url="http://localhost:8080")

# Find conversations about security, even if they don't use that word
results = client.search(
    query="How do we handle user authentication?",
    limit=5
)

for convo in results:
    print(f"{convo.title}: {convo.relevance_score}")
```

### Context Assembly

Get optimal context for AI conversations:

```python
# Get relevant context within token budget
context = client.assemble_context(
    query="Tell me about our API design",
    max_tokens=8000,
    include_labels=["work/api"],
    min_importance=6
)

# Use in your LLM prompt
prompt = f"""
Context from memory:
{context}

User question: Tell me about our API design
"""
```

### Summarization

Generate summaries of conversation history:

```bash
# Get daily summary
curl "http://localhost:8080/summaries/daily?date=2026-01-25" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Get weekly summary
curl "http://localhost:8080/summaries/weekly?week=2026-W04" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Pruning and Maintenance

Keep your memory clean and focused:

```python
# Get pruning recommendations
recommendations = client.get_pruning_suggestions(
    min_age_days=90,
    max_importance=3
)

print(f"Found {len(recommendations)} conversations to archive")

# Archive low-value conversations
for convo_id in recommendations:
    client.archive_conversation(convo_id)
```

## Integration Examples

### With Claude Desktop

Use MCP tools to give Claude access to your memory:

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

See [Claude Desktop Integration](../integrations/claude-desktop.md) for details.

### With Python Applications

```python
from sekha_sdk import SekhaClient
import openai

# Initialize clients
sekha = SekhaClient(api_url="http://localhost:8080")
openai_client = openai.Client()

def chat_with_memory(user_message):
    # Get relevant context from Sekha
    context = sekha.assemble_context(
        query=user_message,
        max_tokens=4000
    )
    
    # Send to LLM with context
    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"Context: {context}"},
            {"role": "user", "content": user_message}
        ]
    )
    
    # Store conversation in Sekha
    sekha.conversations.create(
        title=f"Chat: {user_message[:50]}",
        content=f"Q: {user_message}\nA: {response.choices[0].message.content}"
    )
    
    return response.choices[0].message.content
```

## Best Practices

### Memory Organization

1. **Use consistent labeling** - Establish a label hierarchy early
2. **Set importance scores** - Help prioritize what to keep
3. **Regular pruning** - Archive or delete low-value conversations monthly
4. **Descriptive titles** - Make conversations easy to find

### Performance Optimization

1. **Batch operations** - Create/update multiple conversations together
2. **Use semantic search** - More efficient than full-text for meaning-based queries
3. **Limit context size** - Only retrieve what you need
4. **Archive old data** - Keep active dataset focused

### Security

1. **Rotate API keys** - Change keys periodically
2. **Use HTTPS** - Always use TLS in production
3. **Limit access** - Use firewall rules and network isolation
4. **Backup regularly** - Protect against data loss

## Next Steps

- [**AI Coding Assistant**](ai-coding-assistant.md) - Build a coding assistant
- [**Research Assistant**](research-assistant.md) - Manage research with Sekha
- [**API Reference**](../api-reference/index.md) - Complete API documentation
- [**SDK Documentation**](../sdks/index.md) - Use Python or JavaScript SDKs
