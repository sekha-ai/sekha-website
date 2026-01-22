# Guides

Practical guides for getting the most out of Sekha.

## Memory Management

### [Organizing Memory](organizing-memory.md)
Learn how to use labels, folders, and importance scores to keep your memory organized.

### [Semantic Search](semantic-search.md)
Master semantic search to find exactly what you need from your memory.

### [Context Assembly](context-assembly.md)
Build perfect context for your LLM prompts with intelligent retrieval.

### [Pruning Old Data](pruning.md)
Clean up low-value conversations while preserving important memories.

## Advanced Features

### [Summarization](summarization.md)
Generate hierarchical summaries to compress long conversation histories.

### [Importing Conversations](importing.md)
Import existing conversations from ChatGPT, Claude, or other sources.

### [Backup & Restore](backup-restore.md)
Safely backup and restore your memory database.

## Best Practices

### Labeling Strategy

```
/work
  /project-alpha
    (label: technical)
    (label: planning)
  /project-beta
/personal
  /learning
    (label: rust)
    (label: ai)
```

### Importance Scoring

- **1-3**: Low priority, prune candidates
- **4-6**: Normal conversations
- **7-9**: High value, frequently referenced
- **10**: Pinned, never prune

### Query Optimization

- Use semantic search for concepts
- Use full-text search for exact terms
- Combine filters for precision
- Adjust context budgets for your model

## Common Workflows

### Daily Work Routine

1. Morning: Review yesterday's summaries
2. During work: Store conversations in real-time
3. Evening: Label and organize new conversations
4. Weekly: Run pruning suggestions
5. Monthly: Export backups

### AI Agent Development

1. Design agent tasks
2. Store agent interactions
3. Use context assembly for next actions
4. Implement learning from past failures
5. Build knowledge graphs from conversations

### Research Workflow

1. Import literature notes
2. Store experiment logs
3. Query related research
4. Generate summaries by topic
5. Export for publications

## Quick Reference

| Task | Command | Guide |
|------|---------|-------|
| Store conversation | `POST /api/v1/conversations` | [API Ref](../api-reference/rest-api.md) |
| Semantic search | `POST /api/v1/query` | [Search Guide](semantic-search.md) |
| Add label | `PUT /api/v1/conversations/{id}/label` | [Organizing](organizing-memory.md) |
| Generate summary | `POST /api/v1/summarize` | [Summarization](summarization.md) |
| Get pruning suggestions | `POST /api/v1/prune/dry-run` | [Pruning](pruning.md) |

## Need Help?

- [Troubleshooting](../troubleshooting/index.md)
- [FAQ](../troubleshooting/faq.md)
- [Discord Community](https://discord.gg/sekha)