// PR validator — checks data.js entries against the CONTRIBUTING.md schema.
// Run by .github/workflows/validate.yml on every PR; exits 1 on any violation.
import { readFileSync } from "fs";

const src = readFileSync(new URL("./data.js", import.meta.url), "utf8");
let SERVERS, CATS;
try {
  ({ SERVERS, CATS } = new Function(src + ";return {SERVERS,CATS};")());
} catch (e) {
  console.error("❌ data.js does not parse as JavaScript:\n   " + e.message);
  process.exit(1);
}

const TIERS = ["free", "freemium", "paid"];
const BADGES = ["official", "community", "reference"];
const TRS = ["stdio", "http", "sse"];
const INSTT = ["npx", "uvx", "docker", "http", "sse", "docs"];
const errs = [], warns = [], ids = new Set();

SERVERS.forEach((s, i) => {
  const at = `#${i + 1} "${s.n || s.id || "?"}"`;
  for (const f of ["id", "n", "cat", "tier", "badge", "tr", "use", "inst"])
    if (s[f] === undefined || s[f] === "") errs.push(`${at}: missing required field \`${f}\``);
  if (s.id) {
    if (!/^[a-z0-9-]+$/.test(s.id)) errs.push(`${at}: \`id\` must be lowercase letters/digits/dashes only`);
    if (ids.has(s.id)) errs.push(`${at}: duplicate \`id\` "${s.id}"`);
    ids.add(s.id);
  }
  if (s.cat && !CATS[s.cat]) errs.push(`${at}: \`cat\` "${s.cat}" is not a valid category (see CATS)`);
  if (s.tier && !TIERS.includes(s.tier)) errs.push(`${at}: \`tier\` must be one of ${TIERS.join(" / ")}`);
  if (s.badge && !BADGES.includes(s.badge)) errs.push(`${at}: \`badge\` must be one of ${BADGES.join(" / ")}`);
  if (s.tr && !TRS.includes(s.tr)) errs.push(`${at}: \`tr\` must be one of ${TRS.join(" / ")}`);
  if (s.inst && !INSTT.includes(s.inst.t)) errs.push(`${at}: \`inst.t\` must be one of ${INSTT.join(" / ")}`);
  if (s.env !== undefined && !Array.isArray(s.env)) errs.push(`${at}: \`env\` must be an array`);
  if (s.url && !/^https?:\/\//.test(s.url)) errs.push(`${at}: \`url\` must start with http(s)://`);
  if (s.repo && !/^[\w.-]+\/[\w.-]+$/.test(s.repo)) warns.push(`${at}: \`repo\` should be "owner/repo"`);
  if (s.use && s.use.length > 200) warns.push(`${at}: \`use\` is long (${s.use.length} chars) — keep it one sentence`);
});

const ok = errs.length === 0;
const lines = [];
lines.push(`## ${ok ? "✅" : "❌"} Contribution check — ${SERVERS.length} servers`);
if (errs.length) { lines.push(`\n**${errs.length} error(s)** — must fix before merge:`); errs.forEach(e => lines.push(`- ❌ ${e}`)); }
if (warns.length) { lines.push(`\n**${warns.length} warning(s):**`); warns.forEach(w => lines.push(`- ⚠️ ${w}`)); }
if (ok && !warns.length) lines.push(`\nAll entries follow [CONTRIBUTING.md](../CONTRIBUTING.md). 🎉`);
const out = lines.join("\n");
console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) {
  try { readFileSync; const fs = await import("fs"); fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + "\n"); } catch {}
}
process.exit(ok ? 0 : 1);
