# Testing Guide

Sekha maintains high code quality standards across all repositories with comprehensive testing and continuous integration.

## Coverage Dashboard

| Repository | Coverage | CI Status | Testing Framework |
|------------|----------|-----------|-------------------|
| [sekha-controller](https://github.com/sekha-ai/sekha-controller) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-controller/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-controller) | [![CI](https://github.com/sekha-ai/sekha-controller/actions/workflows/ci.yml/badge.svg)](https://github.com/sekha-ai/sekha-controller/actions/workflows/ci.yml) | cargo test + tarpaulin |
| [sekha-llm-bridge](https://github.com/sekha-ai/sekha-llm-bridge) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-llm-bridge/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-llm-bridge) | [![CI](https://github.com/sekha-ai/sekha-llm-bridge/workflows/LLM%20Bridge%20CI/badge.svg)](https://github.com/sekha-ai/sekha-llm-bridge/actions/workflows/ci.yml) | pytest + pytest-cov |
| [sekha-python-sdk](https://github.com/sekha-ai/sekha-python-sdk) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-python-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-python-sdk) | [![CI](https://github.com/sekha-ai/sekha-python-sdk/workflows/CI/badge.svg)](https://github.com/sekha-ai/sekha-python-sdk/actions) | pytest + pytest-cov |
| [sekha-js-sdk](https://github.com/sekha-ai/sekha-js-sdk) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-js-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-js-sdk) | [![CI](https://github.com/sekha-ai/sekha-js-sdk/workflows/CI/badge.svg)](https://github.com/sekha-ai/sekha-js-sdk/actions) | vitest |
| [sekha-mcp](https://github.com/sekha-ai/sekha-mcp) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-mcp) | [![CI](https://github.com/sekha-ai/sekha-mcp/workflows/CI/badge.svg)](https://github.com/sekha-ai/sekha-mcp/actions) | pytest + pytest-cov |
| [sekha-cli](https://github.com/sekha-ai/sekha-cli) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-cli/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-cli) | [![CI](https://github.com/sekha-ai/sekha-cli/workflows/CI/badge.svg)](https://github.com/sekha-ai/sekha-cli/actions) | pytest + pytest-cov |
| [sekha-vscode](https://github.com/sekha-ai/sekha-vscode) | [![codecov](https://codecov.io/gh/sekha-ai/sekha-vscode/branch/main/graph/badge.svg)](https://codecov.io/gh/sekha-ai/sekha-vscode) | [![CI](https://github.com/sekha-ai/sekha-vscode/workflows/CI/badge.svg)](https://github.com/sekha-ai/sekha-vscode/actions) | vitest/mocha |

## Testing Standards by Language

### Rust (sekha-controller)

**Linting & Formatting:**
```bash
cargo fmt -- --check
cargo clippy --all-targets --all-features
```

**Running Tests:**
```bash
# All tests
cargo test

# Unit tests only
cargo test --lib

# Integration tests
cargo test --test integration

# API tests
cargo test --test api_test

# Benchmarks
cargo test --release --test benchmark
```

**Coverage:**
```bash
# Install tarpaulin
cargo install cargo-tarpaulin --locked

# Generate coverage report
cargo tarpaulin --out Html --output-dir coverage

# Open report
open coverage/index.html
```

### Python (bridge, SDKs, CLI, MCP)

**Linting & Formatting:**
```bash
# Using ruff (modern, fast)
ruff check .
ruff format --check .

# Or black (traditional)
black --check .
```

**Running Tests:**
```bash
# Install dependencies
pip install -e ".[test]"

# Run all tests
pytest

# With coverage
pytest --cov=<module> --cov-report=html

# Verbose output
pytest -v

# Specific test file
pytest tests/test_client.py
```

**Coverage:**
```bash
pytest --cov=<module> --cov-report=term-missing
pytest --cov=<module> --cov-report=html
open htmlcov/index.html
```

### TypeScript/JavaScript (JS SDK, VS Code)

**Linting & Formatting:**
```bash
npm run lint
# or
yarn lint
```

**Running Tests:**
```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test
npm test -- path/to/test.spec.ts
```

**Coverage:**
```bash
npm run test:coverage
open coverage/index.html
```

## CI/CD Pipelines

All repositories use GitHub Actions for continuous integration.

### Controller CI Workflow

```yaml
# .github/workflows/ci.yml
jobs:
  test-controller:
    steps:
      - cargo fmt -- --check
      - cargo clippy
      - cargo test --lib
      - cargo test --test integration
      - cargo test --test api_test
      - cargo tarpaulin --out Xml
      - Upload to codecov
```

### Python CI Workflow

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - ruff check .
      - ruff format --check .
      - pytest --cov --cov-report=xml
      - Upload to codecov
```

### TypeScript CI Workflow

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - npm run lint
      - npm test -- --coverage
      - Upload to codecov
```

## Writing Tests

### Unit Tests

Unit tests should be fast, isolated, and test single units of functionality.

**Rust Example:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversation_label_validation() {
        let result = validate_label("Valid Label");
        assert!(result.is_ok());
    }
}
```

**Python Example:**
```python
def test_client_initialization():
    config = ClientConfig(
        api_key="test-key",
        base_url="http://localhost:8080"
    )
    client = SekhaClient(config)
    assert client.config.api_key == "test-key"
```

**TypeScript Example:**
```typescript
describe('MemoryController', () => {
  it('should initialize with config', () => {
    const memory = new MemoryController({
      apiKey: 'test-key',
      baseURL: 'http://localhost:8080'
    });
    expect(memory.config.apiKey).toBe('test-key');
  });
});
```

### Integration Tests

Integration tests verify multiple components working together.

**Controller Integration Test:**
```rust
#[tokio::test]
async fn test_full_conversation_flow() {
    let app = setup_test_app().await;
    
    // Store conversation
    let response = app.post("/api/v1/conversations")
        .json(&new_conversation)
        .send()
        .await;
    
    assert_eq!(response.status(), 201);
}
```

### Test Data

Use fixtures and factories for consistent test data.

**Python Fixtures:**
```python
@pytest.fixture
def sample_conversation():
    return NewConversation(
        label="Test Conversation",
        folder="/test",
        messages=[
            MessageDto(role="user", content="Test message")
        ]
    )

def test_create_conversation(sample_conversation):
    result = client.create_conversation(sample_conversation)
    assert result.id is not None
```

## Coverage Goals

- **Controller (Rust):** >80% (enforced in CI)
- **LLM Bridge (Python):** >80%
- **Python SDK:** >90% (highest standard)
- **JS SDK:** >80%
- **MCP Server:** >80%
- **CLI:** >80%
- **VS Code:** >70% (UI testing harder)

## Running Tests Locally

### Before Submitting PR

```bash
# 1. Format code
cargo fmt  # or ruff format . or npm run format

# 2. Lint
cargo clippy  # or ruff check . or npm run lint

# 3. Run all tests
cargo test  # or pytest or npm test

# 4. Check coverage
cargo tarpaulin  # or pytest --cov or npm run test:coverage
```

### Quick Test Script

Each repo has a `scripts/test.sh` for convenience:

```bash
./scripts/test.sh          # Run all tests
./scripts/test.sh lint     # Lint only
./scripts/test.sh unit     # Unit tests only
./scripts/test.sh coverage # With coverage report
```

## Troubleshooting Tests

### Tests Fail Locally But Pass in CI

- Check service dependencies (Chroma, Redis, Ollama)
- Verify environment variables match CI
- Check file permissions

### Flaky Integration Tests

- Add proper waits for async operations
- Use test isolation (separate databases)
- Increase timeouts for slow operations

### Low Coverage

- Focus on business logic first
- Mock external dependencies
- Use coverage reports to find gaps

## Contributing Tests

When adding new features:

1. Write tests FIRST (TDD approach)
2. Ensure tests pass locally
3. Check coverage meets repo standards
4. Update this guide if adding new patterns

See [Contributing Guide](contributing.md) for full workflow.

## Resources

- [Rust Testing Book](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
