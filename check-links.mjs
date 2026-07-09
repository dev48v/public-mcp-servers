// Checks that every curated server's `url` is alive. Informational (CI job is non-blocking).
// Usage: node check-links.mjs
import { readFileSync } from "fs";

const src = readFileSync(new URL("./data.js", import.meta.url), "utf8");
const { SERVERS } = new Function(src + ";return {SERVERS};")();
const urls = [...new Set(SERVERS.map(s => s.url).filter(Boolean))];
const dead = [], warn = [];

await Promise.all(urls.map(async url => {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) mcp-directory-linkcheck" }
    });
    if (res.status === 404 || res.status === 410) dead.push(`${res.status} ${url}`);
    else if (res.status >= 500) warn.push(`${res.status} ${url}`);
  } catch (e) {
    warn.push(`ERR(${e.cause?.code || e.name}) ${url}`);
  }
}));

console.log(`checked ${urls.length} server URLs`);
if (warn.length) { console.log("WARN (5xx / timeout — often transient):"); warn.forEach(u => console.log("  " + u)); }
if (dead.length) { console.log("DEAD (404/410):"); dead.forEach(u => console.log("  " + u)); process.exit(1); }
console.log("all alive");
