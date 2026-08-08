# New Pages Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2-3 relevant images and at least one bespoke interactive element to each of the 40 newly created English pages under `astro-site/src/pages/` (industries, ai-automation location/tool pages, vibe-coding pages), per `docs/superpowers/specs/2026-08-02-new-pages-visual-refresh-design.md`.

**Architecture:** No new shared Astro components. Each page gets its own inline `<style>` block (page-scoped CSS class names, e.g. `.consulting-tab-btn`) and inline `<script>` block for interactivity, following the existing convention already used on `src/pages/ar/industries/retail.astro` (see Task 1 for the reference pattern). Images are additional Unsplash photos matching the existing `?w=800&q=80&auto=format&fit=crop` URL convention already used on these pages.

**Tech Stack:** Astro (`.astro` files, SSR with `prerender = false`), vanilla CSS/JS (no framework, no new npm packages), Unsplash for stock photography.

---

## Progress tracker (updated 2026-08-06)

**Done — Tasks 1-13 of 42, all implemented + spec-reviewed + code-quality-reviewed via subagent-driven-development, committed to `master`:**

| # | Page | Commit(s) |
|---|---|---|
| 1 | industries/consulting.astro (Tabs+StatCounter reference) | `924c71e`, `2670c77` (fix) |
| 2 | services/ai-automation/tools/n8n.astro (CompareToggle reference) | `b9e1737`, `21daa0d` (fix) |
| 3 | services/vibe-coding/tools.astro (Tabs roundup reference) | `30b7e08`, `b31dc01` (fix) |
| 4 | industries/education.astro | `6bcf21f` |
| 5 | industries/finance-banking.astro | `841a213` |
| 6 | industries/healthcare.astro | `fd0ba18` |
| 7 | industries/hr-recruitment.astro | `24e72f5` |
| 8 | industries/insurance.astro | `5b9d96b` |
| 9 | industries/legal.astro (ExpandableCard reference) | `a7b5486`, `67ff3cb` (fix) |
| 10 | industries/manufacturing.astro | `086c5c6`, `a9ada56` (fix) |
| 11 | industries/marketing.astro (hub) | `50c191c` |
| 12 | industries/marketing/analytics-attribution.astro | `db74e38` |
| 13 | industries/marketing/content-writing.astro | `f29b598` |

**Not started — Tasks 14-42 + Final verification** (27 page tasks + final build/typecheck pass remain, see below).

**To resume in a new session:** invoke `superpowers:subagent-driven-development` on this plan file, starting at **Task 14** (`industries/marketing/email-marketing.astro`). All 3 reference patterns (Tabs, CompareToggle, ExpandableCard) are already built and proven on the pages above — point new task implementer prompts at those files as the copy source (e.g. `industries/consulting.astro` for Tabs, `services/ai-automation/tools/n8n.astro` or `industries/education.astro` for CompareToggle, `industries/legal.astro` for ExpandableCard) rather than the plan's inline code blocks alone, since the reviewed/fixed versions are more correct than the plan's first draft (e.g. full ARIA `id`/`aria-controls`/`aria-labelledby` linking was added beyond what the plan snippets show).

**Lessons baked into every task since Task 4** (apply these to Tasks 14+ too):
1. Namespace every new id/class with a page-specific prefix — a generic id (`pricing-heading` in Task 2) collided with identical ids already present on 3 other tool pages.
2. Full ARIA linking is required, not optional (id/aria-controls/aria-labelledby/role, `:focus-visible`, `hidden` on inactive panels).
3. Check the target file for existing images/ids before adding new ones — if a split-media slot already holds real content (stat card or photo), add the new image in a new section instead of duplicating/overwriting (established from Task 8 onward).
4. Keep Unsplash image sourcing FAST: 1-2 search queries, first reasonable real photo, build the URL with both `w=` and `h=` params + `fit=crop` so imgix delivers exact declared dimensions (no manual pixel-checking needed) — one implementer spent ~2 hours over-researching a single image early on; tightening this instruction fixed it.
5. If a Tabs/card split is uneven and reuses a fixed-column grid class, check for desktop layout breakage (orphaned card / sparse row) and add a scoped `#page-panel-x { grid-template-columns:... }` override with a matching mobile-breakpoint reset if needed (established in Task 10, manufacturing.astro).
6. Move existing card copy byte-for-byte when regrouping into tabs/panels — don't rewrite. Use best judgment for ambiguous categorization and note it in the implementer's report.
7. Don't invent statistics in new CompareToggle/section copy — generic plausible industry claims only.
8. The StatCounter script (Task 1) has a suffix-guard fix already applied — copy the CURRENT version from `consulting.astro` or `healthcare.astro`, not the plan's original inline snippet, since the original had a bug with non-alphabetic suffixes like "24/7" or "$150B" (mid-animation glitch). It's normal/expected for some pages' stats to not visually animate at all if all their values have symbol-heavy suffixes — this was reviewed and accepted multiple times, not a bug to keep re-litigating.

---

## Conventions used in every task below

**Image sourcing:** Unsplash photo IDs are not looked up in advance — during execution, search unsplash.com (via WebSearch/WebFetch) for the theme given in each task, pick a landscape photo, and build the URL as `https://images.unsplash.com/photo-<ID>?w=<800 or 1400>&q=80&auto=format&fit=crop`. Always set `loading="lazy"` (or `loading="eager" fetchpriority="high"` only for the first/above-the-fold image on a page), explicit `width`/`height`, and a descriptive `alt` tied to the page topic (not generic "stock photo").

**Interactive element patterns (full code given once, reused with page-specific labels):**

- **Tabs** — pattern already established at `astro-site/src/pages/ar/industries/retail.astro:183-185,552-570,618+`. Reuse this exact shape: `role="tablist"` wrapper, `.{page}-tab-btn` buttons with `data-{page}-tab="key"`, `role="tab"`, `aria-selected`, panels toggled via a `hidden` attribute or `display` swap, `.active` class added/removed in JS, `:focus-visible` outline for accessibility.
- **CompareToggle** — a 2-option version of the same Tabs pattern, styled as a pill switch (`"Manual" / "With AI"` or `"Free" / "Paid"`), swapping two content panels. Full reference implementation in Task 2.
- **StatCounter** — count-up animation for existing `.stat-num` text (e.g. "9.3hrs") using `IntersectionObserver`, implemented per-page (does NOT modify the shared `StatStrip.astro` component, since that component is used outside this batch of 40 pages). Full reference implementation in Task 1.
- **ExpandableCard** — click-to-expand card where a `<button>` toggles a `max-height`/`hidden` panel with an `aria-expanded` attribute. Full reference implementation in Task 8 (legal.astro).

**Verification (same for every task):**
```bash
cd "astro-site" && npm run build
```
Expected: build completes with no errors (SSR pages compile even though `prerender = false`). Then run `npm run dev`, open the page in a browser at `http://localhost:4321/<path>`, and confirm: images load, the interactive element responds to click/keyboard (Tab + Enter/Space), and no console errors.

**Commit:** one commit per page, `git add astro-site/src/pages/<path> && git commit -m "feat(<page>): add images and <element> interactivity"`.

---

## Phase 1: Industries + Marketing (19 pages)

### Task 1: industries/consulting.astro (reference implementation — Tabs + StatCounter)

**Files:**
- Modify: `astro-site/src/pages/industries/consulting.astro`

- [ ] **Step 1: Add a second image band**

Insert before the `<!-- EVALUATION CRITERIA -->` section (after line 150, the closing `</section>` of "WHAT LENOO BUILDS"):

```astro
<div style="position:relative; overflow:hidden; height:280px; margin:0 0 -1px;">
  <img src="https://images.unsplash.com/photo-<ID>?w=1400&q=80&auto=format&fit=crop" alt="Consulting team reviewing a client engagement plan together" loading="lazy" width="1400" height="280" style="width:100%; height:100%; object-fit:cover; object-position:center 35%;" />
  <div style="position:absolute; inset:0; background:linear-gradient(to top,rgba(0,19,32,0.35) 0%,transparent 55%);"></div>
</div>
```
Search theme: "consultants meeting office whiteboard" or "professional services team discussion."

- [ ] **Step 2: Convert the "Key AI Applications" bento grid (lines 152-197) into tabs**

Replace the single `<div class="bento-grid bento-grid-3">...</div>` (6 cards, lines 158-195) with two tab groups. Keep each existing `<div class="card">...</div>` block byte-for-byte (icon, heading, paragraphs) — only regroup them into two panels:

- **Client-Facing** panel: "Proposal Generation" (lines 177-182), "Meeting Intelligence" (170-176), "Research Synthesis" (183-188)
- **Internal Operations** panel: "Internal Knowledge Management AI" (159-164), "Automated Reporting" (165-169), "Resource & Staffing Optimization" (189-194)

```astro
<div class="consulting-tabs" role="tablist" aria-label="Application categories">
  <button type="button" class="consulting-tab-btn active" data-consulting-tab="client" role="tab" aria-selected="true">Client-Facing</button>
  <button type="button" class="consulting-tab-btn" data-consulting-tab="internal" role="tab" aria-selected="false">Internal Operations</button>
</div>
<div class="bento-grid bento-grid-3" data-consulting-tab-panel="client">
  <!-- move the existing "Proposal Generation", "Meeting Intelligence", "Research Synthesis" card divs here, unchanged -->
</div>
<div class="bento-grid bento-grid-3" data-consulting-tab-panel="internal" hidden>
  <!-- move the existing "Internal Knowledge Management AI", "Automated Reporting", "Resource & Staffing Optimization" card divs here, unchanged -->
</div>
```

- [ ] **Step 3: Add the tab CSS** (append to the `<style>` block at the bottom of the file, following the `.eval-grid` rules):

```css
.consulting-tabs { display:flex; gap:0.5rem; justify-content:center; margin-bottom:2rem; flex-wrap:wrap; }
.consulting-tab-btn { padding:0.625rem 1.25rem; border-radius:100px; border:1px solid rgba(0,37,59,0.15); background:#fff; color:#42474e; font-size:0.9rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
.consulting-tab-btn:hover { background:#e7eeff; }
.consulting-tab-btn.active { background:#006875; border-color:#006875; color:#fff; }
.consulting-tab-btn:focus-visible { outline:2px solid #006875; outline-offset:2px; }
```

- [ ] **Step 4: Add the tab-switching script** (append before `</BaseLayout>` or in a `<script>` tag at file end):

```astro
<script>
  const tabWrap = document.querySelector('.consulting-tabs');
  if (tabWrap) {
    const btns = tabWrap.querySelectorAll('.consulting-tab-btn');
    const panels = document.querySelectorAll('[data-consulting-tab-panel]');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-consulting-tab');
        btns.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
        panels.forEach((p) => { p.hidden = p.getAttribute('data-consulting-tab-panel') !== key; });
      });
    });
  }
</script>
```

- [ ] **Step 5: Add the StatCounter animation for the existing `StatStrip` numbers**

```astro
<script>
  function animateStats(container: Element) {
    const nums = container.querySelectorAll('.stat-num');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const match = el.textContent?.match(/^([\d.]+)(.*)$/);
        if (!match) return;
        const [, numStr, suffix] = match;
        const target = parseFloat(numStr);
        const isDecimal = numStr.includes('.');
        let start = 0;
        const duration = 900;
        const startTime = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - startTime) / duration, 1);
          const value = start + (target - start) * progress;
          el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value).toString()) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => obs.observe(n));
  }
  const strip = document.querySelector('.stat-strip');
  if (strip) animateStats(strip);
</script>
```

- [ ] **Step 6: Verify**

Run: `cd "astro-site" && npm run build`
Expected: no errors. Then `npm run dev`, open `/industries/consulting`, confirm the new image renders, the tab buttons switch panels, stat numbers count up on scroll.

- [ ] **Step 7: Commit**

```bash
git add astro-site/src/pages/industries/consulting.astro
git commit -m "feat(consulting): add second image band, tabbed applications, animated stats"
```

### Task 2: services/ai-automation/tools/n8n.astro (reference implementation — CompareToggle)

**Files:**
- Modify: `astro-site/src/pages/services/ai-automation/tools/n8n.astro`

- [ ] **Step 1: Add a hero-adjacent image band** (after the `<header class="hero-section">` closing tag, same pattern as Task 1 Step 1). Search theme: "workflow automation dashboard screen" or "developer building automation workflow."

- [ ] **Step 2: Add a "Free vs Paid" CompareToggle** in place of (or appended after) the existing `getAutomationTool('n8n')` free-tier text. Full markup:

```astro
<section class="section" style="background:#f0f3ff;" aria-labelledby="pricing-heading">
  <div class="container" style="max-width:800px;">
    <h2 id="pricing-heading" style="text-align:center; margin-bottom:1.5rem;">n8n Free vs Paid</h2>
    <div class="n8n-toggle" role="tablist" aria-label="Pricing tier">
      <button type="button" class="n8n-toggle-btn active" data-n8n-tier="free" role="tab" aria-selected="true">Free (Self-Hosted)</button>
      <button type="button" class="n8n-toggle-btn" data-n8n-tier="paid" role="tab" aria-selected="false">Paid (Cloud)</button>
    </div>
    <div class="card" data-n8n-tier-panel="free">
      <p style="color:#42474e; font-size:0.9375rem; line-height:1.8;">Self-host n8n for free with unlimited workflows and executions. You manage the server, updates, and uptime yourself. Good fit for teams with existing DevOps capacity.</p>
    </div>
    <div class="card" data-n8n-tier-panel="paid" hidden>
      <p style="color:#42474e; font-size:0.9375rem; line-height:1.8;">n8n Cloud removes the hosting burden: managed uptime, automatic updates, and built-in execution history. Priced per workflow execution volume, scaling with usage rather than a flat seat fee.</p>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add the toggle CSS**

```css
.n8n-toggle { display:flex; gap:0; justify-content:center; margin-bottom:1.5rem; background:#fff; border-radius:100px; padding:4px; border:1px solid rgba(0,37,59,0.1); max-width:420px; margin-left:auto; margin-right:auto; }
.n8n-toggle-btn { flex:1; padding:0.625rem 1.25rem; border-radius:100px; border:none; background:transparent; color:#42474e; font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
.n8n-toggle-btn.active { background:#006875; color:#fff; }
.n8n-toggle-btn:focus-visible { outline:2px solid #006875; outline-offset:2px; }
```

- [ ] **Step 4: Add the toggle script**

```astro
<script>
  const toggleWrap = document.querySelector('.n8n-toggle');
  if (toggleWrap) {
    const btns = toggleWrap.querySelectorAll('.n8n-toggle-btn');
    const panels = document.querySelectorAll('[data-n8n-tier-panel]');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-n8n-tier');
        btns.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
        panels.forEach((p) => { p.hidden = p.getAttribute('data-n8n-tier-panel') !== key; });
      });
    });
  }
</script>
```

- [ ] **Step 5: Verify** — same as Task 1 Step 6, for `/services/ai-automation/tools/n8n`.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/services/ai-automation/tools/n8n.astro
git commit -m "feat(n8n): add image band and free-vs-paid comparison toggle"
```

### Task 3: services/vibe-coding/tools.astro (reference implementation — Tabs for category roundup)

**Files:**
- Modify: `astro-site/src/pages/services/vibe-coding/tools.astro`

- [ ] **Step 1: Convert the three stacked category sections (Chat-Based, IDE-Integrated, App-Builder) into a single tabbed section.** Wrap the three `<section id="tool-roundup">` / following sections' `.bento-grid-2` blocks as `data-vibe-tab-panel="chat"`, `"ide"`, `"appbuilder"`, add a `.vibe-tabs` button row above them (same CSS/JS shape as Task 1 Step 3-4, renamed to `vibe-tab`).

- [ ] **Step 2: Add one more contextual image** inside each tab panel (3 total, one per category) — e.g. a screenshot-style photo for "IDE-Integrated" (search theme: "code editor screen close up"), a chat-interface-style photo for "Chat-Based" (search theme: "developer typing chat interface laptop"), and a phone/app-style photo for "App-Builder" (search theme: "mobile app prototype screen").

- [ ] **Step 3: Verify** — same pattern, for `/services/vibe-coding/tools`.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/pages/services/vibe-coding/tools.astro
git commit -m "feat(vibe-coding-tools): add tabbed category roundup and per-category images"
```

### Task 4: industries/education.astro

**Files:** Modify `astro-site/src/pages/industries/education.astro`
- [ ] Read the current file first (structure may differ slightly from consulting.astro — confirm before editing).
- [ ] Add 2 images: hero-adjacent band (theme: "students using laptops in classroom") + one split-media image in a mid-page section (theme: "teacher reviewing student data on tablet").
- [ ] Add a CompareToggle: "Manual Admin" vs "With AI" (grading/enrollment/reporting workload), following the exact pattern from Task 2 Steps 2-4, renamed to `.education-toggle` / `data-education-tier`.
- [ ] Verify (Task 1 Step 6 pattern, path `/industries/education`).
- [ ] Commit: `git commit -m "feat(education): add images and manual-vs-AI comparison toggle"`.

### Task 5: industries/finance-banking.astro

**Files:** Modify `astro-site/src/pages/industries/finance-banking.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "financial analyst reviewing dashboard" (hero band) + "bank office team meeting" (split-media).
- [ ] Add Tabs for application categories if the page has a 4+ card grid to split (e.g. "Risk & Compliance" vs "Customer-Facing"), following Task 1 Steps 2-4 pattern renamed `.finance-tab-btn`.
- [ ] Verify at `/industries/finance-banking`.
- [ ] Commit: `git commit -m "feat(finance-banking): add images and tabbed applications"`.

### Task 6: industries/healthcare.astro

**Files:** Modify `astro-site/src/pages/industries/healthcare.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "doctor using tablet in hospital" (hero band) + "hospital reception or clinical team" (split-media).
- [ ] Add StatCounter to the existing stat strip/grid (Task 1 Step 5 pattern) AND Tabs for "Clinical" vs "Administrative" AI applications (Task 1 Steps 2-4 pattern, renamed `.healthcare-tab-btn`).
- [ ] Verify at `/industries/healthcare`.
- [ ] Commit: `git commit -m "feat(healthcare): add images, animated stats, and tabbed applications"`.

### Task 7: industries/hr-recruitment.astro

**Files:** Modify `astro-site/src/pages/industries/hr-recruitment.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "HR interview in office" (hero band) + "team onboarding meeting" (split-media).
- [ ] Add Tabs: "Recruiting" vs "Employee Support" applications (Task 1 pattern, `.hr-tab-btn`).
- [ ] Verify at `/industries/hr-recruitment`.
- [ ] Commit: `git commit -m "feat(hr-recruitment): add images and tabbed applications"`.

### Task 8: industries/insurance.astro

**Files:** Modify `astro-site/src/pages/industries/insurance.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "insurance claims adjuster at desk" (hero band) + "office team reviewing documents" (split-media).
- [ ] Add a CompareToggle: "Manual Claims Processing" vs "With AI" (Task 2 pattern, `.insurance-toggle`).
- [ ] Verify at `/industries/insurance`.
- [ ] Commit: `git commit -m "feat(insurance): add images and manual-vs-AI claims comparison toggle"`.

### Task 9: industries/legal.astro (reference implementation — ExpandableCard)

**Files:** Modify `astro-site/src/pages/industries/legal.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "law office contract review" (hero band) + "lawyer at desk with documents" (split-media).
- [ ] Convert the densest card grid (likely "evaluation criteria" or "applications") into click-to-expand cards:

```astro
<div class="legal-card" data-legal-expand>
  <button type="button" class="legal-card-toggle" aria-expanded="false">
    <h3 style="font-weight:700; font-size:1.0625rem; color:#00253b;">Card Title</h3>
    <span class="legal-card-icon" aria-hidden="true">+</span>
  </button>
  <div class="legal-card-panel" hidden>
    <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">Expanded detail text.</p>
  </div>
</div>
```
```css
.legal-card-toggle { display:flex; justify-content:space-between; align-items:center; width:100%; background:none; border:none; cursor:pointer; text-align:left; padding:0; }
.legal-card-icon { font-size:1.25rem; color:#006875; transition:transform 0.2s; flex-shrink:0; }
.legal-card-toggle[aria-expanded="true"] .legal-card-icon { transform:rotate(45deg); }
.legal-card-toggle:focus-visible { outline:2px solid #006875; outline-offset:2px; }
```
```astro
<script>
  document.querySelectorAll('[data-legal-expand]').forEach((card) => {
    const btn = card.querySelector('.legal-card-toggle');
    const panel = card.querySelector('.legal-card-panel');
    btn?.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
</script>
```
- [ ] Verify at `/industries/legal`.
- [ ] Commit: `git commit -m "feat(legal): add images and expandable evaluation cards"`.

### Task 10: industries/manufacturing.astro

**Files:** Modify `astro-site/src/pages/industries/manufacturing.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "factory floor production line" (hero band) + "quality control inspector" (split-media).
- [ ] Add Tabs: "Production" vs "Supply Chain" applications (Task 1 pattern, `.manufacturing-tab-btn`).
- [ ] Verify at `/industries/manufacturing`.
- [ ] Commit: `git commit -m "feat(manufacturing): add images and tabbed applications"`.

### Task 11: industries/marketing.astro (hub page)

**Files:** Modify `astro-site/src/pages/industries/marketing.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "marketing team reviewing campaign dashboard" (hero band) + "analytics dashboard on screen" (split-media).
- [ ] Convert the list of 10 sub-page links (analytics-attribution, content-writing, etc.) into expandable cards (Task 9 pattern, `.marketing-hub-expand`) showing a one-line teaser per sub-service, expanding to 2-3 lines before the link.
- [ ] Verify at `/industries/marketing`.
- [ ] Commit: `git commit -m "feat(marketing-hub): add images and expandable sub-service cards"`.

### Task 12: industries/marketing/analytics-attribution.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/analytics-attribution.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "analytics dashboard charts on monitor" (hero band) + "marketing analyst reviewing reports" (split-media).
- [ ] Add StatCounter to existing stats (Task 1 Step 5 pattern) and a CompareToggle "Last-Click vs AI Attribution" (Task 2 pattern, `.attribution-toggle`).
- [ ] Verify at `/industries/marketing/analytics-attribution`.
- [ ] Commit: `git commit -m "feat(analytics-attribution): add images, animated stats, and attribution comparison toggle"`.

### Task 13: industries/marketing/content-writing.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/content-writing.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "writer working at desk with laptop" (hero band) + "content calendar planning board" (split-media).
- [ ] Add Tabs: "Blog & SEO Content" vs "Social & Ad Copy" (Task 1 pattern, `.content-tab-btn`).
- [ ] Verify at `/industries/marketing/content-writing`.
- [ ] Commit: `git commit -m "feat(content-writing): add images and tabbed content types"`.

### Task 14: industries/marketing/email-marketing.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/email-marketing.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "email marketing dashboard on laptop" (hero band) + "marketer reviewing campaign metrics" (split-media).
- [ ] Add CompareToggle: "Manual Campaigns" vs "With AI" (Task 2 pattern, `.email-toggle`).
- [ ] Verify at `/industries/marketing/email-marketing`.
- [ ] Commit: `git commit -m "feat(email-marketing): add images and manual-vs-AI comparison toggle"`.

### Task 15: industries/marketing/image-generation.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/image-generation.astro`
- [ ] Read the current file first.
- [ ] Add a 3-image gallery (this page's topic is literally imagery, so lean into it): theme "creative design workspace" — 3 images in a `<div class="image-generation-gallery">` grid (`display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;`), each `<img>` with `loading="lazy"`, click-to-lightbox behavior:

```astro
<div class="ig-gallery">
  <img src="..." alt="..." loading="lazy" width="500" height="375" class="ig-gallery-img" />
  <!-- x3 -->
</div>
<div class="ig-lightbox" hidden><img src="" alt="" /><button type="button" class="ig-lightbox-close" aria-label="Close">&times;</button></div>
```
```css
.ig-gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin:2rem 0; }
.ig-gallery-img { width:100%; height:220px; object-fit:cover; border-radius:16px; cursor:zoom-in; transition:transform 0.2s; }
.ig-gallery-img:hover { transform:scale(1.02); }
.ig-lightbox { position:fixed; inset:0; background:rgba(0,19,32,0.9); display:flex; align-items:center; justify-content:center; z-index:1000; }
.ig-lightbox img { max-width:90vw; max-height:85vh; border-radius:8px; }
.ig-lightbox-close { position:absolute; top:24px; right:32px; background:none; border:none; color:#fff; font-size:2rem; cursor:pointer; }
@media(max-width:700px) { .ig-gallery { grid-template-columns:1fr; } }
```
```astro
<script>
  const gallery = document.querySelector('.ig-gallery');
  const lightbox = document.querySelector('.ig-lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const closeBtn = lightbox?.querySelector('.ig-lightbox-close');
  gallery?.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => {
      if (lightboxImg) { (lightboxImg as HTMLImageElement).src = (img as HTMLImageElement).src; (lightboxImg as HTMLImageElement).alt = (img as HTMLImageElement).alt; }
      if (lightbox) (lightbox as HTMLElement).hidden = false;
    });
  });
  closeBtn?.addEventListener('click', () => { if (lightbox) (lightbox as HTMLElement).hidden = true; });
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) (lightbox as HTMLElement).hidden = true; });
</script>
```
- [ ] Verify at `/industries/marketing/image-generation`.
- [ ] Commit: `git commit -m "feat(image-generation): add image gallery with lightbox"`.

### Task 16: industries/marketing/influencer-marketing.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/influencer-marketing.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "content creator filming with phone" (hero band) + "influencer collaboration meeting" (split-media).
- [ ] Add Tabs: "Micro-Influencer Strategy" vs "Macro-Influencer Strategy" (Task 1 pattern, `.influencer-tab-btn`).
- [ ] Verify at `/industries/marketing/influencer-marketing`.
- [ ] Commit: `git commit -m "feat(influencer-marketing): add images and tabbed strategy sections"`.

### Task 17: industries/marketing/paid-ads.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/paid-ads.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "ad campaign dashboard on screen" (hero band) + "marketing team reviewing ad performance" (split-media).
- [ ] Add StatCounter (Task 1 Step 5 pattern) to existing ROAS/performance stats + CompareToggle "Manual Bid Management" vs "With AI" (Task 2 pattern, `.paidads-toggle`).
- [ ] Verify at `/industries/marketing/paid-ads`.
- [ ] Commit: `git commit -m "feat(paid-ads): add images, animated stats, and bid management comparison toggle"`.

### Task 18: industries/marketing/seo.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/seo.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "SEO analytics dashboard" (hero band) + "content strategist at desk" (split-media).
- [ ] Add Tabs: "Technical SEO" vs "Content SEO" vs "Local SEO" (Task 1 pattern, `.seo-tab-btn`, 3 options).
- [ ] Verify at `/industries/marketing/seo`.
- [ ] Commit: `git commit -m "feat(seo): add images and tabbed SEO categories"`.

### Task 19: industries/marketing/social-media.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/social-media.astro`
- [ ] Read the current file first.
- [ ] Add a 3-image gallery (Task 15 pattern, renamed `.social-gallery`): theme "social media content creation setup."
- [ ] Add Tabs: by platform grouping if content supports it (e.g. "Instagram & TikTok" vs "LinkedIn & X") (Task 1 pattern, `.social-tab-btn`).
- [ ] Verify at `/industries/marketing/social-media`.
- [ ] Commit: `git commit -m "feat(social-media): add image gallery and platform tabs"`.

### Task 20: industries/marketing/video-generation.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/video-generation.astro`
- [ ] Read the current file first.
- [ ] Add a 3-image gallery (Task 15 pattern, renamed `.video-gallery`): theme "video editing workspace with monitors."
- [ ] Add ExpandableCard (Task 9 pattern, `.video-expand`) for the applications/evaluation grid.
- [ ] Verify at `/industries/marketing/video-generation`.
- [ ] Commit: `git commit -m "feat(video-generation): add image gallery and expandable cards"`.

### Task 21: industries/marketing/voice-generation.astro

**Files:** Modify `astro-site/src/pages/industries/marketing/voice-generation.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "podcast recording studio microphone" (hero band) + "audio editing on laptop" (split-media).
- [ ] Add CompareToggle: "Human Voiceover" vs "AI Voice" (Task 2 pattern, `.voice-toggle`).
- [ ] Verify at `/industries/marketing/voice-generation`.
- [ ] Commit: `git commit -m "feat(voice-generation): add images and human-vs-AI voice comparison toggle"`.

---

## Phase 2: AI Automation location/audience + tool pages (16 pages)

### Task 22: services/ai-automation/abu-dhabi.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/abu-dhabi.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "Abu Dhabi office skyline" (hero band) + "business team meeting UAE office" (split-media).
- [ ] Add CompareToggle: "Manual Process" vs "With AI Automation" (Task 2 pattern, `.abudhabi-toggle`).
- [ ] Verify at `/services/ai-automation/abu-dhabi`.
- [ ] Commit: `git commit -m "feat(ai-automation-abu-dhabi): add images and comparison toggle"`.

### Task 23: services/ai-automation/accounting.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/accounting.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "accountant reviewing invoices at desk" (hero band) + "bookkeeping software on laptop" (split-media).
- [ ] Add CompareToggle: "Manual Bookkeeping" vs "With AI Automation" (Task 2 pattern, `.accounting-toggle`).
- [ ] Verify at `/services/ai-automation/accounting`.
- [ ] Commit: `git commit -m "feat(ai-automation-accounting): add images and comparison toggle"`.

### Task 24: services/ai-automation/agencies.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/agencies.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "creative agency team collaborating" (hero band) + "agency office workspace" (split-media).
- [ ] Add Tabs: "Client Operations" vs "Internal Operations" (Task 1 pattern, `.agencies-tab-btn`).
- [ ] Verify at `/services/ai-automation/agencies`.
- [ ] Commit: `git commit -m "feat(ai-automation-agencies): add images and tabbed operations"`.

### Task 25: services/ai-automation/business.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/business.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "business team strategy meeting" (hero band) + "office workspace collaboration" (split-media).
- [ ] Add Tabs: "Sales & Ops" vs "Support" applications (Task 1 pattern, `.business-tab-btn`).
- [ ] Verify at `/services/ai-automation/business`.
- [ ] Commit: `git commit -m "feat(ai-automation-business): add images and tabbed applications"`.

### Task 26: services/ai-automation/dubai.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/dubai.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "Dubai office skyline" (hero band) + "business team meeting UAE office" (split-media).
- [ ] Add CompareToggle: "Manual Process" vs "With AI Automation" (Task 2 pattern, `.dubai-toggle`).
- [ ] Verify at `/services/ai-automation/dubai`.
- [ ] Commit: `git commit -m "feat(ai-automation-dubai): add images and comparison toggle"`.

### Task 27: services/ai-automation/real-estate.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/real-estate.astro` (note: this file already has minor uncommitted changes per `git status` — read it first to see current state before adding on top).
- [ ] Read the current file first.
- [ ] Add 2 images: theme "real estate agent showing property" (hero band) + "property listing on tablet" (split-media).
- [ ] Add Tabs: "Leasing" vs "Property Management" (Task 1 pattern, `.realestate-tab-btn`).
- [ ] Verify at `/services/ai-automation/real-estate`.
- [ ] Commit: `git commit -m "feat(ai-automation-real-estate): add images and tabbed applications"`.

### Task 28: services/ai-automation/tools.astro (hub page)

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools.astro`
- [ ] Read the current file first (likely a roundup page similar to `services/vibe-coding/tools.astro`).
- [ ] Add 1 hero-adjacent image band: theme "automation workflow diagram on screen."
- [ ] Convert tool category groupings (if stacked) into Tabs (Task 1 pattern, `.automation-tools-tab-btn`), following the reference established in Task 3.
- [ ] Verify at `/services/ai-automation/tools`.
- [ ] Commit: `git commit -m "feat(ai-automation-tools-hub): add image and tabbed tool categories"`.

### Task 29: services/ai-automation/tools/automation-anywhere.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/automation-anywhere.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band (Task 2 Step 1 pattern): theme "RPA robotic process automation dashboard."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 Steps 2-4 pattern verbatim, renamed `.aa-toggle` / `data-aa-tier`), adapting copy to Automation Anywhere's actual free/paid tier facts already in the page content.
- [ ] Verify at `/services/ai-automation/tools/automation-anywhere`.
- [ ] Commit: `git commit -m "feat(automation-anywhere): add image and free-vs-paid comparison toggle"`.

### Task 30: services/ai-automation/tools/boomi.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/boomi.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "integration platform dashboard screen."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.boomi-toggle`).
- [ ] Verify at `/services/ai-automation/tools/boomi`.
- [ ] Commit: `git commit -m "feat(boomi): add image and free-vs-paid comparison toggle"`.

### Task 31: services/ai-automation/tools/make.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/make.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "visual workflow builder screen."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.make-toggle`).
- [ ] Verify at `/services/ai-automation/tools/make`.
- [ ] Commit: `git commit -m "feat(make): add image and free-vs-paid comparison toggle"`.

### Task 32: services/ai-automation/tools/mulesoft.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/mulesoft.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "enterprise API integration dashboard."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.mulesoft-toggle`).
- [ ] Verify at `/services/ai-automation/tools/mulesoft`.
- [ ] Commit: `git commit -m "feat(mulesoft): add image and free-vs-paid comparison toggle"`.

### Task 33: services/ai-automation/tools/n8n.astro

Already completed in Task 2 (reference implementation).

### Task 34: services/ai-automation/tools/power-automate.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/power-automate.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "Microsoft office workflow automation screen."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.powerautomate-toggle`).
- [ ] Verify at `/services/ai-automation/tools/power-automate`.
- [ ] Commit: `git commit -m "feat(power-automate): add image and free-vs-paid comparison toggle"`.

### Task 35: services/ai-automation/tools/uipath.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/uipath.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "RPA software robot automation office."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.uipath-toggle`).
- [ ] Verify at `/services/ai-automation/tools/uipath`.
- [ ] Commit: `git commit -m "feat(uipath): add image and free-vs-paid comparison toggle"`.

### Task 36: services/ai-automation/tools/workato.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/workato.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "workflow automation integration screen."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.workato-toggle`).
- [ ] Verify at `/services/ai-automation/tools/workato`.
- [ ] Commit: `git commit -m "feat(workato): add image and free-vs-paid comparison toggle"`.

### Task 37: services/ai-automation/tools/zapier.astro

**Files:** Modify `astro-site/src/pages/services/ai-automation/tools/zapier.astro`
- [ ] Read the current file first.
- [ ] Add hero-adjacent image band: theme "apps connecting automation visual."
- [ ] Add CompareToggle "Free vs Paid" (Task 2 pattern, `.zapier-toggle`).
- [ ] Verify at `/services/ai-automation/tools/zapier`.
- [ ] Commit: `git commit -m "feat(zapier): add image and free-vs-paid comparison toggle"`.

---

## Phase 3: Vibe Coding (5 pages)

### Task 38: services/vibe-coding/beginners.astro

**Files:** Modify `astro-site/src/pages/services/vibe-coding/beginners.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "beginner coding on laptop at home" (hero band) + "person learning to code tutorial" (split-media).
- [ ] Add ExpandableCard (Task 9 pattern, `.beginners-expand`) for the getting-started steps or tool comparison section.
- [ ] Verify at `/services/vibe-coding/beginners`.
- [ ] Commit: `git commit -m "feat(vibe-coding-beginners): add images and expandable cards"`.

### Task 39: services/vibe-coding/game-development.astro

**Files:** Modify `astro-site/src/pages/services/vibe-coding/game-development.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "game development screen code" (hero band) + "game design prototype on monitor" (split-media).
- [ ] Add Tabs: "2D Tools" vs "3D Tools" vs "No-Code Tools" (Task 1 pattern, `.gamedev-tab-btn`).
- [ ] Verify at `/services/vibe-coding/game-development`.
- [ ] Commit: `git commit -m "feat(vibe-coding-game-dev): add images and tabbed tool categories"`.

### Task 40: services/vibe-coding/risks-and-limitations.astro

**Files:** Modify `astro-site/src/pages/services/vibe-coding/risks-and-limitations.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "code review on screen close up" (hero band) + "developer debugging code" (split-media).
- [ ] Add ExpandableCard (Task 9 pattern, `.risks-expand`) for each risk category.
- [ ] Verify at `/services/vibe-coding/risks-and-limitations`.
- [ ] Commit: `git commit -m "feat(vibe-coding-risks): add images and expandable risk cards"`.

### Task 41: services/vibe-coding/tools.astro

Already completed in Task 3 (reference implementation).

### Task 42: services/vibe-coding/vs-traditional-coding.astro

**Files:** Modify `astro-site/src/pages/services/vibe-coding/vs-traditional-coding.astro`
- [ ] Read the current file first.
- [ ] Add 2 images: theme "side by side coding styles comparison" (hero band) + "traditional software development team" (split-media).
- [ ] Add CompareToggle: "Traditional Coding" vs "Vibe Coding" (Task 2 pattern, `.vscoding-toggle`) — this page's own topic maps directly onto the toggle metaphor.
- [ ] Verify at `/services/vibe-coding/vs-traditional-coding`.
- [ ] Commit: `git commit -m "feat(vibe-coding-vs-traditional): add images and traditional-vs-vibe comparison toggle"`.

---

## Final Task: Full-batch verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**
```bash
cd "astro-site" && npm run build
```
Expected: no errors across all 40 modified pages.

- [ ] **Step 2: Type check**
```bash
cd "astro-site" && npm run check
```
Expected: no new type errors introduced.

- [ ] **Step 3: Spot-check in browser**
Run `npm run dev`, visit at least one page per interactive-element type (Tabs, CompareToggle, ExpandableCard, Gallery, StatCounter) and confirm click + keyboard (Tab/Enter) both work, no console errors.

- [ ] **Step 4: Final commit** (only if any cleanup/fixes were needed during verification)
```bash
git add astro-site/src/pages
git commit -m "fix: address issues found in full-batch verification"
```
