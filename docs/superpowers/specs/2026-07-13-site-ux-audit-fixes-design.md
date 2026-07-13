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
