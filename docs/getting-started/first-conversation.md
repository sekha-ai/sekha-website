# Your First Conversation

Step-by-step tutorial: Store and retrieve your first AI conversation in Sekha.

## Prerequisites

Before starting, ensure:

- ✅ Sekha is running (`curl http://localhost:8080/health` should return `200 OK`)
- ✅ You have your API key (from `~/.sekha/config.toml` or `.env`)
- ✅ Ollama is running with embedding model (`ollama list` should show `nomic-embed-text`)

---

## Step 1: Store a Conversation

Let's store a simple conversation between you and an AI assistant.

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "label": "Weekend Recipe Ideas",
    "folder": "/personal/cooking",
    "importance_score": 7,
    "messages": [
      {
        "role": "user",
        "content": "I need ideas for a vegetarian dinner party this weekend"
      },
      {
        "role": "assistant",
        "content": "Great choice! Here are three impressive vegetarian dishes: 1) Mushroom Wellington with herb crust, 2) Eggplant Parmigiana with fresh basil, 3) Thai Green Curry with tofu and vegetables. All are crowd-pleasers and can be prepared ahead."
      },
      {
        "role": "user",
        "content": "The mushroom wellington sounds perfect! What sides would you recommend?"
      },
      {
        "role": "assistant",
        "content": "Excellent! Pair it with roasted garlic mashed potatoes, honey-glazed carrots, and a fresh arugula salad with lemon vinaigrette. For an elegant touch, add some sautéed green beans with almonds."
      }
    ]
  }'
```

### Response

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "conversation_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "label": "Weekend Recipe Ideas",
  "folder": "/personal/cooking",
  "status": "active",
  "importance_score": 7,
  "message_count": 4,
  "word_count": 142,
  "session_count": 1,
  "created_at": "2026-01-25T14:30:00Z",
  "updated_at": "2026-01-25T14:30:00Z"
}
```

!!! success "Conversation Stored!"
    
    Your conversation is now permanently stored in Sekha's memory.
    
    - **ID:** `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d` (save this!)
    - **Embedded:** Yes (semantic search enabled)
    - **Organized:** Filed in `/personal/cooking`

---

## Step 2: Search Semantically

Now let's search for this conversation using natural language.

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "What vegetarian dishes did I discuss recently?",
    "limit": 3
  }'
```

### Response

```json
{
  "results": [
    {
      "conversation_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "label": "Weekend Recipe Ideas",
      "folder": "/personal/cooking",
      "similarity_score": 0.92,
      "importance_score": 7,
      "messages": [
        {
          "role": "assistant",
          "content": "Great choice! Here are three impressive vegetarian dishes...",
          "timestamp": "2026-01-25T14:30:15Z"
        }
      ],
      "created_at": "2026-01-25T14:30:00Z"
    }
  ],
  "query_time_ms": 45,
  "total_results": 1
}
```

!!! tip "Semantic Magic"
    
    Notice how Sekha found your conversation even though:
    
    - You asked about "vegetarian dishes"
    - The conversation mentioned "mushroom wellington", "eggplant parmigiana", etc.
    - No exact keyword match was needed
    
    This is **semantic search** - Sekha understands meaning, not just words!

---

## Step 3: Full-Text Search

For keyword-based searches, use full-text search:

```bash
curl -X POST http://localhost:8080/api/v1/search/fts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "mushroom wellington",
    "limit": 5
  }'
```

This finds conversations containing the exact phrase "mushroom wellington".

---

## Step 4: Retrieve Full Conversation

Get all details of a specific conversation:

```bash
CONV_ID="a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"

curl -X GET "http://localhost:8080/api/v1/conversations/${CONV_ID}" \
  -H "Authorization: Bearer dev-key-replace-in-production"
```

### Response

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "label": "Weekend Recipe Ideas",
  "folder": "/personal/cooking",
  "status": "active",
  "importance_score": 7,
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "I need ideas for a vegetarian dinner party this weekend",
      "timestamp": "2026-01-25T14:30:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Great choice! Here are three impressive vegetarian dishes...",
      "timestamp": "2026-01-25T14:30:15Z"
    },
    {
      "id": "msg-3",
      "role": "user",
      "content": "The mushroom wellington sounds perfect! What sides would you recommend?",
      "timestamp": "2026-01-25T14:30:30Z"
    },
    {
      "id": "msg-4",
      "role": "assistant",
      "content": "Excellent! Pair it with roasted garlic mashed potatoes...",
      "timestamp": "2026-01-25T14:30:45Z"
    }
  ],
  "created_at": "2026-01-25T14:30:00Z",
  "updated_at": "2026-01-25T14:30:00Z"
}
```

---

## Step 5: Update Labels and Organization

After the dinner party, let's reorganize:

```bash
CONV_ID="a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"

curl -X PUT "http://localhost:8080/api/v1/conversations/${CONV_ID}/label" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "label": "Successful Dinner Party - Jan 2026",
    "folder": "/personal/cooking/completed"
  }'
```

### Boost Importance

If the recipe was a hit, mark it as important:

```bash
curl -X PUT "http://localhost:8080/api/v1/conversations/${CONV_ID}/importance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{"importance_score": 9}'
```

---

## Step 6: Add More Messages

Continue the conversation later:

```bash
curl -X POST "http://localhost:8080/api/v1/conversations/${CONV_ID}/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "The dinner party was a huge success! Everyone loved the mushroom wellington. Can you help me plan dessert for next time?"
      }
    ]
  }'
```

---

## Step 7: Context Assembly

When planning your next dinner party, get relevant context:

```bash
curl -X POST http://localhost:8080/api/v1/context/assemble \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-key-replace-in-production" \
  -d '{
    "query": "Plan another vegetarian dinner party",
    "preferred_labels": ["Successful Dinner Party"],
    "context_budget": 4000
  }'
```

### Response

```json
{
  "context": "Previous successful dinner party (Jan 2026): Mushroom Wellington with roasted garlic mashed potatoes, honey-glazed carrots, arugula salad, and sautéed green beans. Guests loved it!",
  "conversations_used": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "label": "Successful Dinner Party - Jan 2026",
      "relevance_score": 0.95
    }
  ],
  "token_count": 342,
  "assembly_strategy": "semantic + recency + importance"
}
```

!!! success "Perfect Context!"
    
    Sekha automatically:
    
    1. Found your most relevant past conversation
    2. Extracted key details (menu, success notes)
    3. Assembled context under your token budget
    4. Ranked by semantic relevance + importance

---

## Step 8: Archive When Done

After some time, archive completed conversations:

```bash
curl -X PUT "http://localhost:8080/api/v1/conversations/${CONV_ID}/archive" \
  -H "Authorization: Bearer dev-key-replace-in-production"
```

Archived conversations:

- ✅ Still searchable
- ✅ Still retrievable
- ✅ Excluded from default queries (unless explicitly included)
- ✅ Available for historical reference

---

## Real-World Workflow Example

Here's how you might use Sekha in practice:

### 1. **During AI Chat Session**

```python
import requests

# After each AI interaction
def save_to_sekha(messages, label, folder):
    response = requests.post(
        "http://localhost:8080/api/v1/conversations",
        headers={
            "Authorization": "Bearer your-api-key",
            "Content-Type": "application/json"
        },
        json={
            "label": label,
            "folder": folder,
            "messages": messages
        }
    )
    return response.json()["id"]

conv_id = save_to_sekha(
    messages=[
        {"role": "user", "content": "Debug this error..."},
        {"role": "assistant", "content": "The issue is..."}
    ],
    label="Debug Session - API Error",
    folder="/work/debugging"
)
```

### 2. **Before Starting New Task**

```python
def get_relevant_context(task_description):
    response = requests.post(
        "http://localhost:8080/api/v1/context/assemble",
        headers={
            "Authorization": "Bearer your-api-key",
            "Content-Type": "application/json"
        },
        json={
            "query": task_description,
            "context_budget": 8000
        }
    )
    return response.json()["context"]

# Get context about similar past work
context = get_relevant_context("Fix authentication bug in API")

# Include in your LLM prompt
prompt = f"""
Relevant past experience:
{context}

Current task:
Fix authentication bug in API...
"""
```

### 3. **Weekly Review**

```python
def weekly_summary():
    # Get label suggestions for unorganized conversations
    response = requests.post(
        "http://localhost:8080/api/v1/labels/suggest",
        headers={"Authorization": "Bearer your-api-key"},
        json={"conversation_id": conv_id}
    )
    
    # Get pruning recommendations
    prune = requests.post(
        "http://localhost:8080/api/v1/prune/dry-run",
        headers={"Authorization": "Bearer your-api-key"},
        json={"threshold_days": 30, "importance_threshold": 3}
    )
```

---

## Next Steps

**Explore the full API:**  
→ [REST API Reference](../api-reference/rest-api.md)

**Integrate with Claude:**  
→ [Claude Desktop MCP](../integrations/claude-desktop.md)

**Learn organization strategies:**  
→ [Memory Organization Guide](../guides/organizing-memory.md)

**Deploy to production:**  
→ [Docker Compose Deployment](../deployment/docker-compose.md)

---

!!! quote "Key Takeaways"

    1. **Store everything** - Conversations are cheap to store, expensive to recreate
    2. **Use folders** - Organize from day one (`/work/project`, `/personal/learning`)
    3. **Tag with importance** - Score 1-10, helps with context assembly
    4. **Semantic search is powerful** - Don't rely on exact keywords
    5. **Context assembly is magic** - Let Sekha build perfect LLM context