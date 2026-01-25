# Organizing Memory with Labels & Folders

> Best practices for organizing conversations in Sekha

## Overview

Sekha provides flexible organization through labels and folders to keep your memories structured.

## Labels

### Creating Labels

```bash
curl -X POST http://localhost:8080/api/v1/labels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "name": "work-projects",
    "description": "All work-related project discussions",
    "color": "#4f46e5"
  }'
```

### Applying Labels

When storing conversations:

```json
{
  "label": "Project Planning",
  "folders": ["work-projects", "2026-q1"],
  "messages": [...]
}
```

## Folders

Folders create hierarchical organization:

```
work/
├── projects/
│   ├── project-a
│   └── project-b
├── meetings/
└── notes/

personal/
├── research
├── learning
└── ideas
```

## Best Practices

### 1. Consistent Naming

✅ **Good:**
- `work-project-sekha`
- `learning-rust-2026`
- `meeting-team-weekly`

❌ **Avoid:**
- `stuff`
- `misc`
- `untitled-1`

### 2. Hierarchical Folders

Use `/` for hierarchy:

```
work/projects/sekha/architecture
work/projects/sekha/deployment
work/meetings/2026/january
```

### 3. Label Conventions

| Type | Example | Use Case |
|------|---------|----------|
| Project | `project-sekha` | Specific projects |
| Topic | `topic-rust` | Subject areas |
| Status | `status-active` | Current state |
| Priority | `priority-high` | Importance |
| Date | `2026-01` | Time-based |

## Searching by Organization

### Query by Label

```bash
curl "http://localhost:8080/api/v1/query?label=project-sekha&limit=10"
```

### Query by Folder

```bash
curl "http://localhost:8080/api/v1/query?folder=work/projects&limit=10"
```

### Combined Filters

```bash
curl "http://localhost:8080/api/v1/query?folder=work&importance=8&limit=10"
```

## Related

- [Semantic Search Guide](semantic-search.md)
- [API Reference](../api-reference/rest-api.md)
- [MCP Tools](../api-reference/mcp-tools.md)
