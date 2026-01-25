# System Overview

A deep dive into Sekha's architecture.

## System Architecture

```mermaid
graph TB
    subgraph Client Layer
        CLI[CLI Tool]
        SDK[SDKs]
        MCP[MCP Clients]
    end
    
    subgraph Controller
        API[REST API Server]
        Orch[Memory Orchestrator]
        MCP_S[MCP Server]
    end
    
    subgraph Storage
        SQLite[(SQLite DB)]
        Chroma[(ChromaDB)]
    end
    
    subgraph LLM
        Bridge[LLM Bridge]
        Ollama[Ollama/OpenAI]
    end
    
    CLI --> API
    SDK --> API
    MCP --> MCP_S
    
    API --> Orch
    MCP_S --> Orch
    
    Orch --> SQLite
    Orch --> Chroma
    Orch --> Bridge
    
    Bridge --> Ollama
```

## Core Components

### Controller (Rust)

The heart of Sekha, written in Rust for performance and reliability.

**Responsibilities:**
- REST API server (Axum framework)
- Request routing and validation
- Business logic orchestration
- Database operations (SeaORM)
- MCP protocol server
- Rate limiting and auth

**Key Features:**
- Sub-100ms query latency
- 1000+ requests/second throughput
- Memory-safe concurrency
- Zero-copy operations
- Async I/O throughout

**Technology Stack:**
- [Axum](https://github.com/tokio-rs/axum) - Web framework
- [SeaORM](https://www.sea-ql.org/SeaORM/) - Database ORM
- [Tokio](https://tokio.rs/) - Async runtime
- [Tower](https://github.com/tower-rs/tower) - Middleware

### LLM Bridge (Python)

Handles all LLM-related operations in a separate service.

**Responsibilities:**
- Embedding generation
- Conversation summarization
- Label suggestions
- Provider abstraction
- Async job queue

**Supported Providers:**
- **Ollama** - Local models (default)
- **OpenAI** - GPT-4, text-embedding-ada-002 (coming soon)
- **Anthropic** - Claude models (coming soon)
- **Google** - Gemini (planned)

**Technology Stack:**
- FastAPI - HTTP server
- LangChain - LLM orchestration
- Pydantic - Data validation
- AsyncIO - Concurrent processing

### Storage Layer

Dual storage approach for optimal performance.

**SQLite - Structured Data:**
- Conversations and metadata
- User preferences
- Labels and folders
- System configuration
- Transaction support

**Why SQLite:**
- Zero-config embedded database
- ACID transactions
- Excellent single-server performance
- File-based (easy backups)
- PostgreSQL migration path

**ChromaDB - Vector Embeddings:**
- Message embeddings (768-dim)
- Semantic search index
- Similarity calculations
- Metadata filtering

**Why ChromaDB:**
- Built for embeddings
- Fast cosine similarity
- Metadata support
- Docker-ready
- Open source

## Data Flow

### 1. Store Conversation

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Controller
    participant DB
    participant LLM
    participant Chroma
    
    Client->>API: POST /conversations
    API->>Controller: Validate & route
    Controller->>DB: Store messages
    DB-->>Controller: Conversation ID
    Controller->>LLM: Generate embeddings
    LLM-->>Controller: Embedding vectors
    Controller->>Chroma: Store vectors
    Chroma-->>Controller: Success
    Controller-->>Client: 201 Created
```

### 2. Semantic Query

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Controller
    participant LLM
    participant Chroma
    participant DB
    
    Client->>API: POST /query
    API->>Controller: Process query
    Controller->>LLM: Embed query
    LLM-->>Controller: Query vector
    Controller->>Chroma: Similarity search
    Chroma-->>Controller: Vector IDs + scores
    Controller->>DB: Fetch messages
    DB-->>Controller: Message data
    Controller-->>Client: Ranked results
```

### 3. Context Assembly

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Chroma
    participant DB
    
    Client->>Controller: Request context
    Controller->>Chroma: Semantic search
    Chroma-->>Controller: Relevant IDs
    Controller->>DB: Fetch full messages
    DB-->>Controller: Messages + metadata
    Controller->>Controller: Score & rank
    Controller->>Controller: Budget allocation
    Controller->>Controller: Assemble context
    Controller-->>Client: Optimized context
```

## Memory Orchestration

The intelligence behind Sekha's memory system.

[**Memory Orchestration Details →**](memory-orchestration.md)

**Key Algorithms:**

1. **Relevance Scoring**
   - Semantic similarity (embedding distance)
   - Recency decay (time-based weighting)
   - Importance boost (user-defined scores)
   - Folder filtering (context isolation)

2. **Context Budgeting**
   - Token counting (accurate estimation)
   - Priority queue (importance-ordered)
   - Greedy packing (maximize utility)
   - Summary fallback (compression)

3. **Deduplication**
   - Content hashing (exact duplicates)
   - Fuzzy matching (similar messages)
   - Temporal clustering (conversation flow)

## Scaling Architecture

### Current (Single Server)

Optimized for:
- Individual users
- Small teams (<10 people)
- Development environments
- Edge deployments

**Capacity:**
- 100,000+ conversations
- 1,000,000+ messages
- 100 queries/second
- 2-4GB RAM

### Future (Distributed)

Planned for Q2-Q3 2026:

- PostgreSQL for multi-user
- Redis for caching
- Load balancer for horizontal scaling
- Distributed ChromaDB
- Message queue (RabbitMQ/Kafka)

## Next Steps

- [Memory Orchestration](memory-orchestration.md) - Detailed algorithms
- [Deployment](../deployment/docker-compose.md) - Deploy the stack
- [API Reference](../api-reference/rest-api.md) - Use the API
