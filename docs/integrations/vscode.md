# VS Code Extension

Bring Sekha memory directly into Visual Studio Code for persistent coding context and conversation management.

## Overview

The Sekha VS Code extension integrates AI memory into your editor:

- ✅ **Save conversations** from editor content
- ✅ **Search memory** semantically
- ✅ **Insert context** into active files
- ✅ **Tree view explorer** for browsing conversations
- ✅ **Command palette** integration
- ✅ **Keyboard shortcuts** for quick actions

**Status:** Beta - Available for testing

---

## Installation

### From VS Code Marketplace

**Coming Soon:** Official marketplace publication

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Sekha Memory Controller"
4. Click **Install**

### From Source

```bash
# Clone the repository
git clone https://github.com/sekha-ai/sekha-vscode.git
cd sekha-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code and press F5 to debug
code .
```

### Prerequisites

- **VS Code 1.85.0+**
- **Sekha Controller** running at `http://localhost:8080`
- **Node.js 18+** (for development)

---

## Configuration

### Settings

Open VS Code settings (`Ctrl+,` / `Cmd+,`) and search for "Sekha":

```json
{
  "sekha.apiUrl": "http://localhost:8080",
  "sekha.apiKey": "your-rest-api-key-here",
  "sekha.autoSave": false,
  "sekha.autoSaveInterval": 5,
  "sekha.maxConversationsInTree": 100,
  "sekha.defaultFolder": "/vscode"
}
```

**Configuration Options:**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sekha.apiUrl` | string | `http://localhost:8080` | Sekha Controller API URL |
| `sekha.apiKey` | string | `""` | REST API key (min 32 characters) |
| `sekha.autoSave` | boolean | `false` | Automatically save conversations |
| `sekha.autoSaveInterval` | number | `5` | Auto-save interval in minutes |
| `sekha.maxConversationsInTree` | number | `100` | Max conversations in tree view |
| `sekha.defaultFolder` | string | `/vscode` | Default folder for saved conversations |

### Get API Key

Your API key is configured in the Sekha Controller:

```bash
# Check your API key
cat sekha-docker/docker/.env | grep REST_API_KEY

# Or from config
cat ~/.sekha/config.toml | grep rest_api_key
```

**Security:** Never commit your API key to version control!

---

## Features

### 1. Save Conversations

Store editor content as a conversation in Sekha memory.

**Command:** `Sekha: Save Conversation`  
**Shortcut:** `Ctrl+Shift+S` / `Cmd+Shift+S`

**How it works:**

1. Select text in editor (or use entire file)
2. Run command or press shortcut
3. Enter label and folder when prompted
4. Conversation is stored with file context

**Example:**

```python
# Selected code:
def calculate_similarity(a, b):
    """Calculate cosine similarity between two vectors."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Saved as:
# Label: "Cosine Similarity Function"
# Folder: "/vscode/python/utils"
# Content: Code + file path + timestamp
```

---

### 2. Search Memory

Semantically search all stored conversations.

**Command:** `Sekha: Search Memory`  
**Shortcut:** `Ctrl+Shift+F` / `Cmd+Shift+F`

**How it works:**

1. Run command
2. Enter search query
3. View results in quick pick menu
4. Select result to view full conversation

**Example:**

```
Query: "How did I implement authentication?"

Results:
1. JWT Token Implementation (95% match)
   /vscode/typescript/auth
   Created: 2 days ago

2. OAuth2 Setup Guide (87% match)
   /vscode/docs/setup
   Created: 1 week ago

3. Password Hashing Function (76% match)
   /vscode/python/security
   Created: 3 days ago
```

---

### 3. Insert Context

Insert stored conversation content at cursor position.

**Command:** `Sekha: Insert Context`  
**Shortcut:** `Ctrl+Shift+I` / `Cmd+Shift+I`

**How it works:**

1. Place cursor where you want to insert
2. Run command
3. Browse conversations in tree or search
4. Select conversation to insert

---

### 4. Search & Insert

Combines search and insert in one action.

**Command:** `Sekha: Search & Insert`  
**Shortcut:** `Ctrl+Shift+A` / `Cmd+Shift+A`

**Workflow:**

1. Run command
2. Enter search query
3. Select matching conversation from results
4. Content inserted at cursor

---

### 5. Tree View Explorer

Browse all conversations in a dedicated sidebar.

**Access:** Click Sekha icon in Activity Bar

**Features:**

- View conversations by folder
- Search within tree
- Click to view conversation
- Refresh to update list
- Quick access to settings

**Tree View Actions:**

- **Refresh** - Reload conversation list
- **Search** - Quick search from tree
- **Settings** - Open Sekha settings

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| **Save Conversation** | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| **Search Memory** | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| **Search & Insert** | `Ctrl+Shift+A` | `Cmd+Shift+A` |
| **Insert Context** | `Ctrl+Shift+I` | `Cmd+Shift+I` |

**Customize shortcuts:**

1. Open Keyboard Shortcuts (`Ctrl+K Ctrl+S` / `Cmd+K Cmd+S`)
2. Search for "Sekha"
3. Click on command to edit keybinding

---

## Command Palette

All commands available via `Ctrl+Shift+P` / `Cmd+Shift+P`:

- `Sekha: Save Conversation`
- `Sekha: Search Memory`
- `Sekha: Insert Context`
- `Sekha: Search & Insert`
- `Sekha: Refresh`
- `Sekha: View Conversation`
- `Sekha: Open Settings`

---

## Use Cases

### Code Snippet Library

**Store reusable code patterns:**

```bash
# Save common patterns
- Database connection setup
- Error handling wrappers
- API endpoint templates
- Test fixtures
- Utility functions

# Retrieve later with semantic search
"How do I connect to PostgreSQL?"
"Show me error handling pattern"
```

### Project Documentation

**Save architecture decisions and notes:**

```bash
# Store:
- Architecture decisions
- API design notes
- Performance optimization ideas
- Bug investigation notes
- Refactoring plans

# Search:
"Why did we choose MongoDB?"
"What was the caching strategy?"
```

### Learning Journal

**Track learning progress:**

```bash
# Save:
- Tutorial notes
- Language syntax examples
- Framework patterns
- Debugging solutions
- Stack Overflow answers

# Retrieve:
"How to use React hooks?"
"Python decorator syntax"
```

### Meeting Notes

**Store standup and planning discussions:**

```bash
# Save meeting outcomes
- Sprint planning decisions
- Code review feedback
- Architecture discussions
- Performance metrics

# Find later
"What did we decide about caching?"
"Sprint goals from last week"
```

---

## Workflows

### Daily Standup Notes

```typescript
// 1. Write standup notes in editor
/*
Standup 2026-01-25

Yesterday:
- Fixed authentication bug in user service
- Reviewed PR #234 for API refactor

Today:
- Implement rate limiting middleware
- Update documentation

Blockers:
- Waiting on database migration approval
*/

// 2. Save with Ctrl+Shift+S
// Label: "Standup 2026-01-25"
// Folder: "/vscode/meetings/standup"

// 3. Later, search for context
// Query: "What was blocking me last week?"
```

### Code Review Feedback

```typescript
// 1. Write review comments
/*
PR #345 Review Notes

✅ Good:
- Clean separation of concerns
- Comprehensive tests

🔧 Suggestions:
- Extract validation logic
- Add error handling for edge cases
- Consider caching frequently accessed data
*/

// 2. Save to memory
// 3. Reference in future PRs
```

### Bug Investigation

```python
# 1. Document bug findings
"""
BUG: Memory leak in WebSocket connections

Symptoms:
- Memory grows 10MB/hour
- Connections not properly closed

Root Cause:
- Event listeners not removed on disconnect
- Circular references in connection object

Solution:
- Add cleanup in disconnect handler
- Use WeakMap for connection storage
"""

# 2. Save with context
# 3. Search later when similar issue occurs
```

---

## Troubleshooting

### Extension Not Connecting

**Check Sekha Controller:**

```bash
# Verify controller is running
curl http://localhost:8080/health

# Check logs
docker logs sekha-controller
```

**Check VS Code Settings:**

- Verify `sekha.apiUrl` matches your controller URL
- Ensure `sekha.apiKey` is set and correct (min 32 characters)

---

### No Conversations in Tree View

**Troubleshooting:**

1. Click **Refresh** button in tree view
2. Check `sekha.maxConversationsInTree` setting
3. Verify API key has correct permissions
4. Check Sekha Controller logs for errors

---
### Commands Not Appearing

**Fix:**

1. Reload VS Code window (`Ctrl+R` / `Cmd+R`)
2. Reinstall extension
3. Check VS Code version (requires 1.85.0+)

---

### Search Returns No Results

**Debugging:**

1. Verify conversations exist in controller
2. Test search via REST API:
   ```bash
   curl -X POST http://localhost:8080/api/v1/query \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-key" \
     -d '{"query":"test","limit":10}'
   ```
3. Check embedding service (Ollama) is running
4. Review controller logs for search errors

---

## Development

### Building From Source

```bash
# Clone repository
git clone https://github.com/sekha-ai/sekha-vscode.git
cd sekha-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch

# Run tests
npm test

# Package extension
npm run package
# Generates: sekha-vscode-1.0.0.vsix
```

### Install Local Build

```bash
# Install .vsix file
code --install-extension sekha-vscode-1.0.0.vsix
```

---

## Roadmap

### Planned Features (v1.1+)

- [ ] **Auto-save file changes** with git integration
- [ ] **Code context assembly** - Smart context gathering
- [ ] **Inline suggestions** - Memory-aware autocomplete
- [ ] **Workspace-wide memory** - Project-scoped conversations
- [ ] **Chat panel** - Integrated memory chat interface
- [ ] **Label suggestions** - AI-powered auto-labeling
- [ ] **Folder organization** - Visual folder management
- [ ] **Export/import** - Backup conversations
- [ ] **Multi-workspace support** - Separate memories per workspace

---

## Next Steps

- **[Python SDK](../sdks/python-sdk.md)** - Build custom integrations
- **[JavaScript SDK](../sdks/javascript-sdk.md)** - Web app integration
- **[REST API](../api-reference/rest-api.md)** - Full API reference
- **[Claude Desktop](claude-desktop.md)** - MCP integration

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-vscode/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)

---

## Contributing

We welcome contributions!

- **Bug reports:** [Open an issue](https://github.com/sekha-ai/sekha-vscode/issues)
- **Feature requests:** [Submit a proposal](https://github.com/sekha-ai/sekha-vscode/discussions)
- **Code contributions:** [Contributing Guide](../development/contributing.md)

**Join the beta testing program!** Report bugs and share feedback in [Discord](https://discord.gg/gZb7U9deKH).
