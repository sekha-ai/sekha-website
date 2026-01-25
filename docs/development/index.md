# Development

Contribute to Sekha development.

## Quick Start

### Prerequisites

- **Rust 1.83+** for Controller
- **Python 3.9+** for LLM Bridge  
- **Docker** for dependencies
- **Git** for version control

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# Start dependencies
docker run -d --name chroma -p 8000:8000 chromadb/chroma
docker run -d --name ollama -p 11434:11434 ollama/ollama

# Install Rust dependencies
cargo build

# Run tests
cargo test

# Start development server
cargo run
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the [Contributing Guide](contributing.md) for:

- Code style guidelines
- Commit message format
- Testing requirements

### 3. Run Tests

```bash
# Unit tests
cargo test --lib

# Integration tests  
cargo test --test '*'

# All tests
cargo test
```

See [Testing Guide](testing.md) for comprehensive testing practices.

### 4. Check Quality

```bash
# Format code
cargo fmt --all

# Lint
cargo clippy --all-targets --all-features -- -D warnings

# Security audit
cargo deny check advisories
```

### 5. Submit PR

- Push to your fork
- Open Pull Request on GitHub
- Wait for CI checks to pass
- Address review feedback

## Repository Structure

### sekha-controller (Rust)

```
sekha-controller/
├── src/
│   ├── api/           # REST API endpoints
│   ├── models/        # Database models
│   ├── services/      # Business logic
│   ├── orchestration/ # Memory orchestration
│   ├── mcp/          # MCP server
│   └── main.rs       # Entry point
├── tests/
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── e2e/          # End-to-end tests
├── migrations/       # DB migrations
└── Cargo.toml
```

### sekha-llm-bridge (Python)

```
sekha-llm-bridge/
├── sekha_llm_bridge/
│   ├── embeddings/   # Embedding generation
│   ├── summarization/ # Summarization
│   └── providers/    # LLM providers
├── tests/
└── requirements.txt
```

## Testing

### Test Coverage

We maintain **85%+ coverage**:

```bash
# Generate coverage report
cargo tarpaulin --out Html

# View report
open tarpaulin-report.html
```

### Test Types

- **Unit Tests** - Pure logic, no external dependencies
- **Integration Tests** - Database + API integration
- **E2E Tests** - Full stack with all services

See [Testing Guide](testing.md) for details.

## Code Quality

### Automated Checks

All PRs must pass:

- ✅ Formatting (`cargo fmt`)
- ✅ Linting (`cargo clippy`)
- ✅ Tests (all tests pass)
- ✅ Coverage (85%+ maintained)
- ✅ Security audit (`cargo deny`)

### CI/CD

GitHub Actions automatically:

- Runs all tests
- Checks code quality
- Builds Docker images
- Publishes releases

## Contributing Areas

### High Priority

- 🔴 **LLM Provider Support** - Add OpenAI, Anthropic, etc.
- 🔴 **Kubernetes Deployment** - Production k8s manifests
- 🟡 **PostgreSQL Support** - Alternative to SQLite
- 🟡 **Performance Optimization** - Query optimization

### Good First Issues

- Documentation improvements
- Test coverage expansion
- Error message clarity
- Example applications

Check [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) for tasks.

## Resources

### Documentation

- [Contributing Guide](contributing.md) - How to contribute
- [Testing Guide](testing.md) - Testing practices
- [Architecture](../architecture/overview.md) - System design

### Community

- [Discord](https://discord.gg/sekha) - Chat with developers
- [GitHub Discussions](https://github.com/sekha-ai/sekha-controller/discussions) - Ask questions
- [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues) - Report bugs

## Next Steps

- [Contributing Guide](contributing.md) - Contribution workflow
- [Testing Guide](testing.md) - Testing standards
- [Architecture](../architecture/overview.md) - System architecture
