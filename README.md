# 🔌 MCP Directory

**18,000+ MCP servers in one place.** Live: **https://mcp-directory-jade.vercel.app** — a single static page, no build step. Sister site of [public-apis](https://github.com/dev48v/public-apis).

Two layers:

1. **125+ hand-curated servers** — what each does, what it costs (tier badge), and exact connect configs for **Claude Code / Claude Desktop / Cursor / VS Code**.
2. **18,000+ server catalog** — merged from every public MCP registry: the [official registry](https://registry.modelcontextprotocol.io), [Smithery](https://smithery.ai), [Glama](https://glama.ai) and [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers). Names, descriptions and links; not individually vetted.

## MCP ≠ API

An **API** is a service's raw interface. An **MCP server** is a standard connector that wraps tools/data so any AI agent can use them — the agent speaks one protocol (MCP) instead of a hundred APIs. Server code is almost always free & open source; the **tier badge rates what it costs to actually use it end-to-end**, including the service behind it.

## Structure

| File | Purpose |
|---|---|
| \`index.html\` | The whole site — tabs, search, filters, connect-config generator, catalog |
| \`data.js\` | Curated server data (source of truth) |
| \`stars.js\` | GitHub star counts, generated |
| \`mcp-catalog.js\` | Extended catalog (~18k), generated |
| \`fetch-stars.mjs\` | Regenerates stars.js |
| \`scrape-catalog.mjs\` | Rebuilds mcp-catalog.js from the public registries (raw fetch, no clone) |
| \`validate.mjs\` | PR schema check (runs in CI) |
| \`check-links.mjs\` | PR link check (runs in CI) |

## Contributing

New servers, fixed tiers/links and better connect configs are welcome. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the entry format and naming rules, then open a PR (one entry per PR). A GitHub Action validates every PR against the schema. Licensed **MIT** — see [LICENSE](LICENSE).
