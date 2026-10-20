// Apply sentence rewrites from prose-plan-2026-10-08.json. Usage: node prose.mjs dry|apply
import fs from 'fs'; import { fileURLToPath } from 'url'; import { sb } from '../link-citations/lib.mjs';
const dir = fileURLToPath(new URL('.', import.meta.url)); const mode = process.argv[2] || 'dry';
const plan = JSON.parse(fs.readFileSync(dir + 'prose-plan-2026-10-08.json', 'utf8'));
const slugs = [...new Set(plan.map(p => p.slug))];
const { data: rows, error } = await sb.from('blog_posts').select('id,slug,body_markdown,ar_body_markdown').in('slug', slugs).is('deleted_at', null);
if (error) throw error;
let hit = 0, miss = []; const patches = [];
for (const r of rows) {
  const patch = {};
  for (const col of ['body_markdown', 'ar_body_markdown']) {
    let v = r[col]; if (!v) continue; const before = v;
    for (const p of plan.filter(p => p.slug === r.slug)) if (v.includes(p.old)) { v = v.split(p.old).join(p.new); hit++; }
    if (v !== before) patch[col] = v;
  }
  if (Object.keys(patch).length) patches.push({ r, patch });
}
for (const p of plan) { const r = rows.find(r => r.slug === p.slug); if (!r || ![r.body_markdown, r.ar_body_markdown].some(v => v && v.includes(p.old))) miss.push(p.old.slice(0, 60)); }
console.log(`plan ${plan.length}, replacements ${hit}, rows ${patches.length}, unmatched ${miss.length}`, miss);
if (mode === 'apply') {
  fs.writeFileSync(`${dir}backup-prose-${Date.now()}.json`, JSON.stringify(patches.map(p => p.r)));
  let ok = 0; for (const { r, patch } of patches) { const { error } = await sb.from('blog_posts').update(patch).eq('id', r.id); if (error) console.error(r.slug, error.message); else ok++; }
  console.log(`updated ${ok}/${patches.length}`);
}
