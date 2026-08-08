# AI Training Hub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/services/ai-training` into a hub linking to 10 role/function pages, 1 vertical page (teachers), and an `/services/ai-training-courses` sub-hub with Dubai and Abu Dhabi location pages — replacing the noisy bare "ai training" keyword targeting with buyer-qualified, filtered keywords (see `.claude/skills/keyword-triage/SKILL.md` for how these keywords were sorted from three raw exports).

**Architecture:** 13 new Astro pages under `astro-site/src/pages/services/`, flat URL convention consistent with every existing page in that directory (no nesting exists anywhere in the codebase today — confirmed by directory scan). Each new page reuses `BaseLayout`, `FaqAccordion`, `StatStrip` exactly as `ai-training.astro` already does. The hub page (`ai-training.astro`) gets edited last, once every page it needs to link to actually exists.

**Tech Stack:** Astro (`.astro` files), existing components in `astro-site/src/components/`, existing layout `astro-site/src/layouts/BaseLayout.astro`. Verification: `npm run check` (astro check) and `npm run build` from `astro-site/`. No unit tests apply — these are static marketing/content pages, not testable logic; verification is "does it type-check and build," not TDD red/green.

**Reference context:** `seo-keyword-structure.html` (page-type mapping, geo tiers, scoring), `uae-ai-content-plan.html` (existing 70-article content plan, don't duplicate), `.claude/skills/keyword-triage/SKILL.md` (how to triage any further keyword batches before adding more pages).

**Confirmed decisions (do not re-litigate):**
- URL pattern: flat, e.g. `/services/ai-training-hr`, `/services/ai-training-courses-dubai` — matches codebase convention.
- English only, no Arabic mirrors in this pass.
- "AI Training Courses" (not bare "AI Courses") anchors the courses sub-hub — keeps corporate/private-workshop framing explicit; "ai courses" phrase still worked into body copy/meta for the search variant.
- Doctors/nurses vertical: explicitly NOT in scope for this plan.
- Each role page gets a full dedicated page (user overrode the "fold into hub section" recommendation) — must carry genuinely distinct content per page, not a templated swap, or it risks duplicate-content treatment.

---

## File Structure

| File | Responsibility |
|---|---|
| `astro-site/src/pages/services/ai-training-courses.astro` | New sub-hub: course/workshop format, private-not-open-enrollment framing, links to Dubai/Abu Dhabi |
| `astro-site/src/pages/services/ai-training-courses-dubai.astro` | Dubai location page: AED pricing anchor, Dubai private-sector/free-zone framing |
| `astro-site/src/pages/services/ai-training-courses-abu-dhabi.astro` | Abu Dhabi location page: government/semi-government/ADGM framing, distinct from Dubai |
| `astro-site/src/pages/services/ai-training-hr.astro` | Role page: HR |
| `astro-site/src/pages/services/ai-training-managers.astro` | Role page: managers/leaders |
| `astro-site/src/pages/services/ai-training-finance.astro` | Role page: finance |
| `astro-site/src/pages/services/ai-training-sales.astro` | Role page: sales |
| `astro-site/src/pages/services/ai-training-marketing.astro` | Role page: marketing |
| `astro-site/src/pages/services/ai-training-procurement.astro` | Role page: procurement |
| `astro-site/src/pages/services/ai-training-supply-chain.astro` | Role page: supply chain |
| `astro-site/src/pages/services/ai-training-manufacturing.astro` | Role page: manufacturing |
| `astro-site/src/pages/services/ai-training-internal-audit.astro` | Role page: internal audit |
| `astro-site/src/pages/services/ai-training-quality-assurance.astro` | Role page: quality assurance |
| `astro-site/src/pages/services/ai-training-teachers.astro` | Vertical page: teachers/education |
| `astro-site/src/pages/services/ai-training.astro` | Modify: trim role bento to teaser+links, add "explore by role" grid, add courses-page link, expand FAQ |

---

## Repeatable page skeleton (used by every role/vertical/location task below)

Every new page follows `ai-training.astro`'s existing pattern: import `BaseLayout`, `FaqAccordion`, `StatStrip`; hero with breadcrumb (Home / Services / AI Training / [Page]); body sections; FAQ section using `FaqAccordion`; final CTA section identical in structure to the hub's (`openModal(this)` button, `data-source="training_<page>"`); `Service` + `BreadcrumbList` JSON-LD block matching the hub's pattern with this page's own `url`, `name`, `description`.

```astro
---
export const prerender = false;
import BaseLayout from "../../layouts/BaseLayout.astro";
import FaqAccordion from "../../components/FaqAccordion.astro";

const faqItems = [
  { question: "...", answer: "..." },
];
const faqLdJson = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((f) => ({
    '@type': 'Question', name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
---
<BaseLayout
  title="<exact title>"
  description="<exact meta description>"
  canonicalPath="/services/<slug>"
  ldJson={[faqLdJson]}
>
  <!-- hero, body sections, FAQ, CTA per task spec below -->
</BaseLayout>
```

---

## Task 1: AI Training Courses sub-hub

**Files:**
- Create: `astro-site/src/pages/services/ai-training-courses.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1 / primary keyword:** "AI Training Courses in the UAE" (works "AI courses" naturally into subhead/meta, not the H1)
- **Meta title:** "AI Training Courses for UAE Teams | Lenoo AI"
- **Meta description:** mention private group training, Dubai and Abu Dhabi, on-site/remote.
- **Opening section (critical):** state explicitly and early that this is private group training delivered to one company's team, not an open-enrollment public class — this is the line that prevents the individual-learner mismatch flagged during keyword triage.
- **Format section:** group size, duration options, on-site vs remote vs hybrid — pull from the existing `ai-training.astro` programs section (Foundations/Managers/Power User/Industry-Specific) and reframe as "course" scheduling options rather than re-describing the programs from scratch.
- **Location cards:** two cards linking to `/services/ai-training-courses-dubai` and `/services/ai-training-courses-abu-dhabi`.
- **FAQ (3-4 items):** "Is this an open course I can join individually, or private for my company?" (answer: private only), "Can you run a course in Dubai and Abu Dhabi both?", "How many people can attend?", "Do you offer AI training as a service on a recurring basis?"
- **CTA:** "Request Course Dates" button, `data-source="training_courses_hub"`.
- Link back to `/services/ai-training` in the breadcrumb and one contextual body link.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`
Expected: no new type/template errors.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-courses.astro
git commit -m "feat: add AI Training Courses sub-hub page"
```

---

## Task 2: Dubai course location page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-courses-dubai.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training Courses in Dubai"
- **Keywords covered:** ai training course dubai, ai training courses in dubai, ai training in dubai, ai training dubai, ai training courses dubai
- **Framing:** private-sector / free-zone SME angle (DIFC, DMCC-type audience) — distinct from Abu Dhabi's government angle in Task 3.
- **Required local substance (per keyword-triage skill's duplicate-content rule):** an AED pricing anchor or range, a stated on-site delivery radius across Dubai, and — if available — one named local outcome/client type. If no real client example exists yet, use a realistic scenario framed honestly as an example, not a fabricated testimonial.
- **Body sections:** why Dubai teams need this (reuse the hub's "why training matters" argument, don't rewrite from zero, but keep it shorter — this page should defer to the hub for the general argument and focus on the Dubai-specific delivery details), delivery logistics, program options recap (link to `/services/ai-training-courses` for full format details rather than repeating).
- **FAQ (2-3 Dubai-specific items):** "Do you deliver on-site anywhere in Dubai?", "What does an AI training course cost in Dubai?" (give a real range or defer honestly to "request a quote"), one more relevant to local logistics.
- **CTA:** `data-source="training_dubai"`.
- Links: back to `/services/ai-training-courses` and `/services/ai-training`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-courses-dubai.astro
git commit -m "feat: add Dubai AI training courses location page"
```

---

## Task 3: Abu Dhabi course location page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-courses-abu-dhabi.astro`

- [ ] **Step 1: Write the page**

Content spec: same structure as Task 2, but:
- **H1:** "AI Training Courses in Abu Dhabi"
- **Keywords covered:** ai training courses abu dhabi
- **Framing:** government / semi-government / ADGM-adjacent audience — must read as genuinely different copy from the Dubai page, not the Dubai page with the city name swapped (this is the specific duplicate-content risk called out in the plan header and in `.claude/skills/keyword-triage/SKILL.md`).
- **Required local substance:** AED pricing anchor, Abu Dhabi delivery radius, one named local outcome/client type if available.
- **CTA:** `data-source="training_abu_dhabi"`.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-courses-abu-dhabi.astro
git commit -m "feat: add Abu Dhabi AI training courses location page"
```

---

## Task 4: HR role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-hr.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for HR Teams"
- **Keywords:** ai training for hr, ai training for hr professionals, ai training course for hr
- **Why this role:** HR workload pain points specific to UAE hiring volume (high CV volume, bilingual job postings, compliance-sensitive comms).
- **What they learn (5-6 items, expand beyond the hub's existing 3 HR bullets):** job descriptions matched to UAE market tone, CV screening against criteria with reviewable reasoning, structured interview question sets, internal announcement drafting, onboarding document drafting, policy/FAQ drafting for staff AI questions.
- **Program fit:** note this typically sits inside "AI Foundations" for general HR staff or "Industry-Specific Program" if the whole HR function wants a deeper build-out.
- **FAQ (2-3 HR-specific):** "Does this cover using AI safely with candidate personal data?", "Can this be combined with our applicant tracking system workflows?".
- **CTA:** `data-source="training_hr"`.
- Internal links: back to hub, to Managers page and to Teachers page (adjacent people-function roles).

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-hr.astro
git commit -m "feat: add AI training for HR role page"
```

---

## Task 5: Managers/leaders role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-managers.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Managers and Leaders"
- **Keywords:** ai training for leaders, ai training courses for leaders, ai training for it leaders, ai training course for managers
- **Source content:** the hub already has a full "AI for Managers" program card (managing AI-augmented teams, tool selection framework, measuring AI ROI, change management) — expand each of those four bullets into a real paragraph here rather than inventing new content.
- **What they learn:** managing AI-augmented teams, tool selection framework, measuring AI ROI, leading change management, IT-leader-specific angle (vendor evaluation, security/compliance oversight of AI tool rollouts).
- **FAQ (2-3):** "How is this different from the AI Foundations program?", "Can managers and their teams attend together or should this be separate?".
- **CTA:** `data-source="training_managers"`.
- Internal links: back to hub, to HR page, to Internal Audit page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-managers.astro
git commit -m "feat: add AI training for managers/leaders role page"
```

---

## Task 6: Finance role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-finance.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Finance Professionals"
- **Keywords:** ai training for finance professionals
- **What they learn:** reporting automation (turning exported ledgers/spreadsheets into structured summaries — mirror the hub's Operations "messy data to clean reports" bullet but finance-specific), forecasting support drafts, reconciliation assistance, VAT/compliance-adjacent document drafting (informational only, not tax advice — state that explicitly).
- **Trust note (important, must be explicit on this page):** address AI use with sensitive financial data directly — what the training does and doesn't cover regarding data handling.
- **FAQ (2-3):** "Does this cover using AI with sensitive financial data safely?", "Is this only for the finance team or does it work for solo bookkeepers too?".
- **CTA:** `data-source="training_finance"`.
- Internal links: back to hub, to Procurement page, to Internal Audit page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-finance.astro
git commit -m "feat: add AI training for finance role page"
```

---

## Task 7: Sales role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-sales.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Sales Teams"
- **Keywords:** ai training for sales teams, sales ai training, ai training for sales and marketing
- **Source content:** hub already has full Sales role bullets (prospect research, follow-ups in your own voice, deal review prep) — expand each into a real paragraph.
- **What they learn:** add 2-3 beyond the existing three — e.g. objection-handling prep, proposal drafting, CRM note summarization.
- **FAQ (2-3):** "Will this help with WhatsApp-based sales conversations common in the UAE market?", "Can this be combined with a lead qualification AI agent your team already builds?" (cross-sell link to `/services/ai-agents` or the relevant automation service page).
- **CTA:** `data-source="training_sales"`.
- Internal links: back to hub, to Marketing page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-sales.astro
git commit -m "feat: add AI training for sales role page"
```

---

## Task 8: Marketing role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-marketing.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Marketing Teams"
- **Keywords:** ai training for marketing
- **Source content:** hub already has full Marketing role bullets (campaign variants at speed, content repurposing, brief-to-first-draft) — expand each.
- **What they learn:** add bilingual (English/Arabic) campaign drafting explicitly, since the hub copy already mentions "in English and Arabic" for this role.
- **FAQ (2-3):** "Does this cover Arabic content generation, not just English?", "Can this be run as a joint session with the sales team?".
- **CTA:** `data-source="training_marketing"`.
- Internal links: back to hub, to Sales page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-marketing.astro
git commit -m "feat: add AI training for marketing role page"
```

---

## Task 9: Procurement role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-procurement.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Procurement Teams"
- **Keywords:** procurement ai training
- **What they learn:** RFQ/quote comparison drafting, supplier communication drafting, spend-pattern summarization, contract term comparison drafting (informational support, not legal advice — state explicitly).
- **FAQ (2-3):** "Can this help with supplier communication in multiple languages?", "Does this integrate with our existing procurement software workflows?".
- **CTA:** `data-source="training_procurement"`.
- Internal links: back to hub, to Supply Chain page, to Finance page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-procurement.astro
git commit -m "feat: add AI training for procurement role page"
```

---

## Task 10: Supply chain role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-supply-chain.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Supply Chain Teams"
- **Keywords:** ai training for supply chain management
- **What they learn:** shipment status summarization, exception/delay communication drafting, demand-pattern summary reports, supplier/carrier follow-up drafting.
- **FAQ (2-3):** "Does this work for logistics teams handling multiple carriers?", "How does this relate to a shipment-status AI agent vs staff training?" (cross-sell link to the logistics industry page).
- **CTA:** `data-source="training_supply_chain"`.
- Internal links: back to hub, to Procurement page, to Manufacturing page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-supply-chain.astro
git commit -m "feat: add AI training for supply chain role page"
```

---

## Task 11: Manufacturing role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-manufacturing.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Manufacturing Teams"
- **Keywords:** ai training for manufacturing
- **Scope note (must be explicit):** this covers back-office/admin AI use (order status, quote prep, supplier docs), not shop-floor/production-line AI — keep the claim honest and consistent with how the existing content plan positions the Manufacturing industry vertical.
- **What they learn:** RFQ intake and quote prep drafting, supplier communication, order-status query handling, quality/certificate documentation drafting.
- **FAQ (2-3):** "Does this cover production-line automation?" (answer: no, this is back-office/admin training — link to the relevant automation service page for production-adjacent automation), "Can this be delivered in Arabic and English for a mixed-language workforce?".
- **CTA:** `data-source="training_manufacturing"`.
- Internal links: back to hub, to Supply Chain page, to Quality Assurance page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-manufacturing.astro
git commit -m "feat: add AI training for manufacturing role page"
```

---

## Task 12: Internal audit role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-internal-audit.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Internal Auditors"
- **Keywords:** ai training for internal auditors
- **What they learn:** control-testing documentation drafting, evidence summarization, risk narrative drafting, audit finding write-up support.
- **Trust note (explicit):** clarify AI drafts support the auditor's work, it doesn't replace professional judgment or sign-off.
- **FAQ (2-3):** "Does this replace our audit methodology or just speed up documentation?", "How does this handle confidential audit data?".
- **CTA:** `data-source="training_internal_audit"`.
- Internal links: back to hub, to Finance page, to Quality Assurance page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-internal-audit.astro
git commit -m "feat: add AI training for internal audit role page"
```

---

## Task 13: Quality assurance role page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-quality-assurance.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Quality Assurance Teams"
- **Keywords:** ai training for quality assurance
- **What they learn:** test case drafting support, defect report summarization, documentation consistency checks, checklist/SOP drafting from process walkthroughs (mirror the hub's existing Operations "SOPs from walkthroughs" bullet, QA-specific framing).
- **FAQ (2-3):** "Does this work for both software QA and physical product QA teams?", "Can this integrate with our existing QA/defect tracking tools?".
- **CTA:** `data-source="training_qa"`.
- Internal links: back to hub, to Manufacturing page, to Internal Audit page.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-quality-assurance.astro
git commit -m "feat: add AI training for quality assurance role page"
```

---

## Task 14: Teachers vertical page

**Files:**
- Create: `astro-site/src/pages/services/ai-training-teachers.astro`

- [ ] **Step 1: Write the page**

Content spec:
- **H1:** "AI Training for Teachers"
- **Keywords:** ai training for teachers
- **Framing:** vertical/industry page (like the hub's existing "Industry-Specific Program" examples — hotel staff, retail teams, logistics teams), not a generic role page.
- **What they learn:** lesson planning support, grading/feedback assistance drafting, differentiated materials for mixed-ability classes, parent-communication drafting, AI-safety awareness for classroom use (student data handling, appropriate use boundaries).
- **Program fit:** "Industry-Specific Program," available in Arabic and English per the hub's existing custom-program description.
- **FAQ (2-3):** "Is this training for teachers, or for school administrators too?", "Does this cover AI safety guidance we can pass on to students?".
- **CTA:** `data-source="training_teachers"`.
- Internal links: back to hub. Cross-link to the content plan's planned "AI for Schools" article (#30) once published — leave a comment noting the link target if that article doesn't exist yet at implementation time.

- [ ] **Step 2: Verify**

Run: `cd astro-site && npm run check`

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/services/ai-training-teachers.astro
git commit -m "feat: add AI training for teachers vertical page"
```

---

## Task 15: Edit the hub page

**Files:**
- Modify: `astro-site/src/pages/services/ai-training.astro`

- [ ] **Step 1: Trim the "What Each Role Actually Learns" bento grid**

Locate the section at `astro-site/src/pages/services/ai-training.astro:233-267` (`<!-- ── WHAT EACH ROLE ACTUALLY LEARNS ── -->`). Reduce each of the 4 existing `value-card` blocks (Sales, Operations, HR, Marketing) from 3 full `role-item` bullets down to 1-2 short teaser lines, and add a link at the bottom of each card to its new dedicated page (`/services/ai-training-sales`, `/services/ai-training-hr`, `/services/ai-training-marketing`; Operations doesn't have a dedicated page in this plan, leave it as-is or point it to the closest match if one exists).

- [ ] **Step 2: Add "Explore by Role" section**

Insert a new section after the trimmed role grid: a card grid linking to all 10 role pages plus the Teachers page, each with a one-line hook (reuse the "what they learn" opening line from each page's spec above).

- [ ] **Step 3: Add AI Training Courses link**

Add a card or CTA line pointing to `/services/ai-training-courses`, positioned near the existing Programs section since it's a format/location variant of the same offer.

- [ ] **Step 4: Expand the FAQ**

Add to the `fallbackFaqs` array (`astro-site/src/pages/services/ai-training.astro:9-17`) these entries, matching the existing object shape (`{ question, answer }`):
- "Do you offer AI training as a service on an ongoing basis?"
- "Is this AI training for corporates only, or can smaller businesses book it too?"
- "Do participants get a certificate of completion?"
- "How long does an AI training program take?"
- "What does AI training cost for a team our size?"

Write real 2-4 sentence answers for each, consistent in tone with the existing 7 FAQ entries already in that array.

- [ ] **Step 5: Verify**

Run: `cd astro-site && npm run check && npm run build`
Expected: build succeeds, no broken internal links (spot-check each new href resolves to a file created in Tasks 1-14).

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/services/ai-training.astro
git commit -m "feat: turn AI training page into a hub linking to role, vertical, and course pages"
```

---

## Self-Review Checklist (run before starting execution)

- [ ] Every keyword from the three triaged keyword-dump rounds that was marked "keep" or "build it" has a task above. (Cross-check against the final master list from the conversation this plan was written in, or re-derive with `.claude/skills/keyword-triage/SKILL.md` if starting fresh.)
- [ ] No task says "TBD" or "similar to Task N" without repeating the actual spec — confirmed, each task has its own keyword list, section list, and FAQ questions written out.
- [ ] Dubai and Abu Dhabi pages (Tasks 2-3) have explicitly different framing angles, not just city-name swaps — confirmed in each task's content spec.
- [ ] Every new page links back to the hub, and the hub (Task 15) links forward to every new page — confirmed via Task 15 Steps 1-3.
