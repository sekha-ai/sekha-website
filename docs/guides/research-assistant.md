# Research Assistant with Persistent Memory

## Overview

Build a research assistant that maintains context across months of literature review, connects insights from hundreds of papers, and evolves its understanding over time.

**What You'll Build:**

- Paper annotation and note-taking system
- Cross-paper insight connections
- Research timeline tracking
- Query system for "what did I learn about X?"

**Time:** 20 minutes  
**Prerequisites:** Docker, Python 3.9+

---

## Step 1: Deploy Sekha

```bash
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker
docker compose up -d
```

---

## Step 2: Paper Annotation System

Create `research_assistant.py`:

```python
import requests
from datetime import datetime

BASE_URL = "http://localhost:8080/api/v1"
API_KEY = "dev-key-replace-in-production"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def store_paper(title, authors, abstract, key_findings, notes, tags):
    """Store a research paper with annotations"""
    conversation = {
        "label": f"Paper: {title}",
        "folder": "/research/papers",
        "importance": 8,
        "messages": [
            {
                "role": "user",
                "content": f"""**Title:** {title}
**Authors:** {authors}

**Abstract:**
{abstract}
"""
            },
            {
                "role": "assistant",
                "content": f"""**Key Findings:**
{key_findings}

**My Notes:**
{notes}

**Tags:** {', '.join(tags)}
"""
            }
        ],
        "metadata": {
            "type": "research_paper",
            "authors": authors,
            "date_read": datetime.now().isoformat(),
            "tags": tags
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/conversations",
        headers=HEADERS,
        json=conversation
    )
    
    if response.status_code == 201:
        paper_id = response.json()["id"]
        print(f"✅ Stored: {title}")
        return paper_id
    else:
        print(f"❌ Error: {response.text}")
        return None

# Example: Store a paper
paper_id = store_paper(
    title="Attention Is All You Need",
    authors="Vaswani et al., 2017",
    abstract="""We propose a new simple network architecture,
the Transformer, based solely on attention mechanisms,
dispensing with recurrence and convolutions entirely.""",
    key_findings="""- Self-attention mechanism eliminates need for RNNs
- Parallel processing vs sequential (RNNs/LSTMs)
- Multi-head attention captures different relationships
- Positional encoding preserves sequence information""",
    notes="""Revolutionary paper that changed NLP.
Key insight: attention alone is sufficient.
Led to BERT, GPT, and modern LLMs.

Relevant to my work on context assembly in AI memory systems.""",
    tags=["transformers", "attention", "nlp", "foundational"]
)
```

---

## Step 3: Connect Insights Across Papers

```python
def store_insight_connection(insight, related_papers, synthesis):
    """Connect an insight across multiple papers"""
    conversation = {
        "label": f"Insight: {insight[:50]}",
        "folder": "/research/insights",
        "importance": 9,  # Insights are valuable
        "messages": [
            {
                "role": "user",
                "content": f"I noticed a pattern: {insight}"
            },
            {
                "role": "assistant",
                "content": f"""**Papers Connecting This:**
{chr(10).join([f'- {p}' for p in related_papers])}

**Synthesis:**
{synthesis}
"""
            }
        ],
        "metadata": {
            "type": "insight",
            "related_papers": related_papers
        }
    }
    
    requests.post(f"{BASE_URL}/conversations", headers=HEADERS, json=conversation)
    print(f"✅ Connected insight across {len(related_papers)} papers")

# Example:
store_insight_connection(
    insight="Memory architectures are shifting from parameter-based to retrieval-based",
    related_papers=[
        "Attention Is All You Need (2017)",
        "RETRO: Retrieval-Enhanced Transformer (2021)",
        "MemGPT: Towards LLMs as Operating Systems (2023)"
    ],
    synthesis="""Trend shows movement away from storing knowledge in model weights
toward explicit memory systems that can be updated without retraining.

This validates the Sekha approach of external memory vs in-model knowledge."""
)
```

---

## Step 4: Query Your Research

```python
def ask_research_question(question):
    """Ask a question across all your research"""
    # Semantic search
    response = requests.post(
        f"{BASE_URL}/query",
        headers=HEADERS,
        json={
            "query": question,
            "limit": 10,
            "filters": {"folder": "/research"}
        }
    )
    
    results = response.json()["results"]
    
    print(f"\n❓ Question: {question}")
    print(f"\n📚 Found {len(results)} relevant items:\n")
    
    for r in results:
        print(f"  📄 {r['label']}")
        print(f"     Relevance: {r['relevance_score']:.2%}")
        print(f"     Excerpt: {r['matched_content'][:150]}...\n")
    
    return results

# Example queries:
ask_research_question("What are the key limitations of transformer architectures?")
ask_research_question("Which papers discuss memory-augmented neural networks?")
ask_research_question("What did I learn about attention mechanisms?")
```

---

## Step 5: Literature Review Workflow

### Daily Reading Routine

```python
import arxiv

def process_arxiv_paper(arxiv_id):
    """Download and store ArXiv paper"""
    # Fetch from ArXiv API
    search = arxiv.Search(id_list=[arxiv_id])
    paper = next(search.results())
    
    # Generate summary with LLM
    summary = generate_summary(paper.summary)  # Your LLM call
    
    # Store in Sekha
    store_paper(
        title=paper.title,
        authors=", ".join([a.name for a in paper.authors]),
        abstract=paper.summary,
        key_findings=summary,
        notes="Auto-imported from ArXiv",
        tags=["arxiv", arxiv_id]
    )

# Process today's reading list
for paper_id in ["2301.00234", "2302.05678"]:
    process_arxiv_paper(paper_id)
```

### Monthly Research Review

```python
def monthly_review():
    """Generate monthly research summary"""
    from datetime import datetime, timedelta
    
    month_ago = (datetime.now() - timedelta(days=30)).isoformat()
    
    # Get this month's papers
    response = requests.post(
        f"{BASE_URL}/query",
        headers=HEADERS,
        json={
            "query": "papers read this month",
            "limit": 50,
            "filters": {
                "folder": "/research/papers",
                "since": month_ago
            }
        }
    )
    
    papers = response.json()["results"]
    
    print(f"\n📊 Monthly Research Summary")
    print(f"Papers read: {len(papers)}")
    
    # Group by tags
    tags = {}
    for p in papers:
        for tag in p.get('metadata', {}).get('tags', []):
            tags[tag] = tags.get(tag, 0) + 1
    
    print("\nTop topics:")
    for tag, count in sorted(tags.items(), key=lambda x: -x[1])[:5]:
        print(f"  {tag}: {count} papers")
    
    # Generate summary (use your LLM)
    summary_request = requests.post(
        f"{BASE_URL}/summarize",
        headers=HEADERS,
        json={
            "conversation_ids": [p['conversation_id'] for p in papers],
            "level": "monthly"
        }
    )
    
    print(f"\nSummary:\n{summary_request.json()['summary']}")
```

---

## Step 6: Citation Management

```python
def get_citation(paper_title):
    """Retrieve citation info for a paper"""
    results = ask_research_question(paper_title)
    
    if results:
        paper = results[0]
        metadata = paper.get('metadata', {})
        
        # BibTeX format
        bibtex = f"""@article{{{paper['label'].lower().replace(' ', '_')},
  title={{{paper['label']}}},
  author={{{metadata.get('authors', 'Unknown')}}},
  year={{{metadata.get('date_read', 'Unknown')[:4]}}}
}}"""
        
        print(bibtex)
        return bibtex
    else:
        print("Paper not found in your library")
        return None

# Usage
get_citation("Attention Is All You Need")
```

---

## Step 7: Hypothesis Tracking

```python
def track_hypothesis(hypothesis, evidence_for, evidence_against, status):
    """Track research hypotheses over time"""
    conversation = {
        "label": f"Hypothesis: {hypothesis[:50]}",
        "folder": "/research/hypotheses",
        "importance": 9,
        "messages": [
            {
                "role": "user",
                "content": f"Hypothesis: {hypothesis}"
            },
            {
                "role": "assistant",
                "content": f"""**Evidence For:**
{evidence_for}

**Evidence Against:**
{evidence_against}

**Current Status:** {status}
"""
            }
        ],
        "metadata": {
            "type": "hypothesis",
            "status": status,
            "last_updated": datetime.now().isoformat()
        }
    }
    
    requests.post(f"{BASE_URL}/conversations", headers=HEADERS, json=conversation)

# Example
track_hypothesis(
    hypothesis="External memory systems will outperform parameter-based knowledge storage for LLMs",
    evidence_for="""- RETRO paper shows 25% improvement with retrieval
- MemGPT demonstrates better long-term coherence
- Sekha enables infinite context windows""",
    evidence_against="""- Requires additional infrastructure
- Slower than pure parameter access
- Retrieval quality depends on embeddings""",
    status="Supported, needs more data"
)
```

---

## Advanced Workflows

### Collaborative Research

```python
def share_reading_list(collaborator_email):
    """Export reading list for collaborator"""
    response = requests.post(
        f"{BASE_URL}/export",
        headers=HEADERS,
        json={
            "format": "markdown",
            "filters": {
                "folder": "/research/papers",
                "min_importance": 7
            }
        }
    )
    
    # Email or share the export
    print(f"Exported {response.json()['conversations_exported']} papers")
```

### Grant Proposal Prep

```python
def prepare_grant_lit_review(topic):
    """Pull together literature for grant proposal"""
    results = ask_research_question(topic)
    
    # Get full context
    context_response = requests.post(
        f"{BASE_URL}/context/assemble",
        headers=HEADERS,
        json={
            "query": topic,
            "context_budget": 16000,  # Large context for comprehensive review
            "preferred_labels": [r['label'] for r in results[:5]]
        }
    )
    
    context = context_response.json()["context"]
    
    # Use with LLM to generate literature review section
    print(f"Assembled context from {len(context)} papers")
    print(f"Total tokens: {context_response.json()['total_tokens']}")
```

---

## Real-World Benefits

### After 3 Months of Use:

✅ **200+ papers annotated and searchable**  
✅ **Instant recall of "what did I read about X?"**  
✅ **Cross-paper insights automatically surfaced**  
✅ **Literature reviews generated in minutes**  
✅ **No more losing notes in scattered files**  

### After 1 Year:

✅ **PhD-level knowledge base**  
✅ **Research timeline fully documented**  
✅ **Easy onboarding for new lab members**  
✅ **Grant proposals write themselves from memory**  

---

## Integration with Zotero/Mendeley

```python
import sqlite3

def import_from_zotero(zotero_db_path):
    """Import your existing Zotero library"""
    conn = sqlite3.connect(zotero_db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT title, authors, abstract 
        FROM items 
        WHERE itemType = 'journalArticle'
    """)
    
    for title, authors, abstract in cursor.fetchall():
        store_paper(
            title=title,
            authors=authors,
            abstract=abstract or "No abstract",
            key_findings="Imported from Zotero - add notes",
            notes="",
            tags=["zotero", "imported"]
        )
    
    print(f"Imported {cursor.rowcount} papers from Zotero")
```

---

## Next Steps

- **Obsidian Integration:** Use Sekha with your note-taking
- **Team Research:** Share Sekha instance across lab
- **Publication Pipeline:** Track from idea → paper → publication
- **Teaching:** Use memory for course development

**API Reference:** [REST API](../api-reference/rest-api.md)  
**Python SDK:** [Python SDK](../sdks/python-sdk.md)  

---

*Research never forgets. Build your second brain with Sekha.*
