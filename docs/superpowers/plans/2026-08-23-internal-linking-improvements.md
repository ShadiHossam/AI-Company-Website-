# Internal Linking Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve internal linking across the astro-site (services ↔ industries ↔ tools), while guaranteeing that any link this work adds to a page which is committed but not yet deployed live cannot render as a clickable, broken `<a href>`.

**Architecture:** Three independently-shippable phases. Phase 1 builds a small "live-flag" registry (`src/data/pendingPages.ts`) plus a `SafeLink.astro` component that only renders a real `<a href>` when the target is confirmed live, otherwise falls back to plain text — this is the safety net every later phase's links must go through. Phase 2 fixes nav/footer reachability gaps found in the audit (no "View All Industries" escape hatch exists today, unlike Services). Phase 3 adds a single relationship data file (`src/data/pageRelations.ts`) mapping industries ↔ services, rendered by one `RelatedPages.astro` component wired once into `BaseLayout.astro` — so it applies to every industries/services page automatically, with no per-page edits.

**Tech Stack:** Astro 7 (`.astro` components/pages), TypeScript, Vitest (existing `src/__tests__/lib/**` convention, `node` environment, `globals: true`).

---

## Audit findings this plan is based on (verified against the current codebase, 2026-08-23)

- `src/components/Navbar.astro` and `Footer.astro` (+ `ArNavbar.astro`/`ArFooter.astro`) hardcode a curated subset of links. The Services dropdown has a "View All Services →" link (`Navbar.astro:38`) pointing at `/services` (resolved by `src/pages/services.astro`, confirmed it exists — not a 404). The **Industries dropdown has no equivalent "View all" link**, despite `src/pages/industries/index.astro` already listing all 39 industry pages correctly via its `industryGroups` array (verified complete — this is not a data gap, just a missing nav/footer link to it).
- `src/pages/industries/*.astro` (39 pages) and `src/pages/services/**/*.astro` (68 pages, both top-level and subpages) both render `<slot />` inside `src/layouts/BaseLayout.astro`, which already receives a `canonicalPath` prop on every page — the exact page-identity string this plan uses as the lookup key, so no new prop needs threading through.
- Neither industries nor services page bodies contain any internal contextual links today (confirmed via sampling). The only place hand-written contextual links exist is the 14 tool subpages under `services/ai-automation/tools/*` and `services/ai-agents/tools/*`, which is out of scope here (already working).
- The blog's "Related Articles" query (`src/pages/blog/[slug].astro:65-72`) **already filters `.eq('status', 'published')`** on the related-posts query, same as the main post query (line 54). This was suspected to be a gap but is verified safe — no fix needed, just a guardrail comment so it isn't accidentally weakened later.
- `src/pages/ar/industries/` has no `marketing/` subdirectory, while `src/pages/industries/marketing/` has 10 real pages (seo, social-media, etc.) linked from `Navbar.astro`. This is a **content parity gap** (10 untranslated pages), not a linking bug — out of scope for this plan (flagged separately, see "Not in scope" below).
- No file anywhere maps relationships between industries and services. `src/data/automationTools.ts`'s `AutomationTool` interface has no `related*` field.

## Not in scope (explicitly flagged, not silently dropped)

- **AR `industries/marketing/*` content parity** — 10 pages exist in EN with no AR equivalent. This is translation/content work, not a linking fix. Tracked separately.
- Extending the Phase 3 relationship map to the AR site (`ArBaseLayout.astro`) — deferred until AR content parity above is resolved, otherwise `RelatedPages` would need a second, EN-path-to-AR-path translation table for no real benefit yet.
- Rewriting the 14 existing tool-page contextual links — already working, not touched.

## Amendment (discovered mid-execution, 2026-08-23)

The audit assumed the 39 industries pages and their target service subpages were all committed and merely waiting on a staged-rollout deploy batch (per `project_staged_rollout_status` memory). Live verification during Task 1 execution found something different: **`src/pages/industries/index.astro` itself — the whole Industries hub page — is untracked in git** (never committed), which is why `/industries` 404s on production. Of the 39 industries leaf pages, 18 are untracked local drafts; of the service subpages this plan's `pageRelations.ts` links to, 6 are also untracked drafts (`ai-compliance-uae`, `ai-automation/finance`, `ai-automation/free-zone`, `ai-automation/procurement`, `ai-automation/operations`, `ai-agents/receptionist`). This is a separate, deliberate one-or-two-page-at-a-time publish cadence (`git log --grep=publish`), not a deploy lag — confirmed via matching `git ls-files` tracked/untracked status against live `curl` 200/404 checks on every path this plan touches.

User decisions on this (via AskUserQuestion, 2026-08-23):
1. **Task 4/5/6 nav/footer links now go through `SafeLink`** instead of a raw `<a href>`, since their target (`/industries`) is itself an unpublished draft — this keeps them safe to ship now and self-activating once `/industries` is published through the normal pipeline. `SafeLink.astro`'s design changed accordingly (Task 2) to accept arbitrary passthrough attributes via `{...rest}` so it can carry the nav/footer inline `style` attributes, not just `class`.
2. **`pageRelations.ts` (Task 7) still includes all 39 industries and every service subpage as planned** — draft targets simply render as plain text via `SafeLink` until published, then activate automatically with no further code changes.
3. **`PENDING_PAGES` (Task 1) is seeded with the real, verified list of untracked paths** (below) instead of starting empty.

---

## Phase 1: Deploy-safety live-flag mechanism

### Task 1: Pending-pages registry and `isPageLive()`

**Files:**
- Create: `astro-site/src/data/pendingPages.ts`
- Create: `astro-site/src/lib/internalLinks.ts`
- Test: `astro-site/src/__tests__/lib/internalLinks.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// astro-site/src/__tests__/lib/internalLinks.test.ts
import { describe, it, expect } from 'vitest';
import { isPageLive } from '../../lib/internalLinks';

describe('isPageLive', () => {
  it('returns true for a path not in the pending list', () => {
    expect(isPageLive('/industries/retail')).toBe(true);
  });

  it('returns false for a path in the pending list', () => {
    expect(isPageLive('/industries/pharmacies')).toBe(false);
  });

  it('normalizes a trailing slash before comparing', () => {
    expect(isPageLive('/industries/pharmacies/')).toBe(false);
  });

  it('treats the root path "/" as live without stripping it to empty', () => {
    expect(isPageLive('/')).toBe(true);
  });
});
```

Note: these assertions depend on `/industries/pharmacies` staying in `PENDING_PAGES` (Step 3 below) and `/industries/retail` staying out of it. If you publish `/industries/pharmacies` before running this plan, swap in another still-pending path from the Step 3 list.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro-site && npx vitest run src/__tests__/lib/internalLinks.test.ts`
Expected: FAIL — `Cannot find module '../../lib/internalLinks'`

- [ ] **Step 3: Create the pending-pages registry**

```typescript
// astro-site/src/data/pendingPages.ts

/**
 * Site-relative paths (e.g. "/services/vibe-coding/foo") that are committed
 * to the repo but NOT yet confirmed live on production. Any link this site
 * builds to one of these paths (via SafeLink.astro) renders as plain text
 * instead of a clickable <a href>, so a staged-rollout deploy gap can never
 * surface as a broken link to a visitor.
 *
 * Update this list every time a staged-rollout batch ships (see project
 * memory "Staged Rollout Status" for the current batch schedule): add a
 * path the moment it's referenced by a new cross-link before its own batch
 * has deployed, remove it once that batch's deploy is verified live.
 */
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

This list was verified live during plan execution (see "Amendment" above) — no further curl verification needed before Step 4, just double-check it's still current if executing this plan significantly later than 2026-08-23 (more pages may have been published since).

- [ ] **Step 4: Write the implementation**

```typescript
// astro-site/src/lib/internalLinks.ts
import { PENDING_PAGES } from '../data/pendingPages';

export function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isPageLive(path: string): boolean {
  return !PENDING_PAGES.includes(normalizePath(path));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd astro-site && npx vitest run src/__tests__/lib/internalLinks.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
cd astro-site
git add src/data/pendingPages.ts src/lib/internalLinks.ts src/__tests__/lib/internalLinks.test.ts
git commit -m "feat: add pending-pages registry and isPageLive() helper"
```

### Task 2: `SafeLink.astro` component

**Files:**
- Create: `astro-site/src/components/SafeLink.astro`

- [ ] **Step 1: Write the component**

```astro
---
// astro-site/src/components/SafeLink.astro
// Rest-props passthrough (not just `class`) so this can drop into nav/footer
// markup that uses inline `style`, `role`, etc. on existing hardcoded <a> tags
// (see Task 4/5/6) without losing any of their attributes.
import { isPageLive } from '../lib/internalLinks';

interface Props extends astroHTML.JSX.AnchorHTMLAttributes {
  href: string;
}

const { href, ...rest } = Astro.props;
const live = isPageLive(href);
---
{live ? (
  <a href={href} {...rest}><slot /></a>
) : (
  <span data-pending-page="true" {...rest}><slot /></span>
)}
```

- [ ] **Step 2: Verify it type-checks and builds**

Run: `cd astro-site && npx astro check --root . 2>&1 | grep -i safelink || echo "no SafeLink errors"`
Expected: `no SafeLink errors` (pre-existing unrelated errors in the codebase are expected per project history — only confirm nothing new points at `SafeLink.astro`)

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/components/SafeLink.astro
git commit -m "feat: add SafeLink component that falls back to plain text for not-yet-live pages"
```

### Task 3: Guardrail comment on the blog related-posts query

**Files:**
- Modify: `astro-site/src/pages/blog/[slug].astro:64-74`

The related-posts query already filters `status = 'published'` correctly (verified during the audit — this is not a bug fix, just documenting the constraint so a future edit doesn't drop the filter while "simplifying" the query).

- [ ] **Step 1: Add the comment**

Find this block (around line 64):

```typescript
    // Fetch related posts (same category, different slug, max 3)
    const { data: related } = await supabase
      .from('blog_posts')
      .select('title, slug, category')
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('category', dbPost.category)
      .neq('slug', slug!)
      .limit(3);
```

Replace with:

```typescript
    // Fetch related posts (same category, different slug, max 3).
    // The status filter below is load-bearing: without it, a scheduled/draft
    // post in the same category could be surfaced as a "related" link before
    // it's actually published, producing a broken link for visitors.
    const { data: related } = await supabase
      .from('blog_posts')
      .select('title, slug, category')
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('category', dbPost.category)
      .neq('slug', slug!)
      .limit(3);
```

- [ ] **Step 2: Commit**

```bash
cd astro-site
git add src/pages/blog/\[slug\].astro
git commit -m "docs: mark blog related-posts status filter as load-bearing"
```

---

## Phase 2: Nav/footer reachability

### Task 4: Add "View All Industries" link to `Navbar.astro`

**Files:**
- Modify: `astro-site/src/components/Navbar.astro:1-2` (import)
- Modify: `astro-site/src/components/Navbar.astro:64-73` (desktop industries dropdown)
- Modify: `astro-site/src/components/Navbar.astro:113-137` (mobile industries submenu)

`/industries` is itself an unpublished draft as of 2026-08-23 (see "Amendment" above), so both new links below use `SafeLink` instead of a raw `<a>` — they ship now as plain text and self-activate as a real link the moment `/industries` is published.

- [ ] **Step 1: Import `SafeLink`**

Find (line 1-2):

```astro
---
import { COMPANY } from '../config/company';
```

Replace with:

```astro
---
import { COMPANY } from '../config/company';
import SafeLink from './SafeLink.astro';
```

- [ ] **Step 2: Add the desktop "View all" link**

Find this block (the third column of the industries mega-menu, around line 65):

```astro
          <div class="services-divider"></div>
          <div class="services-col">
            <a href="/industries/marketing" class="nav-dropdown-item" role="menuitem" style="font-weight:700;">Marketing</a>
            <a href="/industries/marketing/seo"                    class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">SEO</a>
            <a href="/industries/marketing/social-media"           class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">Social Media</a>
            <a href="/industries/marketing/image-generation"       class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">Image Generation</a>
            <a href="/industries/marketing/video-generation"       class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">Video Generation</a>
            <a href="/industries/marketing" class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem; color:#006875;">More marketing AI →</a>
          </div>
        </div>
      </div>
```

Replace with (adds a full-width "View All Industries" row, mirroring the existing Services dropdown pattern at line 38, via `SafeLink`):

```astro
          <div class="services-divider"></div>
          <div class="services-col">
            <a href="/industries/marketing" class="nav-dropdown-item" role="menuitem" style="font-weight:700;">Marketing</a>
            <a href="/industries/marketing/seo"                    class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">SEO</a>
            <a href="/industries/marketing/social-media"           class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">Social Media</a>
            <a href="/industries/marketing/image-generation"       class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">Image Generation</a>
            <a href="/industries/marketing/video-generation"       class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem;">Video Generation</a>
            <a href="/industries/marketing" class="nav-dropdown-item" role="menuitem" style="padding-left:1.4rem; font-size:0.8125rem; color:#006875;">More marketing AI →</a>
          </div>
          <div style="height:1px;background:#E2E8F0;margin:.4rem .9rem;grid-column:1/-1;"></div>
          <SafeLink href="/industries" class="nav-dropdown-item" role="menuitem" style="color:#006875;grid-column:1/-1;">View All Industries →</SafeLink>
        </div>
      </div>
```

- [ ] **Step 3: Add the mobile "View all" link**

Find the end of the mobile industries submenu (around line 136):

```astro
          <a href="/industries/marketing/paid-ads"               onclick="toggleMenu()" style="padding-inline-start:1rem;">Paid Ad Optimization</a>
        </div>
      </div>
```

Replace with:

```astro
          <a href="/industries/marketing/paid-ads"               onclick="toggleMenu()" style="padding-inline-start:1rem;">Paid Ad Optimization</a>
          <SafeLink href="/industries" onclick="toggleMenu()" style="color:#006875; font-weight:700;">View All Industries →</SafeLink>
        </div>
      </div>
```

Note: `SafeLink`'s live branch renders a real `<a>`, so the `onclick="toggleMenu()"` attribute (closing the mobile menu on tap) passes through correctly via `{...rest}`. In the not-live fallback it lands on a `<span>` where it's inert, which is fine — there's nothing to navigate away from yet.

- [ ] **Step 4: Verify in the browser**

Run: `cd astro-site && npm run dev`
Visit `http://localhost:4321/` and open the Industries dropdown (desktop) and the mobile menu; confirm "View All Industries →" appears at the bottom of both, rendered as plain (non-clickable) text — inspect via devtools to confirm it's a `<span data-pending-page="true">`, not an `<a>`, since `/industries` is still pending.

- [ ] **Step 5: Commit**

```bash
cd astro-site
git add src/components/Navbar.astro
git commit -m "feat: add View All Industries link to nav, matching existing Services pattern"
```

### Task 5: Add "View all industries" link to `Footer.astro`

**Files:**
- Modify: `astro-site/src/components/Footer.astro:1-2` (import)
- Modify: `astro-site/src/components/Footer.astro:66-84`

- [ ] **Step 1: Import `SafeLink`**

Find (line 1-2):

```astro
---
import { COMPANY } from '../config/company';
```

Replace with:

```astro
---
import { COMPANY } from '../config/company';
import SafeLink from './SafeLink.astro';
```

- [ ] **Step 2: Add the link**

Find this block (around line 66):

```astro
        <!-- Industries -->
        <div class="footer-col footer-industries">
          <h4 class="col-heading">Industries</h4>
          <ul class="col-list industries-list">
            <li><a href="/industries/real-estate"     class="col-link">Real Estate</a></li>
            <li><a href="/industries/retail"          class="col-link">Retail</a></li>
            <li><a href="/industries/hospitality"     class="col-link">Hospitality</a></li>
            <li><a href="/industries/logistics"       class="col-link">Logistics</a></li>
            <li><a href="/industries/healthcare"      class="col-link">Healthcare</a></li>
            <li><a href="/industries/finance-banking" class="col-link">Finance &amp; Banking</a></li>
            <li><a href="/industries/manufacturing"   class="col-link">Manufacturing</a></li>
            <li><a href="/industries/legal"           class="col-link">Legal</a></li>
            <li><a href="/industries/education"       class="col-link">Education</a></li>
            <li><a href="/industries/insurance"       class="col-link">Insurance</a></li>
            <li><a href="/industries/consulting"      class="col-link">Professional Services</a></li>
            <li><a href="/industries/hr-recruitment"  class="col-link">HR &amp; Recruitment</a></li>
            <li><a href="/industries/marketing"       class="col-link">Marketing</a></li>
          </ul>
        </div>
```

Replace with:

```astro
        <!-- Industries -->
        <div class="footer-col footer-industries">
          <h4 class="col-heading">Industries</h4>
          <ul class="col-list industries-list">
            <li><a href="/industries/real-estate"     class="col-link">Real Estate</a></li>
            <li><a href="/industries/retail"          class="col-link">Retail</a></li>
            <li><a href="/industries/hospitality"     class="col-link">Hospitality</a></li>
            <li><a href="/industries/logistics"       class="col-link">Logistics</a></li>
            <li><a href="/industries/healthcare"      class="col-link">Healthcare</a></li>
            <li><a href="/industries/finance-banking" class="col-link">Finance &amp; Banking</a></li>
            <li><a href="/industries/manufacturing"   class="col-link">Manufacturing</a></li>
            <li><a href="/industries/legal"           class="col-link">Legal</a></li>
            <li><a href="/industries/education"       class="col-link">Education</a></li>
            <li><a href="/industries/insurance"       class="col-link">Insurance</a></li>
            <li><a href="/industries/consulting"      class="col-link">Professional Services</a></li>
            <li><a href="/industries/hr-recruitment"  class="col-link">HR &amp; Recruitment</a></li>
            <li><a href="/industries/marketing"       class="col-link">Marketing</a></li>
            <li><SafeLink href="/industries" class="col-link" style="color:#00e3fd;">View all industries →</SafeLink></li>
          </ul>
        </div>
```

- [ ] **Step 3: Commit**

```bash
cd astro-site
git add src/components/Footer.astro
git commit -m "feat: add View all industries link to footer"
```

### Task 6: Mirror both links on the AR site

**Files:**
- Modify: `astro-site/src/components/ArNavbar.astro` (import + desktop/mobile industries menus, same pattern as `Navbar.astro`)
- Modify: `astro-site/src/components/ArFooter.astro` (import + industries column, same pattern as `Footer.astro`)

`/ar/industries` is also an unpublished draft (verified: `src/pages/ar/industries/index.astro` is untracked in git, `curl` confirms 404) — use `SafeLink` here too, same reasoning as Task 4/5.

- [ ] **Step 1: Read the current industries sections and import style**

Run: `cd astro-site && grep -n "^import\|industries/" src/components/ArNavbar.astro src/components/ArFooter.astro`

- [ ] **Step 2: Add the `SafeLink` import to both files' frontmatter**, following the same pattern as Task 4 Step 1 / Task 5 Step 1 (add `import SafeLink from './SafeLink.astro';` alongside the existing imports).

- [ ] **Step 3: Add an Arabic "View all" `SafeLink` in the same two spots as Task 4/5** (desktop dropdown, mobile submenu, and footer industries column), pointing `href="/ar/industries"`. Use an Arabic label consistent with the site's existing AR link text style (e.g. "عرض كل الصناعات ←" for "View all industries", matching the RTL arrow direction already used elsewhere in `ArNavbar.astro`/`ArFooter.astro` — check an existing AR "view all"/"more" link in either file for the exact arrow convention before typing the new one). Replace the raw `<a href="/ar/industries" ...>` you'd otherwise write with `<SafeLink href="/ar/industries" ...>...</SafeLink>`, carrying over whatever `class`/`style` attributes the surrounding links in that file use.

- [ ] **Step 4: Verify in the browser**

Run: `cd astro-site && npm run dev`
Visit `http://localhost:4321/ar` and confirm the new links appear in nav, mobile menu, and footer, rendered as plain (non-clickable) text (inspect via devtools: `<span data-pending-page="true">`, not `<a>`) since `/ar/industries` is still pending.

- [ ] **Step 5: Commit**

```bash
cd astro-site
git add src/components/ArNavbar.astro src/components/ArFooter.astro
git commit -m "feat: mirror View All Industries link on AR nav and footer"
```

---

## Phase 3: Related-pages linking system

### Task 7: `pageRelations.ts` data file

**Files:**
- Create: `astro-site/src/data/pageRelations.ts`

- [ ] **Step 1: Write the file**

```typescript
// astro-site/src/data/pageRelations.ts

export interface RelatedLink {
  path: string;
  label: string;
}

export interface IndustryServiceRelation {
  industry: RelatedLink;
  services: RelatedLink[];
}

/**
 * Maps each industry page to the 2 most relevant service pages. Authored in
 * one direction only: RelatedPages.astro (via getRelatedLinks in
 * src/lib/internalLinks.ts) does the reverse lookup automatically, so a
 * service page shows the industries that named it without needing a second
 * entry here. Prefer a specific service subpage (e.g.
 * "/services/ai-automation/real-estate") over the generic top-level service
 * page when one exists for that industry.
 */
export const INDUSTRY_SERVICE_RELATIONS: IndustryServiceRelation[] = [
  { industry: { path: '/industries/real-estate', label: 'Real Estate' }, services: [
    { path: '/services/ai-agents/for-real-estate', label: 'AI Agents for Real Estate' },
    { path: '/services/ai-automation/real-estate', label: 'Real Estate Automation' },
  ]},
  { industry: { path: '/industries/property-management', label: 'Property Management' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/construction', label: 'Construction' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/interior-fitout', label: 'Interior Design & Fit-Out' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/engineering-consultancies', label: 'Engineering Consultancies' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-strategy', label: 'AI Strategy Consulting' },
  ]},
  { industry: { path: '/industries/healthcare', label: 'Healthcare' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/healthcare-clinics', label: 'Medical Clinics' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/dental-clinics', label: 'Dental Clinics' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/aesthetic-clinics', label: 'Aesthetic & Derma Clinics' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/pharmacies', label: 'Pharmacies' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/fitness-gyms', label: 'Gyms & Fitness Studios' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/beauty-salons', label: 'Salons & Spas' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/retail', label: 'Retail' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/ecommerce', label: 'E-Commerce' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/restaurants', label: 'Restaurants' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/car-dealerships', label: 'Car Dealerships' }, services: [
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/travel-agencies', label: 'Travel Agencies' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/event-management', label: 'Event Management' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/consulting', label: 'Professional Services' }, services: [
    { path: '/services/ai-strategy', label: 'AI Strategy Consulting' },
    { path: '/services/ai-automation/agencies', label: 'Automation for Agencies' },
  ]},
  { industry: { path: '/industries/legal', label: 'Legal' }, services: [
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/finance-banking', label: 'Finance & Banking' }, services: [
    { path: '/services/ai-automation/finance', label: 'Finance Automation' },
    { path: '/services/ai-compliance-uae', label: 'AI Compliance in the UAE' },
  ]},
  { industry: { path: '/industries/accounting-firms', label: 'Accounting Firms' }, services: [
    { path: '/services/ai-automation/accounting', label: 'Accounting Automation' },
    { path: '/services/ai-integration', label: 'AI Integration' },
  ]},
  { industry: { path: '/industries/insurance', label: 'Insurance' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/coworking-business-setup', label: 'Business Setup Consultancies' }, services: [
    { path: '/services/ai-automation/free-zone', label: 'Free Zone Business Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/marketing', label: 'Marketing' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/marketing-agencies', label: 'Marketing Agencies' }, services: [
    { path: '/services/ai-automation/agencies', label: 'Automation for Agencies' },
    { path: '/services/ai-agents/agencies', label: 'AI Agents for Agencies' },
  ]},
  { industry: { path: '/industries/hr-recruitment', label: 'HR & Recruitment' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/logistics', label: 'Logistics' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/last-mile-delivery', label: 'Last-Mile Delivery' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/facilities-management', label: 'Facilities Management' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/cleaning-services', label: 'Cleaning Services' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
  ]},
  { industry: { path: '/industries/auto-service', label: 'Auto Service Centres' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/security-services', label: 'Security & Manpower' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/trading-distribution', label: 'Trading & Distribution' }, services: [
    { path: '/services/ai-automation/procurement', label: 'Procurement Automation' },
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
  ]},
  { industry: { path: '/industries/manufacturing', label: 'Manufacturing' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/hospitality', label: 'Hospitality' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/education', label: 'Education' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/training-institutes', label: 'Training Institutes' }, services: [
    { path: '/services/ai-training', label: 'AI Training & Workshops' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/it-msp', label: 'IT Service Providers' }, services: [
    { path: '/services/ai-integration', label: 'AI Integration' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
];
```

- [ ] **Step 2: Commit**

```bash
cd astro-site
git add src/data/pageRelations.ts
git commit -m "feat: add industry-to-service relationship data for internal linking"
```

### Task 8: `getRelatedLinks()` lookup function

**Files:**
- Modify: `astro-site/src/lib/internalLinks.ts`
- Test: `astro-site/src/__tests__/lib/internalLinks.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `astro-site/src/__tests__/lib/internalLinks.test.ts`:

```typescript
import { isPageLive, getRelatedLinks } from '../../lib/internalLinks';
import type { IndustryServiceRelation } from '../../data/pageRelations';

const testRelations: IndustryServiceRelation[] = [
  {
    industry: { path: '/industries/retail', label: 'Retail' },
    services: [{ path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' }],
  },
];

describe('getRelatedLinks', () => {
  it('returns the related services for an industry page (forward lookup)', () => {
    const result = getRelatedLinks('/industries/retail', testRelations);
    expect(result).toEqual({
      heading: 'Related Services',
      links: [{ path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' }],
    });
  });

  it('returns the related industries for a service page (reverse lookup)', () => {
    const result = getRelatedLinks('/services/ai-agents/customer-support', testRelations);
    expect(result).toEqual({
      heading: 'Related Industries',
      links: [{ path: '/industries/retail', label: 'Retail' }],
    });
  });

  it('returns null for a page with no relation either direction', () => {
    expect(getRelatedLinks('/about', testRelations)).toBeNull();
  });

  it('normalizes a trailing slash before matching', () => {
    const result = getRelatedLinks('/industries/retail/', testRelations);
    expect(result?.heading).toBe('Related Services');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro-site && npx vitest run src/__tests__/lib/internalLinks.test.ts`
Expected: FAIL — `getRelatedLinks is not a function`

- [ ] **Step 3: Implement `getRelatedLinks`**

Add to `astro-site/src/lib/internalLinks.ts`:

```typescript
import type { IndustryServiceRelation, RelatedLink } from '../data/pageRelations';

export interface RelatedLinksResult {
  heading: 'Related Services' | 'Related Industries';
  links: RelatedLink[];
}

export function getRelatedLinks(
  path: string,
  relations: IndustryServiceRelation[]
): RelatedLinksResult | null {
  const normalized = normalizePath(path);

  const forward = relations.find((r) => r.industry.path === normalized);
  if (forward && forward.services.length > 0) {
    return { heading: 'Related Services', links: forward.services };
  }

  const industries = relations
    .filter((r) => r.services.some((s) => s.path === normalized))
    .map((r) => r.industry);
  if (industries.length > 0) {
    return { heading: 'Related Industries', links: industries };
  }

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro-site && npx vitest run src/__tests__/lib/internalLinks.test.ts`
Expected: PASS (8 tests total)

- [ ] **Step 5: Commit**

```bash
cd astro-site
git add src/lib/internalLinks.ts src/__tests__/lib/internalLinks.test.ts
git commit -m "feat: add getRelatedLinks bidirectional lookup for industry/service relations"
```

### Task 9: `RelatedPages.astro` component

**Files:**
- Create: `astro-site/src/components/RelatedPages.astro`

- [ ] **Step 1: Write the component**

```astro
---
// astro-site/src/components/RelatedPages.astro
import SafeLink from './SafeLink.astro';
import { getRelatedLinks } from '../lib/internalLinks';
import { INDUSTRY_SERVICE_RELATIONS } from '../data/pageRelations';

interface Props {
  path: string;
}

const { path } = Astro.props;
const result = getRelatedLinks(path, INDUSTRY_SERVICE_RELATIONS);
---
{result && (
  <section class="section related-pages" aria-labelledby="related-pages-heading">
    <div class="container">
      <h2 id="related-pages-heading" style="font-size:1.375rem; margin-bottom:1.25rem;">{result.heading}</h2>
      <div class="related-pages-list">
        {result.links.map((link) => (
          <SafeLink href={link.path} class="related-pages-link">{link.label}</SafeLink>
        ))}
      </div>
    </div>
  </section>
)}

<style>
  .related-pages { padding: 3rem 0; border-top: 1px solid var(--border); }
  .related-pages-list { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .related-pages-link {
    display: inline-block;
    padding: 0.6rem 1.1rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: #00253b;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
  }
  a.related-pages-link:hover { background: rgba(0,104,117,0.08); border-color: #006875; }
  span.related-pages-link { color: #72787e; cursor: default; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd astro-site
git add src/components/RelatedPages.astro
git commit -m "feat: add RelatedPages component"
```

### Task 10: Wire `RelatedPages` into `BaseLayout.astro`

**Files:**
- Modify: `astro-site/src/layouts/BaseLayout.astro:1-88`

- [ ] **Step 1: Import the component**

Find (line 2-3):

```astro
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
```

Replace with:

```astro
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import RelatedPages from '../components/RelatedPages.astro';
```

- [ ] **Step 2: Render it between `<main>` and `<Footer />`**

Find (lines 85-88):

```astro
<main id="main-content">
<slot />
</main>
<Footer />
```

Replace with:

```astro
<main id="main-content">
<slot />
</main>
<RelatedPages path={canonicalPath} />
<Footer />
```

- [ ] **Step 3: Verify in the browser**

Run: `cd astro-site && npm run dev`
Visit `http://localhost:4321/industries/retail` — confirm a "Related Services" section with a link to "AI Customer Support Agents" appears above the footer.
Visit `http://localhost:4321/services/ai-agents/customer-support` — confirm a "Related Industries" section appears listing "Retail" (and every other industry mapped to that service page in Task 7).
Visit `http://localhost:4321/about` — confirm no related-pages section renders (no entry in the data for this path).

- [ ] **Step 4: Commit**

```bash
cd astro-site
git add src/layouts/BaseLayout.astro
git commit -m "feat: render RelatedPages on every page via BaseLayout"
```

### Task 11: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `cd astro-site && npm run test`
Expected: all tests pass, including the new `internalLinks.test.ts` cases.

- [ ] **Step 2: Run the typechecker**

Run: `cd astro-site && NODE_OPTIONS="--max-old-space-size=8192" npm run check`
Expected: no new errors introduced by this plan (pre-existing unrelated errors are expected per project history — compare the error count/files against a `git stash` baseline if unsure).

- [ ] **Step 3: Run the production build**

Run: `cd astro-site && npm run build`
Expected: build succeeds with no errors referencing `SafeLink.astro`, `RelatedPages.astro`, `internalLinks.ts`, or `pageRelations.ts`.

- [ ] **Step 4: Spot-check a SafeLink fallback**

Temporarily add a real path from `INDUSTRY_SERVICE_RELATIONS` (e.g. `services/ai-agents/customer-support`) to `PENDING_PAGES` in `src/data/pendingPages.ts`, restart `npm run dev`, and confirm on `/industries/retail` that the "AI Customer Support Agents" related link now renders as plain text (no `<a>` tag, inspect via browser devtools) instead of a clickable link. Revert this temporary change before committing anything further.
