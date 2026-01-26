# Quickstart

Get Sekha running in under 5 minutes.

## Prerequisites

- **Docker** 24.0+ with Docker Compose 2.20+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Ollama** installed and running ([ollama.com](https://ollama.com))
- **8GB RAM** minimum (16GB recommended)
- **20GB free disk space**

## Step 1: Install Ollama & Models

```bash
# Install Ollama (if not already installed)
# macOS:
brew install ollama

# Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Windows:
# Download from ollama.com

# Start Ollama
ollama serve

# In a new terminal, pull required models
ollama pull nomic-embed-text    # For embeddings
ollama pull llama3.1:8b          # For summarization
```

## Step 2: Deploy Sekha

```bash
# Clone deployment repository
git clone https://github.com/sekha-ai/sekha-docker.git
cd sekha-docker/docker

# Copy environment template
cp .env.example .env

# Generate secure API keys (Linux/macOS)
export MCP_KEY=$(openssl rand -base64 32)
export REST_KEY=$(openssl rand -base64 32)
echo "MCP_API_KEY=$MCP_KEY" >> .env
echo "REST_API_KEY=$REST_KEY" >> .env

# Or edit .env manually and set:
# MCP_API_KEY=your-secure-key-minimum-32-characters
# REST_API_KEY=your-secure-key-minimum-32-characters

# Start base services (Chroma + Redis)
docker compose up -d

# Start full stack (Controller + LLM Bridge)
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d

# Wait ~30 seconds for initialization
sleep 30
```

## Step 3: Verify Installation

```bash
# Check controller health
curl http://localhost:8080/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T21:00:00Z",
  "checks": {
    "database": {"status": "ok"},
    "chroma": {"status": "ok"}
  }
}
```

**Verify all services:**

```bash
# ChromaDB
curl http://localhost:8000/api/v1/heartbeat
# Expected: {"nanosecond heartbeat": 1234567890}

# LLM Bridge
curl http://localhost:5001/health
# Expected: {"status": "healthy"}

# Ollama (on host)
curl http://localhost:11434/api/version
# Expected: {"version": "0.x.x"}
```

## Step 4: Store Your First Conversation

```bash
# Set your API key (from .env file)
export SEKHA_KEY="your-mcp-api-key-from-env-file"

# Create a conversation
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEKHA_KEY" \
  -d '{
    "label": "My First Conversation",
    "folder": "/quickstart",
    "messages": [
      {
        "role": "user",
        "content": "What is Sekha?"
      },
      {
        "role": "assistant",
        "content": "Sekha is a universal memory system for AI that never forgets. It stores, indexes, and retrieves conversations with semantic search, giving AI agents persistent memory across sessions."
      },
      {
        "role": "user",
        "content": "How does the semantic search work?"
      },
      {
        "role": "assistant",
        "content": "Sekha uses nomic-embed-text to convert messages into 768-dimensional embeddings, stores them in ChromaDB for fast similarity search, and can retrieve relevant context based on meaning rather than just keywords."
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "My First Conversation",
  "folder": "/quickstart",
  "status": "active",
  "message_count": 4,
  "created_at": "2026-01-25T21:00:00Z",
  "updated_at": "2026-01-25T21:00:00Z"
}
```

## Step 5: Search Your Memory

```bash
# Search semantically
curl -X POST http://localhost:8080/api/v1/memory/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEKHA_KEY" \
  -d '{
    "query": "How does vector search work in Sekha?",
    "limit": 5
  }'
```

**Response:**
```json
{
  "results": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "message_id": "msg-456",
      "role": "assistant",
      "content": "Sekha uses nomic-embed-text to convert messages into 768-dimensional embeddings...",
      "similarity_score": 0.89,
      "timestamp": "2026-01-25T21:00:00Z",
      "metadata": {
        "label": "My First Conversation",
        "folder": "/quickstart"
      }
    }
  ],
  "query_embedding_time_ms": 45,
  "search_time_ms": 12,
  "total_time_ms": 57
}
```

## Step 6: Assemble Context for LLM

```bash
# Get intelligent context assembly
curl -X POST http://localhost:8080/api/v1/context/assemble \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEKHA_KEY" \
  -d '{
    "query": "Tell me about Sekha\'s architecture",
    "context_budget": 2000,
    "include_metadata": true
  }'
```

**Response:**
```json
{
  "context": "# Relevant Conversations\n\n## My First Conversation (/quickstart)\n\nUser: What is Sekha?\nAssistant: Sekha is a universal memory system for AI that never forgets...\n\nUser: How does the semantic search work?\nAssistant: Sekha uses nomic-embed-text to convert messages into 768-dimensional embeddings...",
  "token_count": 156,
  "sources": [
    {
      "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
      "label": "My First Conversation",
      "relevance_score": 0.89
    }
  ],
  "assembly_time_ms": 78
}
```

## What Just Happened?

### 1. Message Storage
- Messages saved to **SQLite** (metadata)
- Full-text indexed for keyword search

### 2. Embedding Generation
- Each message sent to **LLM Bridge**
- Converted to 768-dim vector via **nomic-embed-text** model
- Asynchronous processing via Celery + Redis

### 3. Vector Indexing
- Embeddings stored in **ChromaDB**
- Indexed for fast cosine similarity search

### 4. Semantic Retrieval
- Query embedded with same model
- ChromaDB returns top-k similar messages
- Ranked by relevance score

### 5. Context Assembly
- Relevant messages retrieved
- Formatted for LLM consumption
- Fits within token budget

---

## Next Steps

### Learn More

<div class="grid cards" markdown>

-   [:material-book-open: **First Conversation**](first-conversation.md)
    
    Detailed walkthrough of conversation lifecycle

-   [:material-cog: **Configuration**](configuration.md)
    
    Customize Sekha settings

-   [:material-api: **API Reference**](../api-reference/rest-api.md)
    
    Explore all 19 REST endpoints

-   [:material-toolbox: **MCP Tools**](../api-reference/mcp-tools.md)
    
    Use Sekha from Claude Desktop

</div>

### Integrate

<div class="grid cards" markdown>

-   [:simple-claude: **Claude Desktop**](../integrations/claude-desktop.md)
    
    MCP integration setup

-   [:simple-visualstudiocode: **VS Code**](../integrations/vscode.md)
    
    Code with persistent memory

-   [:simple-python: **Python SDK**](../sdks/python-sdk.md)
    
    Build with Python

-   [:simple-typescript: **JavaScript SDK**](../sdks/javascript-sdk.md)
    
    Build with TypeScript

</div>

---

## Troubleshooting

### Services Won't Start

```bash
# Check all container status
docker compose ps

# View logs
docker compose logs -f

# Restart everything
docker compose down
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d
```

### Health Check Fails

```bash
# Test each service individually

# Controller
curl http://localhost:8080/health
docker compose logs controller

# ChromaDB
curl http://localhost:8000/api/v1/heartbeat
docker compose logs chroma

# LLM Bridge
curl http://localhost:5001/health
docker compose logs llm-bridge

# Redis
docker compose exec redis redis-cli ping
docker compose logs redis
```

### Ollama Not Accessible

**macOS/Windows:**
```bash
# Verify Ollama is running on host
curl http://localhost:11434/api/version

# Check .env uses host.docker.internal
cat .env | grep OLLAMA
# Should show: OLLAMA_URL=http://host.docker.internal:11434
```

**Linux:**
```bash
# Get Docker bridge IP
ip addr show docker0
# Usually 172.17.0.1

# Update .env
OLLAMA_URL=http://172.17.0.1:11434

# Restart services
docker compose restart controller llm-bridge
```

### API Returns 401 Unauthorized

```bash
# Check your API key
cat .env | grep MCP_API_KEY

# Make sure you're using the same key in Authorization header
export SEKHA_KEY="paste-your-mcp-api-key-here"

# Test with key
curl -H "Authorization: Bearer $SEKHA_KEY" http://localhost:8080/health
```

### Missing Ollama Models

```bash
# List installed models
ollama list

# Pull required models
ollama pull nomic-embed-text
ollama pull llama3.1:8b

# Verify they loaded
ollama list
# Should show:
# nomic-embed-text:latest
# llama3.1:8b
```

### Embeddings Not Being Generated

```bash
# Check LLM Bridge can reach Ollama
docker compose exec llm-bridge curl http://host.docker.internal:11434/api/version

# Check Celery worker logs
docker compose logs llm-bridge | grep -i celery

# Check Redis connection
docker compose exec llm-bridge python -c "import redis; r=redis.Redis(host='redis'); print(r.ping())"
```

See [Common Issues](../troubleshooting/common-issues.md) for more help.

---

## What's Running?

```bash
# Check all services
docker compose ps

# Should show:
# NAME                 IMAGE                              STATUS
# chroma               chromadb/chroma:latest             Up (healthy)
# redis                redis:7.4-alpine                   Up (healthy)
# controller           ghcr.io/sekha-ai/sekha-controller  Up (healthy)
# llm-bridge           ghcr.io/sekha-ai/sekha-mcp         Up (healthy)
```

**Ports in use:**
- `8080` - Sekha Controller (REST API + MCP)
- `5001` - LLM Bridge (internal)
- `8000` - ChromaDB (internal)
- `6379` - Redis (internal)
- `11434` - Ollama (on host)

---

*Ready to build something amazing? Sekha gives your AI a memory that never forgets.*
