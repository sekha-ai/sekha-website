# Development

Contribute to Sekha or build custom integrations.

## Getting Started

### For Contributors

- [**Contributing Guide**](contributing.md) - How to contribute to Sekha
- [**Testing Guide**](testing.md) - Running and writing tests

### Development Prerequisites

**Required:**
- Rust 1.83+ (stable)
- Python 3.11+
- Docker 20.10+
- Git

**Recommended:**
- rust-analyzer (VSCode/IDE extension)
- cargo-watch (auto-rebuild)
- cargo-nextest (better test runner)

## Repository Structure

### Main Repositories

| Repository | Purpose | Language |
|------------|---------|----------|
| `sekha-controller` | Core memory engine | Rust |
| `sekha-llm-bridge` | LLM operations | Python |
| `sekha-mcp-server` | MCP protocol server | TypeScript |
| `sekha-sdk-python` | Python SDK | Python |
| `sekha-sdk-js` | JavaScript/TypeScript SDK | TypeScript |
| `sekha-website` | Documentation site | Markdown |

### Controller Architecture

```
sekha-controller/
├── src/
│   ├── api/          # REST API routes
│   ├── db/           # Database layer
│   ├── models/       # Data models
│   ├── orchestration/  # Memory orchestration
│   ├── vector/       # Vector store integration
│   └── config.rs    # Configuration
├── tests/
│   ├── integration/  # Integration tests
│   └── unit/        # Unit tests
├── Cargo.toml
└── README.md
```

## Development Workflow

### 1. Clone and Setup

```bash
# Clone controller
git clone https://github.com/sekha-ai/sekha-controller.git
cd sekha-controller

# Build
cargo build

# Run tests
cargo test

# Run in development mode
cargo run
```

### 2. Start Dependencies

```bash
# Start ChromaDB and Ollama
docker-compose -f docker-compose.dev.yml up -d

# Check they're running
curl http://localhost:8000/api/v1/heartbeat  # ChromaDB
curl http://localhost:11434/api/version      # Ollama
```

### 3. Make Changes

```bash
# Auto-rebuild on file changes
cargo watch -x run

# Run specific tests
cargo test conversations

# Check code formatting
cargo fmt --check

# Run clippy (linter)
cargo clippy
```

### 4. Submit PR

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

## Code Standards

### Rust Code Style

- Use `rustfmt` (runs on save in VSCode)
- Follow Rust API Guidelines
- Write doc comments for public APIs
- Keep functions under 50 lines when possible

**Example:**

```rust
/// Creates a new conversation in the memory store.
///
/// # Arguments
/// * `title` - The conversation title
/// * `content` - Initial message content
///
/// # Returns
/// * `Result<Conversation>` - Created conversation or error
pub async fn create_conversation(
    title: String,
    content: String,
) -> Result<Conversation> {
    // Implementation
}
```

### Python Code Style

- Follow PEP 8
- Use type hints
- Write docstrings (Google style)
- Use `black` for formatting
- Use `ruff` for linting

### Testing Requirements

**For PRs to be merged:**

- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Code coverage ≥85%
- [ ] No clippy warnings
- [ ] Formatted with rustfmt

## Building Custom Integrations

### Using the SDKs

**Python:**

```python
from sekha_sdk import SekhaClient

client = SekhaClient(
    api_url="http://localhost:8080",
    api_key="your-api-key"
)

# Create conversation
convo = client.conversations.create(
    title="My Integration",
    content="Hello from my custom app"
)
```

**JavaScript:**

```javascript
import { SekhaClient } from '@sekha/sdk';

const client = new SekhaClient({
  apiUrl: 'http://localhost:8080',
  apiKey: 'your-api-key'
});

// Create conversation
const convo = await client.conversations.create({
  title: 'My Integration',
  content: 'Hello from my custom app'
});
```

### Direct REST API

See [REST API Reference](../api-reference/rest-api.md) for endpoint documentation.

### Adding LLM Providers

To add a new LLM provider (OpenAI, Anthropic, etc.):

1. Implement the `LLMProvider` trait (Rust)
2. Add provider configuration
3. Update orchestration layer
4. Add integration tests
5. Update documentation

See the Contributing Guide for detailed instructions.

## Development Resources

### Documentation

- [Architecture Overview](../architecture/overview.md)
- [API Reference](../api-reference/index.md)
- [Testing Guide](testing.md)

### Communication

- **Discord:** [discord.gg/sekha](https://discord.gg/sekha)
- **GitHub Discussions:** [Ask questions](https://github.com/sekha-ai/sekha-controller/discussions)
- **Issues:** [Report bugs](https://github.com/sekha-ai/sekha-controller/issues)

### Useful Tools

**Rust:**
- `cargo-expand` - Macro expansion
- `cargo-edit` - Dependency management
- `cargo-udeps` - Find unused dependencies
- `cargo-deny` - Security audits

**Testing:**
- `cargo-nextest` - Faster test runner
- `cargo-tarpaulin` - Code coverage
- `cargo-watch` - Auto-rebuild

## Next Steps

- [**Contributing Guide**](contributing.md) - Detailed contribution process
- [**Testing Guide**](testing.md) - How to run and write tests
- [**Architecture**](../architecture/index.md) - Understand the system design
