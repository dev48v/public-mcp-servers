# Contributing

Thanks for helping grow the MCP Directory! Contributions are welcome — new servers, corrected tiers, fixed links, or better connect configs.

## How to contribute

1. Fork the repo and create a branch.
2. Add or edit **one entry** in `data.js` (the curated list) — keep the diff small.
3. Open a PR with a short summary of what you added/changed.

## Entry format & naming

Add a new object to the `SERVERS` array in `data.js`, following this exact shape:

```js
{ id:"uniqueid", n:"Display Name", cat:"dev", tier:"free", badge:"official", tr:"stdio",
  repo:"owner/repo", url:"https://github.com/owner/repo",
  use:"One clear sentence on what the server does.",
  env:["API_KEY"], inst:{t:"npx", v:"@scope/package", args:["--flag"]},
  sec:"Optional one-line security caveat if it holds real credentials." }
```

**Naming & field rules:**
- `id` — lowercase, no spaces, **unique** across the file.
- `n` — real server/product name.
- `cat` — an existing key in `CATS` (`dev`, `browser`, `db`, `cloud`, `search`, `prod`, `comm`, `fin`, `ai`, `secmon`, `design`, `know`, `biz`, `util`).
- `tier` — be **honest**: `free` (works at $0), `freemium` (free tier, real use costs the service behind it), `paid`.
- `badge` — `official` (vendor-built) · `community` · `reference` (Anthropic reference server).
- `tr` — transport: `stdio` · `http` · `sse`.
- `repo` — `owner/repo` on GitHub (used for the ★ star count), or `null` if none.
- `url` — the server's docs/repo landing page.
- `use` — one honest sentence. No marketing copy.
- `env` — array of required env var names (`[]` if none).
- `inst.t` — how to run it: `npx` · `uvx` · `docker` · `http` · `sse` · `docs` (with `v` = package/URL, optional `args`).
- `sec` — optional; add if the server acts on the user's accounts or handles secrets.

## Rules

- **No broken links** — `url` must resolve.
- **Be honest about tier and badge.** Don't mark a community server "official".
- **Security first** — if the server runs with user credentials or fetches untrusted content, note it in `sec`.
- **Self-submissions are allowed** if the entry is accurate, useful, and follows the format above.
- **One entry per PR** keeps review fast.
- The extended **Catalog** tab is auto-synced from the public MCP registries — no need to add those manually. Use `scrape-catalog.mjs` to regenerate it.

## Validate before submitting

```bash
node -e "new Function(require('fs').readFileSync('data.js','utf8'))"   # data.js parses
```
