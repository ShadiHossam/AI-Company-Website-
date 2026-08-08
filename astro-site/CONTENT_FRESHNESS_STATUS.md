# Content Freshness Status Tracker

Tracks the daily SEO/content-freshness pass (2 pages/day, automated via cron job `daily-content-freshness`). Each entry: page path, status, date, notes.

**Status values:** `pending` (not yet touched by this initiative) · `done` (freshness pass complete).

**Selection order:** work top to bottom within a priority tier. Skip `done` entries. English pages are priority (see targeting/brand-naming memory: UAE-focused, English-only brand voice); Arabic (`/ar/`) mirror pages are a lower-priority tier at the bottom — do not start those until Tier 1-3 are clear.

**Freshness pass = for each page:**
1. Check word count (>=1500 words for service/industry pages is the known bar, see commit `c697487`).
2. Tighten/expand copy for on-page SEO: headings, keyword coverage for the page's topic, meta description quality.
3. Apply `/Users/chadihossam/Documents/Claude Code Project/AI Company/CLAUDE.md` content rules: no em dashes unless grammatically required, no AI-sounding words/phrases (leverage, seamless, robust, cutting-edge, delve, etc.), no filler openers.
4. Mark the row `done` with today's date and a one-line note on what changed.

---

## Tier 1 — Core / high-traffic pages

| Page | Status | Date | Note |
|---|---|---|---|
| src/pages/index.astro | pending | | |
| src/pages/about.astro | pending | | |
| src/pages/services.astro | pending | | |
| src/pages/industries/marketing.astro | pending | | |
| src/pages/contact.astro | pending | | |
| src/pages/careers.astro | pending | | |

## Tier 2 — Industry pages

| Page | Status | Date | Note |
|---|---|---|---|
| src/pages/industries/consulting.astro | pending | | |
| src/pages/industries/education.astro | pending | | |
| src/pages/industries/finance-banking.astro | pending | | |
| src/pages/industries/healthcare.astro | pending | | |
| src/pages/industries/hospitality.astro | pending | | |
| src/pages/industries/hr-recruitment.astro | pending | | |
| src/pages/industries/insurance.astro | pending | | |
| src/pages/industries/legal.astro | pending | | |
| src/pages/industries/logistics.astro | pending | | |
| src/pages/industries/manufacturing.astro | pending | | |
| src/pages/industries/real-estate.astro | pending | | |
| src/pages/industries/retail.astro | pending | | |
| src/pages/industries/marketing/analytics-attribution.astro | pending | | |
| src/pages/industries/marketing/content-writing.astro | pending | | |
| src/pages/industries/marketing/email-marketing.astro | pending | | |
| src/pages/industries/marketing/image-generation.astro | pending | | |
| src/pages/industries/marketing/influencer-marketing.astro | pending | | |
| src/pages/industries/marketing/paid-ads.astro | pending | | |
| src/pages/industries/marketing/seo.astro | pending | | |
| src/pages/industries/marketing/social-media.astro | pending | | |
| src/pages/industries/marketing/video-generation.astro | pending | | |
| src/pages/industries/marketing/voice-generation.astro | pending | | |

## Tier 3 — Service pages

| Page | Status | Date | Note |
|---|---|---|---|
| src/pages/services/ai-agents.astro | pending | | |
| src/pages/services/ai-agents/abu-dhabi.astro | pending | | |
| src/pages/services/ai-agents/agencies.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/architecture.astro | pending | | |
| src/pages/services/ai-agents/customer-support.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/development.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/dubai.astro | pending | | |
| src/pages/services/ai-agents/for-real-estate.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/sales.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/templates.astro | pending | | |
| src/pages/services/ai-agents/tools.astro | pending | | |
| src/pages/services/ai-agents/tools/gumloop.astro | pending | | |
| src/pages/services/ai-agents/tools/lindy.astro | pending | | |
| src/pages/services/ai-agents/tools/n8n-ai-agent.astro | pending | | |
| src/pages/services/ai-agents/tools/pipedream.astro | pending | | |
| src/pages/services/ai-agents/tools/salesforce-agentforce.astro | pending | | |
| src/pages/services/ai-agents/use-cases.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/voice-agents.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-agents/vs-agentic-ai.astro | done | 2026-08-02 | word-count expansion (c697487) |
| src/pages/services/ai-automation.astro | pending | | |
| src/pages/services/ai-automation/abu-dhabi.astro | pending | | |
| src/pages/services/ai-automation/accounting.astro | pending | | |
| src/pages/services/ai-automation/agencies.astro | pending | | |
| src/pages/services/ai-automation/business.astro | pending | | |
| src/pages/services/ai-automation/dubai.astro | pending | | |
| src/pages/services/ai-automation/real-estate.astro | pending | | |
| src/pages/services/ai-automation/tools.astro | pending | | |
| src/pages/services/ai-automation/tools/automation-anywhere.astro | pending | | |
| src/pages/services/ai-automation/tools/boomi.astro | pending | | |
| src/pages/services/ai-automation/tools/make.astro | pending | | |
| src/pages/services/ai-automation/tools/mulesoft.astro | pending | | |
| src/pages/services/ai-automation/tools/n8n.astro | pending | | |
| src/pages/services/ai-automation/tools/power-automate.astro | pending | | |
| src/pages/services/ai-automation/tools/uipath.astro | pending | | |
| src/pages/services/ai-automation/tools/workato.astro | pending | | |
| src/pages/services/ai-automation/tools/zapier.astro | pending | | |
| src/pages/services/ai-integration.astro | pending | | |
| src/pages/services/ai-model-finetuning.astro | pending | | |
| src/pages/services/ai-strategy.astro | pending | | |
| src/pages/services/ai-training.astro | pending | | |
| src/pages/services/claude-agent-builds.astro | pending | | |
| src/pages/services/custom-ai-development.astro | pending | | |
| src/pages/services/custom-gpt-development.astro | pending | | |
| src/pages/services/internal-ai-tools.astro | pending | | |
| src/pages/services/prompt-engineering.astro | pending | | |
| src/pages/services/vibe-coding.astro | pending | | |
| src/pages/services/vibe-coding/beginners.astro | pending | | |
| src/pages/services/vibe-coding/game-development.astro | pending | | |
| src/pages/services/vibe-coding/risks-and-limitations.astro | pending | | |
| src/pages/services/vibe-coding/tools.astro | pending | | |
| src/pages/services/vibe-coding/vs-traditional-coding.astro | pending | | |

## Tier 4 — Legal / misc

| Page | Status | Date | Note |
|---|---|---|---|
| src/pages/privacy.astro | pending | | |
| src/pages/terms.astro | pending | | |

## Tier 5 — Arabic (`/ar/`) mirror pages (lower priority — do not start until Tiers 1-4 clear)

| Page | Status | Date | Note |
|---|---|---|---|
| src/pages/ar/about.astro | pending | | |
| src/pages/ar/careers.astro | pending | | |
| src/pages/ar/contact.astro | pending | | |
| src/pages/ar/index.astro | pending | | |
| src/pages/ar/privacy.astro | pending | | |
| src/pages/ar/terms.astro | pending | | |
| src/pages/ar/services.astro | pending | | |
| src/pages/ar/services/ai-agents.astro | pending | | |
| src/pages/ar/services/ai-automation.astro | pending | | |
| src/pages/ar/services/ai-automation/accounting.astro | pending | | |
| src/pages/ar/services/ai-automation/dubai.astro | pending | | |
| src/pages/ar/services/ai-integration.astro | pending | | |
| src/pages/ar/services/ai-model-finetuning.astro | pending | | |
| src/pages/ar/services/ai-strategy.astro | pending | | |
| src/pages/ar/services/ai-training.astro | pending | | |
| src/pages/ar/services/claude-agent-builds.astro | pending | | |
| src/pages/ar/services/custom-ai-development.astro | pending | | |
| src/pages/ar/services/custom-gpt-development.astro | pending | | |
| src/pages/ar/services/internal-ai-tools.astro | pending | | |
| src/pages/ar/services/prompt-engineering.astro | pending | | |
| src/pages/ar/services/vibe-coding.astro | pending | | |
| src/pages/ar/industries/hospitality.astro | pending | | |
| src/pages/ar/industries/logistics.astro | pending | | |
| src/pages/ar/industries/real-estate.astro | pending | | |
| src/pages/ar/industries/retail.astro | pending | | |

## Not tracked (excluded from this initiative)

- `blog.astro` / `blog/[slug].astro` / `jobs/[slug].astro` / `ar/blog*` / `ar/jobs/[slug].astro` — dynamic/CMS-driven content, not static pages to hand-edit.
- `404.astro`, `maintenance.astro` — utility pages, no SEO content need.
