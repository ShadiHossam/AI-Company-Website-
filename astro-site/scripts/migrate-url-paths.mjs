#!/usr/bin/env node
// astro-site/scripts/migrate-url-paths.mjs
//
// Rewrites hardcoded internal URL path strings from the pre-migration shape
// ('/', '/blog/foo', '/ar/blog/foo') to the new '/{lang}/{country}' shape
// ('/en/ae', '/en/ae/blog/foo', '/ar/ae/blog/foo'). This is a standalone copy
// of the mapping logic in src/lib/urls.ts's legacyPathToNew() — kept separate
// because this script runs once via plain `node`, outside the Astro/TS build.
// Keep the two in sync if the URL shape or exclusion list ever changes again.
//
// Usage:
//   node scripts/migrate-url-paths.mjs            (dry run — prints changes)
//   node scripts/migrate-url-paths.mjs --apply     (writes changes to disk)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const APPLY = process.argv.includes('--apply');
const DOMAIN = 'lenooai.com';

const UNPREFIXED_PATHS = new Set([
  '/robots.txt', '/sitemap.xml', '/sitemap_index.xml', '/page-sitemap.xml',
  '/post-sitemap.xml', '/main-sitemap.xsl', '/site.webmanifest',
  '/apple-touch-icon.png', '/favicon.svg', '/favicon-32.png',
  '/cookie-consent.js', '/maintenance',
]);
const UNPREFIXED_PREFIXES = ['/admin', '/api', '/_astro', '/assets', '/_image', '/favicon', '/storage'];

function isExcluded(path) {
  if (UNPREFIXED_PATHS.has(path)) return true;
  if (path.startsWith('/en/ae') || path.startsWith('/ar/ae')) return true; // already migrated
  return UNPREFIXED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
}

/** Maps a bare pre-migration path to its new-style equivalent, or null if unchanged. */
function migratePath(path) {
  if (isExcluded(path)) return null;
  if (path === '/ar') return '/ar/ae';
  if (path.startsWith('/ar/')) return `/ar/ae${path.slice(3)}`;
  if (path === '/') return '/en/ae';
  return `/en/ae${path}`;
}

const EXTS = new Set(['.astro', '.ts', '.tsx']);
const SKIP_DIRS = new Set(['admin', 'api', 'node_modules', '.git']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXTS.has(extname(entry))) files.push(full);
  }
  return files;
}

const TARGET_DIRS = ['src/pages', 'src/components', 'src/layouts', 'src/data'];

// Pass 1: quoted attribute/object values — href="...", canonicalPath="...",
// arPath="...", enPath="...", href: "...", url: "...", path: "...", item: "..."
const ATTR_RE = /\b(href|canonicalPath|arPath|enPath|url|path|item)(\s*[:=]\s*)(["'])(\/[^"'`]*)\3/g;

// Pass 2: template-literal path prefixes — href={`/blog/${slug}`}
const TEMPLATE_RE = /`(\/[^`$]*)(\$\{|`)/g;

// Pass 3: Astro.redirect('/path') / Astro.redirect(`/path`)
const REDIRECT_RE = /Astro\.redirect\((["'`])(\/[^"'`]*)\1/g;

// Pass 4: absolute same-domain URLs, e.g. 'https://lenooai.com/about'
const ABSOLUTE_RE = new RegExp(`(["'\`])https://${DOMAIN.replace('.', '\\.')}(/[^"'\`]*)?\\1`, 'g');

let totalChanges = 0;
const flagged = [];

for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    let text = readFileSync(file, 'utf8');
    let changedHere = false;

    text = text.replace(ATTR_RE, (m, key, sep, quote, path) => {
      const next = migratePath(path);
      if (next === null) return m;
      changedHere = true; totalChanges++;
      return `${key}${sep}${quote}${next}${quote}`;
    });

    text = text.replace(TEMPLATE_RE, (m, path, tail) => {
      const next = migratePath(path);
      if (next === null) return m;
      changedHere = true; totalChanges++;
      return `\`${next}${tail}`;
    });

    text = text.replace(REDIRECT_RE, (m, quote, path) => {
      const next = migratePath(path);
      if (next === null) return m;
      changedHere = true; totalChanges++;
      return `Astro.redirect(${quote}${next}`;
    });

    text = text.replace(ABSOLUTE_RE, (m, quote, path) => {
      const p = path ?? '/';
      const next = migratePath(p);
      if (next === null) return m;
      changedHere = true; totalChanges++;
      return `${quote}https://${DOMAIN}${next}${quote}`;
    });

    if (changedHere) {
      flagged.push(file);
      if (APPLY) writeFileSync(file, text, 'utf8');
    }
  }
}

console.log(`${APPLY ? 'Applied' : 'Would apply'} ${totalChanges} change(s) across ${flagged.length} file(s).`);
if (!APPLY) {
  console.log('Files that would change:');
  flagged.forEach((f) => console.log(`  ${f}`));
  console.log('\nRe-run with --apply to write changes, then review every hunk with `git diff` by hand.');
}
