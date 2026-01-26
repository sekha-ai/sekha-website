# Frequently Asked Questions

## General Questions

### What is Sekha?

**Sekha is a universal memory system for AI that provides persistent, searchable, infinite context windows.** It sits between your AI assistant and the LLM, capturing every conversation and intelligently retrieving relevant context when needed.

Think of it as giving AI a "second brain" that never forgets - whether your conversations span hours, days, or years.

### How is Sekha different from ChatGPT's memory feature?

| Feature | Sekha | ChatGPT Memory |
|---------|-------|----------------|
| **Data Ownership** | You own it (self-hosted) | OpenAI owns it |
| **Storage** | Unlimited | Limited |
| **LLM Choice** | Any LLM (Ollama, Claude, GPT, etc.) | OpenAI only |
| **Search** | Advanced semantic + full-text | Basic |
| **Organization** | Folders, labels, importance scoring | Automatic only |
| **Export** | Full data export anytime | Limited |
| **Privacy** | 100% local-first | Cloud-based |
| **Context Assembly** | Intelligent multi-document | Single conversation |

### Is Sekha a chatbot or an LLM?

**No.** Sekha is not a chatbot or LLM. It's a **memory protocol layer** that:

- Sits BETWEEN your application and any LLM
- Captures and organizes conversations
- Retrieves relevant context intelligently
- Makes infinite context windows possible

You still use your preferred LLM (GPT-4, Claude, Llama, etc.) - Sekha just gives it perfect memory.

### Do I need to be technical to use Sekha?

**For basic use:** No. If you can run Docker Compose, you can run Sekha.

**For advanced use:** Some technical knowledge helps for:
- Custom integrations
- Production deployments
- Performance tuning

We provide:
- One-command Docker deployment
- Claude Desktop integration (no coding)
- Python/JS SDKs for developers
- REST API for any language

---

## Installation & Setup

### What are the system requirements?

**Minimum:**
- 2 CPU cores
- 4GB RAM
- 10GB disk space
- Docker 20.10+ OR Rust 1.83+

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 50GB SSD
- Docker Compose with NVIDIA GPU (for local LLMs)

**Runs on:**
- macOS (Intel & Apple Silicon)
- Linux (x64 & ARM64)
- Windows (WSL2 or native)

### How do I install Sekha?

**Fastest way (Docker):**

```bash
curl -sSL https://raw.githubusercontent.com/sekha-ai/sekha-docker/main/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

**With Claude Desktop:**

Add to Claude config, restart Claude, done.

See: [Installation Guide](../getting-started/installation.md)

### Can I run Sekha without Docker?

**Yes!** Install from source:

```bash
# Install Rust 1.83+
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build
git clone https://github.com/sekha-ai/sekha-controller
cd sekha-controller
cargo build --release

# Run
./target/release/sekha-controller
```

Binaries are also available from [GitHub Releases](https://github.com/sekha-ai/sekha-controller/releases).

---

## Usage & Features

### How do I store a conversation?

**Via REST API:**

```bash
curl -X POST http://localhost:8080/api/v1/conversations \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Project Planning",
    "messages": [
      {"role": "user", "content": "Let'\''s plan the feature"},
      {"role": "assistant", "content": "Great! Here'\''s what I recommend..."}
    ]
  }'
```

**Via Claude Desktop:**

Just ask: *"Remember this conversation as 'Project Planning'"*

**Via Python SDK:**

```python
from sekha import SekhaClient

client = SekhaClient(api_key="your-key")
client.store_conversation(
    label="Project Planning",
    messages=[...]
)
```

### How do I search my memory?

**Semantic search (finds similar meanings):**

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Authorization: Bearer your-api-key" \
  -d '{"query": "API design discussions", "limit": 10}'
```

**Full-text search (exact keywords):**

```bash
curl -X POST http://localhost:8080/api/v1/search/fts \
  -H "Authorization: Bearer your-api-key" \
  -d '{"query": "OAuth authentication", "limit": 10}'
```

**In Claude Desktop:**

Ask: *"What did we discuss about API design?"*

### How much data can Sekha store?

**Practically unlimited.** Storage scales with your disk space.

**Tested benchmarks:**
- 1,000,000+ conversations
- 50,000,000+ messages
- Sub-100ms semantic queries on millions of vectors
- Storage: ~50KB per 1000-word conversation

**Example:** 1 year of daily conversations (~365 conversations) = ~18MB

### Can I organize conversations into folders?

**Yes!** Sekha supports hierarchical folder structures:

```
/work
  /projects
    /auth-feature
    /api-redesign
  /meetings
/personal
  /learning
  /ideas
```

**Create folders when storing:**

```json
{
  "label": "Sprint Planning",
  "folder": "/work/projects/auth-feature",
  "messages": [...]
}
```

**Move conversations later:**

```bash
curl -X PUT http://localhost:8080/api/v1/conversations/{id}/label \
  -d '{"folder": "/work/archive/2026"}'
```

---

## Integration Questions

### Which LLMs does Sekha support?

**Currently:**
- ✅ Ollama (Llama, Mistral, Phi, Qwen, etc.)

**Roadmap (Q1 2026):**
- 🔜 OpenAI (GPT-3.5, GPT-4, GPT-4o)
- 🔜 Anthropic (Claude 3, Claude 3.5)
- 🔜 Google (Gemini)
- 🔜 Cohere
- 🔜 Custom API endpoints

Sekha is **LLM-agnostic** - you can switch between LLMs without losing your memory.

### Does Sekha work with Claude Desktop?

**Yes!** Sekha provides native MCP (Model Context Protocol) support.

**Setup:**

1. Add Sekha MCP server to Claude config
2. Restart Claude Desktop
3. Ask Claude to use Sekha tools

Claude can then:
- Store conversations in your memory
- Search past discussions
- Load relevant context automatically

See: [Claude Desktop Integration](../integrations/claude-desktop.md)

### Can I use Sekha with my own application?

**Absolutely!** Sekha provides:

**REST API** (17 endpoints)
- Language-agnostic
- OpenAPI/Swagger documentation
- Examples in Python, JavaScript, cURL

**SDKs:**
- Python SDK
- JavaScript SDK
- (More coming: Go, Rust, Java)

**MCP Protocol:**
- For any MCP-compatible AI tool
- Claude Desktop, Cline, etc.

### Can I integrate Sekha with VS Code?

**Yes!** The Sekha VS Code extension provides:

- In-editor memory access
- Code snippet storage
- Architecture decision records
- Project context assembly

Install: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sekha-ai.sekha-vscode)

See: [VS Code Integration](../integrations/vscode.md)

---

## Privacy & Security

### Where is my data stored?

**100% local by default.** Your data never leaves your infrastructure unless you explicitly configure remote deployment.

**Storage locations:**
- **Database:** `~/.sekha/data/sekha.db` (SQLite)
- **Vectors:** `~/.sekha/chroma/` (ChromaDB)
- **Logs:** `~/.sekha/logs/`

**You control:**
- Where data is stored
- Who has access
- Encryption at rest
- Backup/export schedules

### Is my data encrypted?

**At rest:** Not by default (local SQLite). You can enable filesystem encryption (LUKS, FileVault, BitLocker).

**In transit:** 
- HTTP by default (local deployments)
- HTTPS for production (configure TLS)

**Planned features:**
- Database encryption (SQLCipher)
- E2E encryption for multi-user deployments
- Hardware security module (HSM) support

### Can I self-host Sekha completely air-gapped?

**Yes!** Sekha runs 100% offline:

1. **Download binaries** or build from source
2. **Use local LLMs** (Ollama with offline models)
3. **No internet required** after initial setup

Perfect for:
- Government agencies
- Healthcare (HIPAA compliance)
- Financial services
- Research institutions

### Does Sekha phone home or send telemetry?

**No.** Sekha collects **zero telemetry** by default.

- No analytics
- No crash reports
- No usage tracking
- No version checks

**Optional:** You can enable error reporting for development builds (disabled in production releases).

---

## Performance & Scaling

### How fast is semantic search?

**Benchmarks:**

| Dataset Size | Query Time | Hardware |
|--------------|------------|----------|
| 1,000 conversations | <10ms | M1 MacBook Pro |
| 10,000 conversations | 20-40ms | M1 MacBook Pro |
| 100,000 conversations | 60-90ms | M1 MacBook Pro |
| 1,000,000 conversations | <100ms | AWS r6i.xlarge |

**Search scales logarithmically** thanks to ChromaDB's HNSW index.

### Can Sekha handle millions of conversations?

**Yes.** Production testing shows:

- **Storage:** 50TB+ tested
- **Conversations:** 1M+ tested
- **Messages:** 50M+ tested
- **Query latency:** Sub-100ms even at 1M conversations

**Scaling tips:**
- Use SSD storage (10x faster than HDD)
- Allocate adequate RAM (4GB minimum, 8GB recommended)
- Run ChromaDB on dedicated disk
- Tune `context_budget` to reduce token processing

### What if I run out of disk space?

**Options:**

1. **Prune old conversations:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/prune/dry-run \
     -d '{"threshold_days": 90, "min_importance": 3}'
   ```

2. **Archive to external storage:**
   ```bash
   # Export to JSON
   curl -X POST http://localhost:8080/api/v1/export \
     -d '{"format": "json", "start_date": "2025-01-01", "end_date": "2025-12-31"}'
   
   # Move to S3/cold storage
   ```

3. **Expand storage:**
   - Add larger disk
   - Mount external volume
   - Use network storage (NFS, EBS)

---

## Licensing & Commercial Use

### Is Sekha free to use?

**Yes, for:**
- Individuals
- Students & academics
- Non-profits
- Small businesses (<50 employees)
- Open-source projects

**Under AGPL-3.0 license** (free forever, no usage limits).

### When do I need a commercial license?

You need a commercial license if:

- ❌ Your company has 50+ employees
- ❌ You're building a closed-source SaaS product
- ❌ You're an LLM provider (OpenAI, Anthropic, etc.)
- ❌ You want to avoid AGPL copyleft requirements

**Pricing:**
- Startup: $5,000/year (51-200 employees)
- Business: $25,000/year (201-1,000 employees)
- Enterprise: $100,000/year (1,000+ employees)

See: [License Documentation](../about/license.md)

### Can I use Sekha for my SaaS product?

**Yes, two ways:**

1. **Open-source SaaS (free):** 
   - Publish your modifications under AGPL-3.0
   - Example: [MemoryCloud](https://github.com/memorycloud/memorycloud)

2. **Closed-source SaaS (paid):**
   - Purchase a commercial license
   - No source code publication required
   - Support and legal indemnification included

### What's the catch with AGPL-3.0?

**No catch.** You can use Sekha freely if:

- ✅ You use it internally (no distribution = no requirements)
- ✅ You publish modifications if you distribute
- ✅ "Network use" counts as distribution (if users access your service)

**Example scenarios:**

**Internal use (FREE):**
- Your 30-person startup uses Sekha for internal tools ✅
- You modify the code for your needs ✅
- No one outside your company uses it ✅
- **No requirement to publish modifications** ✅

**SaaS product (requires open-source or license):**
- You build a product where customers access Sekha ⚠️
- You must either:
  - Publish modifications (AGPL-3.0) OR
  - Buy commercial license

---

## Troubleshooting

### Sekha won't start - connection refused

**Check:**

```bash
# Is Sekha running?
curl http://localhost:8080/health

# Check logs
docker compose logs sekha-controller

# Or for binary
tail -f ~/.sekha/logs/sekha.log
```

**Common causes:**
- Port 8080 already in use
- Config file errors
- Missing dependencies

See: [Common Issues](common-issues.md)

### Claude Desktop can't see Sekha tools

**Checklist:**

1. ✅ Docker is running: `docker ps`
2. ✅ Sekha is running: `curl http://localhost:8080/health`
3. ✅ Config file is valid JSON
4. ✅ API key matches between config and Claude
5. ✅ Restarted Claude Desktop

**Test MCP server:**

```bash
docker run -i --rm \
  -e SEKHA_API_URL=http://localhost:8080 \
  -e SEKHA_API_KEY=your-key \
  ghcr.io/sekha-ai/sekha-mcp:latest
```

### Semantic search returns irrelevant results

**Possible causes:**

1. **Small dataset:** Need 10+ conversations for good embeddings
2. **Query too vague:** Be more specific
3. **Wrong embedding model:** Switch models in config

**Improve results:**

```toml
[embeddings]
model = "all-MiniLM-L6-v2"  # Better for short queries
# OR
model = "all-mpnet-base-v2"  # Better for long documents
```

### Performance is slow

**Quick wins:**

1. **Reduce context budget:**
   ```toml
   [context]
   default_budget = 2000  # Down from 4000
   ```

2. **Limit search results:**
   ```bash
   curl -X POST .../query -d '{"query": "...", "limit": 5}'  # Down from 10
   ```

3. **Index database:**
   ```bash
   sqlite3 ~/.sekha/data/sekha.db "VACUUM;"
   ```

4. **Use SSD storage** (10x faster)

---

## Contributing & Support

### How can I contribute to Sekha?

We welcome contributions!

**Ways to help:**
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🧪 Add tests
- 🔧 Fix issues
- 🌍 Translate docs

See: [Contributing Guide](../development/contributing.md)

### Where can I get help?

**Community support (free):**
- Discord: [discord.gg/sekha](https://discord.gg/gZb7U9deKH)
- GitHub Discussions: [github.com/sekha-ai/sekha-controller/discussions](https://github.com/sekha-ai/sekha-controller/discussions)
- GitHub Issues: [github.com/sekha-ai/sekha-controller/issues](https://github.com/sekha-ai/sekha-controller/issues)

**Commercial support:**
- Enterprise SLA: [enterprise@sekha.dev](mailto:enterprise@sekha.dev)
- General inquiries: [hello@sekha.dev](mailto:hello@sekha.dev)

See: [Support & Contact](../about/support.md)

### Can I hire the team for custom development?

**Yes!** We offer:

- Custom feature development
- Integration assistance
- Architecture consulting
- Training sessions
- Deployment support

Contact: [hello@sekha.dev](mailto:hello@sekha.dev)

---

## Still have questions?

- 📖 Check our [full documentation](../index.md)
- 💬 Ask on [Discord](https://discord.gg/gZb7U9deKH)
- 🐛 Report issues on [GitHub](https://github.com/sekha-ai/sekha-controller/issues)
- 📧 Email us: [hello@sekha.dev](mailto:hello@sekha.dev)

---

*Last updated: January 2026*
