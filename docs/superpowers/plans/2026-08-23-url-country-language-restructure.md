# URL Country/Language Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every public URL on the astro-site from its current shape (`/`, `/blog/slug`, `/ar/`, `/ar/blog/slug`) to `/{language}/{country}/slug` (`/en/ae`, `/en/ae/blog/slug`, `/ar/ae`, `/ar/ae/blog/slug`), launching with UAE (`ae`) as the only country, and 301-redirect every old URL to its new equivalent so no SEO value is lost.

**Architecture:** Astro 7 here has no `i18n` config — routing is 100% filesystem-based (folder path = URL path), and there is no central URL-building helper anywhere in the codebase; every internal link, `canonicalPath`/`arPath`/`enPath` layout prop, and hreflang tag is a hand-typed string literal per page (confirmed by scanning all 249 public page files). Given that, this migration:
1. Physically moves the `src/pages` tree so the URL shape changes for free (Astro just renders whatever the folder structure says).
2. Fixes every relative import broken by the extra directory nesting (mechanical, scripted).
3. Rewrites every hardcoded internal URL string (`href`, `canonicalPath`, `arPath`, `enPath`, `Astro.redirect(...)`, absolute JSON-LD URLs) via a small reviewable codemod script, since there are ~249 files using this pattern and no shared helper to change in one place.
4. Adds a single new-style-aware mapping function (`src/lib/urls.ts`) used by a new middleware rule that 301-redirects any pre-migration URL straight to its new equivalent — one hop, so link equity carries over.
5. Regenerates the two sitemap files and fixes the `SafeLink`/`pendingPages.ts` pending-page registry from the in-flight internal-linking work so it keeps working against the new URL shape.

**Tech Stack:** Astro 7 (`.astro` components/pages, `output: 'server'`, `@astrojs/node` + `@astrojs/vercel` adapters), TypeScript, Vitest (`src/__tests__/**`, `node` environment, `globals: true`), plain Node scripts (no new dependencies) for the one-time file moves and codemod.

---

## Facts this plan is based on (verified against the current codebase, 2026-08-23)

- **Full route inventory**: 131 EN page files (root: `about.astro`, `blog.astro`, `careers.astro`, `contact.astro`, `index.astro`, `privacy.astro`, `services.astro`, `terms.astro`, `404.astro`, `maintenance.astro`; dirs: `blog/`, `industries/` (+ `industries/marketing/`), `jobs/`, `pricing/`, `services/` (+ nested `services/<hub>/*` and `services/<hub>/tools/*`)) and 118 AR page files, all under `src/pages/ar/` mirroring the same tree. `src/pages/admin/**` and `src/pages/api/**` are the CMS/API surface — not part of the public content tree, **not touched by this plan**.
- **No central URL helper exists.** Every internal link is a literal string in the `.astro` file that contains it (`grep -rl 'href="/' src/components src/pages --include="*.astro"` excluding admin → 251 files). `src/components/Navbar.astro` / `ArNavbar.astro` hardcode every nav/mega-menu link; `src/components/Footer.astro` / `ArFooter.astro` hardcode every footer link; `src/pages/industries/index.astro` hardcodes a 39-entry `href:` array; every page hand-writes its own `canonicalPath`/`arPath`/`enPath` string props into `BaseLayout`/`ArBaseLayout`.
- **hreflang generation** (`src/layouts/BaseLayout.astro:67-69`, `src/layouts/ArBaseLayout.astro:68-70`) is a straight template-literal concatenation of `COMPANY.domain` (`lenooai.com`, `src/config/company.ts:2`) with whatever `canonicalPath`/`arPath`/`enPath` string the calling page passed in. **No code change needed in either layout** — only the per-page prop *values* need to change, which the codemod handles.
- **Sitemaps**: `src/pages/page-sitemap.xml.ts` is a hand-maintained hardcoded `PAGES`/`AR_ONLY` array (not generated from the filesystem or a CMS — already confirmed out of sync with some existing routes). `src/pages/post-sitemap.xml.ts` is Supabase-driven (`blog_posts` table) with an `astro:content` fallback. `src/pages/sitemap_index.xml.ts` and `src/pages/robots.txt.ts` reference these two by their unprefixed infra URLs (`/page-sitemap.xml`, `/post-sitemap.xml`) — **no change needed to either**.
- **Redirects, two independent layers**: (1) `astro.config.mjs`'s built-in `redirects` block — confirmed via Astro 7.0.3 core source (`core/redirects/render.js`) that this emits **real HTTP 301s** for GET requests, identically on both the Vercel adapter and the o2switch `@astrojs/node` standalone adapter (both just forward whatever `Response` the core render pipeline returns). (2) `src/middleware.ts` — a Supabase-table-driven (`redirects` table) dynamic redirect layer, admin-managed via `/admin/settings/redirects`, checked on every public request via `getRedirectFor()`. Both layers matter for this migration.
- **Two dynamic (Supabase-backed) routes**: `blog/[slug].astro` + `ar/blog/[slug].astro`, `jobs/[slug].astro` + `ar/jobs/[slug].astro` — all four read exact content (below) and are handled explicitly in this plan, not just by the generic codemod, because they contain template-literal paths, `Astro.redirect(...)` fallbacks, and absolute JSON-LD URLs.
- **In-flight, uncommitted work touches the same files this plan touches.** `git status` at plan-writing time shows `Navbar.astro`, `ArNavbar.astro`, `Footer.astro`, `ArFooter.astro`, `BaseLayout.astro`, `ArBaseLayout.astro` as modified (uncommitted), and `src/components/SafeLink.astro`, `src/lib/internalLinks.ts`, `src/data/pendingPages.ts`, `src/__tests__/lib/internalLinks.test.ts` as new/untracked — this is Phase 1 (and part of Phase 2) of `docs/superpowers/plans/2026-08-23-internal-linking-improvements.md`, already applied to the working tree but not committed. `pendingPages.ts`'s `PENDING_PAGES` list contains old-style paths (e.g. `/industries/pharmacies`, `/ar/industries`) that `SafeLink.astro` compares against via `isPageLive()`. **If this migration renames pages without updating that list, every `SafeLink` silently starts rendering as a live clickable link**, even for pages still meant to be gated as drafts — the safety mechanism the other plan just built would go silently inert. This plan's Task 10 fixes that list.
- **Test conventions**: `vitest run` (`npm test`), tests under `src/__tests__/**`, `environment: 'node'`, `globals: true`. `src/__tests__/middleware.test.ts` already exists and has a test (`'calls next when no redirect row is found'`, currently using `pathname: '/about'`) that **will break** once the new legacy-redirect rule is added, because `/about` becomes a redirected path — Task 12 fixes that test's fixture.

## Not in scope

- `src/pages/admin/**` and `src/pages/api/**` (CMS/API surface, no language/country prefix, unaffected).
- Adding real content for any country other than UAE (`ae`) — the URL shape is built to support more countries later (`src/lib/urls.ts`'s `DEFAULT_COUNTRY` constant), but this plan only ships `ae`.
- The Supabase `redirects` table's existing *rows* (data, not code) — Task 15 flags this as a manual follow-up since a plan can't safely bulk-edit production database rows; it documents what to check.
- Rewriting the AR `industries/marketing/*` content-parity gap (10 EN pages with no AR equivalent) — pre-existing, tracked separately per `project_ar_marketing_pages_gap` memory, unrelated to URL structure.

---

## Phase 1: Foundation — the URL mapping module

### Task 1: `src/lib/urls.ts` and its tests

**Files:**
- Create: `astro-site/src/lib/urls.ts`
- Test: `astro-site/src/__tests__/lib/urls.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// astro-site/src/__tests__/lib/urls.test.ts
import { describe, it, expect } from 'vitest';
import { legacyPathToNew } from '../../lib/urls';

describe('legacyPathToNew', () => {
  it('maps the bare root to the default language/country home', () => {
    expect(legacyPathToNew('/')).toBe('/en/ae');
  });

  it('maps an English page path', () => {
    expect(legacyPathToNew('/about')).toBe('/en/ae/about');
  });

  it('maps a nested English page path', () => {
    expect(legacyPathToNew('/services/ai-agents/tools/gumloop')).toBe('/en/ae/services/ai-agents/tools/gumloop');
  });

  it('maps the bare /ar root to the Arabic home', () => {
    expect(legacyPathToNew('/ar')).toBe('/ar/ae');
  });

  it('maps an Arabic page path', () => {
    expect(legacyPathToNew('/ar/blog/foo')).toBe('/ar/ae/blog/foo');
  });

  it('maps a bare /en to the English home', () => {
    expect(legacyPathToNew('/en')).toBe('/en/ae');
  });

  it('returns null for an already-migrated English path', () => {
    expect(legacyPathToNew('/en/ae/about')).toBeNull();
  });

  it('returns null for an already-migrated Arabic path', () => {
    expect(legacyPathToNew('/ar/ae/blog/foo')).toBeNull();
  });

  it('returns null for admin paths', () => {
    expect(legacyPathToNew('/admin/blog')).toBeNull();
  });

  it('returns null for api paths', () => {
    expect(legacyPathToNew('/api/apply')).toBeNull();
  });

  it('returns null for robots.txt', () => {
    expect(legacyPathToNew('/robots.txt')).toBeNull();
  });

  it('returns null for the sitemap files', () => {
    expect(legacyPathToNew('/sitemap_index.xml')).toBeNull();
    expect(legacyPathToNew('/page-sitemap.xml')).toBeNull();
  });

  it('returns null for /maintenance', () => {
    expect(legacyPathToNew('/maintenance')).toBeNull();
  });

  it('returns null for static asset paths', () => {
    expect(legacyPathToNew('/assets/brand/logo-white.png')).toBeNull();
    expect(legacyPathToNew('/_astro/chunk.js')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro-site && npx vitest run src/__tests__/lib/urls.test.ts`
Expected: FAIL — `Cannot find module '../../lib/urls'`

- [ ] **Step 3: Write the implementation**

```typescript
// astro-site/src/lib/urls.ts

export const DEFAULT_LANG = 'en';
export const DEFAULT_COUNTRY = 'ae';

// Root-level infra/static paths that must never get a language/country prefix.
const UNPREFIXED_PATHS = new Set<string>([
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/page-sitemap.xml',
  '/post-sitemap.xml',
  '/main-sitemap.xsl',
  '/site.webmanifest',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon-32.png',
  '/cookie-consent.js',
  '/maintenance',
]);

const UNPREFIXED_PREFIXES = ['/admin', '/api', '/_astro', '/assets', '/_image', '/favicon', '/storage'];

function isUnprefixedPath(pathname: string): boolean {
  if (UNPREFIXED_PATHS.has(pathname)) return true;
  return UNPREFIXED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isNewStylePath(pathname: string): boolean {
  return (
    pathname === `/${DEFAULT_LANG}/${DEFAULT_COUNTRY}` ||
    pathname.startsWith(`/${DEFAULT_LANG}/${DEFAULT_COUNTRY}/`) ||
    pathname === `/ar/${DEFAULT_COUNTRY}` ||
    pathname.startsWith(`/ar/${DEFAULT_COUNTRY}/`)
  );
}

/**
 * Maps a pre-migration path ('/', '/about', '/blog/foo', '/ar', '/ar/about')
 * to its new /{lang}/{country} equivalent. Returns null when the path should
 * not be redirected: already new-style, or an excluded infra/admin/api path.
 */
export function legacyPathToNew(pathname: string): string | null {
  if (isUnprefixedPath(pathname) || isNewStylePath(pathname)) return null;
  if (pathname === '/en') return `/en/${DEFAULT_COUNTRY}`;
  if (pathname === '/ar') return `/ar/${DEFAULT_COUNTRY}`;
  if (pathname.startsWith('/ar/')) return `/ar/${DEFAULT_COUNTRY}${pathname.slice(3)}`;
  if (pathname === '/') return `/${DEFAULT_LANG}/${DEFAULT_COUNTRY}`;
  return `/${DEFAULT_LANG}/${DEFAULT_COUNTRY}${pathname}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro-site && npx vitest run src/__tests__/lib/urls.test.ts`
Expected: PASS (14 tests)

- [ ] **Step 5: Commit**

```bash
cd astro-site
git add src/lib/urls.ts src/__tests__/lib/urls.test.ts
git commit -m "feat: add legacyPathToNew() URL mapping for the /{lang}/{country} migration"
```

---

## Phase 2: Physical page restructuring

### Task 2: Confirm working-tree state before moving anything

**Files:** none (verification only)

- [ ] **Step 1: Check for the in-flight internal-linking changes**

Run: `cd astro-site && git status --short src/components/Navbar.astro src/components/ArNavbar.astro src/components/Footer.astro src/components/ArFooter.astro src/layouts/BaseLayout.astro src/layouts/ArBaseLayout.astro src/data/pendingPages.ts src/lib/internalLinks.ts src/components/SafeLink.astro`

If any of these show as modified/untracked, **stop and ask the user** whether to commit that in-flight work as its own commit before starting Task 3 below — Phase 2 onward moves and edits these exact files, and mixing an unrelated uncommitted feature into this migration's diff makes both harder to review or revert independently. Do not commit on your own judgment; this is the user's call per the project's git safety rules.

### Task 3: Move the EN page tree into `src/pages/en/ae/`

**Files:** moves `src/pages/{about.astro,blog,blog.astro,careers.astro,contact.astro,index.astro,industries,jobs,pricing,privacy.astro,services,services.astro,terms.astro}` → `src/pages/en/ae/`. Does **not** move `404.astro`, `admin/`, `api/`, `ar/`, `maintenance.astro`, `page-sitemap.xml.ts`, `post-sitemap.xml.ts`, `robots.txt.ts`, `sitemap.xml.ts`, `sitemap_index.xml.ts` — these stay at the root (404 handler, CMS/API, AR tree handled in Task 5, and unprefixed infra files per `src/lib/urls.ts`'s `UNPREFIXED_PATHS`).

- [ ] **Step 1: Run the move**

```bash
cd astro-site/src/pages
mkdir -p en/ae
git mv about.astro    en/ae/about.astro
git mv blog           en/ae/blog
git mv blog.astro     en/ae/blog.astro
git mv careers.astro  en/ae/careers.astro
git mv contact.astro  en/ae/contact.astro
git mv index.astro    en/ae/index.astro
git mv industries     en/ae/industries
git mv jobs           en/ae/jobs
git mv pricing        en/ae/pricing
git mv privacy.astro  en/ae/privacy.astro
git mv services       en/ae/services
git mv services.astro en/ae/services.astro
git mv terms.astro    en/ae/terms.astro
```

- [ ] **Step 2: Verify the move**

Run: `cd astro-site && git status --short src/pages | head -30`
Expected: a block of `R  src/pages/X -> src/pages/en/ae/X` rename entries, one per item above (directories show as many individual file renames).

### Task 4: Fix relative imports broken by the EN move

Every moved file's relative imports (`from '../layouts/...'`, `from '../../lib/...'`, etc.) now need **two extra `../` segments**, because the file is two directory levels deeper (`en/ae/` inserted where there was nothing before). Example: `src/pages/about.astro` had `import BaseLayout from "../layouts/BaseLayout.astro"` (1 level up reaches `src/`); at its new location `src/pages/en/ae/about.astro`, reaching `src/layouts/` requires 3 levels up, i.e. `"../../../layouts/BaseLayout.astro"`.

**Files:**
- Create: `astro-site/scripts/fix-relative-imports.mjs`
- Modifies every `.astro`/`.ts`/`.tsx` file under `src/pages/en/ae/`

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// astro-site/scripts/fix-relative-imports.mjs
//
// Prepends `extraLevels` extra "../" segments to every relative import/export
// specifier (one that starts with "../") in every .astro/.ts/.tsx file under
// rootDir. Only "../..." specifiers are touched — same-directory "./..."
// imports are untouched, since they stay correct when a whole subtree moves
// together as one unit.
//
// Usage: node scripts/fix-relative-imports.mjs <rootDir> <extraLevels>
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const [, , rootDir, extraLevelsArg] = process.argv;
if (!rootDir || !extraLevelsArg) {
  console.error('Usage: node scripts/fix-relative-imports.mjs <rootDir> <extraLevels>');
  process.exit(1);
}
const extraLevels = parseInt(extraLevelsArg, 10);
const prefix = '../'.repeat(extraLevels);
const EXTS = new Set(['.astro', '.ts', '.tsx']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXTS.has(extname(entry))) files.push(full);
  }
  return files;
}

// Matches: from '../x', from "../x", import('../x'), import("../x")
const IMPORT_RE = /((?:from\s+|import\s*\(\s*)['"])(\.\.\/[^'"]*)(['"])/g;

let changedFiles = 0;
for (const file of walk(rootDir)) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(IMPORT_RE, (match, head, relPath, tail) => `${head}${prefix}${relPath}${tail}`);
  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    changedFiles++;
    console.log(`fixed imports: ${file}`);
  }
}
console.log(`Done. ${changedFiles} file(s) updated under ${rootDir} (+${extraLevels} levels).`);
```

- [ ] **Step 2: Run it against the moved EN tree**

Run: `cd astro-site && node scripts/fix-relative-imports.mjs src/pages/en/ae 2`
Expected: a `fixed imports: ...` line per file that had a relative import, ending with a `Done. N file(s) updated...` summary.

- [ ] **Step 3: Spot-check one file**

Run: `grep -n "^import" astro-site/src/pages/en/ae/about.astro`
Expected: `import BaseLayout from "../../../layouts/BaseLayout.astro";` (3 levels, was 1 before the move).

- [ ] **Step 4: Commit**

```bash
cd astro-site
git add src/pages/en scripts/fix-relative-imports.mjs
git commit -m "fix: repoint relative imports after moving EN pages under src/pages/en/ae"
```

### Task 5: Move the AR page tree into `src/pages/ar/ae/`

**Files:** moves everything currently under `src/pages/ar/` into `src/pages/ar/ae/`.

- [ ] **Step 1: Run the move**

```bash
cd astro-site/src/pages
mkdir -p ar/ae
git mv ar/about.astro    ar/ae/about.astro
git mv ar/blog           ar/ae/blog
git mv ar/blog.astro     ar/ae/blog.astro
git mv ar/careers.astro  ar/ae/careers.astro
git mv ar/contact.astro  ar/ae/contact.astro
git mv ar/index.astro    ar/ae/index.astro
git mv ar/industries     ar/ae/industries
git mv ar/jobs           ar/ae/jobs
git mv ar/privacy.astro  ar/ae/privacy.astro
git mv ar/services       ar/ae/services
git mv ar/services.astro ar/ae/services.astro
git mv ar/terms.astro    ar/ae/terms.astro
```

- [ ] **Step 2: Verify the move**

Run: `cd astro-site && ls src/pages/ar` — expected output: exactly one entry, `ae`.

### Task 6: Fix relative imports broken by the AR move

AR files were already one level deep (`src/pages/ar/...`); after the move they're two levels deep (`src/pages/ar/ae/...`), so they need **one extra `../` segment** (not two, since AR only gained the `ae/` level, not `ar/` itself which already existed).

- [ ] **Step 1: Run the same script with `extraLevels = 1`**

Run: `cd astro-site && node scripts/fix-relative-imports.mjs src/pages/ar/ae 1`

- [ ] **Step 2: Spot-check**

Run: `grep -n "^import" astro-site/src/pages/ar/ae/blog/\[slug\].astro`
Expected: `import ArBaseLayout from '../../../../layouts/ArBaseLayout.astro';` (4 levels, was 3 before the move — see the facts section above for why AR needs +1, not +2).

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/pages/ar
git commit -m "fix: move AR pages under src/pages/ar/ae and repoint their relative imports"
```

---

## Phase 3: Rewrite hardcoded internal URL strings

### Task 7: Codemod for `href`/`canonicalPath`/`arPath`/`enPath`/`Astro.redirect`/absolute JSON-LD URLs

This is the mechanical pass over the ~249 leaf files that hardcode a URL string in one of these forms:
- `href="/about"` (double-quoted HTML/JSX attribute)
- `` href={`/blog/${slug}`} `` (template-literal attribute, literal prefix before the first `${`)
- `canonicalPath="/about"`, `arPath="/ar/about"`, `enPath="/about"` (same two forms)
- `Astro.redirect('/careers')` / `` Astro.redirect(`/careers`) ``
- `{ name: "Real Estate", href: "/industries/real-estate" }` (object-literal `href:`/`url:`/`path:`/`item:` keys)
- `'https://lenooai.com/about'` / `` `https://lenooai.com/ar/blog/${slug}` `` (absolute same-domain URLs in JSON-LD blocks)

**Files:**
- Create: `astro-site/scripts/migrate-url-paths.mjs`

- [ ] **Step 1: Write the script**

```javascript
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

const TARGET_DIRS = ['src/pages', 'src/components', 'src/layouts'];

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
```

- [ ] **Step 2: Dry run and review the file list**

Run: `cd astro-site && node scripts/migrate-url-paths.mjs`
Expected: a summary line (`Would apply N change(s) across M file(s)`) and a full file list. Skim the list — every EN/AR leaf page under `src/pages/en/ae`, `src/pages/ar/ae`, plus `Navbar.astro`, `ArNavbar.astro`, `Footer.astro`, `ArFooter.astro` should appear. If a file you expected to change (e.g. one with a hardcoded `href="/about"`) is missing, the regex didn't match its exact syntax — note it for manual fixing after Step 3.

- [ ] **Step 3: Apply**

Run: `cd astro-site && node scripts/migrate-url-paths.mjs --apply`

- [ ] **Step 4: Full manual review of the diff**

Run: `cd astro-site && git diff --stat` then read the actual diff (`git diff`) file by file. Pay specific attention to:
- Any `'https://lenooai.com'` (bare domain, no path) that became `'https://lenooai.com/en/ae'` — this is a deliberate judgment call (schema.org `sameAs`/`url` fields should point at the final canonical URL, not force crawlers through a redirect), confirm each occurrence makes sense in context rather than assuming it's automatically correct.
- Any `logo:`/asset URL that was correctly left untouched (should still read `https://lenooai.com/assets/logo.svg`, not `/en/ae/assets/...`).

- [ ] **Step 5: Grep for anything the codemod missed**

Run:
```bash
cd astro-site
grep -rn 'href="/[^"]' src/pages/en src/pages/ar src/components --include="*.astro" \
  | grep -v '/en/ae\|/ar/ae\|href="/admin\|href="/api\|href="/_astro\|href="/assets\|href="/_image\|href="/favicon\|href="/storage\|href="/robots.txt\|href="/sitemap\|href="/main-sitemap.xsl\|href="/site.webmanifest\|href="/apple-touch-icon.png\|href="/cookie-consent.js\|href="/maintenance\|href="/#'
```
Expected: no output. Any line printed here is a leftover pre-migration `href` the codemod's regex didn't catch (different quote style, unusual spacing, etc.) — fix it by hand, following the same `/x` → `/en/ae/x` or `/ar/x` → `/ar/ae/x` rule.

- [ ] **Step 6: Commit**

```bash
cd astro-site
git add -A
git commit -m "feat: rewrite internal URLs to the /{lang}/{country} shape across all public pages"
```

### Task 8: Manually verify the four dynamic Supabase-backed pages

The codemod's template-literal pass (`` `/PATH...` ``) covers most of what's in these four files, but they're complex enough (conditional `arPath`, `Astro.redirect` fallbacks, breadcrumb JSON-LD) to warrant an explicit read-through rather than trusting the mechanical pass alone.

**Files:**
- Verify: `astro-site/src/pages/en/ae/blog/[slug].astro`
- Verify: `astro-site/src/pages/ar/ae/blog/[slug].astro`
- Verify: `astro-site/src/pages/en/ae/jobs/[slug].astro`
- Verify: `astro-site/src/pages/ar/ae/jobs/[slug].astro`

- [ ] **Step 1: Confirm `blog/[slug].astro`'s redirect fallbacks and arPath**

Run: `grep -n "Astro.redirect\|arPath" astro-site/src/pages/en/ae/blog/\[slug\].astro`
Expected two matches:
```
return Astro.redirect('/en/ae/blog');
    arPath={dbPost.ar_title ? `/ar/ae/blog/${dbPost.slug}` : undefined}
```
(There are two `Astro.redirect('/blog')` calls in the original — one in the content-collection "not found" branch, one in its catch block — both must read `/en/ae/blog`.)

- [ ] **Step 2: Confirm `ar/ae/blog/[slug].astro`'s fallback redirect and canonical/enPath**

Run: `grep -n "Astro.redirect\|canonicalPath\|enPath" astro-site/src/pages/ar/ae/blog/\[slug\].astro`
Expected:
```
  return Astro.redirect(`/en/ae/blog/${slug}`, 302);
  canonicalPath={`/ar/ae/blog/${slug}`}
  enPath={`/en/ae/blog/${slug}`}
```
Also check the breadcrumb `ldJson` block and the in-body "Read in English" link:
Run: `grep -n "lenooai.com/ar\|lenooai.com'\|/blog/\${slug}\`}" astro-site/src/pages/ar/ae/blog/\[slug\].astro`
The `mainEntityOfPage['@id']` and the two breadcrumb `item` values should read `https://lenooai.com/ar/ae/...`, and the "Read in English →" link (`href={\`/blog/${slug}\`}`) should read `href={\`/en/ae/blog/${slug}\`}`.

- [ ] **Step 3: Confirm both jobs pages' `Astro.redirect` fallback and `canonicalPath`/`arPath`/`enPath`**

Run: `grep -n "Astro.redirect\|canonicalPath\|arPath\|enPath" astro-site/src/pages/en/ae/jobs/\[slug\].astro astro-site/src/pages/ar/ae/jobs/\[slug\].astro`
Expected (EN file): `return Astro.redirect('/en/ae/careers');`, `canonicalPath={\`/en/ae/jobs/${job.slug}\`}`, `arPath={\`/ar/ae/jobs/${job.slug}\`}`.
Expected (AR file): `return Astro.redirect('/ar/ae/careers');`, `canonicalPath={\`/ar/ae/jobs/${job.slug}\`}`, `enPath={\`/en/ae/jobs/${job.slug}\`}`.

- [ ] **Step 4: Fix anything that didn't match, then commit if you made changes**

```bash
cd astro-site
git add src/pages/en/ae/blog src/pages/ar/ae/blog src/pages/en/ae/jobs src/pages/ar/ae/jobs
git commit -m "fix: verify blog/jobs dynamic page redirects and cross-language paths post-migration"
```
(Skip the commit if Task 7's codemod already got everything right — check with `git status` first.)

---

## Phase 4: Sitemaps and the pending-pages registry

### Task 9: Rewrite `page-sitemap.xml.ts`

**Files:**
- Modify: `astro-site/src/pages/page-sitemap.xml.ts`

- [ ] **Step 1: Replace the `PAGES` and `AR_ONLY` arrays**

Every `url:` value gets an `/en/ae` prefix (bare `/` becomes `/en/ae`), every `arUrl:` value gets `/ar/ae` in place of `/ar`, and every `AR_ONLY` entry's `url:` gets `/ar/ae` in place of `/ar`. Keep every `lastmod` value exactly as-is (they're real last-edit timestamps, not something this migration changes). Replace the `PAGES` and `AR_ONLY` declarations (lines 16–140) with:

```typescript
const PAGES: PageEntry[] = [
  { url: '/en/ae',                                  lastmod: '2026-07-20T20:07:25+00:00', arUrl: '/ar/ae' },
  { url: '/en/ae/services',                          lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/services' },
  { url: '/en/ae/services/custom-ai-development',   lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/services/custom-ai-development' },
  { url: '/en/ae/services/ai-agents',               lastmod: '2026-08-02T13:53:23+00:00', arUrl: '/ar/ae/services/ai-agents' },
  { url: '/en/ae/services/ai-agents/dubai',                          lastmod: '2026-08-02T13:39:32+00:00' },
  { url: '/en/ae/services/ai-agents/abu-dhabi',                      lastmod: '2026-08-02T13:39:32+00:00' },
  { url: '/en/ae/services/ai-agents/agencies',                       lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/development',                    lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/for-real-estate',                lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/voice-agents',                   lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/customer-support',               lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/sales',                          lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/use-cases',                      lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/templates',                      lastmod: '2026-08-02T13:52:02+00:00' },
  { url: '/en/ae/services/ai-agents/vs-agentic-ai',                  lastmod: '2026-08-02T14:15:55+00:00' },
  { url: '/en/ae/services/ai-agents/architecture',                   lastmod: '2026-08-02T13:52:02+00:00' },
  { url: '/en/ae/services/ai-agents/tools',                          lastmod: '2026-08-02T13:36:29+00:00' },
  { url: '/en/ae/services/ai-agents/tools/gumloop',                  lastmod: '2026-08-02T13:36:30+00:00' },
  { url: '/en/ae/services/ai-agents/tools/lindy',                    lastmod: '2026-08-02T13:36:30+00:00' },
  { url: '/en/ae/services/ai-agents/tools/pipedream',                lastmod: '2026-08-02T13:36:30+00:00' },
  { url: '/en/ae/services/ai-agents/tools/salesforce-agentforce',    lastmod: '2026-08-02T13:36:30+00:00' },
  { url: '/en/ae/services/ai-agents/tools/n8n-ai-agent',             lastmod: '2026-08-02T13:36:30+00:00' },
  { url: '/en/ae/services/ai-automation/tools/n8n',                  lastmod: '2026-08-02T21:13:59+00:00' },
  { url: '/en/ae/services/vibe-coding/tools',                        lastmod: '2026-08-02T21:35:53+00:00' },
  { url: '/en/ae/services/ai-automation',           lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/services/ai-automation' },
  { url: '/en/ae/services/ai-training',             lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/services/ai-training' },
  { url: '/en/ae/services/ai-strategy',             lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/services/ai-strategy' },
  { url: '/en/ae/services/ai-integration',         lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/services/ai-integration' },
  { url: '/en/ae/services/internal-ai-tools',       lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/services/internal-ai-tools' },
  { url: '/en/ae/services/custom-gpt-development', lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/services/custom-gpt-development' },
  { url: '/en/ae/services/vibe-coding',             lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/services/vibe-coding' },
  { url: '/en/ae/services/ai-model-finetuning',    lastmod: '2026-07-19T12:51:47+00:00' },
  { url: '/en/ae/services/claude-agent-builds',    lastmod: '2026-07-19T12:51:47+00:00' },
  { url: '/en/ae/services/prompt-engineering',     lastmod: '2026-07-19T12:51:47+00:00' },
  { url: '/en/ae/services/ai-chatbot-development',            lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-agents/receptionist',            lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/whatsapp-ai-automation',            lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/whatsapp-ai-automation/business-api', lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-agent-security',                 lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/agentops',                          lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/agentops/what-is-agentops',         lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-maintenance',                    lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-compliance-uae',                 lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-automation/finance',             lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-automation/operations',          lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-automation/procurement',         lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-automation/free-zone',           lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/arabic-ai',                         lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/arabic-ai/chatbots',                lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/arabic-ai/voice-agents',            lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/services/ai-strategy/data-readiness',        lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/pricing/ai-automation-cost',                 lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries',                       lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/real-estate',           lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/industries/real-estate' },
  { url: '/en/ae/industries/retail',                lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/industries/retail' },
  { url: '/en/ae/industries/hospitality',           lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/industries/hospitality' },
  { url: '/en/ae/industries/logistics',             lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/industries/logistics' },
  { url: '/en/ae/industries/consulting',            lastmod: '2026-08-02T20:59:59+00:00' },
  { url: '/en/ae/industries/education',             lastmod: '2026-08-03T04:11:17+00:00' },
  { url: '/en/ae/industries/finance-banking',       lastmod: '2026-08-03T04:27:00+00:00' },
  { url: '/en/ae/industries/healthcare',            lastmod: '2026-08-03T16:52:55+00:00' },
  { url: '/en/ae/industries/hr-recruitment',        lastmod: '2026-08-03T17:48:00+00:00' },
  { url: '/en/ae/industries/insurance',             lastmod: '2026-08-03T18:08:05+00:00' },
  { url: '/en/ae/industries/legal',                 lastmod: '2026-08-03T18:55:47+00:00' },
  { url: '/en/ae/industries/manufacturing',         lastmod: '2026-08-04T04:08:56+00:00' },
  { url: '/en/ae/industries/marketing',             lastmod: '2026-08-04T04:22:01+00:00' },
  { url: '/en/ae/industries/marketing/analytics-attribution', lastmod: '2026-08-04T18:38:37+00:00' },
  { url: '/en/ae/industries/marketing/content-writing',        lastmod: '2026-08-04T19:35:55+00:00' },
  { url: '/en/ae/industries/marketing/email-marketing',         lastmod: '2026-08-08T09:34:38+00:00' },
  { url: '/en/ae/industries/property-management',    lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/construction',           lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/interior-fitout',        lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/engineering-consultancies', lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/healthcare-clinics',     lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/dental-clinics',         lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/aesthetic-clinics',      lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/pharmacies',             lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/fitness-gyms',           lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/beauty-salons',          lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/ecommerce',              lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/restaurants',            lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/car-dealerships',        lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/travel-agencies',        lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/event-management',       lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/accounting-firms',       lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/coworking-business-setup', lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/marketing-agencies',     lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/last-mile-delivery',     lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/facilities-management',  lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/cleaning-services',      lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/auto-service',           lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/security-services',      lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/trading-distribution',   lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/training-institutes',    lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/industries/it-msp',                 lastmod: '2026-08-16T16:26:59+00:00' },
  { url: '/en/ae/about',                             lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/about' },
  { url: '/en/ae/blog',                              lastmod: '2026-07-19T06:21:05+00:00', arUrl: '/ar/ae/blog' },
  { url: '/en/ae/contact',                           lastmod: '2026-07-21T19:48:27+00:00', arUrl: '/ar/ae/contact' },
  { url: '/en/ae/careers',                           lastmod: '2026-07-19T12:51:47+00:00', arUrl: '/ar/ae/careers' },
];

const AR_ONLY: PageEntry[] = [
  { url: '/ar/ae',                                  lastmod: '2026-07-19T12:51:47+00:00' },
  { url: '/ar/ae/services',                         lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/services/custom-ai-development',  lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/services/ai-agents',              lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/services/ai-automation',          lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/services/ai-automation/accounting', lastmod: '2026-08-05T18:26:06+00:00' },
  { url: '/ar/ae/services/ai-automation/dubai',      lastmod: '2026-08-05T18:26:06+00:00' },
  { url: '/ar/ae/services/ai-training',            lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/services/ai-strategy',            lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/services/ai-integration',        lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/services/internal-ai-tools',      lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/services/custom-gpt-development', lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/services/vibe-coding',            lastmod: '2026-07-18T14:23:08+00:00' },
  { url: '/ar/ae/industries/real-estate',          lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/industries/retail',               lastmod: '2026-07-19T12:51:47+00:00' },
  { url: '/ar/ae/industries/hospitality',          lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/industries/logistics',            lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/about',                            lastmod: '2026-07-19T12:51:47+00:00' },
  { url: '/ar/ae/contact',                          lastmod: '2026-08-05T18:26:06+00:00' },
  { url: '/ar/ae/blog',                             lastmod: '2026-07-19T11:36:43+00:00' },
  { url: '/ar/ae/careers',                          lastmod: '2026-08-05T18:26:06+00:00' },
];
```

- [ ] **Step 2: Fix `arUrlEntry()`'s EN-URL derivation**

The current `arUrlEntry()` (line 156) derives the EN sibling by stripping a leading `/ar`: `page.url.replace(/^\/ar/, '') || '/'`. Under the new shape that must strip `/ar/ae` and fall back to `/en/ae`, not `/`:

Find:
```typescript
function arUrlEntry(page: PageEntry): string {
  const enUrl = page.url.replace(/^\/ar/, '') || '/';
```
Replace with:
```typescript
function arUrlEntry(page: PageEntry): string {
  const enUrl = page.url.replace(/^\/ar\/ae/, '/en/ae') || '/en/ae';
```

- [ ] **Step 3: Verify**

Run: `cd astro-site && npx tsc --noEmit src/pages/page-sitemap.xml.ts 2>&1 | head -20 || true` (a quick syntax sanity check; full type-checking happens in Task 16).

- [ ] **Step 4: Commit**

```bash
cd astro-site
git add src/pages/page-sitemap.xml.ts
git commit -m "feat: point page-sitemap.xml at the new /{lang}/{country} URLs"
```

### Task 10: Update `post-sitemap.xml.ts`

**Files:**
- Modify: `astro-site/src/pages/post-sitemap.xml.ts:25-41,57-60`

- [ ] **Step 1: Update the Supabase-post URL block**

Find (lines 25-41):
```typescript
        const hreflang = post.ar_title
          ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}/ar/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/blog/${post.slug}"/>`
          : '';
        urlBlocks.push(`  <url>
    <loc>${BASE}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>${hreflang}
  </url>${post.ar_title ? `
  <url>
    <loc>${BASE}/ar/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}/ar/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/blog/${post.slug}"/>
  </url>` : ''}`);
```
Replace with:
```typescript
        const hreflang = post.ar_title
          ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}/en/ae/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}/ar/ae/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/en/ae/blog/${post.slug}"/>`
          : '';
        urlBlocks.push(`  <url>
    <loc>${BASE}/en/ae/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>${hreflang}
  </url>${post.ar_title ? `
  <url>
    <loc>${BASE}/ar/ae/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}/ar/ae/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}/en/ae/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/en/ae/blog/${post.slug}"/>
  </url>` : ''}`);
```

- [ ] **Step 2: Update the content-collection fallback block**

Find (lines 57-60):
```typescript
      urlBlocks.push(`  <url>
    <loc>${BASE}/blog/${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`);
```
Replace with:
```typescript
      urlBlocks.push(`  <url>
    <loc>${BASE}/en/ae/blog/${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`);
```

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/pages/post-sitemap.xml.ts
git commit -m "feat: point post-sitemap.xml blog URLs at the new /{lang}/{country} shape"
```

### Task 11: Fix `pendingPages.ts` so `SafeLink` keeps working

The in-flight internal-linking work's `PENDING_PAGES` list (`src/data/pendingPages.ts`) still lists old-style paths. Since every page it references is moving in this migration, the list must move with them, or `SafeLink.astro`'s `isPageLive()` check silently stops matching anything and every "not yet live" page starts rendering as a real clickable link.

**Files:**
- Modify: `astro-site/src/data/pendingPages.ts`

- [ ] **Step 1: Replace the `PENDING_PAGES` array's entries with their new-style equivalents**

Find:
```typescript
export const PENDING_PAGES: string[] = [
  // Industries hub + leaf pages that are local drafts only (untracked in
  // git) as of 2026-08-23 — verified via `git ls-files` + `curl -sI` against
  // production returning 404. Remove each path once you publish that page
  // through the normal one-or-two-at-a-time pipeline (see git log --grep=publish).
  '/industries',
  '/industries/pharmacies',
  '/industries/event-management',
  '/industries/trading-distribution',
  '/industries/fitness-gyms',
  '/industries/training-institutes',
  '/industries/marketing-agencies',
  '/industries/healthcare-clinics',
  '/industries/property-management',
  '/industries/interior-fitout',
  '/industries/it-msp',
  '/industries/travel-agencies',
  '/industries/restaurants',
  '/industries/engineering-consultancies',
  '/industries/facilities-management',
  '/industries/security-services',
  '/industries/dental-clinics',
  '/industries/ecommerce',
  '/industries/last-mile-delivery',
  '/ar/industries',
  // Service subpages that are local drafts only, same verification method.
  '/services/ai-compliance-uae',
  '/services/ai-automation/finance',
  '/services/ai-automation/free-zone',
  '/services/ai-automation/procurement',
  '/services/ai-automation/operations',
  '/services/ai-agents/receptionist',
];
```
Replace with:
```typescript
export const PENDING_PAGES: string[] = [
  // Industries hub + leaf pages that are local drafts only (untracked in
  // git) as of 2026-08-23 — verified via `git ls-files` + `curl -sI` against
  // production returning 404. Remove each path once you publish that page
  // through the normal one-or-two-at-a-time pipeline (see git log --grep=publish).
  // Paths updated to the /{lang}/{country} shape by the 2026-08-23 URL
  // restructure — see docs/superpowers/plans/2026-08-23-url-country-language-restructure.md.
  '/en/ae/industries',
  '/en/ae/industries/pharmacies',
  '/en/ae/industries/event-management',
  '/en/ae/industries/trading-distribution',
  '/en/ae/industries/fitness-gyms',
  '/en/ae/industries/training-institutes',
  '/en/ae/industries/marketing-agencies',
  '/en/ae/industries/healthcare-clinics',
  '/en/ae/industries/property-management',
  '/en/ae/industries/interior-fitout',
  '/en/ae/industries/it-msp',
  '/en/ae/industries/travel-agencies',
  '/en/ae/industries/restaurants',
  '/en/ae/industries/engineering-consultancies',
  '/en/ae/industries/facilities-management',
  '/en/ae/industries/security-services',
  '/en/ae/industries/dental-clinics',
  '/en/ae/industries/ecommerce',
  '/en/ae/industries/last-mile-delivery',
  '/ar/ae/industries',
  // Service subpages that are local drafts only, same verification method.
  '/en/ae/services/ai-compliance-uae',
  '/en/ae/services/ai-automation/finance',
  '/en/ae/services/ai-automation/free-zone',
  '/en/ae/services/ai-automation/procurement',
  '/en/ae/services/ai-automation/operations',
  '/en/ae/services/ai-agents/receptionist',
];
```

- [ ] **Step 2: Re-run the existing `internalLinks.test.ts` suite**

Run: `cd astro-site && npx vitest run src/__tests__/lib/internalLinks.test.ts`
This suite's own assertions reference `/industries/retail` (expected live) and `/industries/pharmacies` (expected pending) — those are **not** in `PENDING_PAGES` under either the old or new naming for `/industries/retail` (never listed) and `/industries/pharmacies` is now `/en/ae/industries/pharmacies` in the list, so the test's literal string `/industries/pharmacies` will incorrectly now read as "live" (not in the updated list) once this migration lands. Expected: this reveals a **real test failure** — fix it in Step 3, don't skip it.

- [ ] **Step 3: Update `internalLinks.test.ts`'s pending-path fixture to match**

Find (in `astro-site/src/__tests__/lib/internalLinks.test.ts`):
```typescript
  it('returns false for a path in the pending list', () => {
    expect(isPageLive('/industries/pharmacies')).toBe(false);
  });

  it('normalizes a trailing slash before comparing', () => {
    expect(isPageLive('/industries/pharmacies/')).toBe(false);
  });
```
Replace with:
```typescript
  it('returns false for a path in the pending list', () => {
    expect(isPageLive('/en/ae/industries/pharmacies')).toBe(false);
  });

  it('normalizes a trailing slash before comparing', () => {
    expect(isPageLive('/en/ae/industries/pharmacies/')).toBe(false);
  });
```

- [ ] **Step 4: Re-run and confirm pass**

Run: `cd astro-site && npx vitest run src/__tests__/lib/internalLinks.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd astro-site
git add src/data/pendingPages.ts src/__tests__/lib/internalLinks.test.ts
git commit -m "fix: update pendingPages.ts and its test to the new /{lang}/{country} paths"
```

---

## Phase 5: Wire up the legacy-URL 301 redirect

### Task 12: Add the legacy-redirect rule to `src/middleware.ts`

**Files:**
- Modify: `astro-site/src/middleware.ts:1-8` (import)
- Modify: `astro-site/src/middleware.ts:226-231` (insert new check)

- [ ] **Step 1: Import `legacyPathToNew`**

Find (lines 1-3):
```typescript
import { defineMiddleware } from 'astro:middleware';
import { verifyJWT, extractRole } from './lib/jwt';
import { getSupabaseAdmin } from './lib/supabase';
```
Replace with:
```typescript
import { defineMiddleware } from 'astro:middleware';
import { verifyJWT, extractRole } from './lib/jwt';
import { getSupabaseAdmin } from './lib/supabase';
import { legacyPathToNew } from './lib/urls';
```

- [ ] **Step 2: Insert the redirect check right after the static-asset passthrough**

Find:
```typescript
  // Skip static assets (still gets security headers — Vercel's edge rule covers these too)
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    const response = await next();
    applySecurityHeaders(response);
    return response;
  }

  // DB redirect check + maintenance check (public routes only) — both use in-memory caches
  const isPublicRoute = supabaseConfigured && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_');
```
Replace with:
```typescript
  // Skip static assets (still gets security headers — Vercel's edge rule covers these too)
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    const response = await next();
    applySecurityHeaders(response);
    return response;
  }

  // Structural URL migration (2026-08-23): every public page now lives under
  // /{lang}/{country} (e.g. /en/ae/about, /ar/ae/blog/foo). Any request for
  // the pre-migration shape gets a real 301 straight to the new URL — one
  // hop, so SEO value carries over. See src/lib/urls.ts for the mapping.
  // Checked before the DB redirect lookup below so a structural move always
  // wins over any stale admin-authored redirect row for the same old path.
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_')) {
    const migrated = legacyPathToNew(pathname);
    if (migrated) {
      return context.redirect(migrated, 301);
    }
  }

  // DB redirect check + maintenance check (public routes only) — both use in-memory caches
  const isPublicRoute = supabaseConfigured && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_');
```

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/middleware.ts
git commit -m "feat: 301-redirect pre-migration URLs to their new /{lang}/{country} equivalent"
```

### Task 13: Fix the existing middleware test that the new rule breaks

`src/__tests__/middleware.test.ts` has a test using `pathname: '/about'` and asserting `next` gets called with no redirect — that path is now exactly one this migration redirects, so the test's fixture (not its intent) needs to move to an already-migrated path.

**Files:**
- Modify: `astro-site/src/__tests__/middleware.test.ts:97-107`

- [ ] **Step 1: Update the fixture**

Find:
```typescript
  it('calls next when no redirect row is found', async () => {
    // redirects query returns null, maintenance returns null
    const chain = makeChain({ data: null, error: null });
    const supabase = { from: vi.fn().mockReturnValue(chain) };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = makeCtx({ pathname: '/about' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
  });
```
Replace with:
```typescript
  it('calls next when no redirect row is found', async () => {
    // redirects query returns null, maintenance returns null
    const chain = makeChain({ data: null, error: null });
    const supabase = { from: vi.fn().mockReturnValue(chain) };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    // Already new-style — must NOT be caught by the legacy-URL redirect (Task 12)
    const ctx = makeCtx({ pathname: '/en/ae/about' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the full middleware suite to confirm nothing else broke**

Run: `cd astro-site && npx vitest run src/__tests__/middleware.test.ts`
Expected: all existing tests still PASS.

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/__tests__/middleware.test.ts
git commit -m "fix: update middleware test fixture to a new-style path after the URL migration"
```

### Task 14: Add tests for the new legacy-redirect behavior

**Files:**
- Modify: `astro-site/src/__tests__/middleware.test.ts`

- [ ] **Step 1: Insert a new `describe` block**

Insert right after the `describe('static assets passthrough', ...)` block's closing `});` (after line 79) and before `describe('DB redirect check', ...)`:

```typescript
describe('legacy URL structural redirect (2026-08-23 migration)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects the bare root to /en/ae', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/' });
    const next = vi.fn();
    await onRequest(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/en/ae', 301);
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects a pre-migration English page to its new URL', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/about' });
    const next = vi.fn();
    await onRequest(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/en/ae/about', 301);
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects the bare /ar root to /ar/ae', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/ar' });
    const next = vi.fn();
    await onRequest(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/ar/ae', 301);
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects a pre-migration Arabic page to its new URL', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/ar/blog/foo' });
    const next = vi.fn();
    await onRequest(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/ar/ae/blog/foo', 301);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not redirect an already-migrated path', async () => {
    const supabase = noRedirects();
    const ctx = makeCtx({ pathname: '/en/ae/about' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    void supabase;
  });

  it('does not touch API routes', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/api/apply' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the full suite**

Run: `cd astro-site && npx vitest run src/__tests__/middleware.test.ts`
Expected: PASS, including the 6 new tests plus every pre-existing one (Task 13's fix included).

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/__tests__/middleware.test.ts
git commit -m "test: cover the legacy-URL structural redirect in middleware.test.ts"
```

### Task 15: Update `astro.config.mjs`'s static legacy redirects to avoid a double hop

The existing `redirects` block sends old WordPress-style paths (`/pages/about`, `*.html`) to the *pre-migration* clean URLs (`/about`). Left as-is, a visitor hitting `/pages/about.html` would now get chained through two 301s (`/pages/about.html` → `/about` → `/en/ae/about`). Point these directly at the final URL instead.

**Files:**
- Modify: `astro-site/astro.config.mjs`

- [ ] **Step 1: Update the redirect destinations**

Find:
```javascript
  redirects: {
    '/pages/about':                             '/about',
    '/pages/about.html':                        '/about',
    '/pages/blog':                              '/blog',
    '/pages/blog.html':                         '/blog',
    '/pages/contact':                            '/contact',
    '/pages/contact.html':                       '/contact',
    '/pages/privacy':                            '/privacy',
    '/pages/privacy.html':                       '/privacy',
    '/pages/products':                          '/products',
    '/pages/products.html':                     '/products',
    '/pages/results':                           '/results',
    '/pages/results.html':                      '/results',
    '/pages/services':                          '/services',
    '/pages/services.html':                     '/services',
    '/pages/terms':                              '/terms',
    '/pages/terms.html':                         '/terms',
    '/services/custom-ai-development.html':     '/services/custom-ai-development',
    '/services/ai-training.html':               '/services/ai-training',
    '/services/ai-strategy.html':               '/services/ai-strategy',
    '/industries/real-estate.html':             '/industries/real-estate',
    '/industries/retail.html':                  '/industries/retail',
    '/industries/hospitality.html':             '/industries/hospitality',
    '/industries/logistics.html':               '/industries/logistics',
  },
```
Replace with:
```javascript
  redirects: {
    // Destinations point straight at the final /{lang}/{country} URL (not the
    // pre-migration clean URL) so these ancient WordPress-style paths don't
    // chain through two 301s. '/pages/products' and '/pages/results' are left
    // pointing at their original (already-nonexistent) targets — that was a
    // pre-existing dead redirect before this migration, not something it caused.
    '/pages/about':                             '/en/ae/about',
    '/pages/about.html':                        '/en/ae/about',
    '/pages/blog':                              '/en/ae/blog',
    '/pages/blog.html':                         '/en/ae/blog',
    '/pages/contact':                            '/en/ae/contact',
    '/pages/contact.html':                       '/en/ae/contact',
    '/pages/privacy':                            '/en/ae/privacy',
    '/pages/privacy.html':                       '/en/ae/privacy',
    '/pages/products':                          '/products',
    '/pages/products.html':                     '/products',
    '/pages/results':                           '/results',
    '/pages/results.html':                      '/results',
    '/pages/services':                          '/en/ae/services',
    '/pages/services.html':                     '/en/ae/services',
    '/pages/terms':                              '/en/ae/terms',
    '/pages/terms.html':                         '/en/ae/terms',
    '/services/custom-ai-development.html':     '/en/ae/services/custom-ai-development',
    '/services/ai-training.html':               '/en/ae/services/ai-training',
    '/services/ai-strategy.html':               '/en/ae/services/ai-strategy',
    '/industries/real-estate.html':             '/en/ae/industries/real-estate',
    '/industries/retail.html':                  '/en/ae/industries/retail',
    '/industries/hospitality.html':             '/en/ae/industries/hospitality',
    '/industries/logistics.html':               '/en/ae/industries/logistics',
  },
```

- [ ] **Step 2: Commit**

```bash
cd astro-site
git add astro.config.mjs
git commit -m "fix: point legacy .html redirects straight at the new /{lang}/{country} URLs"
```

---

## Phase 6: Verification

### Task 16: Automated verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `cd astro-site && npm run test`
Expected: all tests pass, including every new/updated test from Tasks 1, 11, 13, 14.

- [ ] **Step 2: Typecheck**

Run: `cd astro-site && NODE_OPTIONS="--max-old-space-size=8192" npm run check`
Expected: no new errors beyond whatever pre-existing baseline the project already has (compare file/error count against a `git stash` baseline if unsure which errors are pre-existing).

- [ ] **Step 3: Production build**

Run: `cd astro-site && npm run build`
Expected: build succeeds. This is the single strongest signal that every moved file's imports resolve correctly (Tasks 4 and 6) — a broken relative import fails the build loudly, it doesn't fail silently.

### Task 17: Manual dev-server verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `cd astro-site && npm run dev`

- [ ] **Step 2: Confirm new-style URLs render**

Visit and confirm each loads correctly (not a 404, correct language):
- `http://localhost:4321/en/ae` (EN home)
- `http://localhost:4321/en/ae/about`
- `http://localhost:4321/en/ae/services/ai-agents`
- `http://localhost:4321/en/ae/industries/real-estate`
- `http://localhost:4321/ar/ae` (AR home, RTL)
- `http://localhost:4321/ar/ae/about`
- `http://localhost:4321/ar/ae/services/ai-agents`

- [ ] **Step 3: Confirm nav, footer, and the language switcher use new-style links**

On `http://localhost:4321/en/ae/about`, open devtools and inspect: the Services/Industries mega-menu links, the footer Industries/Services/Company columns, and the "ع" language-switcher link — all should point at `/en/ae/...` or `/ar/ae/...`, never a bare `/services/...` or `/ar/...`.

- [ ] **Step 4: Confirm old-style URLs 301-redirect**

With the dev server running, in a separate terminal:
```bash
curl -sI http://localhost:4321/about | head -5
curl -sI http://localhost:4321/ | head -5
curl -sI http://localhost:4321/ar | head -5
curl -sI http://localhost:4321/ar/about | head -5
```
Expected each: `HTTP/1.1 301` (or `308` is also Astro's spec for non-GET, but these are GET so 301) with a `location:` header pointing at `/en/ae/about`, `/en/ae`, `/ar/ae`, `/ar/ae/about` respectively.

- [ ] **Step 5: Confirm infra paths are unaffected**

```bash
curl -sI http://localhost:4321/robots.txt | head -3
curl -sI http://localhost:4321/sitemap_index.xml | head -3
curl -s  http://localhost:4321/page-sitemap.xml | grep -o '<loc>[^<]*</loc>' | head -5
```
Expected: `robots.txt` and `sitemap_index.xml` return `200` (not redirected); `page-sitemap.xml`'s first few `<loc>` entries read `https://lenooai.com/en/ae` / `https://lenooai.com/en/ae/services` etc.

### Task 18: Flag the Supabase `redirects` table for manual review (data, not code)

**Files:** none — this is a data check, not a code change, and cannot be safely scripted blindly against production data.

- [ ] **Step 1: Check for stale rows**

Via `/admin/settings/redirects` (or a direct Supabase query), check whether any row in the `redirects` table has a `to_path` pointing at a pre-migration URL (e.g. `/about`, `/blog/some-post`, `/ar/services/x`). Any such row now sends visitors into this migration's new legacy-redirect rule for a second hop (`old admin-added-path` → `/about` (DB redirect) → `/en/ae/about` (structural redirect, Task 12)) — still a real 301 either way, but tell the user so they can update those rows' `to_path` values to the final `/en/ae/...`/`/ar/ae/...` URL directly if they want a single hop.

- [ ] **Step 2: Report findings to the user**

Summarize what was found (row count, example `from_path`/`to_path` pairs) and let the user decide whether to update them now or leave the harmless extra hop in place.

---

## Self-review notes (for whoever executes this plan)

- **Spec coverage**: routing (Phase 2), nav/footer links (Task 7's codemod covers `Navbar.astro`/`ArNavbar.astro`/`Footer.astro`/`ArFooter.astro`), sitemap (Tasks 9-10), hreflang tags (no layout code change needed — confirmed the mechanism is prop-driven and the props get corrected by Task 7/8), internal links inside content (Task 7's codemod + Task 8's manual verification), redirect rules for the hosting setup (Task 12 middleware rule, confirmed to emit real 301s identically on both the Vercel and o2switch/`@astrojs/node` adapters per the Astro 7.0.3 core source read during research) — every part of the original request is covered.
- **Known interaction with in-flight work**: this plan assumes Task 2's check has already surfaced and resolved the uncommitted internal-linking changes with the user before Phase 2 begins.
