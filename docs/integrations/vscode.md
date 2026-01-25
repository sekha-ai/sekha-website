# VS Code Integration

> Use Sekha memory directly in Visual Studio Code

## Overview

The Sekha VS Code extension provides memory-powered coding assistance.

**Status:** 🚧 Beta - [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=sekha-ai.sekha-vscode)

## Features

- ✅ Store code discussions and decisions
- ✅ Search past conversations semantically
- ✅ Retrieve relevant context for current task
- ✅ Code snippet memory
- ✅ Architecture decision records (ADRs)

## Installation

### From VS Code

1. Open VS Code
2. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
3. Search for "Sekha"
4. Click Install

### From Marketplace

Visit [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sekha-ai.sekha-vscode)

## Configuration

### 1. Connect to Sekha

```json
// settings.json
{
  "sekha.apiUrl": "http://localhost:8080",
  "sekha.apiKey": "your-api-key"
}
```

### 2. MCP Integration

The extension uses MCP protocol for enhanced integration.

## Usage

### Store Conversation

1. Select code or text
2. Right-click → "Sekha: Store in Memory"
3. Add label and context
4. Saved!

### Search Memory

1. Open Command Palette (`Cmd+Shift+P`)
2. Type "Sekha: Search Memory"
3. Enter query
4. View results in sidebar

### Get Context

1. Command: "Sekha: Get Context for Current Task"
2. Relevant memories appear
3. Click to insert into prompt

## Workflows

### Architecture Decisions

```markdown
# ADR: Use PostgreSQL for Primary Database

## Context
We need persistent storage...

## Decision
PostgreSQL chosen because...

## Consequences
- Pros: ACID compliance, mature
- Cons: More complex than SQLite
```

Store with:
- Label: `ADR: PostgreSQL Database Choice`
- Folder: `architecture/decisions`
- Importance: 9

### Code Review Notes

During code review:
1. Select code snippet
2. Add review comment
3. Store in Sekha with label `Code Review: Auth Module`

Later:
1. Search "authentication review notes"
2. Retrieve past decisions

### Debugging Sessions

```python
# Bug: Memory leak in WebSocket handler
# Cause: Connections not properly closed
# Fix: Added explicit close() in finally block
# Date: 2026-01-25
```

Store for future reference.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K Cmd+M` | Store selection in memory |
| `Cmd+K Cmd+S` | Search memory |
| `Cmd+K Cmd+C` | Get context |

## Coming Soon

- [ ] Inline memory suggestions
- [ ] Automatic code documentation
- [ ] Git commit message generation
- [ ] Pull request summaries

## Repository

[github.com/sekha-ai/sekha-vscode](https://github.com/sekha-ai/sekha-vscode)

## Related

- [Claude Desktop Integration](claude-desktop.md)
- [MCP Tools Reference](../api-reference/mcp-tools.md)
- [AI Coding Assistant Guide](../guides/ai-coding-assistant.md)
