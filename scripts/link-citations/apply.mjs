import fs from 'fs';
import { sb } from './lib.mjs';
const ups = JSON.parse(fs.readFileSync(new URL('./updates.json', import.meta.url), 'utf8'));
let ok = 0, failed = [];
for (let i = 0; i < ups.length; i++) {
  const u = ups[i];
  const { error } = await sb.from('blog_posts').update(u.patch).eq('id', u.id);
  if (error) { failed.push([u.slug, error.message]); } else { ok++; }
  if ((i + 1) % 50 === 0) process.stdout.write(`  ${i + 1}/${ups.length}\n`);
}
console.log(`updated ${ok}/${ups.length} rows`);
if (failed.length) { console.log('FAILED:'); failed.forEach(f => console.log('  ', f[0], f[1])); process.exit(1); }
