# 🔌 MCP Directory

A curated, verified directory of **122 Model Context Protocol (MCP) servers** — what each one does, what it really costs, and copy-paste connect configs for Claude Code, Claude Desktop, Cursor and VS Code.

**Live:** deployed on Vercel · single static page, no build step, no frameworks.

## Why another list?

- **MCP ≠ API.** An API is a service's raw interface; an MCP server is the standard connector that lets any AI agent use it. Server code is almost always free — what costs money is the service behind it. The tier badges here rate the **end-to-end cost**:
  - 🆓 **Free** — works at $0
  - 🔑 **Freemium** — free tier exists, real usage needs a paid plan/API key
  - 💎 **Paid** — needs a paid product or paid API
- **Verified data.** Every GitHub repo listed is checked against the GitHub API (stars baked in, moved/renamed repos resolved, dead ones removed).
- **Security notes** on servers that hold real credentials or carry prompt-injection risk.

## Structure

| File | Purpose |
|---|---|
| `index.html` | The whole site — tabs, search, category filters, connect snippets |
| `data.js` | Curated server data (source of truth) |
| `stars.js` | Star counts, generated — don't edit by hand |
| `fetch-stars.mjs` | Regenerates `stars.js` and flags moved/404 repos |

## Updating

```bash
# refresh star counts + validate all repo links
GITHUB_TOKEN=<token> node fetch-stars.mjs
```

Add a server: append an entry to `SERVERS` in `data.js` (see the field comments at the top of the file), run the fetch script, done.

## Submit a server

Open an [issue](../../issues/new) with: name, repo/docs URL, what it does, tier, and whether it's vendor-official.
