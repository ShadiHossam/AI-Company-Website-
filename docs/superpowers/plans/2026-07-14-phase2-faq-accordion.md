# Phase 2a: Shared FaqAccordion Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the duplicated FAQ-accordion markup/CSS (13 files) into one `FaqAccordion.astro` component, and standardize the two files with a broken icon variant (`ai-strategy.astro`, `ai-training.astro`) onto the working style — without changing any page's surrounding section styling (background color, container width), which genuinely varies per page and must be preserved.

**Architecture:** The FAQ toggle *JavaScript* is already shared globally (`src/scripts/site.ts`'s `toggleFaq()`, exposed on `window`) — this plan does not touch it. Only the repeated `<div class="faq-item">...</div>` list markup and its CSS (`.faq-item`, `.faq-btn`, `.faq-body`, `.faq-body.open`, `.faq-icon`, `.faq-icon.open`) move into a new component. The component is scoped to just the accordion list, not the surrounding `<section>`/heading, because that wrapper's styling (background, `max-width`) is not identical across all 13 files (e.g. `ai-strategy.astro` uses `background:#e7eeff` and `max-width:48rem` where the other 12 use `#f9f9ff`/`720px`) and changing it would be an unintended visual change.

**Tech Stack:** Astro 7 component (`.astro` file, scoped `<style>`, no client JS needed — `toggleFaq` stays global).

**Verification for every step:** no test framework exists for page/component markup (only `vitest` for `src/__tests__` API/lib code) — verification is `grep` to confirm old markup is gone, `cd astro-site && npm run build` succeeding, and a `npm run dev` spot-check.

---

### Task 1: Create the `FaqAccordion.astro` component

**Files:**
- Create: `astro-site/src/components/FaqAccordion.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  items: FaqItem[];
}

const { items } = Astro.props;
---

<div>
  {items.map((item) => (
    <div class="faq-item">
      <button class="faq-btn" onclick="toggleFaq(this)" aria-expanded="false">
        {item.question}
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-body">{item.answer}</div>
    </div>
  ))}
</div>

<style>
.faq-item { border-top:1px solid rgba(0,37,59,0.10); }
.faq-btn { display:flex; justify-content:space-between; align-items:center; width:100%; text-align:left; padding:1.1rem 0; font-weight:600; color:#00253b; cursor:pointer; background:none; border:none; font-family:inherit; font-size:0.95rem; }
.faq-body { display:none; padding-bottom:1rem; color:#42474e; font-size:0.9rem; line-height:1.7; }
.faq-body.open { display:block; }
.faq-icon { transition:transform 0.25s; font-size:1.1rem; color:#006875; }
.faq-icon.open { transform:rotate(45deg); }
</style>
```

This is a byte-for-byte port of the markup/CSS already used identically in 11 of the 13 target files (`services.astro`, `ai-agents.astro`, `ai-automation.astro`, `ai-integration.astro`, `ai-model-finetuning.astro`, `claude-agent-builds.astro`, `custom-ai-development.astro`, `custom-gpt-development.astro`, `internal-ai-tools.astro`, `prompt-engineering.astro`, `vibe-coding.astro`) — no design decisions made here, just relocated. `ai-strategy.astro` and `ai-training.astro` currently use a different (CSS-less, broken) SVG icon variant; Task 3 migrates them onto this same component, which fixes their bug as a side effect.

- [ ] **Step 2: Verify the file is syntactically valid**

Run: `cd astro-site && npx astro check --root . 2>&1 | grep -i "FaqAccordion" || echo "no FaqAccordion-specific errors"`
Expected: no errors referencing this new file (the command may hit the pre-existing `astro check` memory limit for the whole project — if so, this specific verification is inconclusive and Task 2's build check is the real gate).

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/FaqAccordion.astro
git commit -m "feat: add shared FaqAccordion component"
```

---

### Task 2: Migrate the 11 files with the standard "+" icon variant

**Files (all under `astro-site/src/pages/`):**
- Modify: `services.astro`
- Modify: `services/ai-agents.astro`
- Modify: `services/ai-automation.astro`
- Modify: `services/ai-integration.astro`
- Modify: `services/ai-model-finetuning.astro`
- Modify: `services/claude-agent-builds.astro`
- Modify: `services/custom-ai-development.astro`
- Modify: `services/custom-gpt-development.astro`
- Modify: `services/internal-ai-tools.astro`
- Modify: `services/prompt-engineering.astro`
- Modify: `services/vibe-coding.astro`

Each of these 11 files needs the identical 3-part transformation. Worked example using `services/ai-agents.astro`:

- [ ] **Step 1: Add the import**

Current frontmatter top (line 2-3):
```astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getSupabaseAdmin } from "../../lib/supabase";
```

Add the new import (for `services.astro` itself, the relative path is `../components/FaqAccordion.astro`; for every file under `services/`, it's `../../components/FaqAccordion.astro`):

```astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getSupabaseAdmin } from "../../lib/supabase";
import FaqAccordion from "../../components/FaqAccordion.astro";
```

- [ ] **Step 2: Replace the accordion markup**

Current (`services/ai-agents.astro:288-297`, indentation/exact whitespace varies slightly per file — match what's actually there):
```astro
    <div>
      {faqItems.map((item) => (
        <div class="faq-item">
          <button class="faq-btn" onclick="toggleFaq(this)" aria-expanded="false">
            {item.question}
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-body">{item.answer}</div>
        </div>
      ))}
    </div>
```

Replace with:
```astro
    <FaqAccordion items={faqItems} />
```

(Every one of these 11 files uses the variable name `faqItems` for its FAQ array — confirmed via grep across all 13 files. If any file uses a different variable name, use that file's actual variable name instead — check before editing, don't assume.)

- [ ] **Step 3: Delete the now-duplicate CSS rules from the page's own `<style>` block**

Each file has these exact 6 lines somewhere in its `<style>` block (line numbers below are current as of this plan being written — verify with grep before editing since earlier edits in this same task will not shift other files' line numbers, but re-verify each file individually):

```css
.faq-item { border-top:1px solid rgba(0,37,59,0.10); }
.faq-btn { display:flex; justify-content:space-between; align-items:center; width:100%; text-align:left; padding:1.1rem 0; font-weight:600; color:#00253b; cursor:pointer; background:none; border:none; font-family:inherit; font-size:0.95rem; }
.faq-body { display:none; padding-bottom:1rem; color:#42474e; font-size:0.9rem; line-height:1.7; }
.faq-body.open { display:block; }
.faq-icon { transition:transform 0.25s; font-size:1.1rem; color:#006875; }
.faq-icon.open { transform:rotate(45deg); }
```

Delete all 6 lines (they're consecutive in every file). Known current line numbers (re-verify with `grep -n "faq-item\|faq-btn\|faq-body\|faq-icon"` before editing each file, in case earlier edits shifted things):

| File | CSS lines (before this task's edits) |
|---|---|
| `services.astro` | no separate CSS block for these — hub page's FAQ styling lives inline in the markup being replaced; skip this step for this file only, nothing to delete |
| `services/ai-agents.astro` | 367-372 |
| `services/ai-automation.astro` | 389-394 |
| `services/ai-integration.astro` | 366-371 |
| `services/ai-model-finetuning.astro` | 369-374 |
| `services/claude-agent-builds.astro` | 416-421 |
| `services/custom-ai-development.astro` | 371-376 (note: this file indents its CSS with 4 spaces, not 0 — match its existing indentation style when locating/deleting) |
| `services/custom-gpt-development.astro` | 347-352 |
| `services/internal-ai-tools.astro` | 390-395 |
| `services/prompt-engineering.astro` | 357-362 |
| `services/vibe-coding.astro` | 372-377 |

For `services.astro`: check via `grep -n "faq-item\|faq-btn\|faq-body\|faq-icon" astro-site/src/pages/services.astro` — if it returns CSS rule matches (not just the markup match), delete them the same way as the other files; if it only returns the markup match (no CSS block), there's nothing to delete for this file, move on.

- [ ] **Step 4: Verify each file after editing it**

For each file, run: `grep -n "faq-item\|faq-btn\|faq-body\|faq-icon" <file>` — expected: zero matches (both markup and CSS should be fully gone, replaced by the `<FaqAccordion>` usage and the component import).

Also run: `grep -n "FaqAccordion" <file>` — expected: 2 matches (the import line, and the `<FaqAccordion items={faqItems} />` usage).

- [ ] **Step 5: Build after all 11 files are migrated**

Run: `cd astro-site && npm run build`
Expected: succeeds with no errors.

- [ ] **Step 6: Visual spot-check**

Run: `npm run dev`, open `/services`, `/services/ai-agents`, `/services/vibe-coding`, `/services/internal-ai-tools` (pick 4 of the 11 as a sample) — confirm the FAQ section still renders and the accordion still expands/collapses on click (the `toggleFaq` global function is unchanged, so this should just work — but verify, don't assume).

- [ ] **Step 7: Commit**

```bash
git add astro-site/src/pages/services.astro astro-site/src/pages/services/ai-agents.astro astro-site/src/pages/services/ai-automation.astro astro-site/src/pages/services/ai-integration.astro astro-site/src/pages/services/ai-model-finetuning.astro astro-site/src/pages/services/claude-agent-builds.astro astro-site/src/pages/services/custom-ai-development.astro astro-site/src/pages/services/custom-gpt-development.astro astro-site/src/pages/services/internal-ai-tools.astro astro-site/src/pages/services/prompt-engineering.astro astro-site/src/pages/services/vibe-coding.astro
git commit -m "refactor: migrate 11 services pages to shared FaqAccordion component"
```

---

### Task 3: Migrate the 2 files with the broken SVG-icon variant (`ai-strategy.astro`, `ai-training.astro`)

**Files:**
- Modify: `astro-site/src/pages/services/ai-strategy.astro`
- Modify: `astro-site/src/pages/services/ai-training.astro`

These two currently render a flattened one-line variant with an inline SVG "+" icon that has **no matching CSS** (confirmed: `grep -n "\.faq-icon"` on both files' `<style>` blocks returns zero matches — the rotate-on-open animation these SVGs visually imply doesn't exist). Migrating them to `FaqAccordion` intentionally changes their icon from the broken SVG to the working text "+" used everywhere else on the site — this is a deliberate bug fix, not an oversight, and should look like the other 11 pages' FAQ section after this change.

- [ ] **Step 1: Confirm current content in `ai-strategy.astro`**

Run: `grep -n -B2 -A2 "faq-item" astro-site/src/pages/services/ai-strategy.astro`
Expected: a single-line block matching:
```astro
        <div class="faq-item"><button class="faq-btn" onclick="toggleFaq(this)" aria-expanded="false">{item.question}<span class="faq-icon"><svg viewBox="0 0 24 24" fill="none" class="w-3 h-3" stroke="#006875" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg></span></button><div class="faq-body">{item.answer}</div></div>
```
(this line is inside a `{faqItems.map((item) => ( ... ))}` block — read a few lines above/below to see the exact wrapping `<div>` and `.map()` call before editing)

- [ ] **Step 2: Add the import to `ai-strategy.astro`**

Find this file's existing imports (top of frontmatter) and add:
```astro
import FaqAccordion from "../../components/FaqAccordion.astro";
```

- [ ] **Step 3: Replace the whole `{faqItems.map(...)}` block in `ai-strategy.astro`**

Replace the entire wrapping `<div>{faqItems.map((item) => ( ...single-line faq-item... ))}</div>` block with:
```astro
    <FaqAccordion items={faqItems} />
```

- [ ] **Step 4: Verify no CSS needs deleting in `ai-strategy.astro`**

Run: `grep -n "faq-item\|faq-btn\|faq-body\|faq-icon" astro-site/src/pages/services/ai-strategy.astro` — expected: zero matches (this file never had `.faq-item`/`.faq-btn`/`.faq-body` CSS rules to begin with per the earlier audit, only the markup, which is now gone).

- [ ] **Step 5: Repeat Steps 1-4 for `ai-training.astro`**

Same procedure — confirm current content via `grep -n -B2 -A2 "faq-item" astro-site/src/pages/services/ai-training.astro`, add the same import, replace the same shape of block with `<FaqAccordion items={faqItems} />`, verify no CSS to delete.

- [ ] **Step 6: Build**

Run: `cd astro-site && npm run build`
Expected: succeeds with no errors.

- [ ] **Step 7: Visual check — confirm the fix**

Run: `npm run dev`, open `/services/ai-strategy` and `/services/ai-training`. Click a FAQ item on each page. Confirm: (a) the icon is now the text "+" that rotates 45° to look like an "×" when opened (matching every other services page), not the old static SVG, and (b) the accordion opens/closes correctly.

- [ ] **Step 8: Commit**

```bash
git add astro-site/src/pages/services/ai-strategy.astro astro-site/src/pages/services/ai-training.astro
git commit -m "fix: migrate ai-strategy and ai-training FAQ to FaqAccordion, fixing broken icon animation"
```

---

## Notes for whoever picks up the next Phase 2 component

- `ProcessSteps.astro` is next: 10 of 13 files share an identical 4-step static grid (byte-identical CSS confirmed across samples). `ai-strategy.astro` uses a tabbed roadmap instead (belongs with the `Tabs.astro` work, not this component). `ai-training.astro` and `services.astro` (hub) have no such section — don't force one in.
- After that, `StatStrip.astro` (3 real implementations + 2 pages with none — needs a component that accepts 1-3 stats, not a fixed 3) and `Tabs.astro` (two JS families with real behavioral differences — see the design spec's Phase 2 section for the exact decision: full ARIA wiring + root-scoped queries, matching `claude-agent-builds.astro`'s existing safe pattern) — both need their own file-by-file investigation before writing their plans, the same way this one did, since assuming uniformity across "12 services pages" has already proven wrong twice.
