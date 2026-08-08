# AI Courses Hub (`/services/ai-courses/*`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 15-page top-of-funnel content hub at `/services/ai-courses/` that captures individual-learner "ai course(s)" search intent (a documented different buyer than "ai training" — see `.claude/skills/keyword-triage/SKILL.md`), organized by city, skill, role, and starting point, with every page converting via CTA into the existing corporate offer at `/services/ai-training`. Two of the fifteen pages (`automation`, `ai-agents`) are new keyword targets not covered by any prior plan; the rest replace overlapping scope from an older, narrower plan (see "Relationship to prior plan" below).

**Architecture:** `astro-site/src/pages/services/ai-courses.astro` (flat hub file) + `astro-site/src/pages/services/ai-courses/*.astro` (14 sibling files in a same-named folder). This exact "flat hub file + same-named sibling folder" pattern already exists in the codebase for `services.astro` + `services/*.astro` — confirmed no Astro route collision, since `/services/ai-courses` and `/services/ai-courses/dubai` resolve to different final paths.

**Tech stack:** Astro `.astro` files, existing `BaseLayout` (`astro-site/src/layouts/BaseLayout.astro`), existing `FaqAccordion` (`astro-site/src/components/FaqAccordion.astro`), existing CSS system (`astro-site/src/styles/global.css` — no Tailwind, use existing classes: `.card`, `.btn-primary`, `.badge-cyan`, `.cta-band`, `.bento-grid`, `.faq-item`, CSS vars `--navy`/`--cyan`/etc.). Verification: `cd astro-site && npm run check && npm run build`. No unit tests apply — static marketing/content pages.

**Reference context:** `.claude/skills/keyword-triage/SKILL.md` (buyer-intent rules — this plan deliberately overrides its "ai course ≠ ai training buyer" caution by design, see Confirmed Decisions), root `CLAUDE.md` (banned AI-sounding words/phrases, no em dashes), `seo-keyword-structure.html` / `uae-ai-content-plan.html` (repo root — existing keyword scoring and 70-article blog plan, don't duplicate topics already claimed there).

## Relationship to prior plan (read before starting)

`docs/superpowers/plans/2026-08-01-ai-training-hub-pages.md` is an older, still-present plan for flat `/services/ai-training-*` pages (courses sub-hub, Dubai/Abu Dhabi location pages, HR/Managers/Finance/Marketing/Sales role pages, plus Procurement/Supply Chain/Manufacturing/Internal Audit/QA/Teachers). One page from it (`astro-site/src/pages/services/ai-training-courses.astro`) is already committed on a separate git worktree/branch (`.claude/worktrees/ai-training-hub-pages/`, branch `worktree-ai-training-hub-pages`), not merged to master.

**This plan supersedes that older plan's overlapping scope**: courses hub, Dubai, Abu Dhabi, HR, Managers, Finance, Marketing, Sales. Do not build both — this plan's `/services/ai-courses/*` pages replace those tasks. The older plan's non-overlapping tasks (Procurement, Supply Chain, Manufacturing, Internal Audit, QA, Teachers) are untouched and out of scope here; they remain valid as a separate, later initiative if the user wants them. Do not delete or merge the old worktree branch as part of this plan — that's a separate decision for the user to make explicitly.

## Confirmed decisions (do not re-litigate)

- URL pattern: `/services/ai-courses` hub + `/services/ai-courses/<slug>` subpages.
- English only — no Arabic mirrors this pass.
- Every page: **1500+ words** of genuinely distinct, non-fluff visible content (well above the site's current 870–1400 word norm and the keyword-triage skill's 400–600 floor — this needs real depth, not padding).
- Every page's primary conversion CTA points to `/services/ai-training` (except `free-ai-courses-uae`, which gets a soft CTA — see its task).
- `ai-agents.astro`'s careers subsection ("ai agent jobs", "ai agent job salary", "ai agent interview questions", etc.) is **static educational content** — salary ranges, interview-question guide, career-path overview — not wired to the live Supabase job board (`/careers`, `/jobs/[slug]`), which only holds Lenoo's own real openings. A soft, honestly-framed link to `/careers` is fine ("interested in working with us specifically? see our own openings"); this page must not read as a job board itself.
- Each role/skill/city page must carry genuinely distinct content — no templated swap of another page's copy with nouns changed. Where a page's audience is an individual learner rather than a company (which is the entire point of this hub, per Confirmed Decisions above), write to that individual, not to "your team."

## Course/service differentiation (must be explicit in-page, not just in this plan)

Three pairs of pages cover adjacent-sounding topics for different audiences. Each course page below must contain a short explicit "learn it yourself vs. have us build/deliver it" comparison box that cross-links to its live counterpart:

| Course page (this plan) | Live counterpart | Distinction to state on-page |
|---|---|---|
| `ai-courses/ai-agents.astro` | `services/ai-agents.astro` | Course teaches an individual to build/use agents; the service page is Lenoo building agents for a company |
| `ai-courses/automation.astro` | `services/ai-automation.astro` | Course teaches automation concepts; the service page is Lenoo building automations for a company |
| `ai-courses/real-estate.astro` | `industries/real-estate.astro` | Course teaches an individual real estate professional; the industry page is Lenoo building AI systems for a real estate agency |
| `ai-courses/agentic-ai.astro` | `ai-courses/ai-agents.astro` | Agentic AI = broader technical/conceptual skill page (agent frameworks, orchestration); AI Agents = keyword-specific course + careers page framed around the job title "AI agent" — do not let these two pages converge into the same content |

---

## Repeatable page skeleton (word budget ≈ 1650–1750 words; use for every subpage except `ai-agents.astro`)

Every page: import `BaseLayout`, `FaqAccordion`; hero with breadcrumb (`Home / Services / AI Courses / [Page]`); body sections; FAQ via `FaqAccordion`; final `.cta-band` CTA (`onclick="openModal(this)" data-source="courses_<page>"`); `Course` + `FAQPage` + `BreadcrumbList` JSON-LD array passed to `BaseLayout`'s `ldJson` prop.

| Section | Word budget | Content |
|---|---|---|
| Hero / intro | 150–200 | H1, subhead, opening paragraph: who this is for, why it matters now, UAE relevance |
| Who this is for / why it matters | 250–300 | Concrete pain points or motivations for this specific audience — not generic AI hype |
| Curriculum / what you'll learn | 400–500 | 5–6 modules, each a real 60–90 word paragraph (not a bare bullet list) |
| Format & path | 150–200 | Self-study reality check + honest bridge to "if your company wants this delivered properly, private training is the real path" |
| Local/comparison context | 200–250 | UAE-specific angle, or free-vs-paid landscape, or differentiation box (see table above) where applicable |
| FAQ | 250–350 | 5–6 Q&A, each answer a full 40–70 word paragraph, via `FaqAccordion` |
| Final CTA | 80–120 | `.cta-band`: eyebrow → H2 → body → `.cta-trust-badges` → button |

```astro
---
export const prerender = false;
import BaseLayout from "../../../layouts/BaseLayout.astro";
import FaqAccordion from "../../../components/FaqAccordion.astro";

const faqItems = [ { question: "...", answer: "..." } ];
const faqLdJson = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqItems.map((f) => ({
    '@type': 'Question', name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
const courseLdJson = {
  '@context': 'https://schema.org', '@type': 'Course',
  name: "<page course name>",
  description: "<1-2 sentence course description>",
  provider: { '@type': 'Organization', name: 'Lenoo AI', sameAs: 'https://lenooai.com' },
  url: 'https://lenooai.com/services/ai-courses/<slug>',
};
const breadcrumbLdJson = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lenooai.com/' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://lenooai.com/services' },
    { '@type': 'ListItem', position: 3, name: 'AI Courses', item: 'https://lenooai.com/services/ai-courses' },
    { '@type': 'ListItem', position: 4, name: '<Page>', item: 'https://lenooai.com/services/ai-courses/<slug>' },
  ],
};
---
<BaseLayout
  title="<exact title>"
  description="<exact meta description>"
  canonicalPath="/services/ai-courses/<slug>"
  ldJson={[courseLdJson, faqLdJson, breadcrumbLdJson]}
>
  <!-- hero, body sections per table above, FAQ, CTA -->
</BaseLayout>
```

Note the relative import depth: files in `services/ai-courses/*.astro` are one level deeper than `services/*.astro`, so `../../../layouts/` and `../../../components/` (not `../../`).

---

## File structure

| File | URL | Responsibility |
|---|---|---|
| `astro-site/src/pages/services/ai-courses.astro` | `/services/ai-courses` | Hub — links to every page below |
| `astro-site/src/pages/services/ai-courses/dubai.astro` | `/services/ai-courses/dubai` | City page |
| `astro-site/src/pages/services/ai-courses/abu-dhabi.astro` | `/services/ai-courses/abu-dhabi` | City page |
| `astro-site/src/pages/services/ai-courses/generative-ai.astro` | `/services/ai-courses/generative-ai` | Skill page |
| `astro-site/src/pages/services/ai-courses/agentic-ai.astro` | `/services/ai-courses/agentic-ai` | Skill page |
| `astro-site/src/pages/services/ai-courses/prompt-engineering.astro` | `/services/ai-courses/prompt-engineering` | Skill page |
| `astro-site/src/pages/services/ai-courses/managers.astro` | `/services/ai-courses/managers` | Role page |
| `astro-site/src/pages/services/ai-courses/hr.astro` | `/services/ai-courses/hr` | Role page |
| `astro-site/src/pages/services/ai-courses/finance.astro` | `/services/ai-courses/finance` | Role page |
| `astro-site/src/pages/services/ai-courses/marketing.astro` | `/services/ai-courses/marketing` | Role page |
| `astro-site/src/pages/services/ai-courses/sales.astro` | `/services/ai-courses/sales` | Role page |
| `astro-site/src/pages/services/ai-courses/real-estate.astro` | `/services/ai-courses/real-estate` | Role/vertical page |
| `astro-site/src/pages/services/ai-courses/beginners.astro` | `/services/ai-courses/beginners` | Entry-point page |
| `astro-site/src/pages/services/ai-courses/free-ai-courses-uae.astro` | `/services/ai-courses/free-ai-courses-uae` | Low-intent page |
| `astro-site/src/pages/services/ai-courses/automation.astro` | `/services/ai-courses/automation` | **New** skill page |
| `astro-site/src/pages/services/ai-courses/ai-agents.astro` | `/services/ai-courses/ai-agents` | **New** skill + careers page (longer) |
| `astro-site/src/pages/page-sitemap.xml.ts` | — | Modify: register all 15 URLs |
| `astro-site/src/components/Navbar.astro` | — | Modify: add "AI Courses" entry |
| `astro-site/src/components/Footer.astro` | — | Modify: add "AI Courses" entry to Services column |

---

## Task 1: Dubai city page

**Create:** `astro-site/src/pages/services/ai-courses/dubai.astro`

- **H1:** "AI Courses in Dubai"
- **Keywords:** ai courses dubai, ai course dubai, best ai course in dubai
- **Angle:** private-sector/free-zone/startup professional audience (DIFC, Dubai Internet City-type context) — distinct from Abu Dhabi's government framing in Task 2
- **Sections beyond skeleton:** "choose your path" mini-grid linking to generative-ai, agentic-ai, finance, marketing, sales, real-estate, managers; brief honest note on Dubai's AI skills landscape (informational, not competitor-promotional)
- **FAQ topics:** is there a free AI course in Dubai; typical cost; can a whole team train together in Dubai; which AI skill is most in demand right now
- **Internal links:** generative-ai, agentic-ai, finance, marketing, sales, real-estate, managers, `/services/ai-training`, `/industries/real-estate`
- **CTA:** `data-source="courses_dubai"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/dubai.astro && git commit -m "feat: add AI courses Dubai page"`

---

## Task 2: Abu Dhabi city page

**Create:** `astro-site/src/pages/services/ai-courses/abu-dhabi.astro`

- **H1:** "AI Courses in Abu Dhabi"
- **Keywords:** ai courses abu dhabi, ai course abu dhabi
- **Angle:** government/semi-government/ADGM/public-sector workforce audience — must read as genuinely different from Dubai's copy, not a city-name swap (same duplicate-content risk called out in the prior plan and in `keyword-triage/SKILL.md`)
- **Sections beyond skeleton:** "choose your path" grid linking to generative-ai, agentic-ai, hr, finance, beginners; brief note on public-sector AI upskilling context
- **FAQ topics:** government-sponsored AI training in Abu Dhabi; best course for public sector employees; typical cost; team training options
- **Internal links:** generative-ai, agentic-ai, hr, finance, beginners, `/services/ai-training`
- **CTA:** `data-source="courses_abu_dhabi"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/abu-dhabi.astro && git commit -m "feat: add AI courses Abu Dhabi page"`

---

## Task 3: Generative AI skill page

**Create:** `astro-site/src/pages/services/ai-courses/generative-ai.astro`

- **H1:** "Generative AI Course: What to Learn and Where to Start"
- **Keywords:** generative ai course, gen ai course
- **Angle:** foundational skill page — ChatGPT/Claude-style tools, prompting basics, core use cases by function
- **Sections beyond skeleton:** "is this you" self-check pointing beginners to `beginners.astro`; progression path forward to agentic-ai and prompt-engineering
- **FAQ topics:** difference between generative and agentic AI; do I need to code; best free course; how long it takes
- **Internal links:** agentic-ai, prompt-engineering, dubai, abu-dhabi
- **CTA:** `data-source="courses_generative_ai"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/generative-ai.astro && git commit -m "feat: add generative AI course page"`

---

## Task 4: Agentic AI skill page

**Create:** `astro-site/src/pages/services/ai-courses/agentic-ai.astro`

- **H1:** "Agentic AI Course: Building and Working With AI Agents"
- **Keywords:** agentic ai course
- **Angle:** more advanced than generative-ai — agent frameworks, orchestration, tool use, no-code agent builders. **Must stay conceptual/technical**, not converge with `ai-agents.astro`'s job-title/careers framing — see differentiation table above
- **Sections beyond skeleton:** prerequisite note recommending generative-ai first; curriculum covering agent frameworks, orchestration basics, no-code builders; cross-link box to `/services/ai-agents` ("want this built for your company instead?")
- **FAQ topics:** is agentic AI the same as AI agents (answer explicitly: related but this page is the skill/concept, see our AI Agents page for the career angle); programming experience needed; tools covered; connection to Lenoo's agent development service
- **Internal links:** generative-ai, prompt-engineering, dubai, `/services/ai-agents`
- **CTA:** `data-source="courses_agentic_ai"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/agentic-ai.astro && git commit -m "feat: add agentic AI course page"`

---

## Task 5: Prompt engineering skill page

**Create:** `astro-site/src/pages/services/ai-courses/prompt-engineering.astro`

- **H1:** "Prompt Engineering Course: Learn to Write Effective AI Prompts"
- **Keywords:** prompt engineering course
- **Angle:** tactical, most beginner-accessible skill page
- **Sections beyond skeleton:** curriculum covering prompt structuring, role-based prompting, chain-of-thought, few-shot examples, iteration/debugging; practical use cases by function (writing, coding, analysis)
- **FAQ topics:** is prompt engineering still relevant in 2026; technical background needed; best free course; how this differs from the generative AI course
- **Internal links:** generative-ai, agentic-ai
- **CTA:** `data-source="courses_prompt_engineering"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/prompt-engineering.astro && git commit -m "feat: add prompt engineering course page"`

---

## Task 6: Managers role page

**Create:** `astro-site/src/pages/services/ai-courses/managers.astro`

- **H1:** "AI Course for Managers and Team Leaders"
- **Keywords:** ai course for managers
- **Angle:** individual manager/leader learning for themselves — write distinct copy from `services/ai-training.astro`'s existing Managers program bullets (that page addresses "deliver training to your team"; this page addresses "what should I personally learn")
- **Sections beyond skeleton:** curriculum covering evaluating AI tools/vendors, delegating to AI, measuring ROI, leading change management, avoiding common pitfalls
- **FAQ topics:** should managers learn AI themselves or just approve tools for staff; ROI of AI training for managers; private session option for a leadership team
- **Internal links:** finance, sales, marketing, hr, `/services/ai-training`
- **CTA:** `data-source="courses_managers"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/managers.astro && git commit -m "feat: add AI course for managers page"`

---

## Task 7: HR role page

**Create:** `astro-site/src/pages/services/ai-courses/hr.astro`

- **H1:** "AI Course for HR Professionals"
- **Keywords:** ai course for hr
- **Angle:** individual HR professional upskilling
- **Sections beyond skeleton:** curriculum covering CV screening support, job description drafting, interview question generation, policy drafting, bias/compliance awareness; explicit data-privacy trust note
- **FAQ topics:** is it safe to use AI with candidate data; UAE labor law compliance coverage; best free HR AI course
- **Internal links:** managers, beginners
- **CTA:** `data-source="courses_hr"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/hr.astro && git commit -m "feat: add AI course for HR page"`

---

## Task 8: Finance role page

**Create:** `astro-site/src/pages/services/ai-courses/finance.astro`

- **H1:** "AI Course for Finance Professionals"
- **Keywords:** ai course for finance
- **Angle:** individual finance professional/analyst/bookkeeper upskilling
- **Sections beyond skeleton:** curriculum covering reporting automation concepts, forecasting support, reconciliation assistance, VAT/compliance-adjacent drafting (explicit "informational only, not tax advice" disclaimer); explicit sensitive-data trust note
- **FAQ topics:** is this for accountants only or also analysts/bookkeepers; sensitive financial data safety; best free finance AI course
- **Internal links:** managers, sales, real-estate, `/services/ai-training`
- **CTA:** `data-source="courses_finance"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/finance.astro && git commit -m "feat: add AI course for finance page"`

---

## Task 9: Marketing role page

**Create:** `astro-site/src/pages/services/ai-courses/marketing.astro`

- **H1:** "AI Course for Marketing Teams"
- **Keywords:** ai course for marketing
- **Angle:** individual marketer upskilling
- **Sections beyond skeleton:** curriculum covering campaign copy generation, content repurposing, bilingual EN/AR content drafting, brief-to-draft workflows, analytics summarization
- **FAQ topics:** Arabic content generation coverage; best free marketing AI course; combining with sales training
- **Internal links:** sales, managers, beginners
- **CTA:** `data-source="courses_marketing"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/marketing.astro && git commit -m "feat: add AI course for marketing page"`

---

## Task 10: Sales role page

**Create:** `astro-site/src/pages/services/ai-courses/sales.astro`

- **H1:** "AI Course for Sales Teams"
- **Keywords:** ai course for sales
- **Angle:** individual sales professional upskilling
- **Sections beyond skeleton:** curriculum covering prospect research, follow-up drafting in your own voice, objection-handling prep, proposal drafting, CRM note summarization, WhatsApp-based sales workflows common in the UAE market
- **FAQ topics:** WhatsApp sales conversation support; best free sales AI course; how this differs from a lead-qualification AI agent
- **Internal links:** marketing, managers, finance
- **CTA:** `data-source="courses_sales"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/sales.astro && git commit -m "feat: add AI course for sales page"`

---

## Task 11: Real estate role/vertical page

**Create:** `astro-site/src/pages/services/ai-courses/real-estate.astro`

- **H1:** "AI Course for Real Estate Professionals"
- **Keywords:** ai course for real estate
- **Angle:** individual agent/broker upskilling — **must include the differentiation box** contrasting this with `/industries/real-estate` (see differentiation table above)
- **Sections beyond skeleton:** curriculum covering listing description generation, lead-response drafting, market report summarization, bilingual EN/AR client communication drafting; explicit "learn it yourself vs. have us build it for your agency" box linking to `/industries/real-estate`
- **FAQ topics:** is this for agents or agency owners; learn it yourself vs. have Lenoo build a system; best free real estate AI course
- **Internal links:** finance, managers, `/industries/real-estate`
- **CTA:** `data-source="courses_real_estate"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/real-estate.astro && git commit -m "feat: add AI course for real estate page"`

---

## Task 12: Beginners entry-point page

**Create:** `astro-site/src/pages/services/ai-courses/beginners.astro`

- **H1:** "AI Courses for Beginners: Where to Start"
- **Keywords:** ai course for beginners, beginner ai course
- **Angle:** true entry point, decision-tree style, no prior knowledge assumed
- **Sections beyond skeleton:** self-assessment ("is this you"); absolute-basics curriculum (what generative AI actually is, first tools to try, safe/responsible use basics); decision path onward by role or skill; pointer to `free-ai-courses-uae.astro` for free options
- **FAQ topics:** need to code; first thing to learn; free beginner course availability; how long until useful at work
- **Internal links:** free-ai-courses-uae, generative-ai
- **CTA:** `data-source="courses_beginners"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/beginners.astro && git commit -m "feat: add AI courses for beginners page"`

---

## Task 13: Free AI courses UAE page (low-intent, soft CTA)

**Create:** `astro-site/src/pages/services/ai-courses/free-ai-courses-uae.astro`

- **H1:** "Free AI Courses in the UAE: What's Actually Worth Your Time"
- **Keywords:** free ai courses uae, free ai course uae
- **Angle:** honest, non-salesy roundup — manage expectations about what "free" actually gets you, categorize real free-resource types, be upfront about self-study limitations
- **Sections beyond skeleton:** what "free AI course" actually means; categories of free resources (major platform free tiers, free intro modules, any real institutional programs); honest limitations of self-study; when it's worth paying for real training
- **FAQ topics:** are free AI courses actually worth it; what's the catch; when to pay for training instead
- **Internal links:** beginners, dubai, abu-dhabi
- **CTA:** soft only — `data-source="courses_free_soft"`, lower-key styling/copy than other pages' CTAs (this page must not hard-sell, per Confirmed Decisions)

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/free-ai-courses-uae.astro && git commit -m "feat: add free AI courses UAE page"`

---

## Task 14: Automation skill page (new)

**Create:** `astro-site/src/pages/services/ai-courses/automation.astro`

- **H1:** "AI Automation Course: Learn to Build Automated Workflows"
- **Keywords:** ai automation course
- **Angle:** teaches automation concepts to an individual — **must include differentiation box** vs. `/services/ai-automation` (see differentiation table above)
- **Sections beyond skeleton:** what AI automation actually is (workflow automation, not just chatbots); curriculum covering identifying automatable tasks, the no-code automation tool landscape, connecting AI to existing systems, testing/maintaining automations; explicit "learn it yourself vs. have us build it" box linking to `/services/ai-automation`
- **FAQ topics:** need to code; tools covered; learn it yourself or hire someone; best free AI automation course
- **Internal links:** hub, ai-agents (related topic), `/services/ai-automation`
- **CTA:** `data-source="courses_automation"`

- [ ] Write the page per spec above (1500+ words)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/automation.astro && git commit -m "feat: add AI automation course page"`

---

## Task 15: AI Agents course + careers page (new, longer page ≈ 2800–3000 words)

**Create:** `astro-site/src/pages/services/ai-courses/ai-agents.astro`

This page has two distinct parts on one URL. Use the standard skeleton for Part 1, then extend with the careers sections below for Part 2 — do not thin out Part 1 to compensate; both parts need real depth.

**Part 1 — Course (H1: "AI Agent Course: Learn to Build and Work With AI Agents")**
- **Keywords:** ai agent course, ai agent learning course, ai agent course free, ai agent udemy course, google ai agent 5 days, kaggle ai agent 5 days
- **Angle:** keyword-specific/job-title framing ("AI agent" as a role), distinct from `agentic-ai.astro`'s broader conceptual/technical framing — see differentiation table above
- **Sections:** what an AI agent course covers; curriculum modules (agent fundamentals, hands-on practice options); honest mention of external free pathways like Google's and Kaggle's 5-day AI agent programs as real existing resources (do not claim Lenoo runs them); self-study vs. corporate training path; differentiation box vs. `/services/ai-agents`
- **FAQ (3):** is there a free AI agent course; what's covered in Google's/Kaggle's 5-day programs; is this the same as an agentic AI course (answer explicitly, cross-link)

**Part 2 — Careers (H2 section: "AI Agent Careers: Jobs, Salaries, and How to Break In")**
- **Keywords:** ai agent jobs, ai agent job search, ai agent jobs remote, ai agent jobs in india, ai agent interview questions, ai agent job salary, ai agent job apply/near me/openings/for freshers
- **Must be static, informational content only** — not wired to `/careers` or the `jobs` Supabase table (per Confirmed Decisions)
- **Sections:** AI agent job market overview (UAE + global framing); typical salary ranges (honest, appropriately-hedged ranges — do not fabricate false precision); common interview questions with brief guidance (6–8 questions); how to break in / build a portfolio; remote work reality check
- **FAQ (3–4):** what an AI agent specialist does day to day; expected salary; what interviewers usually ask; remote availability
- **CTA:** separate CTA blocks — `data-source="courses_ai_agents_hero"` for the course section, `data-source="courses_ai_agents_careers_cta"` for the careers section. The careers CTA may include a soft, honestly-framed link to `/careers` ("interested in working with us specifically? see our own openings") but the primary conversion CTA on this page is still `/services/ai-training`.
- **Internal links:** hub, agentic-ai (related), `/services/ai-agents`, soft link to `/careers`

- [ ] Write the page per spec above (2800–3000 words across both parts)
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses/ai-agents.astro && git commit -m "feat: add AI agent course and careers page"`

---

## Task 16: Hub page

**Create:** `astro-site/src/pages/services/ai-courses.astro`

Build this last, once all 14 subpages exist, so every link target is real.

- **H1:** "AI Courses in the UAE: The Complete Guide by Role, Skill, and City"
- **Keywords:** ai courses, ai courses uae, ai course
- **Sections:** intro/overview positioning this as the entry point; "choose your path by role" grid (managers, hr, finance, marketing, sales, real-estate); "choose by skill" grid (generative-ai, agentic-ai, prompt-engineering, automation, ai-agents); "choose by city" grid (dubai, abu-dhabi); beginner/free path callout (beginners, free-ai-courses-uae); comparison section: self-study vs. private corporate training, bridging to `/services/ai-training`
- **FAQ topics:** difference between an AI course and AI training; are these free; can my company book private training instead; which course to start with; Dubai/Abu Dhabi availability
- **Internal links:** all 14 subpages, `/services/ai-training`
- **CTA:** `data-source="courses_hub_hero"` and `data-source="courses_hub_cta"`
- 1500+ words minimum (hub pages on this site typically run longer given the linking grids — budget 1800–2200)

- [ ] Write the page per spec above
- [ ] Verify: `cd astro-site && npm run check`
- [ ] Commit: `git add astro-site/src/pages/services/ai-courses.astro && git commit -m "feat: add AI courses hub page"`

---

## Task 17: Shared infrastructure — sitemap, nav, footer

**Modify:**
- `astro-site/src/pages/page-sitemap.xml.ts` — add all 15 new URLs to the hardcoded `PAGES` array (`url`, `lastmod`, `priority`, `changefreq`; no `arUrl` since this pass is English-only). New pages are NOT auto-included by any integration — this step is required or they won't appear in the sitemap.
- `astro-site/src/components/Navbar.astro` — add an "AI Courses" entry pointing to `/services/ai-courses` (place alongside the existing Services-related nav entries).
- `astro-site/src/components/Footer.astro` — add an "AI Courses" entry to the existing Services column, pointing to `/services/ai-courses`.

- [ ] Update `page-sitemap.xml.ts` with all 15 URLs
- [ ] Update `Navbar.astro`
- [ ] Update `Footer.astro`
- [ ] Verify: `cd astro-site && npm run check && npm run build`
- [ ] Spot-check: visit `/services/ai-courses` locally, click through every subpage link, confirm no 404s
- [ ] Commit: `git add astro-site/src/pages/page-sitemap.xml.ts astro-site/src/components/Navbar.astro astro-site/src/components/Footer.astro && git commit -m "feat: register AI courses hub in sitemap, nav, and footer"`

---

## Build order

1. Task 1 (Dubai) first as the reference implementation — get tone/format right before parallelizing.
2. Tasks 2–15 (remaining 13 subpages) — content-independent, safe to parallelize across multiple workers once Task 1's pattern is confirmed. Suggested grouping: cities (2), skills (3, 4, 5, 14, 15), roles (6, 7, 8, 9, 10, 11), entry points (12, 13).
3. Task 16 (hub) — after all subpages exist.
4. Task 17 (sitemap/nav/footer) — last, once every URL is final.

## Verification

- `cd astro-site && npm run check` after every page (type/template errors).
- `cd astro-site && npm run build` after Task 17 (full build, confirms no broken imports across all new files).
- Word count spot check: strip frontmatter/script/style and count visible text per page — every page ≥1500 words (`ai-agents.astro` ≥2800).
- Internal link audit: every href added across all 15 pages resolves to a file created in this plan or an existing live page (`/services/ai-training`, `/services/ai-agents`, `/services/ai-automation`, `/industries/real-estate`, `/careers`).
- Content-style compliance: no banned words/phrases from root `CLAUDE.md` (seamless, robust, cutting-edge, leverage, harness, unlock, empower, "in today's fast-paced world," etc.), no em dashes unless grammatically justified.

## Self-Review Checklist (run before starting execution)

- [ ] Every page has its own real H1, keyword list, section list, and FAQ topics — no "TBD" or "same as Task N."
- [ ] Dubai/Abu Dhabi (Tasks 1–2) read as genuinely different cities, not a name swap.
- [ ] Agentic AI (Task 4) and AI Agents (Task 15) stay clearly differentiated — conceptual/technical vs. job-title/careers framing.
- [ ] All three course/service differentiation boxes (ai-agents, automation, real-estate) are actually written into the page copy, not just noted in this plan.
- [ ] `ai-agents.astro`'s careers section is static content, never a live Supabase query against the `jobs` table.
- [ ] Every subpage links back to the hub, and the hub (Task 16) links forward to every subpage.
- [ ] Task 17 completed — no new page is reachable only by direct URL guess.
