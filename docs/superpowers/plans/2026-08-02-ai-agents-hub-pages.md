# AI Agents Hub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/services/ai-agents` into a hub linking to 12 dedicated subpages plus a `tools` sub-hub (5 further tool-specific pages) — 18 new pages total — targeting the AI-agent keyword cluster documented in `docs/superpowers/specs/2026-08-02-ai-agents-hub-pages-design.md`.

**Architecture:** New folder `astro-site/src/pages/services/ai-agents/` (sibling to the existing `services/ai-agents.astro` file, same coexistence pattern already proven by `ai-automation.astro` + `ai-automation/`), plus a nested `tools/` folder inside it for 5 tool pages. Every page clones the live, shipped structure of `astro-site/src/pages/services/ai-automation/dubai.astro` and `astro-site/src/pages/services/ai-automation/tools/n8n.astro` — same components, same CTA cadence, same JSON-LD shape. The hub page (`ai-agents.astro`) is edited last, once every page it needs to link to exists.

**Tech Stack:** Astro (`.astro` files), existing components in `astro-site/src/components/` (`BaseLayout`, `FaqAccordion`, `ProcessSteps`, `StatStrip`), existing global CSS classes (no new CSS system — reuse `.value-card`, `.bento-grid`, `.cta-band`, `.learn-link`, `.hero-section`, etc., exactly as `ai-automation/*` already does). Verification: `cd astro-site && npm run check` (type/template errors) after every page, `npm run build` after the final infra task, then `npm run dev` to visually confirm on localhost. No unit tests apply — these are static marketing/content pages; verification is "does it type-check, build, and render," not TDD red/green (same convention already used in `docs/superpowers/plans/2026-08-01-ai-training-hub-pages.md` and `2026-08-01-ai-courses-hub-services.md`).

**Reference context:** `docs/superpowers/specs/2026-08-02-ai-agents-hub-pages-design.md` (full per-page content specs — read this first, this plan doesn't repeat every detail from it), `astro-site/src/pages/services/ai-automation/dubai.astro` and `astro-site/src/pages/services/ai-automation/tools/n8n.astro` (the literal templates every task below clones structurally).

**Confirmed decisions (do not re-litigate — see design spec for full rationale):**
- Nested folder URLs for all 18 pages: `/services/ai-agents/<slug>`, `/services/ai-agents/tools/<slug>`.
- English only, no Arabic mirrors this pass.
- Every page: minimum 1500 words of visible body content, exactly 3 CTAs (hero, mid-page, final), `data-source="ai_agents_<page>_hero|mid|cta"`.
- Tool pages (Task 1–5): neutral, factual "what is this tool" content; CTAs frame the offer as "we'll build your idea/app using this tool for you," not a replace-the-tool pitch.
- Breadcrumb pattern in every hero: `Home / AI Agents / [Page]` (matches `ai-automation/dubai.astro:91`, which drops the "Services" crumb level once inside a subpage).

---

## File Structure

| File | Responsibility |
|---|---|
| `astro-site/src/pages/services/ai-agents/tools/n8n-ai-agent.astro` | Tool page: n8n agent workflows (closes a dead link that already exists live) |
| `astro-site/src/pages/services/ai-agents/tools/gumloop.astro` | Tool page: Gumloop |
| `astro-site/src/pages/services/ai-agents/tools/lindy.astro` | Tool page: Lindy |
| `astro-site/src/pages/services/ai-agents/tools/pipedream.astro` | Tool page: Pipedream |
| `astro-site/src/pages/services/ai-agents/tools/salesforce-agentforce.astro` | Tool page: Salesforce Agentforce |
| `astro-site/src/pages/services/ai-agents/tools.astro` | Sub-hub linking the 5 tool pages |
| `astro-site/src/pages/services/ai-agents/dubai.astro` | Location page |
| `astro-site/src/pages/services/ai-agents/abu-dhabi.astro` | Location page |
| `astro-site/src/pages/services/ai-agents/agencies.astro` | "Choosing an agency" page |
| `astro-site/src/pages/services/ai-agents/development.astro` | Technical process deep-dive |
| `astro-site/src/pages/services/ai-agents/for-real-estate.astro` | Vertical use-case page |
| `astro-site/src/pages/services/ai-agents/voice-agents.astro` | Use-case page |
| `astro-site/src/pages/services/ai-agents/customer-support.astro` | Use-case page |
| `astro-site/src/pages/services/ai-agents/sales.astro` | Use-case page |
| `astro-site/src/pages/services/ai-agents/use-cases.astro` | Informational catalog page |
| `astro-site/src/pages/services/ai-agents/templates.astro` | Informational page |
| `astro-site/src/pages/services/ai-agents/vs-agentic-ai.astro` | Definitional/comparison page |
| `astro-site/src/pages/services/ai-agents/architecture.astro` | Technical pillar page |
| `astro-site/src/pages/services/ai-agents.astro` | Modify: add cross-link section + mid-page CTA |
| `astro-site/src/pages/page-sitemap.xml.ts` | Modify: register 18 new URLs |
| `astro-site/src/pages/services/ai-automation/tools/n8n.astro` | Modify: fix dead link at line 116 |

---

## Repeatable page skeleton (used by every task below)

Every page imports `BaseLayout` and `FaqAccordion` (plus `ProcessSteps`/`StatStrip` where the task calls for them) at relative depth `../../../` for `ai-agents/*.astro` or `../../../../` for `ai-agents/tools/*.astro`. Every page defines `fallbackFaqs`, a Supabase FAQ override block (copy verbatim from the template below, only the `.eq('section', ...)` value changes), an `ldJson` array of `Service` + `BreadcrumbList` + `FAQPage`, and a `<BaseLayout>` with hero (CTA 1), body sections, mid-page CTA (CTA 2), FAQ, final `.cta-band` CTA (CTA 3).

```astro
---
export const prerender = false;
import BaseLayout from "../../../layouts/BaseLayout.astro";
import { getSupabaseAdmin } from "../../../lib/supabase";
import FaqAccordion from "../../../components/FaqAccordion.astro";

const fallbackFaqs = [
  { question: "...", answer: "..." },
];

let faqItems = fallbackFaqs;
try {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('faq_items')
    .select('question, answer, sort_order')
    .eq('section', 'ai_agents_<page>')
    .eq('published', true)
    .order('sort_order');
  if (!error && data && data.length > 0) faqItems = data;
} catch (err) {
  // Fallback to hardcoded content on error
}

Astro.response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

const ldJson = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '<page name>',
    url: 'https://lenooai.com/services/ai-agents/<slug>',
    description: '<meta description>',
    provider: { '@type': 'Organization', name: 'Lenoo AI', url: 'https://lenooai.com' },
    areaServed: 'United Arab Emirates',
    serviceType: 'AI Agent Development',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lenooai.com/' },
      { '@type': 'ListItem', position: 2, name: 'AI Agents', item: 'https://lenooai.com/services/ai-agents' },
      { '@type': 'ListItem', position: 3, name: '<Page>', item: 'https://lenooai.com/services/ai-agents/<slug>' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  },
];
---
<BaseLayout
  title="<exact title, ≤60 chars, ends '| Lenoo AI'>"
  description="<exact meta description>"
  canonicalPath="/services/ai-agents/<slug>"
  ogImage="/assets/og-services.jpg"
  ldJson={ldJson}
>
<header class="hero-section">
  <div class="container" style="text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:4px;background:rgba(0,227,253,0.12);border:1px solid rgba(0,227,253,0.28);border-radius:100px;padding:6px 16px;color:#a8f2ff;font-size:0.875rem;font-weight:600;margin-bottom:1.5rem;" aria-label="Breadcrumb"><a href="/" style="color:inherit;text-decoration:none;opacity:0.65;">Home</a><span style="opacity:0.4;padding:0 4px;"> / </span><a href="/services/ai-agents" style="color:inherit;text-decoration:none;opacity:0.65;">AI Agents</a><span style="opacity:0.4;padding:0 4px;"> / </span><Page></div>
    <h1><H1></h1>
    <p style="color:rgba(255,255,255,0.72); font-size:1.125rem; max-width:640px; margin:1.5rem auto 0; line-height:1.8;"><hero paragraph></p>
    <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
      <button onclick="openModal(this)" data-source="ai_agents_<page>_hero" class="btn-primary">Book a Free Discovery Call</button>
      <a href="#<anchor>" class="btn-outline"><scroll link text> ↓</a>
    </div>
  </div>
</header>
<!-- body sections per task spec -->
<section class="section-sm" aria-label="Call to action">
  <div class="container" style="text-align:center;">
    <p style="color:#42474e; font-size:1.0625rem; max-width:560px; margin:0 auto 1.25rem;"><mid CTA line></p>
    <button onclick="openModal(this)" data-source="ai_agents_<page>_mid" class="btn-primary"><mid CTA button text></button>
  </div>
</section>
<section class="section" style="background:#f9f9ff;" aria-labelledby="faq-heading">
  <div class="container" style="max-width:720px;">
    <div class="section-header"><h2 id="faq-heading">Frequently Asked Questions</h2></div>
    <FaqAccordion items={faqItems} />
  </div>
</section>
<section class="section-sm" aria-label="Call to action">
  <div class="container">
    <div class="cta-band">
      <div style="position:relative; z-index:1; text-align:center;">
        <p class="cta-eyebrow">Free Discovery Call</p>
        <h2 style="font-size:clamp(1.75rem,3vw,2.5rem); margin-bottom:1rem;"><final CTA H2></h2>
        <p style="font-size:1.125rem; max-width:36rem; margin:0 auto 2rem; line-height:1.7;"><final CTA body></p>
        <div class="cta-trust-badges">
          <span class="cta-trust-badge">✓ 100% free</span>
          <span class="cta-trust-badge">✓ No commitment</span>
          <span class="cta-trust-badge">✓ Refund guarantee</span>
        </div>
        <button onclick="openModal(this)" data-source="ai_agents_<page>_cta" class="btn-primary" style="font-size:1.125rem; padding:1.125rem 2.75rem;">Book Free Discovery Call</button>
        <p style="font-size:.875rem; margin-top:1rem; color:#94a3b8;">30-min call · No sales pressure</p>
      </div>
    </div>
  </div>
</section>
</BaseLayout>
<style>
.value-card { display:flex; flex-direction:column; }
</style>
```

Body sections between the hero and the mid-page CTA use `.section` wrappers alternating plain/`background:#f0f3ff`, `.bento-grid.bento-grid-3` grids of `.value-card` blocks for feature/example lists (copy the exact markup from `ai-automation/dubai.astro:150-180`), and plain `<p>` blocks styled `color:#42474e; font-size:1.0625rem; line-height:1.85;` for prose — this is the only prose/grid vocabulary used anywhere in this file family, don't invent new patterns.

---

## Task 1: n8n AI agent tool page (build first — closes an existing dead link)

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/tools/n8n-ai-agent.astro`

- [ ] **Step 1: Write the page**

Follow the skeleton above at `../../../../` import depth. Content spec (full detail in design spec §14–18, this is the shortlist):
- **H1:** "n8n AI Agent Workflows"
- **Keywords:** n8n ai agent (170/mo — highest-volume keyword in the whole 18-page set), ai agent n8n (20/mo), ai agent chatgpt (20/mo)
- **What Is n8n (for agents) section:** n8n as a workflow engine that can run an LLM node mid-pipeline to make a decision, not just move data — explicitly cross-link to `/services/ai-automation/tools/n8n` as "the automation-only side of this same platform"
- **How Lenoo Builds Agents on n8n:** self-hosted vs. cloud decision, where the agent's reasoning step sits in the pipeline, guardrails around what actions the agent can trigger
- **Who This Fits:** teams needing data residency/compliance control or agent logic a no-code builder can't express
- **Typical Project:** discovery → design (map where the LLM decision step sits) → build/test (structured error handling per branch) → launch/monitor
- **vs. the Alternatives:** honest comparison against Gumloop, Lindy, Pipedream (link to their pages once they exist — for now, name them without links since they're built in later tasks; revisit in Task 6 to add links back)
- **Use Cases grid (4-6 cards):** e.g. inbound lead-qualification agent, invoice-exception-handling agent, support-ticket triage agent, compliance-monitoring agent
- **FAQ (5-6 items):** is this the same as n8n automation (no, cross-link), self-hosting requirement, cost driver, does it replace the automation page's use cases
- Word count: 1500+ words visible body text. 3 CTAs: `ai_agents_n8n-ai-agent_hero`, `ai_agents_n8n-ai-agent_mid`, `ai_agents_n8n-ai-agent_cta` — every CTA copy frames it as "we'll build your agent on n8n for you."

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`
Expected: no new type/template errors.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/tools/n8n-ai-agent.astro
git commit -m "feat: add n8n AI agent tool page"
```

---

## Task 2: Gumloop tool page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/tools/gumloop.astro`

- [ ] **Step 1: Write the page**

Same skeleton and section structure as Task 1. Content spec:
- **H1:** "AI Agents Built on Gumloop"
- **Keyword:** no-code AI agent builder (Gumloop's positioning)
- **What Is Gumloop:** visual no-code agent builder, drag-and-drop node canvas, built for non-technical teams to see and understand the agent's logic
- **Who This Fits:** teams without in-house developers who still want visibility into how the agent reasons, or want to hand off small edits to a non-technical owner after launch
- **Typical Project:** discovery → design (map the visual flow) → build/test → launch/monitor
- **vs. the Alternatives:** vs. Lindy (integration breadth), vs. Pipedream (code-level flexibility), vs. n8n (self-hosting/compliance) — cross-link all three once they exist (revisit in Task 6)
- **Use Cases grid (4-6 cards):** e.g. content-repurposing agent, inbox-triage agent, lead-research agent, report-generation agent
- **FAQ (5-6 items):** does our team need to touch Gumloop after launch, is it free to start, how it compares to a fully custom build, data handling
- Word count 1500+, 3 CTAs `ai_agents_gumloop_hero|mid|cta`, framed as "we'll build your idea on Gumloop for you."

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/tools/gumloop.astro
git commit -m "feat: add Gumloop tool page"
```

---

## Task 3: Lindy tool page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/tools/lindy.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents Built on Lindy"
- **Keyword:** AI agent builder, 4,000+ integrations
- **What Is Lindy:** agent builder with a very wide native-integration library — the pitch is breadth of "already connects to X" rather than needing custom API work for common tools
- **Who This Fits:** businesses whose stack is mostly mainstream SaaS tools (email, calendar, CRM, Slack) where an off-the-shelf integration saves real build time vs. a custom API integration
- **Typical Project:** discovery (integration inventory against Lindy's library) → design → build/test → launch/monitor
- **vs. the Alternatives:** vs. Gumloop (visual simplicity), vs. Pipedream (code-level control), vs. n8n (self-hosting) — cross-link (revisit Task 6)
- **Use Cases grid:** e.g. meeting-notes-to-CRM agent, recruiting-screener agent, customer-onboarding agent, calendar-coordination agent
- **FAQ (5-6):** what happens if we need an integration Lindy doesn't have, pricing model, data residency, maintenance after launch
- Word count 1500+, 3 CTAs `ai_agents_lindy_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/tools/lindy.astro
git commit -m "feat: add Lindy tool page"
```

---

## Task 4: Pipedream tool page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/tools/pipedream.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents Built on Pipedream"
- **Keyword:** developer/API-focused agent building
- **What Is Pipedream:** code-first workflow platform, every step can be a real code function, built for developers who want full control rather than a purely visual canvas
- **Who This Fits:** teams with an in-house or contracted dev resource, or workflows with logic too specific for a visual-only builder to express cleanly
- **Typical Project:** discovery → design (decide which steps need code vs. built-in actions) → build/test → launch/monitor
- **vs. the Alternatives:** vs. n8n (closest comparison — both code-capable; difference is hosting model and workflow-canvas philosophy), vs. Gumloop/Lindy (less technical, faster to a first version) — cross-link (revisit Task 6)
- **Use Cases grid:** e.g. custom-API-integration agent, data-transformation-and-decision agent, webhook-triggered support agent, multi-step research agent
- **FAQ (5-6):** do we need our own developer on staff, hosting/ownership of code, cost driver, how debugging works
- Word count 1500+, 3 CTAs `ai_agents_pipedream_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/tools/pipedream.astro
git commit -m "feat: add Pipedream tool page"
```

---

## Task 5: Salesforce Agentforce tool page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/tools/salesforce-agentforce.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents Built on Salesforce Agentforce"
- **Keyword:** CRM-embedded AI agents
- **What Is Agentforce:** Salesforce's native agent layer, runs inside existing CRM data/permissions rather than as a bolted-on external tool
- **Who This Fits:** businesses already running Salesforce as their CRM of record, where the agent needs to act on live pipeline/case data without a separate integration layer
- **Typical Project:** discovery (map which Salesforce objects/permissions the agent needs) → design → build/test inside a sandbox org → launch/monitor
- **vs. the Alternatives:** vs. the 4 other tool pages — the key differentiator is "you're already paying for and running Salesforce, this is the agent layer for that specific investment," not a general-purpose comparison — cross-link (revisit Task 6)
- **Use Cases grid:** e.g. lead-scoring-and-routing agent, case-triage agent, opportunity-follow-up agent, pipeline-hygiene agent
- **FAQ (5-6):** do we need an existing Salesforce license, does this replace Salesforce's own admin, cost driver, data stays inside Salesforce or not
- Word count 1500+, 3 CTAs `ai_agents_salesforce-agentforce_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/tools/salesforce-agentforce.astro
git commit -m "feat: add Salesforce Agentforce tool page"
```

---

## Task 6: Tools sub-hub (build after all 5 tool pages exist, add cross-links between them)

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/tools.astro`
- Modify: `astro-site/src/pages/services/ai-agents/tools/n8n-ai-agent.astro` (add real links to gumloop/lindy/pipedream in its "vs. the Alternatives" section)
- Modify: `astro-site/src/pages/services/ai-agents/tools/gumloop.astro` (add real links to lindy/pipedream/n8n-ai-agent)
- Modify: `astro-site/src/pages/services/ai-agents/tools/lindy.astro` (add real links to gumloop/pipedream/n8n-ai-agent)
- Modify: `astro-site/src/pages/services/ai-agents/tools/pipedream.astro` (add real links to gumloop/lindy/n8n-ai-agent)
- Modify: `astro-site/src/pages/services/ai-agents/tools/salesforce-agentforce.astro` (add real links to gumloop/lindy)

- [ ] **Step 1: Write the sub-hub page**

Mirror `ai-automation/tools.astro` structure. Content spec:
- **H1:** "AI Agent Tools & Platforms We Build With"
- **Keywords:** ai agent builder (AED 65.10 — highest-value keyword in the entire set), ai agent platform, ai agent marketplace, ai agent management platform, ai agent store, ai agent tools, ai agent free, ai agent for free, ai agent openai, ai agent google, ai agent microsoft
- **Intro section:** "one implementation partner, many tools" — Lenoo isn't locked to a single platform
- **Category comparison:** no-code builders (Gumloop, Lindy) vs. developer platforms (Pipedream, n8n) vs. enterprise-embedded (Salesforce Agentforce) — when each category fits
- **Honest "free" section:** OpenAI, Google, and Microsoft each ship their own agent-building offerings; mention factually (what they're for, who they suit — a developer experimenting solo) and be upfront that a free/DIY tool is a different starting point than a delivered, maintained system
- **Grid linking to all 5 tool pages** (bento-grid-3 of `.value-card`s, `tool-logo-wrap` pattern like `ai-automation/tools.astro:152-163`, using `cdn.simpleicons.org` logos where a slug exists — Gumloop/Lindy/Pipedream/Agentforce/n8n)
- **FAQ (6-7 items, mirror `ai-automation/tools.astro`'s FAQ shape):** how we pick a platform, can you switch us between platforms, do we need an existing license, cost variance by platform, can one workflow use more than one of these tools
- Word count 1500+, 3 CTAs `ai_agents_tools_hero|mid|cta`.

- [ ] **Step 2: Add cross-links between the 5 tool pages**

In each tool page's "vs. the Alternatives" section (written as a placeholder note in Tasks 1–5), replace the plain tool-name mentions with real `<a href="/services/ai-agents/tools/<slug>">` links to the other 4 pages, matching how `ai-automation/tools/n8n.astro:162` links to `/services/ai-automation/tools/zapier` and `/services/ai-automation/tools/make` inline in prose.

- [ ] **Step 3: Verify**

Run: `cd astro-site && npm run check`
Expected: no broken links among the 6 tools-cluster pages (sub-hub + 5 tool pages).

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/tools.astro astro-site/src/pages/services/ai-agents/tools/*.astro
git commit -m "feat: add AI agent tools sub-hub and cross-link the 5 tool pages"
```

---

## Task 7: Dubai location page (reference implementation for the remaining 11 pages)

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/dubai.astro`

- [ ] **Step 1: Write the page**

Import depth `../../../` (one level shallower than the tools/ pages). Mirror `ai-automation/dubai.astro` structure exactly (StatStrip banner, tech-stack-style grid repurposed as agent-use-case grid, split-grid section, ProcessSteps, cross-links section, mid CTA, FAQ, final CTA). Content spec:
- **H1:** "AI Agents in Dubai"
- **Keyword:** ai agent dubai (30/mo)
- **Why local section:** Business Bay-based, on-site discovery sessions, Dubai's free zone (DMCC/JAFZA/DIFC) vs. mainland business mix
- **Agent use cases by Dubai industry (bento-grid-3, 6 cards with a "real example" line each):** real estate lead qualification, trading/logistics shipment-status agents, hospitality booking agents, retail customer-service agents, professional-services client-intake agents, free-zone/mainland business-admin agents
- **DIFC callout:** agents touching personal data under DIFC's separate data protection law need scoping around that, same distinction already made on `ai-automation/dubai.astro:241`
- **Process section:** reuse the hub's existing 4-step `processSteps` from `ai-agents.astro:47-52` (Define the Mission / Build & Connect / Test Rigorously / Monitor & Improve)
- **Cross-links section:** to Abu Dhabi, Agencies, Tools sub-hub
- **FAQ (6-7 items):** on-site vs. remote, free zone compatibility, WhatsApp integration, timeline, DIFC data handling
- Word count 1500+ (target 3000+ to match the automation precedent), 3 CTAs `ai_agents_dubai_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/dubai.astro
git commit -m "feat: add AI agents Dubai location page"
```

---

## Task 8: Abu Dhabi location page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/abu-dhabi.astro`

- [ ] **Step 1: Write the page**

Same structure as Task 7, but content must be genuinely distinct, not a city-name swap:
- **H1:** "AI Agents in Abu Dhabi"
- **Angle:** government/semi-government/ADGM-adjacent audience, public-sector workforce framing
- **Agent use cases (6 cards):** government-portal-adjacent document processing, ADGM-registered firm compliance agents, public-sector citizen-service-style inquiry agents, semi-government utility/logistics agents, healthcare-adjacent administrative agents, professional-services intake agents — each with a distinct "real example" line from Dubai's
- **ADGM callout:** ADGM's own common-law data protection regime, distinct from Dubai's DIFC callout and from the federal PDPL
- **FAQ (6-7 items):** government portal integration reality check (what's automatable vs. not, honestly), ADGM data rules, public-sector procurement/timeline expectations, remote vs. on-site (served from the Dubai base)
- Word count 1500+, 3 CTAs `ai_agents_abu-dhabi_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/abu-dhabi.astro
git commit -m "feat: add AI agents Abu Dhabi location page"
```

---

## Task 9: Agencies page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/agencies.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "Choosing an AI Agent Development Company"
- **Keywords:** ai agent development company (20/mo), ai agent architect (20/mo, AED 23.28)
- **In-house vs. freelancer vs. agency section:** honest trade-offs for each path, not a one-sided pitch
- **What to look for in an agency section (bento-grid-3 or ordered list):** portfolio of shipped agents (not just demos), guardrail/testing discipline, post-launch monitoring and support, transparent process
- **"What is an AI agent architect" section:** the system-design role — tool selection, orchestration pattern choice, guardrail definition, evaluation methodology — and why that skill matters even when a business is hiring an agency rather than the role itself
- **Lenoo's approach mapped against the checklist:** concrete, specific, not generic self-praise
- **FAQ (5-6):** how to vet an agency, red flags to watch for, fixed-scope vs. retainer, who owns the resulting code/IP
- Word count 1500+, 3 CTAs `ai_agents_agencies_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/agencies.astro
git commit -m "feat: add AI agent agencies page"
```

---

## Task 10: Development process page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/development.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agent Development: How We Build"
- **Keyword:** ai agent development (20/mo, AED 53.21 — highest CPC in the top-level cluster)
- **Written for a technical buyer (ops lead, CTO), not a general audience.** Sections: scoping (tool inventory, guardrail definition), architecture decisions (single-agent vs. multi-agent, LLM selection, memory/state handling), build phase (tool integration, instruction design, testing harness against edge cases), deployment (monitoring, logging, rollback capability)
- **Reuse and expand** the hub's existing 4-step `processSteps`, don't just repeat it — go one level deeper on each step here since this page's whole purpose is technical depth
- **FAQ (5-6):** realistic build timeline by complexity, tech stack used, how testing actually works, who owns the resulting code/IP after delivery
- Word count 1500+, 3 CTAs `ai_agents_development_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/development.astro
git commit -m "feat: add AI agent development process page"
```

---

## Task 11: Real estate vertical page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/for-real-estate.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents for Real Estate"
- **Keyword:** ai agent for real estate (20/mo, AED 20.58)
- **Required differentiation box (explicit, on-page):** vs. `/services/ai-automation/real-estate` — automation moves data on a fixed trigger (e.g. posts a new listing to three portals on schedule); an agent reasons and decides (e.g. reads an inbound WhatsApp inquiry, checks it against buyer criteria, decides whether to schedule a viewing or flag a human) — link to the automation page as the "if you just need data moved" option
- **Use-case sections (bento-grid-3, one real example each):** lead-qualification agents, property-matching agents, viewing-scheduling agents, post-viewing follow-up agents, tenant/landlord communication agents
- **FAQ (5-6):** Property Finder/Bayut integration, WhatsApp handling, human handoff for high-value leads, how this differs from the automation page (reinforce the differentiation box)
- Word count 1500+, 3 CTAs `ai_agents_for-real-estate_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/for-real-estate.astro
git commit -m "feat: add AI agents for real estate page"
```

---

## Task 12: Voice agents page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/voice-agents.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Voice Agents"
- **No single seed keyword — use-case-driven page.**
- **What a voice agent does section:** answers/makes calls, understands intent, takes action (books, transfers, logs)
- **Inbound use cases (bento-grid-3):** reception replacement, appointment booking by phone, order-status-by-phone
- **Outbound use cases (bento-grid-3):** confirmation calls, follow-up calls, missed-payment reminder calls
- **Bilingual EN/AR section:** relevant to UAE call volume, honest about current model quality/limitations for Arabic
- **Honest limitations section:** when a call needs immediate human handling, not routed through the agent
- **FAQ (5-6):** does it sound robotic, call recording/compliance, integration with existing phone systems, cost driver (call volume vs. complexity)
- Word count 1500+, 3 CTAs `ai_agents_voice-agents_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/voice-agents.astro
git commit -m "feat: add AI voice agents page"
```

---

## Task 13: Customer support page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/customer-support.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents for Customer Support"
- **Keyword:** ai agent zendesk (10/mo)
- **Tier 1/2 support automation section:** order status, refund/return handling
- **Named integrations section:** Zendesk, Intercom, Freshdesk specifically (Zendesk is the seed keyword — name it explicitly, don't genericize it away)
- **Escalation logic section:** when the agent hands off to a human, how that handoff is designed
- **24/7 coverage framing section**
- **FAQ (5-6):** does this replace our support team (no — handles volume, escalates judgment calls), which helpdesk platforms are supported, how brand voice/tone is maintained
- Word count 1500+, 3 CTAs `ai_agents_customer-support_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/customer-support.astro
git commit -m "feat: add AI agents for customer support page"
```

---

## Task 14: Sales & marketing page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/sales.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents for Sales & Marketing"
- **Keyword:** ai agent for marketing (10/mo)
- **Sales use cases (bento-grid-3):** prospect-research agents, personalized-outreach-drafting agents, follow-up-sequencing agents, CRM-update agents
- **Marketing use cases (bento-grid-3):** campaign-variant-generation agents, content-repurposing agents
- **Distinct-from-training note:** briefly note this is Lenoo building the agent, distinct from `/services/ai-training` or `/services/ai-courses` sales pages which teach a person the skill — one sentence, not a full differentiation box (lower stakes than the real-estate/automation overlap)
- **FAQ (5-6):** CRM compatibility, WhatsApp-based sales workflows common in the UAE market, human review before send
- Word count 1500+, 3 CTAs `ai_agents_sales_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/sales.astro
git commit -m "feat: add AI agents for sales and marketing page"
```

---

## Task 15: Use cases / examples page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/use-cases.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agent Examples & Use Cases"
- **Keywords:** ai agent examples (50/mo — highest volume in this cluster), ai agent use cases (10/mo, AED 57.14 — highest CPC in the entire 18-page set), ai agent uses, ai agent personal assistant, ai agent team
- **Broad example catalog, organized by function (bento-grid-3, expand each beyond a one-liner into a real 60-90 word example):** research agents, sales agents, support agents, operations agents, compliance agents, scheduling agents — expand the hub's existing 6 agent-type cards from `ai-agents.astro:163-193`, don't just repeat them verbatim
- **"AI agent team" section:** multi-agent orchestration explained concretely — specialized agents coordinated by an orchestrator, expand the hub's brief mention at `ai-agents.astro:190-192`
- **"Personal assistant" agent example section:** scheduling, inbox triage, task follow-up for an individual executive
- **Keep the CTA strong, not soft** — this is the highest commercial-value informational page in the set
- **FAQ (5-6):** how specific can an agent get, can one agent do multiple jobs, how "AI agent team" differs from one agent with many tools
- Word count 1500+, 3 CTAs `ai_agents_use-cases_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/use-cases.astro
git commit -m "feat: add AI agent examples and use cases page"
```

---

## Task 16: Templates page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/templates.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agent Templates"
- **Keyword:** ai agent templates (70/mo — highest search volume in the entire 18-page set)
- **5-6 example agent "blueprints" (bento-grid-3 or ordered cards):** each names a use case and sketches trigger → tools used → decision logic → output (e.g. lead-qualification agent, invoice-processing agent, support-ticket-triage agent, meeting-follow-up agent, compliance-monitoring agent) — framed explicitly as illustrative starting points, not copy-paste-ready
- **Explicit pivot section:** generic templates break on real business messiness (naming conventions, edge cases, tool quirks); a custom-built agent handles actual data from day one
- **FAQ (5-6):** are these templates free to use, why not just use a template, how long a custom build takes vs. adapting a template
- Word count 1500+, 3 CTAs `ai_agents_templates_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/templates.astro
git commit -m "feat: add AI agent templates page"
```

---

## Task 17: vs. Agentic AI page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/vs-agentic-ai.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Agents vs. Agentic AI: What's the Difference"
- **Keyword:** ai agents vs agentic ai (30/mo, AED 28.02)
- **Definitional clarity section:** "AI agent" is usually a noun (a specific deployed system); "agentic AI" is usually the broader property/approach (systems that plan and act autonomously) — explain honestly that the terms overlap heavily in real usage and marketing muddies them further, don't force an artificial hard line that doesn't hold up
- **vs. chatbot section, vs. plain automation section:** where agents/agentic AI differ from each
- **"Agentic AI" as umbrella term section:** how it gets used for multi-agent systems specifically
- **FAQ (5-6):** is agentic AI just a buzzword, do I need "agentic AI" or a simpler single agent, how Lenoo scopes which one a project actually needs
- Word count 1500+, 3 CTAs `ai_agents_vs-agentic-ai_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/vs-agentic-ai.astro
git commit -m "feat: add AI agents vs agentic AI page"
```

---

## Task 18: Architecture pillar page

**Files:**
- Create: `astro-site/src/pages/services/ai-agents/architecture.astro`

- [ ] **Step 1: Write the page**

Content spec (this is the densest keyword page in the set — 8 keywords, all developer-intent):
- **H1:** "AI Agent Architecture & System Design"
- **Keywords:** ai agent architecture (30/mo), ai agent frameworks (30/mo), ai agent system design (10/mo), ai agent llm (10/mo), ai agent workflow (10/mo), ai agent security (10/mo), ai agent governance (10/mo), ai agent github (20/mo)
- **Core architecture patterns section:** single-agent vs. multi-agent/orchestrator, reasoning-loop pattern (perceive → reason → act), tool-calling
- **Framework landscape section (named honestly, not just Lenoo's preferred stack):** LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Claude Agent SDK
- **LLM selection considerations section**
- **Workflow/state management section**
- **Security section:** prompt injection, tool permission scoping, data exposure
- **Governance section:** audit logging, human-in-the-loop checkpoints, action limits — echo and expand the hub's existing FAQ answer on this from `ai-agents.astro:13`
- **Written for a technical evaluator**, not a general buyer
- **FAQ (5-6):** which framework Lenoo uses and why, open-source vs. proprietary trade-offs, how security is handled by default
- Word count 1500+ (target higher given 8 keywords to cover — aim 2500+), 3 CTAs `ai_agents_architecture_hero|mid|cta`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-agents/architecture.astro
git commit -m "feat: add AI agent architecture pillar page"
```

---

## Task 19: Edit the hub page

**Files:**
- Modify: `astro-site/src/pages/services/ai-agents.astro`

- [ ] **Step 1: Add a mid-page CTA**

The hub currently has only 2 CTAs (hero at line 79, final at line 278). Insert a `.section-sm` mid-page CTA block (same markup pattern as the skeleton's mid-CTA section above) between the "HOW AGENTS WORK" section (ends `astro-site/src/pages/services/ai-agents.astro:253`) and the "FAQ" section (starts line 256). Use `data-source="agents_mid"` and copy: "Not sure which type of agent fits your workflow? Ask us on a free call." / button text "Book a Free Discovery Call".

- [ ] **Step 2: Add "More AI Agent Resources" cross-link section**

Insert after the FAQ section (after line 263, before "FINAL CTA" at line 265). Three `bento-grid-3` sub-grids of `.value-card` links (same markup as `ai-automation.astro`'s cross-link cards, e.g. lines 273-291 of that file), grouped:
- **By location:** Dubai (`/services/ai-agents/dubai`), Abu Dhabi (`/services/ai-agents/abu-dhabi`)
- **By use case:** Real Estate (`/services/ai-agents/for-real-estate`), Voice Agents (`/services/ai-agents/voice-agents`), Customer Support (`/services/ai-agents/customer-support`), Sales & Marketing (`/services/ai-agents/sales`), Examples & Use Cases (`/services/ai-agents/use-cases`)
- **Learn more:** Agencies (`/services/ai-agents/agencies`), Development Process (`/services/ai-agents/development`), Templates (`/services/ai-agents/templates`), vs. Agentic AI (`/services/ai-agents/vs-agentic-ai`), Architecture (`/services/ai-agents/architecture`), Tools We Build With (`/services/ai-agents/tools`)

Each card: `.service-icon` with a relevant `material-symbols-outlined` icon, `<h3>` page name, one-sentence `<p>` hook (reuse the hook line from that page's design-spec entry), `<a class="learn-link">Learn more →</a>`.

- [ ] **Step 3: Verify**

Run: `cd astro-site && npm run check && npm run build`
Expected: build succeeds, no broken internal links — every href added resolves to a file created in Tasks 1–18.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/pages/services/ai-agents.astro
git commit -m "feat: turn AI agents page into a hub linking to location, use-case, and tools pages"
```

---

## Task 20: Register new URLs in the sitemap

**Files:**
- Modify: `astro-site/src/pages/page-sitemap.xml.ts`

- [ ] **Step 1: Add all 18 new URLs**

In the `PAGES` array, immediately after the existing `{ url: '/services/ai-agents', ... }` entry (around line 19), insert 18 entries following the exact format of the `ai-automation` block at lines 21-36 (no `arUrl` since English-only):

```ts
  { url: '/services/ai-agents/dubai',                          lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/abu-dhabi',                      lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/agencies',                       lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/development',                    lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/for-real-estate',                lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/voice-agents',                   lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/customer-support',               lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/sales',                          lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/use-cases',                      lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/templates',                      lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/vs-agentic-ai',                  lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/architecture',                   lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools',                          lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/gumloop',                  lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/lindy',                    lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/pipedream',                lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/salesforce-agentforce',    lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/n8n-ai-agent',             lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
```

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/page-sitemap.xml.ts
git commit -m "feat: register 18 AI agents hub pages in sitemap"
```

---

## Task 21: Fix the dead link in the live n8n automation page

**Files:**
- Modify: `astro-site/src/pages/services/ai-automation/tools/n8n.astro:116`

- [ ] **Step 1: Fix the link**

Change:
```astro
See our dedicated <a href="/ai-agents/tools/n8n-ai-agent">n8n AI agent builds →</a>
```
to:
```astro
See our dedicated <a href="/services/ai-agents/tools/n8n-ai-agent">n8n AI agent builds →</a>
```

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check && npm run build`
Expected: full build succeeds.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-automation/tools/n8n.astro
git commit -m "fix: correct dead link to n8n AI agent page"
```

---

## Task 22: Final localhost verification

- [ ] **Step 1: Start the dev server**

Run: `cd astro-site && npm run dev`

- [ ] **Step 2: Spot-check every new page loads and renders**

Visit each of the 18 new URLs plus the edited hub at `http://localhost:4321` (or whatever port the dev server reports), confirm: page renders without console errors, hero/mid/final CTAs are all present and open the discovery-call modal, FAQ accordion expands, breadcrumb links work, cross-link cards on the hub and tools sub-hub resolve to real pages (no 404s).

- [ ] **Step 3: Word count spot check**

Run against each new file: `for f in astro-site/src/pages/services/ai-agents/*.astro astro-site/src/pages/services/ai-agents/tools/*.astro; do echo "$f: $(sed -n '/^---$/,/^---$/!p' "$f" | grep -oE '>[^<]+<' | tr -d '><' | wc -w) words"; done` — confirm every file well above 1500 (this rough strip undercounts slightly since it only catches text between tags, so treat anything under ~1300 as a real flag worth expanding, not a hard fail).

Report any page that fails to render, has a broken link, or reads noticeably short before calling this plan done.
