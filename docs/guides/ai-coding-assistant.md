# AI Coding Assistant with Memory

## Overview

Build a coding assistant that remembers your entire codebase evolution, architectural decisions, and coding patterns across months of development.

**What You'll Build:**

- Persistent coding companion that remembers your project
- Context-aware code suggestions
- Architectural decision tracking
- Bug fix history and patterns

**Time:** 15 minutes  
**Prerequisites:** Docker, Python 3.9+

---

## Step 1: Deploy Sekha

```bash
# Clone and start
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker
docker compose up -d

# Verify
curl http://localhost:8080/health
```

---

## Step 2: Create Your Coding Session Script

Create `coding_assistant.py`:

```python
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8080/api/v1"
API_KEY = "dev-key-replace-in-production"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def store_coding_session(file_path, changes, reasoning, context=""):
    """Store a coding session in memory"""
    conversation = {
        "label": f"Code: {file_path}",
        "folder": "/work/codebase",
        "importance": 7,  # Higher for architectural changes
        "messages": [
            {
                "role": "user",
                "content": f"Working on {file_path}\n\n{context}"
            },
            {
                "role": "assistant",
                "content": f"Changes made:\n{changes}\n\nReasoning:\n{reasoning}"
            }
        ],
        "metadata": {
            "file": file_path,
            "timestamp": datetime.now().isoformat(),
            "type": "code_change"
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/conversations",
        headers=HEADERS,
        json=conversation
    )
    
    if response.status_code == 201:
        print(f"✅ Stored coding session for {file_path}")
        return response.json()["id"]
    else:
        print(f"❌ Error: {response.text}")
        return None

def query_code_history(query):
    """Search past coding sessions"""
    response = requests.post(
        f"{BASE_URL}/query",
        headers=HEADERS,
        json={
            "query": query,
            "limit": 5,
            "filters": {"folder": "/work/codebase"}
        }
    )
    
    if response.status_code == 200:
        results = response.json()["results"]
        print(f"\n🔍 Found {len(results)} relevant sessions:\n")
        for r in results:
            print(f"  📄 {r['label']}")
            print(f"     Score: {r['relevance_score']:.2f}")
            print(f"     Snippet: {r['matched_content'][:100]}...\n")
        return results
    else:
        print(f"❌ Error: {response.text}")
        return []

def get_context_for_new_feature(feature_description):
    """Get relevant context for implementing a new feature"""
    response = requests.post(
        f"{BASE_URL}/context/assemble",
        headers=HEADERS,
        json={
            "query": feature_description,
            "context_budget": 4000,
            "recency_weight": 0.2,
            "relevance_weight": 0.6,
            "importance_weight": 0.2
        }
    )
    
    if response.status_code == 200:
        context = response.json()
        print(f"\n🧠 Assembled context from {context['conversations_included']} sessions")
        print(f"   Tokens used: {context['total_tokens']}/{context['context_budget']}")
        return context["context"]
    else:
        print(f"❌ Error: {response.text}")
        return []

# Example usage
if __name__ == "__main__":
    # Store a coding session
    session_id = store_coding_session(
        file_path="src/api/auth.rs",
        changes="""- Added JWT token validation
- Implemented refresh token rotation
- Added rate limiting (100 req/min)""",
        reasoning="""Security hardening based on OWASP recommendations.
Refresh token rotation prevents token theft.
Rate limiting prevents brute force attacks.""",
        context="Implementing OAuth 2.0 authentication"
    )
    
    # Query past work
    print("\n" + "="*60)
    query_code_history("authentication security patterns")
    
    # Get context for new feature
    print("\n" + "="*60)
    context = get_context_for_new_feature(
        "Add two-factor authentication using TOTP"
    )
```

---

## Step 3: Run It

```bash
python coding_assistant.py
```

**Output:**

```
✅ Stored coding session for src/api/auth.rs

============================================================
🔍 Found 0 relevant sessions:

============================================================
🧠 Assembled context from 1 sessions
   Tokens used: 250/4000
```

---

## Step 4: Build a Richer Assistant

### Track Architectural Decisions

```python
def store_architecture_decision(decision, rationale, alternatives):
    """Store ADR (Architecture Decision Record)"""
    conversation = {
        "label": f"ADR: {decision}",
        "folder": "/work/architecture",
        "importance": 10,  # Pin architectural decisions
        "messages": [
            {
                "role": "user",
                "content": f"Should we: {decision}?"
            },
            {
                "role": "assistant",
                "content": f"""**Decision:** {decision}

**Rationale:**
{rationale}

**Alternatives Considered:**
{alternatives}

**Status:** Accepted
"""
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/conversations",
        headers=HEADERS,
        json=conversation
    )
    return response.json()["id"]

# Example:
store_architecture_decision(
    decision="Use Rust for the API layer",
    rationale="""- Memory safety without GC
- Sub-millisecond latency requirements
- Strong type system prevents bugs
- WebAssembly compilation for client SDKs""",
    alternatives="""- Go: Good performance but GC pauses
- C++: Fast but memory unsafe
- Python: Too slow for our use case"""
)
```

### Track Bug Fixes

```python
def store_bug_fix(bug_description, root_cause, fix, prevention):
    """Remember bugs so you don't repeat them"""
    conversation = {
        "label": f"Bug Fix: {bug_description[:50]}",
        "folder": "/work/bugs",
        "importance": 8,
        "messages": [
            {"role": "user", "content": f"Bug: {bug_description}"},
            {
                "role": "assistant",
                "content": f"""**Root Cause:**
{root_cause}

**Fix Applied:**
{fix}

**Prevention:**
{prevention}
"""
            }
        ],
        "metadata": {"type": "bug_fix"}
    }
    
    requests.post(f"{BASE_URL}/conversations", headers=HEADERS, json=conversation)

# Example:
store_bug_fix(
    bug_description="Race condition in token refresh",
    root_cause="Two simultaneous requests refreshing the same token",
    fix="Added distributed lock using Redis",
    prevention="Always use locks for shared mutable state"
)
```

---

## Step 5: Integrate with Your LLM

Now use Sekha's context with any LLM:

```python
import openai

def ask_coding_question(question):
    # Get relevant context from Sekha
    context_response = requests.post(
        f"{BASE_URL}/context/assemble",
        headers=HEADERS,
        json={"query": question, "context_budget": 8000}
    )
    context = context_response.json()["context"]
    
    # Build prompt with context
    system_prompt = "You are an expert coding assistant with memory of this project."
    
    context_text = "\n\n".join([
        f"Previous work on {c['label']}:\n" +
        "\n".join([m['content'] for m in c['messages']])
        for c in context
    ])
    
    # Call your LLM (OpenAI example)
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"Context:\n{context_text}"},
            {"role": "user", "content": question}
        ]
    )
    
    answer = response.choices[0].message.content
    
    # Store this conversation in Sekha
    store_coding_session(
        file_path="assistant_query",
        changes=answer,
        reasoning=question,
        context="AI assistant query"
    )
    
    return answer

# Usage
answer = ask_coding_question(
    "How should I implement password reset given our auth architecture?"
)
print(answer)
```

---

## Real-World Workflows

### Morning Standup Prep

```python
def morning_standup():
    """What did I work on yesterday?"""
    from datetime import datetime, timedelta
    
    yesterday = (datetime.now() - timedelta(days=1)).isoformat()
    
    response = requests.post(
        f"{BASE_URL}/query",
        headers=HEADERS,
        json={
            "query": "code changes from yesterday",
            "limit": 10,
            "filters": {"since": yesterday}
        }
    )
    
    print("📅 Yesterday's Work:\n")
    for result in response.json()["results"]:
        print(f"  • {result['label']}")
```

### Code Review Preparation

```python
def prepare_code_review(pr_files):
    """Get context for reviewing a PR"""
    for file in pr_files:
        context = query_code_history(f"previous changes to {file}")
        print(f"\n📄 {file}:")
        print("  Previous work:")
        for c in context:
            print(f"    - {c['label']}: {c['matched_content'][:80]}")
```

### Onboarding New Team Members

```python
def export_project_knowledge():
    """Export all architectural decisions and key code sessions"""
    response = requests.post(
        f"{BASE_URL}/export",
        headers=HEADERS,
        json={
            "format": "markdown",
            "filters": {
                "folder": "/work/architecture",
                "min_importance": 8
            }
        }
    )
    # Share with new team member
```

---

## Advanced: VS Code Integration

Connect to VS Code for inline memory:

```python
# Save as .vscode/sekha_extension.py
import subprocess
import json

def on_file_save(file_path, git_diff):
    """Automatically store file changes"""
    # Get git diff
    diff = subprocess.check_output(["git", "diff", file_path]).decode()
    
    # Get commit message (or ask user)
    commit_msg = input("What did you change? ")
    
    # Store in Sekha
    store_coding_session(
        file_path=file_path,
        changes=diff,
        reasoning=commit_msg,
        context="Auto-saved from VS Code"
    )
```

---

## Benefits After 1 Month

✅ **Never forget why you made a decision**  
✅ **Instantly recall similar bugs**  
✅ **Onboard new team members 10x faster**  
✅ **Code reviews reference past discussions**  
✅ **AI assistant understands your full context**  

---

## Next Steps

- **Scale Up:** Use this for multi-repository projects
- **Team Memory:** Share Sekha instance across team
- **CI/CD:** Auto-store deployment decisions
- **Documentation:** Export to wiki/docs

**Full SDK Documentation:** [Python SDK](../sdks/python-sdk.md)  
**API Reference:** [REST API](../api-reference/rest-api.md)  

---

*Example code: [github.com/sekha-ai/examples](https://github.com/sekha-ai/examples)*
