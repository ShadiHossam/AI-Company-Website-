# Vibe Coding Hub — Design Spec

**Status:** Approved by user 2026-08-02. Next step: writing-plans skill produces the implementation plan.

## Goal

Turn `/services/vibe-coding` (existing B2B pillar page: "we build your product for you using AI-accelerated development") into a hub with 5 supporting pages that capture individual-learner, hobbyist, and comparison/debate search intent around "vibe coding" — a term whose search volume skews heavily toward people who are *not* the pillar page's buyer (business owners commissioning a build). Each subpage earns a bridge back to Lenoo's real offer rather than pretending the audience mismatch doesn't exist.

## Business context

Lenoo AI is a UAE AI automation + AI training + custom development agency (see `.claude/skills/keyword-triage/SKILL.md` for the general buyer-intent framework used across this codebase's content hubs — same underlying pattern as the `ai-training` vs `ai-courses` split: bare topic keywords attract a different buyer than the branded service page, and the fix is an honest CTA bridge, not pretending the audience is uniform). The existing pillar page `astro-site/src/pages/services/vibe-coding.astro` sells "we build your software for you, faster, using AI." The 5 new pages target keyword clusters that read as DIY/individual/hobbyist/debate intent:

- `tools` — free tools, apps, websites, best AI (individual chooses their own tool)
- `beginners` — what is it, 101, kids, dummies, how to learn (individual learns to do it themselves)
- `game-development` — 3D game, Unreal Engine, Roblox, mobile game (hobbyist building games)
- `risks-and-limitations` — security checklist, dangers, horror stories, is it bad (risk-aware — closest to a real buyer)
- `vs-traditional-coding` — Reddit debates, Karpathy origin, dead or not (comparison/debate — developer or decision-maker evaluating the approach)

## Confirmed decisions (do not re-litigate)

- **File structure:** nested folder, matching the current codebase convention used by `ai-automation/` and the `ai-courses` plan (not the older flat-hyphenated `ai-training-hub-pages` convention). New files:
  - `astro-site/src/pages/services/vibe-coding/tools.astro`
  - `astro-site/src/pages/services/vibe-coding/beginners.astro`
  - `astro-site/src/pages/services/vibe-coding/game-development.astro`
  - `astro-site/src/pages/services/vibe-coding/risks-and-limitations.astro`
  - `astro-site/src/pages/services/vibe-coding/vs-traditional-coding.astro`
- **English only** this pass. No Arabic mirrors (matches how `ai-training-hub-pages` and `ai-courses` were both scoped).
- **CTA strategy:** every page keeps the pillar's real CTA ("Discuss Your Project" → `/services/vibe-coding`), reframed per page to bridge from the page's DIY/hobbyist/debate angle to "if you want this built professionally." No page gets a different destination or a softer non-sales CTA — the bridge is in the copy, not the link target.
- **Word count:** 1500+ words of genuinely distinct visible content per page (above the site's normal 870-1400 word norm — these pages need real depth to avoid thin/duplicate-content risk, especially since the pillar page already has a "What Is Vibe Coding" section these must not just re-paraphrase).
- **CTAs per page:** exactly 3 — hero button, one contextual mid-body CTA placed at the bridge moment (see per-page spec), final CTA band button. Each gets a unique `data-source` value: `vibe_<slug>_hero`, `vibe_<slug>_mid`, `vibe_<slug>_final`.
- Every subpage links back to `/services/vibe-coding` (breadcrumb + at least one contextual body link) and the pillar page is edited to link forward to all 5.

## Architecture

Each new page follows `services/vibe-coding.astro`'s existing skeleton exactly:

```astro
---
export const prerender = false;
import BaseLayout from "../../../layouts/BaseLayout.astro";
import FaqAccordion from "../../../components/FaqAccordion.astro";
// StatStrip / ProcessSteps imported only where the page spec below uses them

const faqItems = [ /* page-specific, 3-4 items per spec below */ ];
const faqLdJson = { /* standard FAQPage schema, matches pillar's pattern */ };
---
<BaseLayout
  title="<exact title>"
  description="<exact meta description>"
  canonicalPath="/services/vibe-coding/<slug>"
  ogImage="/assets/og-services.jpg"
  ldJson={[faqLdJson]}
>
  <!-- hero w/ breadcrumb: Home / Services / Vibe Coding / <Page> -->
  <!-- body sections per spec -->
  <!-- FAQ section -->
  <!-- final CTA band, same structure as pillar's -->
</BaseLayout>
<script type="application/ld+json"><!-- Service + BreadcrumbList, url: https://lenooai.com/services/vibe-coding/<slug> --></script>
```

Note the relative import depth is one level deeper than the pillar page (`../../../` not `../../`) since these live in `services/vibe-coding/` not `services/`.

Reuse existing global CSS classes already used by the pillar page (`.card`, `.btn-primary`, `.btn-outline`, `.cta-band`, `.section`, `.bento-grid`, `value-card`, etc.) — no new component files needed. `StatStrip` and `ProcessSteps` are available to reuse per-page where they genuinely fit (see below), not mandatory on every page.

## Per-page specs

### 1. `tools.astro`

- **H1:** "The Best AI Tools for Vibe Coding"
- **Meta title:** "Best AI Coding Tools for Vibe Coding (2026) | Lenoo AI"
- **Keywords:** free ai coding tools, best ai coding tools, ai coding apps, ai coding websites, best ai for coding
- **Sections:** categorized roundup — (a) chat/agent-based tools (Claude Code, ChatGPT/Codex-style), (b) IDE-integrated tools (Cursor, GitHub Copilot, Windsurf), (c) app-builder/no-setup tools (Replit, Bolt, v0, Lovable). For each: what it's good for, free-tier limits, who it fits. Then a "how to choose" section (skill level, project type, budget).
- **Mid-body CTA bridge (after the tool roundup):** once you've outgrown a free tier or need something production-grade rather than a prototype, professional AI-accelerated development is the next step.
- **FAQ (3):** "Which AI coding tool is actually free?", "Can I build something real with just these tools?", "What's the catch with free tiers?"
- **CTA `data-source`:** `vibe_tools_hero`, `vibe_tools_mid`, `vibe_tools_final`

### 2. `beginners.astro`

- **H1:** "Vibe Coding for Beginners: What It Is and How to Start"
- **Meta title:** "Vibe Coding 101: A Beginner's Guide | Lenoo AI"
- **Keywords:** what is vibe coding, vibe coding 101, vibe coding for beginners, vibe coding for kids, vibe coding for dummies, how to learn vibe coding
- **Sections:** plain-language explainer distinct from the pillar's buyer-facing explainer (teach a total beginner, not sell a business buyer); "who this is for" (non-coders, students, kids, career-changers); step-by-step first-project walkthrough; common beginner mistakes; a short learning-path/resources list.
- **Mid-body CTA bridge:** once a DIY prototype needs to become a real, secure, maintainable product, that's a different job — one Lenoo does professionally.
- **FAQ (3):** "Can a complete beginner really build something with vibe coding?", "Is vibe coding safe for kids to learn?", "How long does it take to learn?"
- **CTA `data-source`:** `vibe_beginners_hero`, `vibe_beginners_mid`, `vibe_beginners_final`

### 3. `game-development.astro`

- **H1:** "Vibe Coding for Game Development"
- **Meta title:** "AI Game Development: Vibe Coding for Games | Lenoo AI"
- **Keywords:** vibe coding game development, ai game development, 3d game with ai, unreal engine ai, roblox ai scripting, mobile game ai
- **Sections:** how vibe coding applies specifically to games — Roblox Lua scripting assistance, Unreal Engine Blueprint/C++ assist, 2D/mobile prototyping; an honest limitations section (real-time rendering, physics, performance-critical code still need an experienced engineer, not just AI).
- **Mid-body CTA bridge:** for a real, shippable, monetizable game rather than a prototype, professional build support closes that gap.
- **FAQ (3):** "Can I make a full 3D game with AI alone?", "Does vibe coding work for Roblox or Unreal specifically?", "What are the real limits for game development?"
- **CTA `data-source`:** `vibe_gamedev_hero`, `vibe_gamedev_mid`, `vibe_gamedev_final`

### 4. `risks-and-limitations.astro`

- **H1:** "Vibe Coding: Risks, Limitations, and a Security Checklist"
- **Meta title:** "Vibe Coding Risks & Security Checklist | Lenoo AI"
- **Keywords:** vibe coding security risks, vibe coding dangers, is vibe coding bad, vibe coding horror stories, vibe coding checklist
- **Sections:** honest risk breakdown (injection vulnerabilities, exposed secrets/API keys, auth bypass patterns, technical debt from unreviewed output); general horror-story *patterns* (described honestly, not fabricated specific-company incidents); a practical security checklist; explicit "when vibe coding is not appropriate" section.
- **Mid-body/bridge (strongest natural fit of the 5 — this reader is closest to a real buyer):** tie directly to Lenoo's actual differentiator — every line shipped gets senior engineer review, automated testing, and QA, which is precisely the mitigation for the risks just described.
- **FAQ (3):** "Is vibe coding inherently insecure?", "How do you prevent these risks in a professional build?", "What should I check before shipping AI-generated code myself?"
- **CTA `data-source`:** `vibe_risks_hero`, `vibe_risks_mid`, `vibe_risks_final`

### 5. `vs-traditional-coding.astro`

- **H1:** "Vibe Coding vs. Traditional Coding"
- **Meta title:** "Vibe Coding vs Traditional Coding: Is It Dead or Real? | Lenoo AI"
- **Keywords:** vibe coding vs traditional coding, is vibe coding dead, karpathy vibe coding origin, vibe coding reddit debate
- **Sections:** brief factual origin note (Andrej Karpathy coined the term); honest summary of the debate (proponents' speed argument vs critics' quality/security concerns — represent both sides fairly, don't strawman either); a real side-by-side comparison table (speed, cost, code quality, maintainability, best use case for each); a direct "is vibe coding dying or overhyped" section that answers the debate rather than dodging it.
- **Mid-body CTA bridge:** professionally managed vibe coding (senior review + testing layered on top) gets the speed advantage without the downsides critics point to — that's the whole premise of Lenoo's service.
- **FAQ (3):** "Did Andrej Karpathy invent vibe coding?", "Is vibe coding just a hype cycle?", "Which approach actually wins for production software?"
- **CTA `data-source`:** `vibe_vstraditional_hero`, `vibe_vstraditional_mid`, `vibe_vstraditional_final`

## Pillar page edit (`services/vibe-coding.astro`)

Add an "Explore Vibe Coding" section (new, after the existing "Is Vibe Coding Right for You" section and before "The Timeline Difference," or after FAQ — final placement decided during implementation) with 5 cards, one per new subpage, each with a one-line hook and a link. This is the only planned change to the existing pillar page content; its own copy, FAQ, and CTAs are left as-is.

## Verification

`cd astro-site && npm run check && npm run build` after each page and again after the pillar-page edit. Confirm every new page's internal links resolve (breadcrumb, cross-links between the 5 subpages where relevant, e.g. tools ↔ beginners, game-development ↔ tools) and that the pillar page's 5 new card links all resolve to files created in this plan.

## Self-review

- No placeholders — every page has its own keyword list, section list, FAQ questions, and CTA bridge line written out (not "TBD" or "similar to page X").
- No page reuses the pillar's "What Is Vibe Coding" paragraph content; each teaches/argues something the pillar doesn't cover.
- CTA destination is identical across all 15 CTA instances (`/services/vibe-coding`) by design — only the surrounding bridge copy differs per page. `data-source` values are unique per instance for attribution.
- Scope: 5 new files + 1 edit to an existing file. Single implementation plan, no decomposition needed.
