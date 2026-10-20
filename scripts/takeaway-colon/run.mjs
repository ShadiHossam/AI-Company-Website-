// Rewrite bold-lead bullets "- **Claim** — text" to "- **Claim:** text" in blog_posts.
// Usage: node run.mjs dry | apply
import fs from 'fs';
import { sb } from '../link-citations/lib.mjs';
const mode = process.argv[2] || 'dry';
import { fileURLToPath } from 'url';
const dir = fileURLToPath(new URL('.', import.meta.url));
const RE = /^(\s*(?:[-*+]|\d+[.)])\s+)\*\*([^*\n]+?)\*\*\s*—\s*/gm;
const fix = (s) => s.replace(RE, (_, lead, claim) => {
  const c = claim.trim();
  return `${lead}**${/[.:?!؟]$/.test(c) ? c : c + ':'}** `;
});
let rows = [], from = 0;
while (true) {
  const { data, error } = await sb.from('blog_posts').select('id,slug,status,body_markdown,ar_body_markdown').is('deleted_at', null).order('id').range(from, from + 499);
  if (error) throw error; rows = rows.concat(data); if (data.length < 500) break; from += 500;
}
const changes = [];
let n = 0;
for (const r of rows) {
  const patch = {};
  for (const col of ['body_markdown', 'ar_body_markdown']) {
    const v = r[col]; if (!v) continue;
    const m = v.match(RE); if (!m) continue;
    patch[col] = fix(v); n += m.length;
  }
  if (Object.keys(patch).length) changes.push({ r, patch });
}
const byStatus = changes.reduce((a, c) => (a[c.r.status] = (a[c.r.status] || 0) + 1, a), {});
console.log(`rows scanned ${rows.length}, rows to change ${changes.length}`, byStatus, `bullets fixed ${n}`);
if (mode === 'dry') {
  for (const c of changes.slice(0, 3).concat(changes.slice(-2))) for (const col in c.patch) {
    const before = c.r[col].split('\n').find(l => RE.test(l)); RE.lastIndex = 0;
    console.log(`\n[${c.r.slug} ${col}]\n- ${before.slice(0, 160)}\n+ ${fix(before).slice(0, 160)}`);
  }
  const left = changes.reduce((a, c) => a + Object.values(c.patch).join('').split('—').length - 1, 0);
  console.log(`\nem dashes remaining elsewhere in changed rows: ${left}`);
} else {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(`${dir}backup-${stamp}.json`, JSON.stringify(changes.map(c => c.r)));
  console.log('backup written', `backup-${stamp}.json`);
  let ok = 0;
  for (const c of changes) {
    const { error } = await sb.from('blog_posts').update(c.patch).eq('id', c.r.id);
    if (error) { console.error(c.r.slug, error.message); continue; } ok++;
  }
  console.log(`updated ${ok}/${changes.length}`);
}
