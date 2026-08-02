# New Pages Visual Refresh — Design Spec

Date: 2026-08-02

## Problem

The batch of newly created English pages under `astro-site/src/pages/` (industries, ai-automation location/tool pages, vibe-coding pages) is text-heavy: most pages carry zero or one stock photo and rely entirely on icon-box card grids for visual interest. The request is to make these pages more attractive by adding more images and more interactive elements.

## Scope

**In scope (this spec):** the ~40 newly created English-language pages, grouped below.

**Out of scope (future work):**
- Arabic (`/ar/`) equivalents of these pages
- The rest of the site (homepage, services hub, about, contact, existing older service pages, admin)

### Page inventory (40 pages)

**Industry pages (9)** — `src/pages/industries/`
consulting, education, finance-banking, healthcare, hr-recruitment, insurance, legal, manufacturing, marketing (hub)

**Marketing sub-industry pages (10)** — `src/pages/industries/marketing/`
analytics-attribution, content-writing, email-marketing, image-generation, influencer-marketing, paid-ads, seo, social-media, video-generation, voice-generation

**AI Automation location/audience pages (7)** — `src/pages/services/ai-automation/`
abu-dhabi, accounting, agencies, business, dubai, real-estate, tools (hub)

**AI Automation tool profile pages (9)** — `src/pages/services/ai-automation/tools/`
automation-anywhere, boomi, make, mulesoft, n8n, power-automate, uipath, workato, zapier

**Vibe Coding pages (5)** — `src/pages/services/vibe-coding/`
beginners, game-development, risks-and-limitations, tools, vs-traditional-coding

## Approach: bespoke per page

No shared component library is imposed. Each page gets its own custom pass — the person/agent working a page picks whatever images and interactive elements fit that page's specific content. This trades build speed for visual variety: pages should not look copy-pasted from a common template.

Every page must still hit two targets:

1. **More images.** At least 2-3 real images per page (up from the current 0-1), sourced from Unsplash (matches existing site usage — free, fast, already the established pattern). Images should be contextually relevant to the page's topic, not generic filler.
2. **Medium interactivity.** At least one interactive element beyond the existing FAQ accordion, drawn freely from (not limited to):
   - Tabbed content switchers (e.g. splitting a long card grid into categories)
   - A comparison/toggle element (e.g. "Manual vs AI", "Free vs Paid tier")
   - Animated stat counters (count-up on scroll into view)
   - Expandable/click-to-reveal cards
   - Image galleries or before/after-style sliders where content supports it

Which element(s) a given page uses is a per-page judgment call based on what that page is actually about (a tool profile page's Free-vs-Paid toggle differs naturally from an industry page's tabbed application list).

## Execution order

Within this batch, work proceeds in three groups, highest-traffic first:

1. Industry pages (9) + marketing sub-pages (10) — 19 pages
2. AI Automation location/audience pages (7) + tool profile pages (9) — 16 pages
3. Vibe Coding pages (5)

Because pages are independent (no shared state, no shared components), execution runs as parallel bespoke passes rather than one linear pass through all 40.

## Non-goals

- No new shared Astro components
- No changes to Arabic pages
- No changes to pages outside the 40 listed above
- No changes to page copy/content strategy beyond what's needed to support added images/interactivity (e.g., don't rewrite SEO copy)

## Success criteria

- Every one of the 40 pages has ≥2-3 relevant images and ≥1 interactive element beyond the FAQ accordion
- Pages read as visually distinct from each other, not templated
- No regression to existing functionality (forms, FAQ accordion, ld+json, Supabase FAQ fetch, modal triggers)
- Site still builds and existing pages render correctly
