// Builds mcp-catalog.js from public MCP registries (raw fetch, no clone).
// Sources: official registry.modelcontextprotocol.io, Smithery, Glama, punkpeye/awesome-mcp-servers.
// Usage: node scrape-catalog.mjs
import { readFileSync, writeFileSync } from "fs";

const dataSrc = readFileSync(new URL("./data.js", import.meta.url), "utf8");
const { SERVERS } = new Function(dataSrc + ";return {SERVERS};")();
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const norm = s => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const seenName = new Set(SERVERS.map(s => norm(s.n)));
const seenRepo = new Set(SERVERS.map(s => (s.repo || "").toLowerCase()).filter(Boolean));
const rows = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "mcp-directory" } });
      if (r.ok) return await r.json();
      if (r.status === 429) { await sleep(2000); continue; }
      return null;
    } catch { await sleep(600); }
  }
  return null;
}
function push(n, d, u, src, tr) {
  if (!n) return;
  const nk = norm(n);
  if (nk.length < 2 || seenName.has(nk)) return;
  const repoMatch = /github\.com\/([^/]+\/[^/#?]+)/.exec(u || "");
  if (repoMatch && seenRepo.has(repoMatch[1].toLowerCase())) return;
  seenName.add(nk);
  rows.push({ n: n.slice(0, 80), d: (d || "").replace(/\s+/g, " ").trim().slice(0, 180), u: u || "", src, tr: tr || "" });
}

// 1) Official MCP registry
let cursor = "", pages = 0, scanned = 0;
while (pages < 200) {
  const j = await getJSON("https://registry.modelcontextprotocol.io/v0/servers?limit=100" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""));
  if (!j) break;
  const servers = j.servers || [];
  for (const it of servers) {
    const s = it.server || it;
    const link = (s.repository && s.repository.url) || (s.remotes && s.remotes[0] && s.remotes[0].url) || s.websiteUrl || "";
    const tr = s.remotes && s.remotes[0] ? (s.remotes[0].type || "http") : (s.packages && s.packages.length ? "stdio" : "");
    push(s.title || s.name, s.description, link, "registry", tr); scanned++;
  }
  cursor = j.metadata && j.metadata.nextCursor;
  pages++;
  if (!cursor || !servers.length) break;
  await sleep(80);
}
console.log(`registry: ${scanned} scanned, ${rows.length} kept (${pages} pages)`);

// 2) Smithery
let sp = 1, before = rows.length, stotal = 0;
while (sp <= 200) {
  const j = await getJSON(`https://registry.smithery.ai/servers?page=${sp}&pageSize=100`);
  if (!j || !j.servers || !j.servers.length) break;
  for (const s of j.servers) push(s.displayName || s.qualifiedName, s.description, s.qualifiedName ? "https://smithery.ai/server/" + s.qualifiedName : s.homepage, "smithery", s.connections && s.connections[0] && s.connections[0].type);
  stotal = (j.pagination && j.pagination.totalPages) || sp;
  if (sp >= stotal) break;
  sp++; await sleep(80);
}
console.log(`smithery: +${rows.length - before} kept (${sp}/${stotal} pages)`);

// 3) Glama
let gc = "", gp = 0; before = rows.length;
while (gp < 90) {
  const j = await getJSON("https://glama.ai/api/mcp/v1/servers?first=100" + (gc ? "&after=" + encodeURIComponent(gc) : ""));
  if (!j) break;
  for (const s of (j.servers || [])) push(s.name, s.description, s.url || (s.repository && s.repository.url) || "", "glama", "");
  if (!j.pageInfo || !j.pageInfo.hasNextPage) break;
  gc = j.pageInfo.endCursor; gp++; await sleep(80);
}
console.log(`glama: +${rows.length - before} kept (${gp} pages)`);

// 4) awesome-mcp-servers README
before = rows.length;
const md = await (await fetch("https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md", { signal: AbortSignal.timeout(30000) })).text().catch(() => "");
for (const m of md.matchAll(/^[-*]\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*(.*)$/gm)) {
  const name = m[1].replace(/[^\x20-\x7E]+/g, "").trim();
  if (/^https?:/.test(name) || name.length < 2) continue;
  push(name, m[3].replace(/^[-–—:\s]+/, "").replace(/[`*]/g, "").trim(), m[2], "awesome", "");
}
console.log(`awesome: +${rows.length - before} kept`);

writeFileSync(new URL("./mcp-catalog.js", import.meta.url),
  "// Extended MCP catalog — merged from registry.modelcontextprotocol.io, Smithery, Glama, punkpeye/awesome-mcp-servers (raw-fetched).\n" +
  "// Regenerate: node scrape-catalog.mjs\n" +
  "const MCP_CATALOG = " + JSON.stringify(rows) + ";\n");
const bySrc = rows.reduce((m, r) => (m[r.src] = (m[r.src] || 0) + 1, m), {});
console.log(`TOTAL catalog: ${rows.length} | by source: ${JSON.stringify(bySrc)}`);
