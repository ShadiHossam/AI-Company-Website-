import fs from 'fs';
import { SOURCES } from './sources.mjs';
const U = p => new URL('./' + p, import.meta.url);
const bfile = fs.readdirSync(U('.')).find(x => x.startsWith('backup-blog_posts'));
const rows = JSON.parse(fs.readFileSync(U(bfile), 'utf8'));
const ups  = JSON.parse(fs.readFileSync(U('updates.json'), 'utf8'));
const byId = Object.fromEntries(rows.map(r => [r.id, r]));
const slugs = new Set(rows.map(r => r.slug));
const routes = new Set(fs.readFileSync(U('routes.txt'), 'utf8').split('\n').map(s => s.trim()).filter(Boolean));
const approved = new Set(Object.values(SOURCES).flatMap(s => [s.en.url, s.ar.url]));

const fail = [];
const preexisting = new Set();
const preRoutes = new Set();
const add = (slug, col, msg) => fail.push(`${slug} [${col}] ${msg}`);
let bodies = 0, extTotal = 0, intTotal = 0, grew = 0;

for (const u of ups) {
  const row = byId[u.id];
  for (const [col, md] of Object.entries(u.patch)) {
    bodies++;
    const before = row[col];

    // 1. structural integrity
    if (/\[[^\]]*\[[^\]]*\]\([^)]*\)[^\]]*\]\(/.test(md)) add(row.slug, col, 'nested link');
    if (/\]\(\s*\)/.test(md)) add(row.slug, col, 'empty href');
    if (/\[\s*\]\(/.test(md)) add(row.slug, col, 'empty anchor text');
    const ob = (md.match(/\]\(/g) || []).length, cb = (md.match(/\[/g) || []).length;
    if (ob > cb) add(row.slug, col, `unbalanced brackets ${cb}[ vs ${ob}](`);
    if (/\n#{1,6}[^ #]/.test(md)) add(row.slug, col, 'malformed heading');

    // 2. no original prose lost: everything removed must be a dead href
    const stripLinks = t => t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    const beforeText = stripLinks(before).replace(/\s+/g, ' ').trim();
    const afterText  = stripLinks(md).replace(/\s+/g, ' ').trim();
    if (!afterText.includes(beforeText.slice(0, 400))) add(row.slug, col, 'opening prose changed');
    if (afterText.length < beforeText.length) add(row.slug, col, 'text shrank');
    if (afterText.length > beforeText.length) grew++;

    // 3. every link resolves
    const re = /\[([^\]]*)\]\(([^)\s]+)\)/g; let m, ext = 0, int = 0;
    while ((m = re.exec(md))) {
      const href = m[2];
      if (/^https?:\/\/(www\.)?lenooai\.com\/?$/i.test(href)) { int++; continue; }
      if (/^https?:\/\//i.test(href)) {
        ext++;
        // only links this pass introduced are held to the approved list;
        // citations the article already carried are audited separately
        if (!approved.has(href) && !before.includes(href)) add(row.slug, col, `unapproved external ${href}`);
        if (!approved.has(href)) preexisting.add(href);
        continue;
      }
      if (!href.startsWith('/')) { add(row.slug, col, `odd href ${href}`); continue; }
      int++;
      const path = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
      const bm = /^\/(?:ar\/)?blog\/(.+)$/.exec(path);
      if (bm) { if (!slugs.has(bm[1])) add(row.slug, col, `dead blog target ${path}`); }
      else if (!routes.has(path) && !before.includes(href)) add(row.slug, col, `unknown route ${path}`);
      else if (!routes.has(path)) preRoutes.add(path);
    }
    if (ext < 5) add(row.slug, col, `only ${ext} external citations`);
    if (int < 5) add(row.slug, col, `only ${int} internal links`);
    extTotal += ext; intTotal += int;

    // 4. citation must not sit inside a heading
    for (const line of md.split('\n')) if (/^#{1,6} /.test(line) && /\]\(http/.test(line)) add(row.slug, col, 'link inside heading');
  }
}
console.log(`bodies checked: ${bodies} | external ${extTotal} | internal ${intTotal} | bodies that grew: ${grew}`);
console.log(`approved source URLs: ${approved.size}`);
if (fail.length) { console.log(`\nFAILURES (${fail.length}):`); fail.slice(0, 40).forEach(f => console.log('  ' + f)); }
else console.log('\nall checks passed for everything this pass added');
fs.writeFileSync(U('preexisting-urls.txt'), [...preexisting].sort().join('\n'));
console.log(`\npre-existing external URLs outside the verified library: ${preexisting.size} (written to preexisting-urls.txt)`);
console.log(`pre-existing internal links to routes that do not exist: ${preRoutes.size}`);
[...preRoutes].sort().slice(0, 25).forEach(p => console.log('   ' + p));
