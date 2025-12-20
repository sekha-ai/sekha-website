# Memory Orchestration Guide

Project Sekha's Memory Orchestration layer provides intelligent context assembly, automatic summarization, pruning recommendations, and label management.

## Context Assembly

**Endpoint:** `POST /api/v1/context/assemble`

Assembles the most relevant context for a given query using a 4-phase algorithm:

1. **Recall**: Semantic search + pinned + recent messages
2. **Rank**: Composite scoring (50% importance + 30% recency + 20% label match)
3. **Assembly**: Fill 85% of token budget
4. **Enhancement**: Add citations and summaries

**Request:**
{
"query": "deployment strategies",
"preferred_labels": ["devops", "kubernetes"],
"context_budget": 8000
}


**Response:**
[
{
"id": "uuid",
"conversation_id": "uuid",
"role": "user",
"content": "How do we deploy to Kubernetes?",
"timestamp": "2025-12-20T10:00:00",
"metadata": {
"citation": {
"label": "devops",
"folder": "/work",
"timestamp": "2025-12-20T10:00:00"
}
}
}
]

---

## Hierarchical Summarization

**Endpoint:** `POST /api/v1/summarize`

Generates daily, weekly, or monthly summaries using LLM:

**Request:**
{
"conversation_id": "uuid",
"level": "daily"
}


**Levels:**
- `daily`: Last 24 hours of messages
- `weekly`: Combines last 7 daily summaries
- `monthly`: Combines last 4 weekly summaries

**Response:**
{
"conversation_id": "uuid",
"level": "daily",
"summary": "Discussed Kubernetes deployment strategies...",
"generated_at": "2025-12-20T14:00:00Z"
}

---

## Intelligent Pruning

### Dry Run (Preview)

**Endpoint:** `POST /api/v1/prune/dry-run`

Get pruning suggestions without modifying data:

**Request:**
{
"threshold_days": 90
}

**Response:**
{
"suggestions": [
{
"conversation_id": "uuid",
"conversation_label": "Old Project Notes",
"last_accessed": "2025-09-15T10:00:00",
"message_count": 342,
"token_estimate": 68400,
"importance_score": 3.5,
"preview": "Contains outdated project planning...",
"recommendation": "archive"
}
],
"total": 1
}

---

### Execute Pruning

**Endpoint:** `POST /api/v1/prune/execute`

Archive selected conversations:

**Request:**
{
"conversation_ids": ["uuid1", "uuid2"]
}

**Response:** `200 OK`

---

## Label Intelligence

**Endpoint:** `POST /api/v1/labels/suggest`

Get AI-powered label suggestions:

**Request:**
{
"conversation_id": "uuid"
}


**Response:**
{
"conversation_id": "uuid",
"suggestions": [
{
"label": "rust-programming",
"confidence": 0.9,
"is_existing": true,
"reason": "Suggested based on conversation content"
},
{
"label": "async-tokio",
"confidence": 0.6,
"is_existing": false,
"reason": "Suggested based on conversation content"
}
]
}

---

## Scheduling Orchestration Tasks

Use cron or Kubernetes CronJobs to automate:

**Daily Summaries (2 AM):**
0 2 * * * curl -X POST http://localhost:8080/api/v1/summarize
-H "Content-Type: application/json"
-d '{"level":"daily"}' >> /var/log/sekha-summaries.log


**Weekly Summaries (Sunday 2 AM):**
0 2 * * 0 curl -X POST http://localhost:8080/api/v1/summarize
-H "Content-Type: application/json"
-d '{"level":"weekly"}' >> /var/log/sekha-summaries.log


**Pruning Suggestions (3 AM):**
0 3 * * * curl -X POST http://localhost:8080/api/v1/prune/dry-run
-H "Content-Type: application/json"
-d '{"threshold_days":90}' >> /var/log/sekha-pruning.log

---

## Performance Tuning

### Context Assembly
- Default budget: 4000 tokens (~16KB)
- Recommended range: 2000-16000 tokens
- Affects response time: +100ms per 4000 tokens

### Summarization
- Daily: ~2-5 seconds
- Weekly: ~5-10 seconds
- Monthly: ~10-20 seconds

Use background jobs for batch summarization.

### Pruning
- Dry run: ~1-2 seconds per 100 conversations
- Execute: Instant (just status update)

---

## Error Handling

All endpoints return standard error format:
{
"error": "Conversation not found",
"code": 404
}


**Common errors:**
- `400 BAD_REQUEST`: Invalid level in summarize
- `404 NOT_FOUND`: Conversation doesn't exist
- `500 INTERNAL_SERVER_ERROR`: LLM Bridge unavailable

