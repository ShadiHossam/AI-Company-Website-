import fs from 'fs';
import { SOURCES } from './sources.mjs';
import { MATCHERS_EN, MATCHERS_AR, CLUSTERS, BRIDGE, BRIDGE_ALT, AR_FALLBACK } from './config.mjs';
import { MONEY_TITLES } from './moneytitles.mjs';
import { stripDeadLinks, inlineCitations, insertSentences, addInternalLinks, countLinks, repairBrokenCitations } from './engine.mjs';

const TARGET = 5;
const AR_RE = /[؀-ۿ]/;
const isArTitle = t => { if (!t) return false; let L=0,a=0; for (const c of t){ if(!/\p{L}/u.test(c))continue; L++; if(AR_RE.test(c))a++; } return L>0 && a/L>0.5; };
const hash = s => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); };

const IN  = process.env.IN  || fs.readdirSync(new URL('.', import.meta.url)).find(x => x.startsWith('backup-blog_posts'));
const OUT = process.env.OUT || 'updates.json';
const REP = process.env.REP || 'report.json';
const rows = JSON.parse(fs.readFileSync(new URL('./' + IN, import.meta.url), 'utf8'));

const liveSlugs = new Set(rows.map(r => r.slug));
const enLive = new Set(rows.filter(r => !isArTitle(r.title)).map(r => r.slug));
const arLive = new Set(rows.filter(r => r.ar_title).map(r => r.slug));

// inbound counts, for orphan weighting
const inbound = {};
for (const r of rows) for (const k of ['body_markdown','ar_body_markdown']) {
  const re = /\]\((?:https?:\/\/(?:www\.)?lenooai\.com)?\/(?:ar\/)?blog\/([^)\s#?]+)/g; let m;
  while ((m = re.exec(r[k] || ''))) if (liveSlugs.has(m[1])) inbound[m[1]] = (inbound[m[1]]||0) + 1;
}

const byCat = {};
for (const r of rows) (byCat[r.category] = byCat[r.category] || []).push(r);

function siblingsFor(row, cat, lang, exclude) {
  const pool = (byCat[cat] || []).filter(r => r.slug !== row.slug && !exclude.has(r.slug)
    && (lang === 'ar' ? arLive.has(r.slug) : enLive.has(r.slug)));
  // orphans first, then least-linked; deterministic tiebreak on slug
  pool.sort((a, b) => (inbound[a.slug]||0) - (inbound[b.slug]||0) || a.slug.localeCompare(b.slug));
  const off = hash(row.slug) % Math.max(1, Math.min(6, pool.length));
  return pool.slice(0, 12).slice(off).concat(pool.slice(0, off));
}

/**
 * Anchor text for a link to another article. Titles are written for the
 * <title> tag, so most carry a "Main clause: long subtitle" shape plus the
 * odd keyword left in brackets. The lead clause is the better anchor.
 */
function titleOf(r, lang) {
  let t = (lang === 'ar' ? (r.ar_title || r.title) : r.title) || r.slug;
  t = t.replace(/\s*\|\s*Lenoo AI\s*$/i, '').trim();
  t = t.replace(/\s*\([a-z0-9 ]{6,}\)\s*$/i, '').trim();   // stray target keyword
  const head = t.split(/\s*[:\u061F?]\s*/)[0].trim();
  if (head.length >= 20 && head.length < t.length) t = head;
  return t;
}
const blogPath = (slug, lang) => lang === 'ar' ? `/ar/blog/${slug}` : `/blog/${slug}`;

const report = [];
const updates = [];

for (const row of rows) {
  const sides = [];
  if (!isArTitle(row.title) && row.body_markdown) sides.push(['en', 'body_markdown', row.category]);
  if (row.ar_title && row.ar_body_markdown) {
    const cat = CLUSTERS[row.category]?.lang === 'ar' ? row.category : (AR_FALLBACK[row.category] || row.category);
    sides.push(['ar', 'ar_body_markdown', cat]);
  }
  const patch = {};
  for (const [lang, col, cat] of sides) {
    const cfg = CLUSTERS[cat];
    if (!cfg) { report.push({ slug: row.slug, lang, skip: 'no cluster config for ' + cat }); continue; }
    let md = row[col];
    const before = countLinks(md);

    // 1. drop links to articles that were never written
    const s1 = stripDeadLinks(md, sl => liveSlugs.has(sl));
    md = s1.md;

    // 1b. repoint citations whose page is gone
    const s1b = repairBrokenCitations(md);
    md = s1b.md;

    // 2. cite entities the copy already names
    const need = Math.max(0, TARGET - countLinks(md).ext);
    // Alternate the PDPL citation between the legislation text and the
    // government's plain-English page on the same law, so one URL does not
    // become a site-wide footprint. Both support a PDPL mention.
    let matchers = lang === 'ar' ? MATCHERS_AR : MATCHERS_EN;
    if (hash(row.slug + 'pdpl') % 3 === 0) matchers = matchers.map(([id, re]) => [id === 'pdpl' ? 'pdpl_overview' : id, re]);
    const s2 = inlineCitations(md, matchers, lang, need);
    md = s2.md;

    // 3. add source-backed sentences for whatever is still short
    const still = Math.max(0, TARGET - countLinks(md).ext);
    let picks = [];
    if (still > 0) {
      const pool = cfg.pool.filter(id => !md.includes(SOURCES[id][lang].url));
      const off = hash(row.slug + lang) % Math.max(1, pool.length);
      picks = pool.slice(off).concat(pool.slice(0, off)).slice(0, still);
    }
    const s3 = insertSentences(md, picks, lang);
    md = s3.md;

    // 4. internal links to target
    const have = countLinks(md).int;
    let s4 = { md, added: [] };
    if (have < TARGET) {
      const want = TARGET - have;
      const seen = new Set([row.slug]);
      const cand = [];
      const liveSet = lang === 'ar' ? arLive : enLive;
      const push = (slug, r) => { if (!seen.has(slug) && liveSet.has(slug)) { seen.add(slug); cand.push({ path: blogPath(slug, lang), title: titleOf(r, lang) }); } };
      // slot 1: cluster hub
      const hubRow = rows.find(r => r.slug === cfg.hub);
      if (hubRow) push(cfg.hub, hubRow);
      // slots 2-3: cluster siblings, orphans first
      for (const sib of siblingsFor(row, cat, lang, seen).slice(0, 2)) push(sib.slug, sib);
      // slot 4: money page
      if (!md.includes(`](${cfg.money})`)) cand.push({ path: cfg.money, title: MONEY_TITLES[cfg.money] || cfg.money });
      // slot 5: compliance bridge
      const bslug = cfg.hub === BRIDGE[lang] ? BRIDGE_ALT[lang] : BRIDGE[lang];
      const brow = rows.find(r => r.slug === bslug);
      if (brow) push(bslug, brow);
      // deeper bench: the rest of the cluster, then the most useful
      // cross-cluster pages, so small clusters still reach the target
      for (const sib of siblingsFor(row, cat, lang, seen)) push(sib.slug, sib);
      for (const other of Object.entries(CLUSTERS)) {
        if (other[0] === cat || other[1].lang !== (lang === 'ar' ? 'ar' : 'en')) continue;
        const hr = rows.find(r => r.slug === other[1].hub);
        if (hr) push(other[1].hub, hr);
      }
      s4 = addInternalLinks(md, cand, lang, want);
      md = s4.md;
    }

    const after = countLinks(md);
    if (md !== row[col]) patch[col] = md;
    report.push({ slug: row.slug, lang, cat, before, after,
      dead_removed: s1.removed, repaired: s1b.repaired, inline: s2.added, sentences: s3.added, internal: s4.added });
  }
  if (Object.keys(patch).length) updates.push({ id: row.id, slug: row.slug, patch });
}

fs.writeFileSync(new URL('./' + REP, import.meta.url), JSON.stringify(report, null, 1));
fs.writeFileSync(new URL('./' + OUT, import.meta.url), JSON.stringify(updates, null, 1));

const sum = (f) => report.reduce((a, r) => a + (f(r) || 0), 0);
const en = report.filter(r => r.lang === 'en' && r.after), ar = report.filter(r => r.lang === 'ar' && r.after);
const line = (n, l) => `${n}: ${l.length} bodies | ext ${l.reduce((a,r)=>a+r.before.ext,0)} -> ${l.reduce((a,r)=>a+r.after.ext,0)} | below 5 ext: ${l.filter(r=>r.before.ext<5).length} -> ${l.filter(r=>r.after.ext<5).length} | int ${l.reduce((a,r)=>a+r.before.int,0)} -> ${l.reduce((a,r)=>a+r.after.int,0)} | below 5 int: ${l.filter(r=>r.before.int<5).length} -> ${l.filter(r=>r.after.int<5).length}`;
console.log(line('EN', en));
console.log(line('AR', ar));
console.log('dead links removed:', sum(r => r.dead_removed), '| broken citations repointed:', sum(r => r.repaired));
console.log('inline citations:', sum(r => r.inline?.length), '| inserted sentences:', sum(r => r.sentences?.length), '| internal links added:', sum(r => r.internal?.length));
console.log('rows to update:', updates.length);
const skips = report.filter(r => r.skip); if (skips.length) console.log('SKIPPED:', skips.length, skips.slice(0,5));
// source spread
const spread = {}; for (const r of report) for (const id of [...(r.inline||[]), ...(r.sentences||[])]) spread[id]=(spread[id]||0)+1;
console.log('\nsource spread (' + Object.keys(spread).length + ' distinct):');
console.log(Object.entries(spread).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join('  '));
