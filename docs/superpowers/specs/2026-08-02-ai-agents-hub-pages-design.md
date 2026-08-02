# AI Agents Hub Pages — Design Spec

**Goal:** Turn `/services/ai-agents` into a hub linking to 12 dedicated subpages plus a `tools` sub-hub (5 further tool-specific pages), targeting the keyword structure pasted in this conversation and sourced from `seo-keyword-structure.html`. Total: 18 new pages + 3 edited shared files.

**Precedent this clones:** `astro-site/src/pages/services/ai-automation/*` is a live, already-shipped example of this exact pattern — `dubai.astro`, `abu-dhabi.astro`, `agencies.astro`, `accounting.astro`, `business.astro`, `real-estate.astro`, `tools.astro` + `tools/*.astro` (9 tool pages). Every new page in this spec follows that folder's structure, tone, component usage, and CTA cadence, not a new pattern invented for this task.

**Architecture:** New folder `astro-site/src/pages/services/ai-agents/` (sibling to the existing `services/ai-agents.astro` file — confirmed this coexists without collision, since `ai-automation.astro` + `ai-automation/` already do this in the same directory). Plus a nested `tools/` folder inside it for the 5 tool-specific pages, matching `ai-automation/tools/`.

**Tech stack:** Astro `.astro` files, existing `BaseLayout`, `FaqAccordion`, `ProcessSteps`, `StatStrip` components, existing global CSS classes (`.value-card`, `.bento-grid`, `.cta-band`, `.learn-link`, etc. — no new CSS system). Verification: `cd astro-site && npm run check && npm run build`. No unit tests apply — static marketing pages.

**Confirmed decisions (do not re-litigate):**
- URL pattern: nested folder for every page — `/services/ai-agents/dubai`, `/services/ai-agents/tools/gumloop`, etc.
- English only, no Arabic mirrors this pass.
- All 18 pages built in one plan (matches the `ai-courses` precedent of 15 pages in one pass).
- Every page: **minimum 1500 words** of visible body content, and **exactly 3 CTAs** (hero, mid-page, final) — both explicit user requirements for this pass, and above the automation-tools precedent's occasional dip to ~1400 words.
- Tool pages (`tools/gumloop.astro`, `tools/lindy.astro`, `tools/pipedream.astro`, `tools/salesforce-agentforce.astro`, `tools/n8n-ai-agent.astro`): neutral, honest educational content about what the tool is and its real pros/cons — **not** an alternative/replacement pitch — but every CTA on these pages offers "we'll build your idea or app using this tool for you," i.e. build-for-you service framing layered on top of neutral info, not a DIY-vs-us competitive angle.
- `ai-automation/tools/n8n.astro:116` currently links to `/ai-agents/tools/n8n-ai-agent` — a dead link today (no `/ai-agents/*` route exists; the live hub is `/services/ai-agents`). Fix it to `/services/ai-agents/tools/n8n-ai-agent` as part of this work.
- Dubai vs. Abu Dhabi pages must carry genuinely different angles (Dubai = private-sector/free-zone/Business Bay-local framing; Abu Dhabi = government/semi-government/ADGM framing), not a city-name swap — same duplicate-content rule already enforced twice in this codebase (`ai-training` plan, `ai-automation` live pages).
- `for-real-estate.astro` must explicitly differentiate itself from `ai-automation/real-estate.astro` (agents that act/decide vs. automations that move data on fixed triggers) — same differentiation-box pattern used in the `ai-courses` plan.

---

## File structure

| File | URL | Keyword(s) targeted |
|---|---|---|
| `services/ai-agents/dubai.astro` | `/services/ai-agents/dubai` | ai agent dubai (30/mo) |
| `services/ai-agents/abu-dhabi.astro` | `/services/ai-agents/abu-dhabi` | city-level commercial intent |
| `services/ai-agents/agencies.astro` | `/services/ai-agents/agencies` | ai agent development company (20/mo), ai agent architect (20/mo, AED 23.28) |
| `services/ai-agents/development.astro` | `/services/ai-agents/development` | ai agent development (20/mo, AED 53.21) |
| `services/ai-agents/for-real-estate.astro` | `/services/ai-agents/for-real-estate` | ai agent for real estate (20/mo, AED 20.58) |
| `services/ai-agents/voice-agents.astro` | `/services/ai-agents/voice-agents` | phone/voice-based agent use case |
| `services/ai-agents/customer-support.astro` | `/services/ai-agents/customer-support` | ai agent zendesk (10/mo) |
| `services/ai-agents/sales.astro` | `/services/ai-agents/sales` | ai agent for marketing (10/mo) |
| `services/ai-agents/use-cases.astro` | `/services/ai-agents/use-cases` | ai agent examples (50/mo), ai agent use cases (10/mo, AED 57.14 — highest CPC), ai agent uses, ai agent personal assistant, ai agent team |
| `services/ai-agents/templates.astro` | `/services/ai-agents/templates` | ai agent templates (70/mo, AED 16.71) |
| `services/ai-agents/vs-agentic-ai.astro` | `/services/ai-agents/vs-agentic-ai` | ai agents vs agentic ai (30/mo, AED 28.02) |
| `services/ai-agents/architecture.astro` | `/services/ai-agents/architecture` | ai agent architecture, frameworks, system design, llm, workflow, security, governance, github (30/mo, 30/mo, 10/mo×6) |
| `services/ai-agents/tools.astro` | `/services/ai-agents/tools` | **[SUB-HUB]** ai agent builder (70/mo, AED 65.10), platform (50/mo), marketplace (40/mo), management platform, store, tools, free, for free, openai, google, microsoft |
| `services/ai-agents/tools/gumloop.astro` | `/services/ai-agents/tools/gumloop` | no-code AI agent builder |
| `services/ai-agents/tools/lindy.astro` | `/services/ai-agents/tools/lindy` | AI agent builder, 4,000+ integrations |
| `services/ai-agents/tools/pipedream.astro` | `/services/ai-agents/tools/pipedream` | developer/API-focused agent building |
| `services/ai-agents/tools/salesforce-agentforce.astro` | `/services/ai-agents/tools/salesforce-agentforce` | CRM-embedded AI agents |
| `services/ai-agents/tools/n8n-ai-agent.astro` | `/services/ai-agents/tools/n8n-ai-agent` | n8n ai agent (170/mo), ai agent n8n (20/mo), ai agent chatgpt (20/mo) |
| `services/ai-agents.astro` | `/services/ai-agents` | **Modify**: add cross-link section to all 13 new top-level pages/sub-hub, add mid-page CTA (currently 2 CTAs, needs 3) |
| `page-sitemap.xml.ts` | — | **Modify**: register all 18 new URLs |
| `services/ai-automation/tools/n8n.astro` | — | **Modify**: fix dead link at line 116 |

---

## Repeatable page skeleton

Cloned directly from `ai-automation/dubai.astro` / `ai-automation/tools/n8n.astro`. Every new page:

```astro
---
export const prerender = false;
import BaseLayout from "../../../layouts/BaseLayout.astro";       // ../../../../ for tools/*.astro (one level deeper)
import { getSupabaseAdmin } from "../../../lib/supabase";
import FaqAccordion from "../../../components/FaqAccordion.astro";
// ProcessSteps / StatStrip where the page spec calls for them

const fallbackFaqs = [ /* 5-8 real Q&A pairs per page spec below */ ];
let faqItems = fallbackFaqs;
try {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('faq_items').select('question, answer, sort_order')
    .eq('section', 'ai_agents_<page>').eq('published', true).order('sort_order');
  if (!error && data && data.length > 0) faqItems = data;
} catch (err) { /* fallback */ }

Astro.response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

const ldJson = [
  { '@context': 'https://schema.org', '@type': 'Service', name: '<page name>',
    url: 'https://lenooai.com/services/ai-agents/<slug>', description: '<meta description>',
    provider: { '@type': 'Organization', name: 'Lenoo AI', url: 'https://lenooai.com' },
    areaServed: 'United Arab Emirates', serviceType: 'AI Agent Development' },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lenooai.com/' },
    { '@type': 'ListItem', position: 2, name: 'AI Agents', item: 'https://lenooai.com/services/ai-agents' },
    { '@type': 'ListItem', position: 3, name: '<Page>', item: 'https://lenooai.com/services/ai-agents/<slug>' },
  ]},
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map((f) => ({
    '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
];
---
<BaseLayout title="<title>" description="<description>" canonicalPath="/services/ai-agents/<slug>" ogImage="/assets/og-services.jpg" ldJson={ldJson}>
  <!-- hero (CTA 1: data-source="ai_agents_<page>_hero") -->
  <!-- body sections per page spec -->
  <!-- mid-page CTA (CTA 2: data-source="ai_agents_<page>_mid") -->
  <!-- FAQ via FaqAccordion -->
  <!-- final CTA band (CTA 3: data-source="ai_agents_<page>_cta") -->
</BaseLayout>
```

Breadcrumb in the hero: `Home / AI Agents / [Page]`, matching the live `ai-automation/dubai.astro:91` pattern (not `Home / Services / AI Agents / [Page]` — the automation precedent drops the "Services" crumb level once inside a subpage, and this should match it for consistency across the two hub families).

---

## Per-page content specs

### 1. `dubai.astro` — "AI Agents in Dubai"
Mirror `ai-automation/dubai.astro` structure exactly, agent-specific content: Business Bay-based, on-site discovery sessions, Dubai's free zone (DMCC/JAFZA/DIFC) vs. mainland business mix, agent use cases by Dubai industry (real estate lead qualification, trading/logistics shipment tracking agents, hospitality booking agents, retail customer service agents) each with a "real example" line, tools/CRMs commonly connected (Zoho, HubSpot, WhatsApp Business), process steps, DIFC data-handling callout (agents touching personal data). FAQ: on-site vs. remote, free zone compatibility, WhatsApp integration, timeline. Cross-links: abu-dhabi, agencies, tools sub-hub.

### 2. `abu-dhabi.astro` — "AI Agents in Abu Dhabi"
Same skeleton, explicitly different angle: government/semi-government/ADGM-adjacent audience, public-sector workforce framing, distinct case examples (not Dubai's with the city swapped). FAQ: government portal integration reality check, ADGM data rules, public-sector timelines.

### 3. `agencies.astro` — "Choosing an AI Agent Development Company"
Keywords: ai agent development company, ai agent architect. Content: in-house vs. freelancer vs. agency comparison (honest trade-offs, not a hit piece on alternatives), what to actually look for in an agency (portfolio of shipped agents, guardrail/testing discipline, post-launch support, not just a slick demo), what an "AI agent architect" role does (system design: tool selection, orchestration pattern, guardrails, evaluation) and why that skill set matters even if you're hiring rather than building the role internally, Lenoo's own approach mapped against that checklist. FAQ: how to vet an agency, red flags, whether Lenoo does fixed-scope or retainer work.

### 4. `development.astro` — "AI Agent Development: Our Process"
Keyword: ai agent development (highest CPC in the set at AED 53.21). Content: technical deep-dive companion to the hub's lighter 4-step process teaser — real detail on scoping (tool inventory, guardrail definition), architecture decisions (single agent vs. multi-agent, which LLM, memory/state handling), build phase (tool integration, prompt/instruction design, testing harness), deployment (monitoring, logging, rollback). Written for a technically-literate buyer (ops lead, CTO) evaluating whether Lenoo's process is rigorous, not just marketing copy. FAQ: build timeline, tech stack used, how testing works, ownership of the resulting code/IP.

### 5. `for-real-estate.astro` — "AI Agents for Real Estate"
Keyword: ai agent for real estate. **Must include an explicit differentiation box vs. `/services/ai-automation/real-estate`**: automation moves data on a fixed trigger, an agent reasons and decides (e.g., an automation posts a new listing to three portals on schedule; an agent reads an inbound WhatsApp inquiry, checks it against buyer criteria, and decides whether to schedule a viewing or flag it for a human). Curriculum-style sections: lead qualification agents, property-matching agents, viewing scheduling agents, post-viewing follow-up agents, tenant/landlord communication agents. Real example per category. FAQ: Property Finder/Bayut integration, WhatsApp handling, human handoff for high-value leads.

### 6. `voice-agents.astro` — "AI Voice Agents"
No single strong keyword (use-case-driven page). Content: what a voice agent actually does (answers/makes calls, understands intent, takes action — books, transfers, logs), inbound use cases (reception replacement, appointment booking, order status by phone), outbound use cases (confirmation calls, follow-ups, missed-payment reminders), bilingual EN/AR voice handling relevant to UAE, honest limitations (when a call needs a human immediately). FAQ: does it sound robotic, call recording/compliance, integration with existing phone systems, cost driver (call volume vs. complexity).

### 7. `customer-support.astro` — "AI Agents for Customer Support"
Keyword: ai agent zendesk. Content: Tier 1/Tier 2 support automation, order status/refund/return handling, integration with Zendesk, Intercom, Freshdesk specifically (name the platforms since "ai agent zendesk" is the seed keyword), escalation logic (when the agent hands off to a human), 24/7 coverage framing. FAQ: does this replace our support team (no — handles volume, escalates judgment calls), which helpdesk platforms are supported, how tone/brand voice is maintained.

### 8. `sales.astro` — "AI Agents for Sales & Marketing"
Keyword: ai agent for marketing. Content: prospect research agents, personalized outreach drafting, follow-up sequencing, CRM update agents, campaign-variant generation agents (marketing side). Distinct from the existing `ai-training`/`ai-courses` sales pages (those teach a person; this is Lenoo building the agent). FAQ: CRM compatibility, WhatsApp-based sales workflows, human review before send.

### 9. `use-cases.astro` — "AI Agent Examples & Use Cases"
Keywords: ai agent examples (50/mo — highest volume in this cluster), ai agent use cases (AED 57.14 — highest CPC in the entire set), ai agent uses, ai agent personal assistant, ai agent team. Content: broad example catalog organized by function (research, sales, support, ops, compliance — reuse/expand the hub's 6 agent-type cards into fuller examples), a dedicated "AI agent team" section explaining multi-agent orchestration (specialized agents coordinated by an orchestrator, same concept the hub briefly mentions), a "personal assistant" agent example (scheduling, inbox triage, task follow-up for an individual exec). This is the highest commercial-value informational page in the set — keep the CTA strong, not soft. FAQ: how specific can an agent get, can one agent do multiple jobs, how "AI agent team" differs from one agent with many tools.

### 10. `templates.astro` — "AI Agent Templates"
Keyword: ai agent templates (70/mo — highest search volume in the entire cluster). Content: show 5-6 example agent "blueprints" (each: trigger → tools used → decision logic → output, for a named use case like lead-qualification or invoice-processing), framed as illustrative starting points, not something to copy-paste and expect to work. Explicit pivot: generic templates break on real business messiness (naming conventions, edge cases, tool quirks); a custom-built agent handles your actual data from day one. FAQ: are these templates free to use, why not just use a template, how long custom build takes vs. adapting a template.

### 11. `vs-agentic-ai.astro` — "AI Agents vs. Agentic AI: What's the Difference"
Keyword: ai agents vs agentic ai. Content: definitional clarity — "AI agent" is usually a noun (a specific deployed system), "agentic AI" is usually the broader property/approach (systems that plan and act autonomously); in practice the terms overlap heavily and marketing muddies them further. Explain honestly rather than force an artificial hard line. Cover: how this differs from a chatbot, how it differs from plain automation, where "agentic AI" gets used as an umbrella term for multi-agent systems. FAQ: is agentic AI just a buzzword, do I need "agentic AI" or a simpler agent, how Lenoo scopes which one a project actually needs.

### 12. `architecture.astro` — "AI Agent Architecture & System Design"
Keywords: ai agent architecture, ai agent frameworks, ai agent system design, ai agent llm, ai agent workflow, ai agent security, ai agent governance, ai agent github (8 keywords, all low-volume but developer-intent — this is a technical pillar page). Content: core architecture patterns (single-agent vs. multi-agent/orchestrator, ReAct-style reasoning loops, tool-calling), framework landscape (LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Claude Agent SDK — named honestly, not just Lenoo's preferred stack), LLM selection considerations, workflow/state management, security section (prompt injection, tool permission scoping, data exposure), governance section (audit logging, human-in-the-loop checkpoints, action limits — echo the hub's existing FAQ answer on this, expand it). Written for a technical evaluator. FAQ: which framework does Lenoo use and why, open-source vs. proprietary trade-offs, how security is handled by default.

### 13. `tools.astro` (sub-hub) — "AI Agent Tools & Platforms"
Keywords: ai agent builder (AED 65.10 — highest-value keyword in the entire set), ai agent platform, ai agent marketplace, ai agent management platform, ai agent store, ai agent tools, ai agent free, ai agent for free, ai agent openai, ai agent google, ai agent microsoft. Mirror `ai-automation/tools.astro` exactly: intro ("one implementation partner, many tools" — Lenoo isn't locked to one platform), category comparison (no-code builders like Gumloop/Lindy vs. developer platforms like Pipedream/n8n vs. enterprise-embedded like Salesforce Agentforce), honest coverage of free tiers/options (OpenAI, Google, Microsoft each have agent-building offerings — mention factually, not dismissively), grid linking to the 5 tool pages below. FAQ mirrors the automation tools page's structure: how we pick a platform, can you switch us between platforms, do we need to already own a license, cost variance by platform.

### 14–18. Tool pages (`tools/gumloop.astro`, `tools/lindy.astro`, `tools/pipedream.astro`, `tools/salesforce-agentforce.astro`, `tools/n8n-ai-agent.astro`)
Mirror `ai-automation/tools/n8n.astro` structure exactly: What Is X, Who X Fits, Typical Project With Us Looks Like (discovery → design → build/test → launch/monitor, adapted per platform), X vs. the Alternatives (honest trade-offs against the other 4 tools in this set, cross-linked), Keeping It Reliable After Launch, Use Cases grid (3-6 cards). **Per the confirmed decision above**, keep the "what is this tool" content neutral and factual, but every CTA (hero/mid/final) frames the offer as "we'll build your idea or app using \<Tool>\ for you" — i.e. Lenoo-as-implementer of that specific platform, not Lenoo-as-alternative-to-it.
- **`gumloop.astro`**: no-code AI agent builder — visual, non-technical team fit.
- **`lindy.astro`**: AI agent builder with 4,000+ integrations — breadth-of-integration angle.
- **`pipedream.astro`**: developer/API-focused agent building — code-step flexibility angle, closer to n8n's automation-side positioning.
- **`salesforce-agentforce.astro`**: CRM-embedded agents — for businesses already running Salesforce, agents that live inside existing CRM data/permissions.
- **`n8n-ai-agent.astro`**: **this is the page `ai-automation/tools/n8n.astro:116` already links to.** Content should explicitly position this as the "agent workflows built on n8n" companion to that existing automation page (cross-link back to it), covering agent-specific n8n patterns (LLM nodes making mid-pipeline decisions vs. n8n's automation-only use). Keywords: n8n ai agent (170/mo — by far the single highest-volume keyword in this entire 18-page set), ai agent n8n, ai agent chatgpt.

---

## Hub page edit (`services/ai-agents.astro`)

- Add a mid-page CTA section (the page currently has only hero + final = 2 CTAs; needs a 3rd to match the new standard).
- Add a "More AI Agent Resources" cross-link section after the FAQ (mirroring `ai-automation.astro`'s existing pattern at its own cross-link section), grouped into logical sub-grids rather than one 13-card wall:
  - **By location:** Dubai, Abu Dhabi
  - **By use case:** Real Estate, Voice Agents, Customer Support, Sales & Marketing, Use Cases/Examples
  - **Learn more:** Agencies, Development Process, Templates, vs. Agentic AI, Architecture, Tools We Build With
- Every new subpage links back to `/services/ai-agents` in its breadcrumb.

## Shared infra

- `page-sitemap.xml.ts`: add all 18 new URLs following the exact `ai-automation` block's format (`url`, `lastmod: NOW`, `priority: '0.6'` for subpages / `'0.7'` for the `tools` sub-hub, `changefreq: 'monthly'`, no `arUrl` since English-only).
- `ai-automation/tools/n8n.astro:116`: change `href="/ai-agents/tools/n8n-ai-agent"` to `href="/services/ai-agents/tools/n8n-ai-agent"`.
- No Navbar/Footer changes — confirmed the `ai-automation` subpages aren't individually listed there either; only the top-level "AI Agents" hub entry exists and already points to the right place.

---

## Build order

1. `tools/n8n-ai-agent.astro` first — it's the page an existing live page already links to, so closing that gap earliest reduces the live 404 window.
2. Remaining 4 tool pages + `tools.astro` sub-hub (content-independent, safe to parallelize).
3. `dubai.astro` as the reference implementation for the location/use-case pages, then the remaining 10 top-level pages in parallel.
4. `ai-agents.astro` hub edit — last, once every link target exists.
5. `page-sitemap.xml.ts` + the `n8n.astro` link fix — last, once every URL is final.

## Verification

- `cd astro-site && npm run check && npm run build` after every page and again after the final infra pass.
- Word count check: every page ≥1500 words of visible body content.
- CTA count check: every page has exactly 3 `data-source`-tagged CTA buttons.
- Internal link audit: every href added resolves to a file created in this plan or an existing live page.
- Content-style compliance: no banned AI-sounding words/phrases or unjustified em dashes per root `CLAUDE.md`.

## Self-Review Checklist

- [x] Every page has its own keyword list, section list, and FAQ topics — no "TBD" or "same as page N."
- [x] Dubai/Abu Dhabi carry genuinely different framing, not a city-name swap.
- [x] `for-real-estate.astro` has an explicit differentiation box vs. `ai-automation/real-estate.astro`.
- [x] Tool pages stay neutral on the tool itself, build-for-you framing lives only in the CTAs.
- [x] The dead link in `ai-automation/tools/n8n.astro` is captured as an explicit fix task.
- [x] Every new page links back to the hub, and the hub links forward to every new page.
