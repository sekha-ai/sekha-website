# Sekha Documentation Website

> **Official documentation for the Sekha AI Memory Controller ecosystem**

[![Documentation Status](https://img.shields.io/badge/docs-passing-brightgreen)](https://docs.sekha.dev)
[![MkDocs](https://img.shields.io/badge/MkDocs-Material-blue)](https://squidfunk.github.io/mkdocs-material/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## 📚 About This Repository

This repository contains the source files for the **unified Sekha documentation site** at [docs.sekha.dev](https://docs.sekha.dev).

All documentation from the 12 Sekha repositories is consolidated here as the **single source of truth**.

## 🏗️ Structure

```
sekha-website/
├── docs/                    # Documentation content (Markdown)
│   ├── getting-started/     # Quickstart, installation, tutorials
│   ├── architecture/        # System design, data flow
│   ├── deployment/          # All deployment methods
│   ├── api-reference/       # REST API, MCP tools
│   ├── sdks/                # Python, JavaScript SDKs
│   ├── integrations/        # VS Code, Claude, CLI, Obsidian
│   ├── guides/              # How-to guides, best practices
│   ├── development/         # Contributing, testing, building
│   ├── reference/           # Configuration, schemas, metrics
│   ├── troubleshooting/     # Common issues, FAQs
│   └── about/               # Journey, roadmap, license
├── mkdocs.yml               # MkDocs configuration
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## 🚀 Local Development

### Prerequisites

- Python 3.8+
- pip

### Setup

```bash
# Clone the repository
git clone https://github.com/sekha-ai/sekha-website.git
cd sekha-website

# Install dependencies
pip install -r requirements.txt

# Start development server
mkdocs serve

# Open browser to http://localhost:8000
```

### Building

```bash
# Build static site
mkdocs build

# Output will be in site/ directory
```

## 📝 Contributing to Documentation

### Quick Edit

1. Find the page you want to edit in `docs/`
2. Edit the Markdown file
3. Preview locally with `mkdocs serve`
4. Submit a pull request

### Adding New Pages

1. Create a new `.md` file in the appropriate `docs/` subdirectory
2. Add the page to `mkdocs.yml` navigation
3. Link to it from related pages
4. Submit a pull request

### Documentation Standards

- **One topic per page** - Keep pages focused and scannable
- **No duplication** - Link to existing content instead of repeating
- **Code examples** - Every feature should have working code samples
- **Cross-linking** - Help users discover related content
- **Tested examples** - All code samples must work out-of-the-box

### Writing Style

- Use active voice
- Write in present tense
- Keep sentences short and clear
- Use code blocks for commands and code
- Add context before showing solutions
- Include "Next steps" at the end of guides

## 🔗 Content Sources

This documentation aggregates content from:

- [sekha-controller](https://github.com/sekha-ai/sekha-controller) - Core engine
- [sekha-docker](https://github.com/sekha-ai/sekha-docker) - Deployment
- [sekha-llm-bridge](https://github.com/sekha-ai/sekha-llm-bridge) - LLM operations
- [sekha-python-sdk](https://github.com/sekha-ai/sekha-python-sdk) - Python client
- [sekha-js-sdk](https://github.com/sekha-ai/sekha-js-sdk) - JavaScript client
- [sekha-mcp](https://github.com/sekha-ai/sekha-mcp) - MCP server
- [sekha-cli](https://github.com/sekha-ai/sekha-cli) - CLI tool
- [sekha-vscode](https://github.com/sekha-ai/sekha-vscode) - VS Code extension
- [sekha-obsidian](https://github.com/sekha-ai/sekha-obsidian) - Obsidian plugin
- [sekha-proxy](https://github.com/sekha-ai/sekha-proxy) - Context injection
- [sekha-roadmap](https://github.com/sekha-ai/sekha-roadmap) - Project roadmap

## 🤖 Automated Deployment

Documentation is automatically built and deployed on push to `main` branch via GitHub Actions.

See `.github/workflows/docs-deploy.yml` for details.

## 📄 License

AGPL-3.0 - See [LICENSE](LICENSE) for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/sekha-ai/sekha-website/issues)
- **Discord**: [Join Community](https://discord.gg/7RUTmdd2)
- **Email**: hello@sekha.dev

---

**Built with** [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) • **Deployed to** [docs.sekha.dev](https://docs.sekha.dev)
