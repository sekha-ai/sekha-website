# Architecture

Understand how Sekha Controller is designed and how its components work together.

## Overview

Sekha is built as a **modular, production-ready memory system** for AI applications.

**Key Documents:**

- [**System Overview**](overview.md) - High-level architecture and components
- [**Memory Orchestration**](memory-orchestration.md) - How memory is managed and optimized

## System Design

### Core Components

**Sekha Controller** (Rust)
- REST API server
- Database management (SQLite/PostgreSQL)
- Vector store integration (ChromaDB)
- Memory orchestration engine
- Health monitoring and metrics

**LLM Bridge** (Python)
- LLM provider abstraction
- Embedding generation
- Summarization
- Label suggestions

**Storage Layer**
- **SQLite** - Primary database (single-user)
- **PostgreSQL** - Multi-user deployments (planned Q2 2026)
- **ChromaDB** - Vector embeddings for semantic search

### Data Flow

```
Client Request
      ↓
  REST API (Rust)
      ↓
  Controller Logic
      │
      ├────────────────────────▶ SQLite (metadata)
      │
      ├────────────────────────▶ ChromaDB (vectors)
      │
      └────────────────────────▶ LLM Bridge (Python)
                               │
                               └───▶ Ollama/OpenAI/etc
```

## Design Principles

### 1. Production-First
- Type-safe Rust core
- Comprehensive error handling
- Graceful degradation
- Health checks and monitoring

### 2. LLM Agnostic
- Provider abstraction layer
- Pluggable LLM backends
- Supports Ollama, OpenAI, Anthropic, Google

### 3. Scalable
- Async I/O (Tokio)
- Connection pooling
- Efficient memory usage
- Horizontal scaling ready

### 4. Privacy-Focused
- Self-hosted by default
- Local embeddings (Ollama)
- No telemetry
- Air-gap capable

## Performance Characteristics

| Operation | Latency (P95) | Throughput |
|-----------|---------------|------------|
| Create conversation | <50ms | 1,000/sec |
| Search (semantic) | <100ms | 500/sec |
| Get by ID | <10ms | 5,000/sec |
| Update metadata | <30ms | 2,000/sec |
| Context assembly | <200ms | 200/sec |

*Benchmarked on: 4-core CPU, 8GB RAM, SSD*

## Technology Stack

### Controller (Rust)
- **Axum** - HTTP framework
- **SQLx** - Database driver
- **Tokio** - Async runtime
- **Serde** - Serialization
- **Tracing** - Structured logging

### LLM Bridge (Python)
- **FastAPI** - API framework
- **LangChain** - LLM abstractions
- **ChromaDB** - Vector client
- **Ollama** - Local LLM runtime

### Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Codecov** - Coverage tracking
- **Docker Hub** - Image registry

## Security Model

### Authentication
- Bearer token (API key)
- Configurable token length (min 32 chars)
- No built-in user management (use reverse proxy)

### Network Security
- TLS/HTTPS support
- CORS configuration
- Rate limiting
- Request size limits

### Data Security
- SQLite WAL mode (ACID guarantees)
- Connection encryption (PostgreSQL)
- No data sent to external services (local LLMs)

## Next Steps

- [**System Overview**](overview.md) - Detailed component breakdown
- [**Memory Orchestration**](memory-orchestration.md) - How memory management works
- [**Deployment Guide**](../deployment/index.md) - Production deployment
- [**Performance Benchmarks**](../reference/benchmarks.md) - Detailed performance data
