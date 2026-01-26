# Organizing Memory

Best practices for organizing conversations, labels, and folders in Sekha for maximum productivity and findability.

## Overview

Effective organization makes memory searchable and useful. Sekha provides three organizational tools:

- **Labels** - Descriptive tags for conversation topics
- **Folders** - Hierarchical paths for categorization
- **Importance Scores** - Priority ranking (1-10)

With good organization, you can:

- Find conversations instantly via semantic search
- Filter by project, topic, or time period
- Prune low-value memory efficiently
- Maintain context across long timelines

---

## Labeling Strategy

### What Makes a Good Label?

**✅ DO:**

```
✅ "Database Migration PostgreSQL to MySQL"
✅ "API v2 Authentication Design"
✅ "Bug Fix: Memory Leak in WebSocket"
✅ "Sprint Planning Q1 2026"
✅ "Learning: Rust Ownership Model"
```

**❌ DON'T:**

```
❌ "Conversation 1"
❌ "Notes"
❌ "Stuff"
❌ "Work"
❌ "TODO"
```

**Principles:**

1. **Be specific** - Include key entities ("PostgreSQL", "API v2")
2. **Add context** - What, not just topic ("Migration" vs "Database")
3. **Use keywords** - Terms you'll search for later
4. **Include dates/versions** when relevant
5. **Be consistent** - Establish patterns and stick to them

---

### Label Patterns

#### Project-Based

```
"Project Alpha: Initial Architecture"
"Project Alpha: API Implementation"
"Project Alpha: Performance Optimization"
"Project Alpha: Launch Retrospective"
```

#### Issue Tracking

```
"Bug #1234: Login Timeout"
"Feature #5678: Dark Mode Support"
"Incident #9012: Database Outage 2026-01-20"
```

#### Meeting Notes

```
"Standup 2026-01-25: Sprint 42"
"1-on-1 with Sarah: Career Development"
"All-Hands 2026-01: Company Roadmap"
```

#### Learning & Research

```
"Learning: Kubernetes StatefulSets"
"Research: Vector Database Comparison"
"Tutorial: React Server Components"
```

---

### Auto-Generated Labels

Use the `POST /api/v1/labels/suggest` endpoint for AI-generated label suggestions:

```bash
curl -X POST http://localhost:8080/api/v1/labels/suggest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response:**

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "suggestions": [
    {
      "label": "Authentication Implementation OAuth2",
      "confidence": 0.92,
      "is_existing": false,
      "reason": "Conversation discusses OAuth2 setup and JWT tokens"
    },
    {
      "label": "Security Best Practices",
      "confidence": 0.78,
      "is_existing": true,
      "reason": "Related to existing security conversations"
    }
  ]
}
```

---

## Folder Structure

### Recommended Hierarchy

```
/
├── work/
│   ├── projects/
│   │   ├── project-alpha/
│   │   │   ├── planning/
│   │   │   ├── implementation/
│   │   │   ├── testing/
│   │   │   └── retrospectives/
│   │   ├── project-beta/
│   │   └── project-gamma/
│   ├── meetings/
│   │   ├── standups/
│   │   ├── 1-on-1s/
│   │   └── all-hands/
│   ├── incidents/
│   │   ├── 2026-01/
│   │   └── 2026-02/
│   └── docs/
│       ├── architecture/
│       ├── api-design/
│       └── runbooks/
├── personal/
│   ├── learning/
│   │   ├── rust/
│   │   ├── kubernetes/
│   │   └── machine-learning/
│   ├── goals/
│   │   ├── 2026-q1/
│   │   └── 2026-q2/
│   └── health/
├── research/
│   ├── vector-databases/
│   ├── embeddings/
│   └── rag-patterns/
└── integrations/
    ├── claude/
    ├── vscode/
    └── obsidian/
```

---

### Folder Naming Conventions

**✅ Good:**

```
/work/engineering/backend/database
/personal/learning/rust/ownership-model
/research/ai/rag-architectures
/meetings/team/retrospectives/2026-01
```

**❌ Bad:**

```
/stuff/things
/folder1/folder2/folder3
/misc
/temp
```

**Rules:**

1. **Lowercase with hyphens** - `/project-alpha` not `/Project Alpha`
2. **Meaningful names** - Describe content, not structure
3. **Max 4-5 levels deep** - Avoid over-nesting
4. **Consistent patterns** - Use same structure across projects
5. **Date folders** - Use ISO format `2026-01` or `2026-q1`

---

## Importance Scores

### Scoring Guide

| Score | Category | Use Case | Examples |
|-------|----------|----------|----------|
| **10** | Critical | Must-keep forever | Architecture decisions, critical incidents, legal |
| **9** | Very High | Long-term reference | Major features, quarterly planning |
| **8** | High | Important work | Sprint planning, key implementations |
| **7** | Above Average | Significant tasks | Bug fixes, code reviews |
| **6** | Average | Regular work | Daily coding, standard meetings |
| **5** | Baseline | Default | General conversations |
| **4** | Below Average | Low priority | Casual discussions |
| **3** | Low | Temporary | Quick questions, sandbox work |
| **2** | Very Low | Delete candidate | Old drafts, superseded content |
| **1** | Minimal | Auto-prune | Test data, throwaway notes |

### Setting Importance

```bash
# Set importance when creating
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Architecture Decision: Microservices",
    "folder": "/work/docs/architecture",
    "importance_score": 10,
    "messages": [...]
  }'

# Update importance later
curl -X PUT http://localhost:8080/api/v1/conversations/{id}/importance \
  -H "Content-Type: application/json" \
  -d '{"importance_score": 9}'
```

### Pin Important Conversations

```bash
# Pin (sets importance to 10)
curl -X PUT http://localhost:8080/api/v1/conversations/{id}/pin
```

Pinned conversations:
- Appear first in search results
- Never suggested for pruning
- Easy to filter: `?pinned=true`

---

## Pruning Strategy

### When to Prune

**Prune candidates:**

- Importance score ≤ 3
- Not accessed in 90+ days
- Superseded by newer conversations
- Temporary notes or drafts
- Test/sandbox content

**Keep forever:**

- Importance score ≥ 8
- Architecture decisions
- Incident reports
- Legal/compliance records
- Learning milestones

---

### Dry-Run Pruning

```bash
curl -X POST http://localhost:8080/api/v1/prune/dry-run \
  -H "Content-Type: application/json" \
  -d '{"threshold_days": 90}'
```

**Response:**

```json
{
  "suggestions": [
    {
      "conversation_id": "...",
      "conversation_label": "Temp Notes",
      "last_accessed": "2025-10-01T10:00:00Z",
      "message_count": 3,
      "token_estimate": 450,
      "importance_score": 2,
      "preview": "Quick testing notes...",
      "recommendation": "DELETE"
    },
    {
      "conversation_id": "...",
      "conversation_label": "Q3 Planning",
      "last_accessed": "2025-09-15T14:30:00Z",
      "message_count": 25,
      "token_estimate": 5000,
      "importance_score": 7,
      "preview": "Quarterly objectives...",
      "recommendation": "ARCHIVE"
    }
  ],
  "total": 2
}
```

### Execute Pruning

```bash
curl -X POST http://localhost:8080/api/v1/prune/execute \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
    ]
  }'
```

**Note:** Pruning archives conversations (sets status to "archived"), not permanent deletion.

---

## Search Filters

### By Label

```bash
curl "http://localhost:8080/api/v1/conversations?label=API%20Design"
```

### By Folder

```bash
curl "http://localhost:8080/api/v1/conversations?folder=/work/projects/alpha"
```

### By Pinned Status

```bash
curl "http://localhost:8080/api/v1/conversations?pinned=true"
```

### By Archived Status

```bash
curl "http://localhost:8080/api/v1/conversations?archived=false"
```

### Combined Filters

```bash
curl "http://localhost:8080/api/v1/conversations?folder=/work&pinned=true&archived=false"
```

---

## Workflow Examples

### Weekly Review

```python
from sekha import SekhaClient

client = SekhaClient(base_url="http://localhost:8080", api_key="key")

# Get conversations from last week
results = client.query(
    query="conversations from last 7 days",
    filters={"archived": False}
)

# Review and update importance
for conv in results:
    if "critical" in conv.label.lower():
        client.conversations.update_importance(conv.id, 9)
    elif "temp" in conv.label.lower():
        client.conversations.update_importance(conv.id, 2)
```

### Monthly Cleanup

```python
# Find prune candidates
suggestions = client.prune.dry_run(threshold_days=60)

# Review and archive low-value
to_archive = [
    s.conversation_id 
    for s in suggestions 
    if s.importance_score <= 3
]

client.prune.execute(to_archive)
```

### Project Organization

```python
# Move all project conversations to dedicated folder
project_convs = client.query(
    query="project alpha",
    filters={"folder": "/work"}
)

for conv in project_convs:
    client.conversations.update_folder(
        conv.id, 
        "/work/projects/alpha/implementation"
    )
```

---

## Best Practices Summary

### Labels

1. Use descriptive, keyword-rich labels
2. Include project names and versions
3. Add dates for time-sensitive content
4. Be consistent with naming patterns
5. Use AI suggestions for inspiration

### Folders

1. Create hierarchy that matches your work
2. Use lowercase-with-hyphens naming
3. Keep depth to 4-5 levels max
4. Group by project, team, or topic
5. Use date-based folders for incidents/meetings

### Importance

1. Set appropriate scores at creation time
2. Review and adjust during weekly reviews
3. Pin critical conversations (10)
4. Mark temporary work low (1-3)
5. Use pruning to maintain quality

### Maintenance

1. Weekly review of new conversations
2. Monthly pruning of old/low-value content
3. Quarterly reorganization of folders
4. Annual audit of high-importance conversations
5. Regular backups via export API

---

## Next Steps

- **[Semantic Search](semantic-search.md)** - Improve search quality
- **[REST API](../api-reference/rest-api.md)** - API documentation
- **[Python SDK](../sdks/python-sdk.md)** - Automate organization
- **[MCP Tools](../api-reference/mcp-tools.md)** - Claude integration

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
