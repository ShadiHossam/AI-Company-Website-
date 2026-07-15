# Phase 2b: Shared ProcessSteps Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the duplicated 4-step "how it works" process grid (identical markup and CSS across 10 services pages) into one `ProcessSteps.astro` component.

**Architecture:** Confirmed by reading all 10 files directly: the `.process-grid`/`.process-connector`/`.process-step`/`.process-circle` CSS is byte-identical across all 10 (verified via `md5` hash comparison; `custom-ai-development.astro` differs only in using 4-space indentation, same content), and every file has exactly 4 `.process-step` children. The component is scoped to just the grid (icon/step-label/title/description repeated 4×), not the surrounding `<section>`/heading, because — same finding as the FaqAccordion sub-phase — the wrapper varies per page: some sections have `style="background:#e7eeff;"`, others don't, and the heading `id` varies between `how-heading` and `process-heading`. Changing that wrapper would be an unintended visual change, so it stays in each page.

**Data shape decision:** Unlike the FAQ accordion (which already read from a `faqItems` array variable), each page's 4 process steps are currently hardcoded directly as JSX-like markup, not a data array. Migrating means introducing a `const processSteps = [...]` array literal in each page's frontmatter (built from that page's actual 4 steps) and passing it to `<ProcessSteps steps={processSteps} />`. **Escaping note:** step titles that contain `&amp;` in the current HTML (e.g. `Build &amp; Connect`) must become a plain `&` in the new JS string literal (e.g. `"Build & Connect"`) — `&amp;` is HTML entity escaping that doesn't apply inside a JS string, and copying it literally would render a visible `&amp;` on the page instead of `&`.

**Responsive behavior:** Each page currently has a combined `@media(max-width:900px) { .builds-grid {...} .process-grid {...} .process-connector {...} ... }` rule mixing multiple unrelated classes on one line. Rather than risk breaking that line by surgically extracting just the `.process-grid`/`.process-connector` fragments (error-prone across 10 files with slightly different combined rules), this plan leaves those lines completely untouched and puts the responsive behavior inside the new component's own `<style>` block instead. Since Astro scopes each file's CSS independently and the process-grid markup will no longer exist in the page's own template after migration, the leftover `.process-grid`/`.process-connector` references inside each page's combined media-query line become harmless dead CSS (same accepted pattern as the orphaned `.team-photo-row` CSS found and accepted in Phase 1) — the line's *other* class references (`.builds-grid`, `.stat-strip`, etc.) remain live and necessary, so the line itself must not be deleted.

**Tech Stack:** Astro 7 component, scoped `<style>`, no client JS (static grid, no interactivity).

**Verification for every step:** no test framework for page/component markup — verification is `grep` to confirm old markup is gone, `cd astro-site && npm run build` succeeding, and a `npm run dev` spot-check. Use `npm run build`/`npm run dev` (npm scripts), not `npx` (not on PATH in this environment per prior task notes) — use `astro-site/node_modules/.bin/astro` directly if a raw Astro CLI call is ever needed.

---

### Task 1: Create the `ProcessSteps.astro` component

**Files:**
- Create: `astro-site/src/components/ProcessSteps.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Step {
  icon: string;
  step: string;
  title: string;
  description: string;
}

interface Props {
  steps: Step[];
}

const { steps } = Astro.props;
---

<div class="process-grid">
  <div class="process-connector"></div>
  {steps.map((s) => (
    <div class="process-step">
      <div class="process-circle">
        <span class="material-symbols-outlined" style="color:#00e3fd; font-size:22px;">{s.icon}</span>
      </div>
      <span style="color:#006875; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">{s.step}</span>
      <h3 style="font-weight:700; font-size:0.9375rem; color:#00253b; margin-bottom:4px;">{s.title}</h3>
      <p style="color:#42474e; font-size:0.8125rem; line-height:1.6;">{s.description}</p>
    </div>
  ))}
</div>

<style>
.process-step { display:flex; flex-direction:column; align-items:center; text-align:center; }
.process-circle { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#00253b,#006875); box-shadow:0 0 0 6px #fff, 0 0 0 8px rgba(0,227,253,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:1rem; position:relative; z-index:1; }
.process-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; position:relative; }
.process-connector { position:absolute; top:27px; left:calc(12.5% + 28px); right:calc(12.5% + 28px); height:2px; background:linear-gradient(90deg,#00e3fd,rgba(0,37,59,0.20)); }
@media(max-width:900px) {
  .process-grid { grid-template-columns:1fr 1fr; }
  .process-connector { display:none; }
}
</style>
```

This is a byte-for-byte port of the markup/CSS already used identically in all 10 target files, generalized to accept step content as data instead of being hardcoded 4 times. No design decisions on visual output — the rendered result is identical to today's markup.

- [ ] **Step 2: Verify the file is syntactically valid**

Run: `cd astro-site && npm run build`
Expected: succeeds (the component isn't used anywhere yet, so this just confirms no syntax error in the new file breaks the overall build).

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/ProcessSteps.astro
git commit -m "feat: add shared ProcessSteps component"
```

---

### Task 2: Migrate all 10 files to `ProcessSteps`

**Files (all under `astro-site/src/pages/services/`):**
- Modify: `ai-agents.astro`
- Modify: `ai-automation.astro`
- Modify: `ai-integration.astro`
- Modify: `ai-model-finetuning.astro`
- Modify: `claude-agent-builds.astro`
- Modify: `custom-ai-development.astro`
- Modify: `custom-gpt-development.astro`
- Modify: `internal-ai-tools.astro`
- Modify: `prompt-engineering.astro`
- Modify: `vibe-coding.astro`

Every file needs the identical 4-part transformation. Full worked example using `ai-agents.astro` (verified exact current content as of this plan being written):

- [ ] **Step 1: Add the import**

Add to the frontmatter imports (alongside the existing `BaseLayout`/`getSupabaseAdmin` imports):
```astro
import ProcessSteps from "../../components/ProcessSteps.astro";
```

- [ ] **Step 2: Add a `processSteps` data array to the frontmatter**

Add this near the other page-level constants in the frontmatter (exact content transcribed from `ai-agents.astro`'s current markup, lines 245-277):

```astro
const processSteps = [
  { icon: "target", step: "Step 1", title: "Define the Mission", description: "We scope exactly what your agent needs to do, what tools it needs access to, and where humans stay in the loop." },
  { icon: "extension", step: "Step 2", title: "Build & Connect", description: "We build the agent, connect it to your tools, train it on your context, and define guardrails for safe operation." },
  { icon: "science", step: "Step 3", title: "Test Rigorously", description: "We stress-test with edge cases, adversarial inputs, and real scenarios to ensure the agent behaves as expected before going live." },
  { icon: "monitoring", step: "Step 4", title: "Monitor & Improve", description: "Full audit logs, performance dashboards, and 90-day support ensure your agent keeps improving after launch." },
];
```

Note there is no `&amp;` in this particular file's titles, but check each of the other 9 files for HTML entities in step titles/descriptions (e.g. `&amp;`, `&#39;`) and convert them to their plain-text equivalent (`&`, `'`) in the JS string literal — copying the HTML-escaped form literally into a JS string would display the raw escape sequence on the page.

- [ ] **Step 3: Replace the markup**

Current (`ai-agents.astro:245-277`, the entire `<div class="process-grid">...</div>` block including all 4 `.process-step` children):
```astro
    <div class="process-grid">
      <div class="process-connector"></div>
      <div class="process-step">
        <div class="process-circle">
          <span class="material-symbols-outlined" style="color:#00e3fd; font-size:22px;">target</span>
        </div>
        <span style="color:#006875; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Step 1</span>
        <h3 style="font-weight:700; font-size:0.9375rem; color:#00253b; margin-bottom:4px;">Define the Mission</h3>
        <p style="color:#42474e; font-size:0.8125rem; line-height:1.6;">We scope exactly what your agent needs to do, what tools it needs access to, and where humans stay in the loop.</p>
      </div>
      <div class="process-step">
        <div class="process-circle">
          <span class="material-symbols-outlined" style="color:#00e3fd; font-size:22px;">extension</span>
        </div>
        <span style="color:#006875; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Step 2</span>
        <h3 style="font-weight:700; font-size:0.9375rem; color:#00253b; margin-bottom:4px;">Build &amp; Connect</h3>
        <p style="color:#42474e; font-size:0.8125rem; line-height:1.6;">We build the agent, connect it to your tools, train it on your context, and define guardrails for safe operation.</p>
      </div>
      <div class="process-step">
        <div class="process-circle">
          <span class="material-symbols-outlined" style="color:#00e3fd; font-size:22px;">science</span>
        </div>
        <span style="color:#006875; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Step 3</span>
        <h3 style="font-weight:700; font-size:0.9375rem; color:#00253b; margin-bottom:4px;">Test Rigorously</h3>
        <p style="color:#42474e; font-size:0.8125rem; line-height:1.6;">We stress-test with edge cases, adversarial inputs, and real scenarios to ensure the agent behaves as expected before going live.</p>
      </div>
      <div class="process-step">
        <div class="process-circle">
          <span class="material-symbols-outlined" style="color:#00e3fd; font-size:22px;">monitoring</span>
        </div>
        <span style="color:#006875; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Step 4</span>
        <h3 style="font-weight:700; font-size:0.9375rem; color:#00253b; margin-bottom:4px;">Monitor &amp; Improve</h3>
        <p style="color:#42474e; font-size:0.8125rem; line-height:1.6;">Full audit logs, performance dashboards, and 90-day support ensure your agent keeps improving after launch.</p>
      </div>
    </div>
```

Replace with:
```astro
    <ProcessSteps steps={processSteps} />
```

For the other 9 files: locate their own `<div class="process-grid">...</div>` block (find via `grep -n "process-grid" <file>`, then read enough surrounding lines to capture the full block through its matching closing `</div>`), transcribe each of that file's 4 steps' `icon` (the Material Symbols icon name in the `<span class="material-symbols-outlined">` text), `step` (the "Step N" label), `title` (the `<h3>` text, un-escaping any HTML entities), and `description` (the `<p>` text) into a `processSteps` array in that file's own frontmatter, then replace the whole grid block with `<ProcessSteps steps={processSteps} />`. Do not invent or paraphrase content — copy each file's actual current text exactly (this is a refactor, not a content rewrite).

- [ ] **Step 4: Delete the now-duplicate CSS rules from the page's own `<style>` block**

Each file has these exact 4 lines somewhere in its `<style>` block (indentation may be 0 or 4 spaces depending on the file — `custom-ai-development.astro` uses 4-space indentation, matching its earlier FAQ CSS pattern from Phase 2a):

```css
.process-step { display:flex; flex-direction:column; align-items:center; text-align:center; }
.process-circle { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#00253b,#006875); box-shadow:0 0 0 6px #fff, 0 0 0 8px rgba(0,227,253,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:1rem; position:relative; z-index:1; }
.process-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; position:relative; }
.process-connector { position:absolute; top:27px; left:calc(12.5% + 28px); right:calc(12.5% + 28px); height:2px; background:linear-gradient(90deg,#00e3fd,rgba(0,37,59,0.20)); }
```

Delete all 4 lines (they're consecutive in every file). Known current line numbers (re-verify with `grep -n "process-step \|process-circle \|process-grid \|process-connector "` before editing each file — note the trailing space in the grep pattern to avoid also matching the combined `@media` line, which must NOT be touched):

| File | CSS lines (before this task's edits) |
|---|---|
| `ai-agents.astro` | 354-357 |
| `ai-automation.astro` | 371-374 |
| `ai-integration.astro` | 347-350 |
| `ai-model-finetuning.astro` | 356-359 |
| `claude-agent-builds.astro` | 403-406 |
| `custom-ai-development.astro` | 359-360, 363-364 (note: this file has a `.faq-icon.open`-style unrelated line in between at 361-362 from a different rule — verify exact content with grep before deleting, do not delete lines 361-362) |
| `custom-gpt-development.astro` | 325-328 |
| `internal-ai-tools.astro` | 367-370 |
| `prompt-engineering.astro` | 338-341 |
| `vibe-coding.astro` | 344-347 |

**Do NOT touch** the combined `@media(max-width:900px) { .builds-grid {...} .process-grid {...} .process-connector {...} ... }` line in any file — per the Architecture note above, this becomes harmless dead CSS for the process-grid/process-connector portion specifically, but its other class references are still live and necessary. Deleting or editing that line is out of scope for this task.

For `custom-ai-development.astro` specifically: run `grep -n "process-step \|process-circle \|process-grid \|process-connector "` first and read the actual lines before deleting — the table above notes its CSS block may not be fully consecutive; verify before editing rather than assuming the exact line numbers still hold.

- [ ] **Step 5: Verify each file after editing it**

For each file, run: `grep -n "process-step \|process-circle \|process-grid \|process-connector " <file>` — expected: the only remaining match should be the combined `@media` line (which is correctly left alone) — zero matches for the base (non-media) CSS rules and zero matches for the old inline markup.

Also run: `grep -n "ProcessSteps" <file>` — expected: 2 matches (the import line, and the `<ProcessSteps steps={processSteps} />` usage).

- [ ] **Step 6: Build after all 10 files are migrated**

Run: `cd astro-site && npm run build`
Expected: succeeds with no errors.

- [ ] **Step 7: Visual spot-check**

Run: `npm run dev`, open `/services/ai-agents`, `/services/vibe-coding`, `/services/internal-ai-tools`, `/services/custom-ai-development` (pick 4 of the 10 as a sample, including `custom-ai-development` since its CSS deletion is the trickiest one) — confirm the "how it works" process grid still renders with 4 steps, correct icons, correct text, and the connecting line between circles, and that it collapses to a 2-column layout on a narrow viewport (resize the browser or use dev tools device emulation to confirm the `@media(max-width:900px)` rule from the new component is actually working).

- [ ] **Step 8: Commit**

```bash
git add astro-site/src/pages/services/ai-agents.astro astro-site/src/pages/services/ai-automation.astro astro-site/src/pages/services/ai-integration.astro astro-site/src/pages/services/ai-model-finetuning.astro astro-site/src/pages/services/claude-agent-builds.astro astro-site/src/pages/services/custom-ai-development.astro astro-site/src/pages/services/custom-gpt-development.astro astro-site/src/pages/services/internal-ai-tools.astro astro-site/src/pages/services/prompt-engineering.astro astro-site/src/pages/services/vibe-coding.astro
git commit -m "refactor: migrate 10 services pages to shared ProcessSteps component"
```

---

## Notes for whoever picks up the next Phase 2 component

- `StatStrip.astro` is next: 3 real implementations (named-class, inline-only, and a `.stat-number`-with-no-CSS variant that also varies in count — 1 stat vs. 3) across ~10 files, plus 2 pages (`services.astro` hub, `internal-ai-tools.astro`) with no stat strip at all. Needs a component accepting an array of 1-3 `{ value, caption }` items with grid columns computed from array length — a real design decision, not a mechanical port. Investigate each file's actual current markup before writing that plan, the same way this one and the FaqAccordion one did.
- `Tabs.astro` after that: two JS families with real behavioral differences (see the design spec's Phase 2 section for the exact decision already made — full ARIA wiring + root-scoped queries, matching `claude-agent-builds.astro`'s existing safe pattern).
- `services.astro`'s category-filter widget and `internal-ai-tools.astro`'s tab widget are separate from this component and not touched here.
