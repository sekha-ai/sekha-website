# Importing Conversations from ChatGPT and Claude

Project Sekha can automatically import your conversation history from ChatGPT and Claude AI.

## Setup

The file watcher monitors `~/.sekha/import/` for new export files:

Create import directory (done automatically on first run)
mkdir -p ~/.sekha/import
mkdir -p ~/.sekha/imported


## Importing from ChatGPT

### Export Your Conversations

1. Go to [ChatGPT Settings](https://chat.openai.com/settings)
2. Navigate to **Data Controls** → **Export Data**
3. Download your `conversations.json` file

### Import into Sekha

Copy export file to import directory
cp ~/Downloads/conversations.json ~/.sekha/import/

Sekha will automatically:
1. Detect the file
2. Parse ChatGPT format
3. Import conversations
4. Move file to ~/.sekha/imported/


**Supported formats:**
- Single conversation: `{"title": "...", "mapping": {...}}`
- Multiple conversations: `[{"title": "..."}, ...]`

## Importing from Claude

### Export Your Conversations

1. Open Claude conversation
2. Click **Export** button
3. Save as JSON or XML

### Import into Sekha

cp ~/Downloads/claude_export.json ~/.sekha/import/

**Supported formats:**
- JSON: `{"conversations": [...]}`
- XML: `<conversation>...</conversation>`

## Verify Import

Check import logs
tail -f ~/.sekha/logs/file_watcher.log

Query imported conversations via API
curl http://localhost:8080/api/v1/conversations?folder=/imports/chatgpt


## Automatic Import

The file watcher runs continuously while Sekha is active:

- **Detects:** `.json` and `.xml` files
- **Processes:** ChatGPT and Claude formats
- **Archives:** Processed files to `~/.sekha/imported/`


## Troubleshooting

**File not processed?**
Check file format
cat ~/.sekha/import/your_file.json | jq .

Check logs
journalctl -u sekha-controller | grep "file_watcher"

**Import failed?**
- Ensure file is valid JSON/XML
- Check Sekha has write permissions to `~/.sekha/`
- Verify database is accessible

## Manual Import

Use the CLI tool for one-time imports:
sekha import --file ~/path/to/conversations.json


## Import Statistics

After import, conversations are tagged:

- **Folder:** `/imports/chatgpt` or `/imports/claude`
- **Metadata:** `{"source": "chatgpt", "imported_at": "..."}`
- **Status:** `active`

Query import stats:

curl http://localhost:8080/api/v1/conversations/count?label=imports


Usage:
# Start Sekha (file watcher runs automatically)
cargo run

# Drop export file into watched directory
cp conversations.json ~/.sekha/import/

# Check logs
# 📁 Watching for imports in: /home/user/.sekha/import
# 📥 New file detected: conversations.json
# 🤖 Detected ChatGPT export format (array)
# 📊 Found 42 conversations
# ✅ Imported conversation: <uuid>
# 🎉 Successfully imported 42 conversations from conversations.json
# 📦 Moved to: /home/user/.sekha/imported/20251220_144500_conversations.json

