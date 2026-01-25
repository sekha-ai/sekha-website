# Guides

Practical guides for using Sekha effectively.

## Use Case Guides

### AI Coding Assistant

Build an AI coding assistant with persistent memory:

[**AI Coding Assistant →**](ai-coding-assistant.md)

- Remember project context across sessions
- Track architectural decisions
- Build knowledge base of code patterns
- Context-aware code suggestions

### Research Assistant

Create a research assistant that never forgets:

[**Research Assistant →**](research-assistant.md)

- Organize research notes semantically
- Track sources and citations
- Find related research across conversations
- Build comprehensive literature reviews

## Core Concepts

### Organizing Memory

Best practices for organizing conversations:

- **Folders** - Organize by project, topic, or context
- **Labels** - Tag conversations with themes
- **Importance** - Score 1-10 for prioritization
- **Summaries** - Auto-generate for long conversations

### Semantic Search

Find memories by meaning, not just keywords:

- Query in natural language
- Relevance scoring with embeddings
- Cross-conversation search
- Time-based filtering

### Context Assembly

Buil optimal context for your LLM:

- Budget-aware context selection
- Importance-weighted prioritization
- Summary integration for compression
- Source tracking for citations

### Memory Pruning

Keep your memory system efficient:

- Identify low-value conversations
- Prune by age, importance, or relevance
- Selective deletion with summaries
- Export before deletion

### Conversation Summarization

Compress long conversations:

- Automatic summarization
- Configurable detail levels
- Summary-aware context assembly
- Token budget optimization

### Importing Data

Bring existing data into Sekha:

- ChatGPT export compatibility
- Claude conversation imports
- Custom JSON format
- Bulk import tools

### Backup & Restore

Protect your memory:

- Export conversations as JSON
- SQLite database backups
- ChromaDB vector backups
- Automated backup scripts

## Integration Guides

Integrate Sekha with your workflow:

- [Claude Desktop](../integrations/claude-desktop.md) - MCP integration
- **VS Code** (Coming Soon) - Editor integration
- **Obsidian** (Coming Soon) - Knowledge base sync
- **CLI** (Coming Soon) - Terminal interface

## Best Practices

### Conversation Labels

Use descriptive, searchable labels:

```bash
# Good
"Architecture Discussion - Auth System"
"Bug Fix - Payment Processing"
"Research - Vector Databases"

# Not ideal
"Chat 1"
"Conversation"
"Notes"
```

### Folder Structure

Organize by project or domain:

```
work/
  ├── project-a/
  ├── project-b/
  └── research/

personal/
  ├── learning/
  └── creative/
```

### Importance Scoring

Use consistent scoring:

- **9-10** - Critical decisions, breakthroughs
- **7-8** - Important discussions, solutions
- **5-6** - Regular conversations, notes
- **3-4** - Minor discussions
- **1-2** - Trivial or test conversations

## Next Steps

- [AI Coding Assistant](ai-coding-assistant.md) - Build a coding assistant
- [Research Assistant](research-assistant.md) - Research workflow
- [Claude Desktop](../integrations/claude-desktop.md) - MCP integration
- [API Reference](../api-reference/rest-api.md) - Programmatic access
