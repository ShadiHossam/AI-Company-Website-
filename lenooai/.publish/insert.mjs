// Insert rows.json into blog_posts. Skips slugs that already exist, so it is safe to re-run.
import fs from 'fs';
import { sb } from '../../scripts/link-citations/lib.mjs';
const rows = JSON.parse(fs.readFileSync(new URL('./rows.json', import.meta.url), 'utf8'));
const { data: have, error: e } = await sb.from('blog_posts').select('slug').like('slug', 'abu-dhabi/%');
if (e) throw e;
const skip = new Set(have.map(r => r.slug));
const todo = rows.filter(r => !skip.has(r.slug));
console.log(`inserting ${todo.length} (skipping ${rows.length - todo.length} existing)`);
for (let i = 0; i < todo.length; i += 20) {
  const { error } = await sb.from('blog_posts').insert(todo.slice(i, i + 20));
  if (error) { console.error('FAILED at', i, error.message); process.exit(1); }
  console.log('ok', Math.min(i + 20, todo.length));
}
