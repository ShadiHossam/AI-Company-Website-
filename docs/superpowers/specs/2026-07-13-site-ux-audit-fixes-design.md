# Site UX/UI Audit Fixes — Design

Date: 2026-07-13
Source: Fable-model UX/UI audit of the Aegis AI Astro site (EN + AR), covering filler imagery and missing interactivity across ~30 pages.

## Problem

Two independent problems, confirmed page-by-page across the site:

1. **Imagery**: most images are generic stock photos with no informational value (decorative "dividers," repeated hero banners). Several pages (About, Careers, Contact, and their Arabic mirrors) caption stock photos as if they show the real office/team ("our Dubai office," "Aegis AI team members").
2. **Interactivity**: the site has zero sliders, carousels, or calculators. What interactivity exists (homepage picker, per-service tabs, contact wizard) is real but shallow (one click deep) or duplicated by hand across pages instead of shared.

**Correction after checking the live database (2026-07-13):** the original audit flagged `results.astro`/`industries/logistics.astro` case-study captions as claiming to show real dashboard screenshots over mismatched stock photos. Checking the live Supabase `case_studies` table shows `media_sections` is empty for all published rows (no Logistics case study exists in the DB at all), and `testimonials` is also empty — both pages are currently rendering from hardcoded fallback arrays in the `.astro` files, and that fallback data never reaches production while the DB returns rows. This is dead code, not a live trust problem; fixing it is a hygiene item, not urgent.

Separately, the live `team_members` table **is** populated and contains fabricated names (Faris Al-Hashemi, Dr. Elena Rostova, Tareq Al-Mansoori) with stock face photos, matching the code's fallback exactly. Raised with the user directly; decision: leave `team_members` untouched, handled separately outside this work.

User decision on imagery: no real assets will be supplied. Replace/fix using better-matched stock imagery sourced the same way the codebase already does (Unsplash-style URLs), and correct any caption that overclaims. No simulated/animated demo UI — that's out of scope for this pass.

## Scope decomposition

Four phases, each independently shippable:

### Phase 1 — Trust fix (imagery honesty)
Scoped to what's actually live, per the database check above. `team_members` is explicitly excluded (handled separately by the user).

- `about.astro`: delete the two "team working" stock photos (`team-photo-row`) and the office-corridor divider image — pure filler, no identity claims, safe to remove outright.
- `careers.astro`: delete the stock photo captioned "Aegis AI team members... Dubai office," and the "colleagues in a modern office" quote-band background image.
- `jobs/[slug].astro`: delete the same reused banner (identical image/caption to careers.astro).
- `contact.astro`: delete the stock photo captioned "Aegis AI Dubai office and team workspace."
- `ar/services.astro`: delete the orphan two-photo grid (no caption, no heading, no link — the clearest case of "added just to add an image").
- `ar/about.astro`: delete the mirrored office photo with the same "our team" claim.
- `results.astro` fallback array: low-priority hygiene fix (not urgent — this code doesn't render while the DB returns rows). Swap the Logistics case study's port-yard photo (miscaptioned as "the route-optimisation dashboard") for a verified real dashboard photo, and soften the WhatsApp case study's caption since its image is a messaging-app-icon grid, not a conversation screenshot.

No new components needed. Straightforward deletions and one verified image swap.

### Phase 2 — Shared services components (refactor, mostly no visual change)

**Correction after reading all 13 files directly (2026-07-14):** the original framing ("extract 4 identical duplicated patterns") was wrong on two counts. First, the FAQ toggle *JS* is not duplicated at all — `toggleFaq()` already lives once in `src/scripts/site.ts` and every page calls the same global function; only markup/CSS is repeated. Second, none of the other three patterns are actually identical across all 13 files — each has real per-file variance (missing CSS, different content shapes, or genuinely different JS behavior), so "behavior-preserving, no changes" isn't achievable as stated. Extracting still pays off, but each component involves a real small decision, documented below instead of silently picked.

- **`FaqAccordion.astro`** — markup/CSS only (JS already shared). 10 of 12 sub-pages + the hub use a working "+" icon with correct CSS; `ai-strategy.astro` and `ai-training.astro` use an inline SVG icon with **no matching CSS rule at all** (a pre-existing, silent bug — the open/close rotate animation these SVGs imply just doesn't fire). Decision: standardize all 13 on the working "+" icon variant; this incidentally fixes the 2 broken pages rather than propagating their bug into the shared component.
- **`ProcessSteps.astro`** — only 10 of 13 files have this pattern in identical form (4-step static grid, byte-identical CSS). `ai-strategy.astro` uses a tabbed roadmap instead (conceptually similar slot, different implementation — migrates to the new `Tabs.astro`, not this component). `ai-training.astro` and the hub have no such section at all. Scope: migrate the 10, leave the other 3 as-is.
- **`StatStrip.astro`** — not one pattern but three real implementations plus 2 pages with none: named-class version (`ai-automation`, `ai-integration`, `vibe-coding`), inline-only version with the same visual result (`ai-agents`, `ai-model-finetuning`, `claude-agent-builds`, `custom-gpt-development`, `prompt-engineering`), and a `.stat-number`-class-with-no-CSS version that also varies in count — 1 stat (`ai-strategy`) vs. 3 (`ai-training`, using a `<div>` instead of `<p>`). Decision: one component taking an array of `{ value, caption }` (length 1-3), grid columns computed from array length, so all three groups' actual visual output (which already looks the same to a site visitor — same colors/sizes) converges into one implementation. `services.astro` (hub) and `internal-ai-tools.astro` have no stat strip — not touched.
- **`Tabs.astro`** — two JS "families" already exist with real behavioral differences, not just naming: Family A (5 files: `ai-agents`, `ai-integration`, `ai-model-finetuning`, `ai-strategy`, `ai-training`) has no ARIA panel wiring (`role="tabpanel"`/`id`/`aria-controls` are all missing) and queries are wrapper-scoped. Family B (5 files: `claude-agent-builds`, `custom-ai-development`, `internal-ai-tools`, `prompt-engineering`, `vibe-coding`) has full ARIA wiring, but 4 of its 5 instances query `document.querySelectorAll` unscoped (a latent bug if two tab widgets ever land on one page — currently harmless since each page only has one, but not safe to copy forward as a shared component's default). Decision: the new component uses Family B's full ARIA wiring + `claude-agent-builds.astro`'s scoped-to-root query pattern (the one file that already avoids the unscoped-query issue) — the safest behavior already proven in the codebase, not a novel design. `services.astro`'s category-filter widget (`data-service-filter`/`data-cat`) is a 10th, distinct interactive pattern (filtering, not tab-panel-swapping) — out of scope for `Tabs.astro`, left as-is.

Migrate the files that actually have each pattern (see per-component scope above — not a uniform "all 12 + hub" for every component). This is what makes Phase 3's service-page work cheap instead of 12x.

### Phase 3 — New interactive features

**Correction after reading the actual target pages directly (2026-07-15), in a git worktree run in parallel with Phase 2:** two of the originally-planned items turned out to already exist, fully built. Removed from scope below rather than duplicated:
- **Blog reading-progress bar, table of contents, and related-posts** — all three already exist and work in `ArticleLayout.astro` (progress bar: lines ~102, ~517-526; auto-generated TOC from `<h2>`s with an `IntersectionObserver` active-section highlight: lines ~550-579; related-posts grid: lines ~220-237). Nothing to build here.
- **Industries pipeline diagram** — `hospitality.astro` and `real-estate.astro` already have an interactive, accessible 3-stage "journey" tabs component (keyboard nav, ARIA tablist, one photo + copy per stage) that already does what a "clickable pipeline diagram" would do. Only `retail.astro` still has the plain static 3-photo grid this item was meant to replace — scope narrows from 3 files to 1.

Remaining items, ranked by reuse value:
1. **ROI/time-savings calculator** (shared component: inputs like team size / hours-per-week on manual work / hourly cost → annual savings out). Placed on homepage, `services/ai-automation.astro`, `services/internal-ai-tools.astro`, `services/ai-agents.astro`, and one industries page as a pilot (`industries/logistics.astro`, since it already has fleet/fuel-shaped inputs).
2. **Testimonials carousel** on the homepage, replacing the static 3-card grid that currently drops rows 4–6 the DB already returns (confirmed: query fetches up to 6, fallback is 3 hardcoded, current markup is a plain `.bento-grid` with zero carousel/slider code anywhere on the page). Build with CSS scroll-snap + logical properties (not hardcoded `left`/`right`) so it works unmodified in Phase 4's RTL homepage port, rather than needing an LTR-only rebuild later.
3. **Homepage picker**: add a second step. Confirmed: currently a single click swaps in one of 5 hardcoded static `.picker-panel` cards with no further interaction — needs a real second step, not just a description tweak.
4. **Results page**: count-up stats (confirmed: `.result-pill`/`.result-val` are static text, zero animation JS on the page) — before/after metric slider deferred, no existing hook to build it against yet, revisit after count-up ships.
5. ~~Blog~~ — already built, removed from scope (see correction above).
6. **Careers**: department/location filter on the job list (confirmed: `department`/`location` already selected in the Supabase query, zero filter/search UI exists yet, functional or not).
7. **Contact**: office-hours widget. Confirmed: no hero image exists (already removed in Phase 1), and office-hours info is scattered as static text in 4+ places (location card, footer, WhatsApp card, LD-JSON) with no single widget — a live "we're open now" GST widget would consolidate these rather than compete with a hero image.
8. **Services hub**: a 3-question "which service fits" quiz replacing the static "still not sure" strip (confirmed still static: `.deciding-strip` with a CSS-gradient placeholder box, no quiz). **Blocked until Phase 2 fully merges** — this is the one Phase 3 item that touches `services.astro`, which Phase 2 is actively modifying.
9. **Industries**: `retail.astro` only (see correction above) — replace its static 3-photo grid with a pipeline-style treatment matching the pattern hospitality/real-estate already established, for consistency across all three pages rather than inventing a 4th pattern.

Each is an independent unit: own component, own data needs, no cross-dependencies except items reusing the Phase 2 components. Item 8 has a hard file-overlap dependency on Phase 2 (`services.astro`); everything else does not.

### Phase 4 — Arabic parity
- Port the homepage rebuild (stat band, picker, testimonials, blog preview) from `index.astro` to `ar/index.astro`, using existing `ar_*` DB columns.
- Remove the orphan two-photo grid in `ar/services.astro` (no caption/link — pure filler, simplest to just delete).
- Unify the two conflicting FAQ-accordion patterns (`<details>` vs `onclick="toggleFaq"`) on one pattern sitewide.
- Reuse the Phase 3 testimonials carousel with `dir="rtl"` (Swiper/Embla both support this natively — confirm whichever library Phase 3 picks handles RTL before committing to it).

## Approach notes

- No new dependency will be added without checking bundle-size impact first; if a carousel needs a library, prefer a small dependency-free implementation (CSS scroll-snap + JS) over pulling in Swiper/Embla, unless RTL support makes that impractical for Phase 4.
- Every phase after 1 touches live marketing pages — changes should be verified in a running dev server (screenshot or manual check of the affected page) before being considered done, not just type-checked.
- Phases are ordered by dependency and risk, but are independently committable; each phase can ship on its own.

## Out of scope for this pass

- Simulated/animated demo UI (chat/dashboard mockups) — explicitly declined in favor of better stock imagery.
- Admin dashboard pages — not customer-facing, not part of the original audit.
- New pricing/plans content — not raised in the audit.
