# Development

Contribute to Sekha and extend its capabilities.

## Getting Started

### [Contributing Guide](contributing.md)
Learn how to contribute code, documentation, and ideas to Sekha.

### [Building from Source](building.md)
Build Sekha Controller and related components from source code.

### [Testing](testing.md)
Comprehensive testing guide covering unit, integration, and E2E tests.

### [Code Coverage](coverage.md)
Understand coverage requirements and how to improve test coverage.

## Architecture Deep Dives

### [Repository Structure](repositories.md)
Understand the 12-repository ecosystem and how they interact.

### [Adding LLM Providers](llm-providers.md)
Extend Sekha to support new LLM providers beyond Ollama.

## Development Setup

### Prerequisites

- **Rust 1.83+** for controller
- **Python 3.11+** for LLM bridge
- **Node.js 18+** for JS SDK and extensions
- **Docker & Docker Compose** for integration tests

### Quick Setup

```bash
# Clone controller
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# Start dependencies
docker compose -f docker-compose.dev.yml up -d

# Run controller
cargo run

# Run tests
cargo test
```

## Development Workflows

### Feature Development

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Write tests first (TDD)
4. Implement feature
5. Ensure tests pass: `cargo test`
6. Check coverage: `cargo tarpaulin`
7. Submit PR

### Bug Fixes

1. Create issue describing bug
2. Write failing test that reproduces bug
3. Fix the bug
4. Verify test passes
5. Submit PR referencing issue

### Documentation Updates

1. Find page in `docs/` directory
2. Edit Markdown file
3. Preview: `mkdocs serve`
4. Submit PR

## Code Quality Standards

### Rust (Controller)

```bash
# Format code
cargo fmt

# Lint
cargo clippy -- -D warnings

# Security audit
cargo deny check advisories

# Test coverage
cargo tarpaulin --out Html
```

**Requirements:**
- 80%+ test coverage
- Zero clippy warnings
- Formatted with rustfmt

### Python (LLM Bridge)

```bash
# Format
black .

# Lint
ruff check .

# Type check
mypy .

# Test
pytest --cov
```

**Requirements:**
- 80%+ test coverage
- Type hints for all functions
- PEP 8 compliant

### TypeScript (SDKs/Extensions)

```bash
# Format
npm run format

# Lint
npm run lint

# Type check
npm run typecheck

# Test
npm test
```

**Requirements:**
- 80%+ test coverage
- Strict TypeScript mode
- ESLint compliant

## Release Process

1. Update CHANGELOG.md
2. Bump version in Cargo.toml/package.json
3. Tag release: `git tag v0.x.0`
4. Push tag: `git push origin v0.x.0`
5. GitHub Actions builds and publishes

## Community

- **GitHub Discussions**: Design discussions, RFC proposals
- **Discord**: Real-time development chat
- **Issue Tracker**: Bug reports, feature requests

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Axum Docs](https://docs.rs/axum/latest/axum/)
- [SeaORM Guide](https://www.sea-ql.org/SeaORM/)
- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)