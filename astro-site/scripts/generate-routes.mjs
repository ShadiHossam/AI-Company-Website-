#!/usr/bin/env node
/**
 * Writes src/data/routes.generated.ts from the contents of src/pages.
 *
 * This exists instead of an `import.meta.glob` in the layout. Globbing pages
 * from a module that every page imports puts all 250 page modules into the
 * layout's module graph, and Astro then inlines every page's scoped <style>
 * into every page: it took each rendered document from 65KB to 390KB. A plain
 * generated array of strings has no module graph at all.
 *
 * Runs automatically before `npm run build` via the `prebuild` script, and
 * routes.test.ts fails if the committed file has drifted from the filesystem.
 */
import { readdirSync, statSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const PAGES = join(here, '..', 'src', 'pages');
const OUT = join(here, '..', 'src', 'data', 'routes.generated.ts');

/** Not indexable, so never part of a sitemap or an hreflang cluster. */
const EXCLUDE = new Set(['/404', '/maintenance']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.astro')) out.push(full);
  }
  return out;
}

export function collectRoutes() {
  return walk(PAGES)
    .map((file) => '/' + relative(PAGES, file).split('\\').join('/'))
    .filter((r) => !r.includes('['))
    .map((r) => r.replace(/\.astro$/, ''))
    .filter((r) => !r.startsWith('/admin/') && !r.startsWith('/api/'))
    .map((r) => (r.endsWith('/index') ? r.slice(0, -6) : r))
    .map((r) => (r === '' ? '/' : r))
    .filter((r) => !EXCLUDE.has(r))
    .sort();
}

export function render(routes) {
  return `// GENERATED FILE — do not edit by hand.
// Run \`node scripts/generate-routes.mjs\` (or \`npm run build\`) to refresh it.
//
// The set of static, indexable routes on the site. Both the sitemap and every
// page's hreflang read this, so the two can never disagree about whether a
// translated twin exists.

export const GENERATED_ROUTES: readonly string[] = [
${routes.map((r) => `  '${r}',`).join('\n')}
];
`;
}

const routes = collectRoutes();
const next = render(routes);
const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
if (prev !== next) {
  writeFileSync(OUT, next);
  console.log(`routes.generated.ts updated (${routes.length} routes)`);
} else {
  console.log(`routes.generated.ts already current (${routes.length} routes)`);
}
