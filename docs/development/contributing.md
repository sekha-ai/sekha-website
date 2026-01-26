# Contributing to Sekha

Thank you for your interest in contributing to Sekha! This guide will help you get started.

---

## Quick Start for Contributors

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/sekha-controller
cd sekha-controller
```

### 2. Set Up Development Environment

```bash
# Install Rust 1.83+
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install development tools
rustup component add rustfmt clippy

# Install pre-commit hooks
cargo install cargo-husky
```

### 3. Build and Test

```bash
# Build
cargo build

# Run tests
cargo test

# Run locally
cargo run
```

### 4. Make Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Submit Pull Request

1. Go to [sekha-controller](https://github.com/sekha-ai/sekha-controller)
2. Click "Pull Requests" → "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template
5. Submit!

---

## Ways to Contribute

### 🐛 Report Bugs

Found a bug? [Create an issue](https://github.com/sekha-ai/sekha-controller/issues/new?template=bug_report.md)

**Include:**
- Sekha version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs

### 💡 Suggest Features

[Open a feature request](https://github.com/sekha-ai/sekha-controller/issues/new?template=feature_request.md)

**Include:**
- Use case (why you need it)
- Proposed solution
- Alternatives considered
- Impact on existing features

### 📝 Improve Documentation

Documentation PRs are always welcome!

**Docs repo:** [sekha-website](https://github.com/sekha-ai/sekha-website)

```bash
git clone https://github.com/sekha-ai/sekha-website
cd sekha-website

# Edit docs/...
vim docs/getting-started/quickstart.md

# Preview locally
mkdocs serve
# Open http://localhost:8000
```

### 🧪 Write Tests

We aim for 80%+ code coverage. Add tests for:

- New features
- Bug fixes
- Edge cases
- Integration scenarios

### 🎨 Fix Issues

Check out [good first issues](https://github.com/sekha-ai/sekha-controller/labels/good-first-issue)!

---

## Development Workflow

### Branch Naming

```bash
feature/add-openai-support   # New features
fix/crash-on-empty-query      # Bug fixes
docs/update-api-reference     # Documentation
chore/upgrade-dependencies    # Maintenance
refactor/simplify-context     # Code refactoring
test/add-integration-tests    # Testing
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add OpenAI LLM provider support
fix: prevent crash when query is empty
docs: update REST API authentication guide
chore: upgrade tokio to 1.35
refactor: simplify context assembly logic
test: add integration tests for MCP server
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change, no new feature/fix
- `perf`: Performance improvement
- `test`: Add/update tests
- `chore`: Tooling, dependencies

### Code Style

**Rust code must:**

```bash
# Format with rustfmt
cargo fmt

# Pass clippy lints
cargo clippy -- -D warnings

# Build without warnings
cargo build --all-features
```

**Python code must:**

```bash
# Format with black
black .

# Lint with flake8
flake8 .

# Type check with mypy
mypy .
```

### Testing Requirements

**All PRs must:**

1. **Pass CI/CD:**
   - All tests pass
   - Code coverage ≥ 80%
   - Linters pass
   - Builds successfully

2. **Include tests for:**
   - New features
   - Bug fixes
   - Changed behavior

**Run tests locally:**

```bash
# Unit tests
cargo test

# Integration tests
cargo test --test '*'

# With coverage
cargo tarpaulin --out Html
```

---

## Repository Structure

Sekha is organized into multiple repositories:

### Core Components

**[sekha-controller](https://github.com/sekha-ai/sekha-controller)** (Rust)
- REST API server
- Memory orchestration engine
- Context assembly
- Database layer (SQLite + ChromaDB)

**[sekha-llm-bridge](https://github.com/sekha-ai/sekha-llm-bridge)** (Python)
- LLM integrations (Ollama, OpenAI, etc.)
- Embedding generation
- Summarization
- Tool calling

### Deployment

**[sekha-docker](https://github.com/sekha-ai/sekha-docker)**
- Docker Compose files
- Multi-arch builds (amd64/arm64)
- Kubernetes manifests

### Integrations

**[sekha-mcp](https://github.com/sekha-ai/sekha-mcp)**
- Model Context Protocol server
- Claude Desktop integration

**[sekha-python-sdk](https://github.com/sekha-ai/sekha-python-sdk)**
- Python client library

**[sekha-js-sdk](https://github.com/sekha-ai/sekha-js-sdk)**
- JavaScript/TypeScript client library

**[sekha-cli](https://github.com/sekha-ai/sekha-cli)**
- Command-line interface

**[sekha-vscode](https://github.com/sekha-ai/sekha-vscode)**
- VS Code extension

**[sekha-obsidian](https://github.com/sekha-ai/sekha-obsidian)**
- Obsidian plugin

### Meta

**[sekha-website](https://github.com/sekha-ai/sekha-website)**
- Documentation (MkDocs)
- Website content

**[sekha-roadmap](https://github.com/sekha-ai/sekha-roadmap)**
- Public roadmap
- Feature voting

---

## Development Setup

### Prerequisites

**Required:**
- Rust 1.83+ (`rustup`)
- Python 3.11+
- Docker & Docker Compose
- Git

**Optional:**
- VS Code (recommended IDE)
- rust-analyzer extension
- SQLite browser

### Full Development Stack

```bash
# Clone all repos
mkdir sekha-dev && cd sekha-dev

git clone https://github.com/sekha-ai/sekha-controller
git clone https://github.com/sekha-ai/sekha-llm-bridge
git clone https://github.com/sekha-ai/sekha-mcp

# Start dependencies (ChromaDB, etc.)
cd sekha-controller
docker compose -f docker-compose.dev.yml up -d

# Run controller in dev mode
cargo run -- --config config.dev.toml

# In another terminal, run LLM bridge
cd ../sekha-llm-bridge
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m sekha_llm_bridge
```

### VS Code Setup

**.vscode/settings.json**

```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.cargo.features": "all",
  "editor.formatOnSave": true,
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

**.vscode/extensions.json**

```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "tamasfe.even-better-toml",
    "serayuzgur.crates",
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

## Common Development Tasks

### Adding a New API Endpoint

**1. Define route in `src/api/mod.rs`:**

```rust
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .service(your_new_endpoint)
    );
}
```

**2. Implement handler in `src/api/handlers.rs`:**

```rust
#[post("/your-endpoint")]
async fn your_new_endpoint(
    req: web::Json<YourRequest>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    // Implementation
    Ok(web::Json(YourResponse { ... }))
}
```

**3. Add tests in `tests/api/your_endpoint_test.rs`:**

```rust
#[actix_web::test]
async fn test_your_endpoint() {
    let app = test::init_service(App::new()...).await;
    let req = test::TestRequest::post()
        .uri("/api/v1/your-endpoint")
        .set_json(&YourRequest { ... })
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
```

**4. Update documentation:**

- Add to `docs/api-reference/rest-api.md`
- Update OpenAPI spec if needed

### Adding a New LLM Provider

**1. Create provider module in `sekha-llm-bridge/providers/`:**

```python
# sekha_llm_bridge/providers/openai.py

from .base import LLMProvider

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.api_key = api_key
        self.model = model
    
    async def generate_embedding(self, text: str) -> list[float]:
        # Implementation
        pass
    
    async def summarize(self, text: str) -> str:
        # Implementation
        pass
```

**2. Register in `sekha_llm_bridge/providers/__init__.py`:**

```python
from .openai import OpenAIProvider

PROVIDERS = {
    "ollama": OllamaProvider,
    "openai": OpenAIProvider,
}
```

**3. Update config schema:**

```toml
# config.toml
[llm]
provider = "openai"  # or "ollama"

[llm.openai]
api_key = "sk-..."
model = "gpt-4"
```

**4. Add tests:**

```python
# tests/providers/test_openai.py

import pytest
from sekha_llm_bridge.providers import OpenAIProvider

@pytest.mark.asyncio
async def test_openai_embedding():
    provider = OpenAIProvider(api_key="test")
    embedding = await provider.generate_embedding("test")
    assert len(embedding) == 1536  # OpenAI embedding dim
```

### Adding Documentation

**1. Create markdown file:**

```bash
cd sekha-website
vim docs/guides/your-new-guide.md
```

**2. Add to navigation in `mkdocs.yml`:**

```yaml
nav:
  - Guides:
    - guides/index.md
    - Your New Guide: guides/your-new-guide.md
```

**3. Preview locally:**

```bash
mkdocs serve
# Open http://localhost:8000
```

**4. Submit PR to sekha-website repo**

---

## Pull Request Guidelines

### Before Submitting

**Checklist:**

- [ ] Code follows style guide
- [ ] `cargo fmt` passes
- [ ] `cargo clippy` passes with no warnings
- [ ] All tests pass (`cargo test`)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description is clear

### PR Template

When you create a PR, fill in this template:

```markdown
## Description

Brief description of what this PR does.

## Motivation

Why is this change needed? What problem does it solve?

## Changes

- List of specific changes
- With explanations

## Testing

How was this tested?

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manually tested (describe scenario)

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Checklist

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Breaking changes documented

## Related Issues

Fixes #123
Related to #456
```

### PR Review Process

1. **Automated checks run** (CI/CD)
2. **Code review by maintainer** (usually within 1-3 days)
3. **Address feedback** if requested
4. **Approval** when ready
5. **Merge** to main branch

---

## Release Process

Sekha uses [semantic versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

**Release cycle:**
- Patch releases: As needed (bug fixes)
- Minor releases: Monthly (new features)
- Major releases: Quarterly (breaking changes)

**Creating a release (maintainers only):**

```bash
# Update version in Cargo.toml
vim Cargo.toml

# Update CHANGELOG.md
vim CHANGELOG.md

# Commit
git commit -am "chore: bump version to v0.2.0"

# Tag
git tag -a v0.2.0 -m "Release v0.2.0"

# Push
git push origin main --tags

# CI will build and publish automatically
```

---

## Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

**Expected behavior:**
- Be respectful and welcoming
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

**Unacceptable behavior:**
- Harassment of any kind
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

**Enforcement:**
Violations can be reported to [hello@sekha.dev](mailto:hello@sekha.dev).

### Getting Help

**Stuck? Ask for help:**

- [Discord #contributing channel](https://discord.gg/gZb7U9deKH)
- [GitHub Discussions](https://github.com/sekha-ai/sekha-controller/discussions)
- [Office Hours](https://calendar.google.com/calendar/sekha-office-hours) (Wednesdays 2-3 PM EST)

**Tips for getting help:**

1. Search existing issues/discussions first
2. Provide context (what you're trying to do)
3. Include error messages/logs
4. Show what you've already tried
5. Be patient and respectful

---

## Recognition

### Contributors

All contributors are recognized in:

- [CONTRIBUTORS.md](https://github.com/sekha-ai/sekha-controller/blob/main/CONTRIBUTORS.md)
- Release notes
- Annual contributor spotlight blog posts

### Rewards

**Contributor benefits:**

- Recognition in release notes
- Sekha swag for significant contributions
- Free commercial license for active contributors
- Priority support
- Invitation to contributor-only Discord channel

**Significant contributions:**
- Major features (multi-PR efforts)
- Critical bug fixes
- Comprehensive documentation
- Consistent participation over 3+ months

---

## License

By contributing to Sekha, you agree that your contributions will be licensed under the AGPL-3.0 License.

**What this means:**

- Your code becomes open source
- Others can use/modify your code
- Modifications must also be open-sourced
- You retain copyright of your contributions
- Sekha can include your code in commercial licenses

**Contributor License Agreement (CLA):**

For substantial contributions, we may ask you to sign a CLA. This allows us to:

- Offer commercial licenses (funds development)
- Relicense if needed (e.g., Apache 2.0 for broader adoption)
- Protect the project legally

Your contributions remain open source regardless.

---

## Questions?

- **Discord:** [discord.gg/sekha](https://discord.gg/gZb7U9deKH)
- **Email:** [hello@sekha.dev](mailto:hello@sekha.dev)
- **Office Hours:** [Wednesdays 2-3 PM EST](https://calendar.google.com/calendar/sekha-office-hours)

**Thank you for contributing to Sekha! 🎉**

---

*Last updated: January 2026*
