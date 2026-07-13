# Site UX/UI Audit Fixes — Design

Date: 2026-07-13
Source: Fable-model UX/UI audit of the Aegis AI Astro site (EN + AR), covering filler imagery and missing interactivity across ~30 pages.

## Problem

Two independent problems, confirmed page-by-page across the site:

1. **Imagery**: most images are generic stock photos with no informational value (decorative "dividers," repeated hero banners), and in two places (Results, Logistics) captions describe a real product screenshot ("the route-optimisation dashboard," "the demand forecasting dashboard") over an image that isn't one. Team/office photos on About and Careers are stock but captioned as if authentic ("our Dubai office," "Aegis AI team members").
2. **Interactivity**: the site has zero sliders, carousels, or calculators. What interactivity exists (homepage picker, per-service tabs, contact wizard) is real but shallow (one click deep) or duplicated by hand across pages instead of shared.

User decision on imagery: no real assets will be supplied. Replace/fix using better-matched stock imagery sourced the same way the codebase already does (Unsplash-style URLs), and correct any caption that overclaims. No simulated/animated demo UI — that's out of scope for this pass.

## Scope decomposition

Four phases, each independently shippable:

### Phase 1 — Trust fix (imagery honesty)
- `results.astro`: replace or re-caption case-study images so nothing claims to be a dashboard/screenshot it isn't.
- `industries/logistics.astro`: same fix for the "route-optimisation dashboard" caption.
- `about.astro`: replace the two "team working" photos and the office-corridor divider; if team headshots fall back to stock, replace fallback with initials (matches existing avatar-fallback pattern already used elsewhere on the site) rather than a stock face.
- `careers.astro`, `jobs/[slug].astro`: replace the stock photo captioned as "Aegis AI team members... Dubai office" (reused in both places) with a better-matched generic stock image and non-claiming caption, or remove the banner.
- `contact.astro`: replace stock office photo/caption to stop claiming it's "Aegis AI Dubai office."
- `ar/` equivalents of the above where the same images/captions are mirrored.

No new components needed. Straightforward find-and-replace of `src`/`alt` per file.

### Phase 2 — Shared services components (refactor, no visual change)
Extract from the 12 duplicated services pages into `src/components/`:
- `Tabs.astro` (replaces `data-agent-demo`, `data-roadmap-tabs`, `data-role-tabs`, `data-cab-tabs`, `data-iat-tab`, `data-ft-demo`, and toggle variants — same interaction, one implementation)
- `FaqAccordion.astro`
- `ProcessSteps.astro`
- `StatStrip.astro`

Migrate all 12 service pages + hub to use them. Behavior-preserving: no copy or layout changes, just de-duplication. This is what makes Phase 3's service-page work cheap instead of 12x.

### Phase 3 — New interactive features
Ranked by reuse value:
1. **ROI/time-savings calculator** (shared component: inputs like team size / hours-per-week on manual work / hourly cost → annual savings out). Placed on homepage, `services/ai-automation.astro`, `services/internal-ai-tools.astro`, `services/ai-agents.astro`, and one industries page as a pilot (`industries/logistics.astro`, since it already has fleet/fuel-shaped inputs).
2. **Testimonials carousel** on the homepage, replacing the static 3-card grid that currently drops rows 4–6 the DB already returns.
3. **Homepage picker**: add a second step so each of the 5 challenge buttons leads to a short follow-up instead of one static card.
4. **Results page**: count-up stats + a before/after metric slider per case study.
5. **Blog**: reading-progress bar, auto-generated table of contents on post pages, related-posts as a small carousel.
6. **Careers**: department/location filter on the job list (fields already exist in the data).
7. **Contact**: replace the stock hero image (already being fixed in Phase 1) with a live "we're open now" GST office-hours widget.
8. **Services hub**: a 3-question "which service fits" quiz replacing the static "still not sure" strip.
9. **Industries** (hospitality, real-estate, retail — logistics gets the calculator instead): a clickable pipeline diagram replacing the stock photo grids.

Each is an independent unit: own component, own data needs, no cross-dependencies except items reusing the Phase 2 components.

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
