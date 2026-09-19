import { SOURCES } from './sources.mjs';

/* ---------- protected ranges: never link inside these ---------- */
const PROTECT = [
  /```[\s\S]*?```/g,          // fenced code
  /`[^`\n]*`/g,               // inline code
  /!\[[^\]]*\]\([^)]*\)/g,    // images
  /\[[^\]]*\]\([^)]*\)/g,     // existing markdown links (text and target)
  /<[^>\n]+>/g,               // html tags
  /https?:\/\/\S+/g,          // bare urls
  /^#{1,6} .*$/gm,            // headings
  /^\s*\|.*\|\s*$/gm,         // table rows
  /^\s*[-*+]\s+\*\*[^*\n]+\*\*/gm, // bolded lead-in of a list item
];
function protectedRanges(md) {
  const r = [];
  for (const re of PROTECT) { re.lastIndex = 0; let m; while ((m = re.exec(md))) r.push([m.index, m.index + m[0].length]); }
  return r.sort((a, b) => a[0] - b[0]);
}
const inRange = (r, s, e) => r.some(([a, b]) => s < b && e > a);

/* ---------- 1. strip links to articles that were never written ---------- */
export function stripDeadLinks(md, isLiveSlug) {
  if (!md) return { md, removed: 0 };
  let removed = 0;
  const out = md.replace(/\[([^\]]+)\]\((?:https?:\/\/(?:www\.)?lenooai\.com)?\/(?:ar\/)?blog\/([^)\s#?]+)(?:[#?][^)\s]*)?\)/g,
    (whole, text, slug) => {
      if (isLiveSlug(slug.replace(/\/$/, ''))) return whole;
      removed++;
      return text;               // keep the prose, drop the dead href
    });
  return { md: out, removed };
}

/* ---------- 2. link named entities the article already mentions ---------- */
export function inlineCitations(md, matchers, lang, limit) {
  if (!md || limit <= 0) return { md, added: [] };
  const added = [];
  let work = md;
  for (const [id, re] of matchers) {
    if (added.length >= limit) break;
    const url = SOURCES[id][lang].url;
    if (work.includes(url)) continue;                 // already cited somewhere
    const ranges = protectedRanges(work);
    const g = new RegExp(re.source, re.flags.includes('i') ? 'gi' : 'g');
    let m, hit = null;
    while ((m = g.exec(work))) {
      const s = m.index, e = s + m[0].length;
      if (inRange(ranges, s, e)) continue;
      // never split a word. Latin matches are skipped when they land
      // mid-token; Arabic ones grow to the whole word instead, so a linked
      // noun keeps its attached prefix (لسوق, not ل + سوق).
      const AR_LETTER = /[\u0600-\u06FF\u0750-\u077F]/;
      let a = s, b = e;
      if (/[A-Za-z0-9]/.test(work[a - 1] || '') || /[A-Za-z0-9]/.test(work[b] || '')) continue;
      while (a > 0 && AR_LETTER.test(work[a - 1])) a--;
      while (b < work.length && AR_LETTER.test(work[b])) b++;
      if (inRange(ranges, a, b)) continue;
      hit = [a, b, work.slice(a, b)];
      break;
    }
    if (!hit) continue;
    work = work.slice(0, hit[0]) + `[${hit[2]}](${url})` + work.slice(hit[1]);
    added.push(id);
  }
  return { md: work, added };
}

/* ---------- section map, for inserting new sentences ---------- */
const SKIP_HEADING = /^##\s*(key takeaways|faq|frequently asked|أهم النقاط|الأسئلة الشائعة|أسئلة شائعة|الخطوة العملية|what to do next|the practical next step|sources|المصادر|related reading|قراءات ذات صلة)/i;

/** Index of the last plain-paragraph line inside each eligible `##` section. */
function insertionPoints(md) {
  const lines = md.split('\n');
  const heads = [];
  lines.forEach((l, i) => { if (/^## /.test(l)) heads.push(i); });
  const pts = [];
  for (let h = 0; h < heads.length; h++) {
    const start = heads[h], end = h + 1 < heads.length ? heads[h + 1] : lines.length;
    if (SKIP_HEADING.test(lines[start])) continue;
    let last = -1;
    for (let i = start + 1; i < end; i++) {
      const l = lines[i];
      if (!l.trim()) continue;
      if (/^#{1,6} /.test(l)) continue;
      if (/^\s*([-*+]|\d+\.)\s/.test(l)) continue;   // list item
      if (/^\s*\|/.test(l)) continue;                // table
      if (/^\s*>/.test(l)) continue;                 // quote
      if (/^\s{4,}\S/.test(l)) continue;             // indented block
      if (l.trim().length < 40) continue;            // too short to be a paragraph
      last = i;
    }
    if (last >= 0) pts.push(last);
  }
  return { lines, pts };
}

/* ---------- 3. add source-backed sentences where no anchor existed ---------- */
export function insertSentences(md, ids, lang) {
  if (!md || !ids.length) return { md, added: [] };
  const { lines, pts } = insertionPoints(md);
  if (!pts.length) return { md, added: [] };
  const use = ids.slice(0, pts.length);
  // spread the insertions across the available sections
  const step = Math.max(1, Math.floor(pts.length / use.length));
  const chosen = use.map((_, i) => pts[Math.min(pts.length - 1, i * step)]);
  const byLine = new Map();
  use.forEach((id, i) => {
    const key = chosen[i];
    const text = SOURCES[id][lang].sentence.replace('URL', SOURCES[id][lang].url);
    byLine.set(key, (byLine.get(key) || []).concat(text));
  });
  const out = [];
  lines.forEach((l, i) => {
    out.push(l);
    if (byLine.has(i)) for (const t of byLine.get(i)) out.push('', t);
  });
  return { md: out.join('\n'), added: use };
}

/* ---------- 4. internal links ---------- */
const RELATED_HEADING = { en: '## Related reading', ar: '## قراءات ذات صلة' };

export function addInternalLinks(md, targets, lang, want) {
  if (!md || !targets.length) return { md, added: [] };
  const seen = new Set();
  const fresh = targets.filter(t => {
    if (seen.has(t.path)) return false;
    seen.add(t.path);
    return !md.includes(`](${t.path})`) && !md.includes(`](${t.path}/)`)
        && !md.includes(`](https://lenooai.com${t.path})`);
  }).slice(0, want ?? targets.length);
  if (!fresh.length) return { md, added: [] };
  const lines = md.split('\n');
  // sit ahead of the FAQ and the closing call to action, not after them
  const TAIL = /^##\s*(faq|frequently asked|common questions|the practical next step|what to do next|next steps?|الأسئلة الشائعة|أسئلة شائعة|الخطوة العملية|الخطوة التالية)/i;
  let at = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i]) && TAIL.test(lines[i])) { at = i; break; }
  }
  while (at > 0 && !lines[at - 1].trim()) at--;
  const block = ['', RELATED_HEADING[lang], ''];
  for (const t of fresh) block.push(`- [${t.title}](${t.path})`);
  block.push('');
  lines.splice(at, 0, ...block);
  return { md: lines.join('\n'), added: fresh.map(t => t.path) };
}

/* ---------- counting ---------- */
export function countLinks(md) {
  let ext = 0, int = 0;
  if (!md) return { ext, int };
  const re = /\[([^\]]*)\]\(([^)\s]+)\)/g; let m;
  while ((m = re.exec(md))) {
    const h = m[2];
    if (/^https?:\/\/(www\.)?lenooai\.com/i.test(h) || h.startsWith('/')) int++;
    else if (/^https?:\/\//i.test(h)) ext++;
  }
  return { ext, int };
}

/* ---------- 5. repair citations that no longer resolve ---------- */
// Checked live 2026-09-09. Only URLs that genuinely 404 are swapped, and only
// for the primary source of the same claim. Domains that merely block bots
// (mckinsey.com returns 000 for its own root) are left alone: SOURCE-POLICY
// allows a source that a browser can reach.
export const BROKEN = {
  // Khaleej Times pulled the article. The 70.1% figure it reported is the
  // Microsoft AI Economy Institute's, which the surrounding copy already says.
  'https://www.khaleejtimes.com/uae/uae-tops-global-ai-adoption-with-70-1-of-working-age-population-utilising-it-report':
    'https://blogs.microsoft.com/on-the-issues/2026/05/07/the-state-of-global-ai-diffusion-in-2026/',
};

export function repairBrokenCitations(md) {
  if (!md) return { md, repaired: 0 };
  let repaired = 0, out = md;
  for (const [from, to] of Object.entries(BROKEN)) {
    if (!out.includes(from)) continue;
    repaired += out.split(from).length - 1;
    out = out.split(from).join(to);
  }
  return { md: out, repaired };
}
