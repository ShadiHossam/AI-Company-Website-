# Phase 1: Image & Caption Honesty Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove stock images that dishonestly claim to show the real Aegis AI office/team, and fix the one dead-code caption/image mismatch in the results page fallback data.

**Architecture:** This is a content site (Astro `.astro` pages). There is no test framework for page markup — `astro-site/package.json` only has `vitest` for `src/__tests__` (API/lib code), nothing for page content. Verification for every task in this plan is: (1) `grep` to confirm the old string is gone, (2) `npm run check` (Astro's type checker) passes, (3) `npm run build` succeeds, (4) a manual look at the page in `npm run dev` to confirm nothing visually broke where an image was removed.

**Scope note:** `team_members` (fabricated names + stock face photos, live in the Supabase DB) is explicitly **excluded** — the user is handling that separately. Do not touch `team_members` data or the `fallbackTeam` array in `about.astro` in this plan.

**Tech Stack:** Astro 7, static `.astro` files with inline `<style>`/`<script>`, no CMS content involved in this phase (all edits are to hardcoded markup).

---

### Task 1: Remove filler team-photo-row and office-image from `about.astro`

**Files:**
- Modify: `astro-site/src/pages/about.astro:230-233` (team-photo-row)
- Modify: `astro-site/src/pages/about.astro:270-274` (office image divider)

- [ ] **Step 1: Confirm current content matches expectations**

Run: `grep -n "team-photo-row\|OFFICE IMAGE" "astro-site/src/pages/about.astro"`
Expected output includes lines near 230 (`<div class="team-photo-row">`) and 270 (`<!-- OFFICE IMAGE -->`).

- [ ] **Step 2: Delete the team-photo-row block**

Remove this exact block (currently lines 230-233):

```astro
    <div class="team-photo-row">
      <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop" alt="Aegis AI engineers working side by side on a client build at our Dubai workspace" loading="lazy" width="600" height="300" />
      <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80&auto=format&fit=crop" alt="Whiteboard planning session mapping an AI rollout for a UAE client team" loading="lazy" width="600" height="300" />
    </div>
```

Replace with nothing (delete the block entirely — the surrounding `<div class="team-grid">...</div>` closes on its own above it, and `</div></section>` below it still close the outer containers correctly).

- [ ] **Step 3: Delete the office-image divider block**

Remove this exact block (currently lines 270-274):

```astro
<!-- OFFICE IMAGE -->
<div style="position:relative; overflow:hidden; height:260px;">
  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop" alt="Modern office workspace where our team works" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;" />
  <div style="position:absolute;inset:0;background:rgba(0,104,117,0.08);"></div>
</div>
```

Replace with nothing.

- [ ] **Step 4: Verify removal**

Run: `grep -n "team-photo-row\|1522202176988\|1531482615713\|1497366216548\|OFFICE IMAGE" "astro-site/src/pages/about.astro"`
Expected: no matches.

- [ ] **Step 5: Type-check and build**

Run: `cd astro-site && npm run check`
Expected: no new errors introduced by this file.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Visual check**

Run: `npm run dev`, open `/about` in a browser, confirm the page flows cleanly from the team grid straight to the "For Business Owners" section, and from the values-lead-in straight to the "VALUES" section, with no broken spacing where the images were.

- [ ] **Step 7: Commit**

```bash
git add astro-site/src/pages/about.astro
git commit -m "fix(about): remove stock filler images with no informational value"
```

---

### Task 2: Remove dishonest office/team banners from `careers.astro`

**Files:**
- Modify: `astro-site/src/pages/careers.astro:154-156`
- Modify: `astro-site/src/pages/careers.astro:161-163`

- [ ] **Step 1: Delete the "team members" banner block**

Remove this exact block (currently lines 154-156):

```astro
    <div style="border-radius:24px; overflow:hidden; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80&auto=format&fit=crop" alt="Aegis AI team members working together on a project at our Dubai office" loading="lazy" width="1400" height="360" style="width:100%; height:clamp(220px,32vw,360px); object-fit:cover; display:block;" />
    </div>
```

Replace with nothing.

- [ ] **Step 2: Remove just the `<img>` from the quote-band background (keep the gradient)**

Current block (lines 161-163, note the `<img>` on line 162 sits inside a `position:relative` wrapper alongside a gradient overlay and the quote content that follows):

```astro
<div style="position:relative; overflow:hidden;">
  <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&auto=format&fit=crop" alt="Colleagues working together in a modern office" loading="lazy" width="1600" height="360" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 35%;" />
  <div style="position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,104,117,0.18),rgba(0,37,59,0.35));"></div>
```

Replace with (remove only the `<img>` line, keep the wrapper div and gradient, and change the gradient to a solid enough background since it's no longer layered over a photo):

```astro
<div style="position:relative; overflow:hidden; background:linear-gradient(135deg,#006875,#00253b);">
  <div style="position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,104,117,0.18),rgba(0,37,59,0.35));"></div>
```

- [ ] **Step 3: Verify removal**

Run: `grep -n "1552664730\|1600880292203" "astro-site/src/pages/careers.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/careers`, confirm the "no degree required" section flows into the next section cleanly, and the quote band still reads clearly against its new gradient background (check text contrast).

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/careers.astro
git commit -m "fix(careers): remove stock photos falsely captioned as our team/office"
```

---

### Task 3: Remove the same reused banner from `jobs/[slug].astro`

**Files:**
- Modify: `astro-site/src/pages/jobs/[slug].astro:122-126`

- [ ] **Step 1: Delete the banner block**

Remove this exact block (currently lines 122-126):

```astro
<!-- BANNER IMAGE -->
<div style="position:relative; overflow:hidden; height:240px;">
  <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=80&auto=format&fit=crop" alt="Aegis AI colleagues working together in the Dubai office" loading="lazy" width="1400" height="240" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;" />
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(249,249,255,0.50) 0%,rgba(249,249,255,0) 45%),linear-gradient(to top,rgba(0,19,32,0.28) 0%,transparent 55%);"></div>
</div>
```

Replace with nothing.

- [ ] **Step 2: Verify removal**

Run: `grep -n "1600880292203\|BANNER IMAGE" "astro-site/src/pages/jobs/[slug].astro"`
Expected: no matches.

- [ ] **Step 3: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed. Note this is a dynamic route (`[slug]`) — `npm run build` needs the Supabase env vars available (check `.env` is loaded) to prerender/verify job slugs; if build fails for unrelated env reasons, `npm run check` passing is sufficient confirmation for this task.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open any `/jobs/<slug>` page, confirm the header flows straight into the content container with no broken 240px gap.

- [ ] **Step 5: Commit**

```bash
git add "astro-site/src/pages/jobs/[slug].astro"
git commit -m "fix(jobs): remove stock photo falsely captioned as our Dubai office"
```

---

### Task 4: Remove dishonest office banner from `contact.astro`

**Files:**
- Modify: `astro-site/src/pages/contact.astro:104-108`

- [ ] **Step 1: Delete the hero image block**

Remove this exact block (currently lines 104-108):

```astro
<!-- HERO IMAGE -->
<div style="position:relative; overflow:hidden; height:240px;">
  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop" alt="Aegis AI Dubai office and team workspace" loading="eager" fetchpriority="high" width="1400" height="240" style="width:100%; height:100%; object-fit:cover; object-position:center 30%;" />
  <div style="position:absolute; inset:0; background:linear-gradient(to top,rgba(0,19,32,0.45) 0%,transparent 55%),linear-gradient(135deg,rgba(0,104,117,0.20),rgba(0,37,59,0.40));"></div>
</div>
```

Replace with nothing.

- [ ] **Step 2: Verify removal**

Run: `grep -n "1497366216548\|HERO IMAGE" "astro-site/src/pages/contact.astro"`
Expected: no matches.

- [ ] **Step 3: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open `/contact`, confirm the header flows directly into the "MAIN CONTENT" section with no broken gap, and the contact form/wizard is unaffected.

- [ ] **Step 5: Commit**

```bash
git add astro-site/src/pages/contact.astro
git commit -m "fix(contact): remove stock photo falsely captioned as our Dubai office"
```

---

### Task 5: Remove the orphan photo grid from `ar/services.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/services.astro:179-186`

- [ ] **Step 1: Delete the orphan grid block**

Remove this exact block (currently lines 179-186):

```astro
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem; margin-top:3rem;">
      <div style="border-radius:24px; overflow:hidden; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
        <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80&auto=format&fit=crop" alt="فريق عمل يتعاون على مشروع ذكاء اصطناعي" loading="lazy" width="800" height="520" style="width:100%; height:260px; object-fit:cover; display:block;" />
      </div>
      <div style="border-radius:24px; overflow:hidden; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&auto=format&fit=crop" alt="محترف يعمل على حلول الذكاء الاصطناعي للشركات" loading="lazy" width="800" height="520" style="width:100%; height:260px; object-fit:cover; display:block;" />
      </div>
    </div>
```

Replace with nothing (the enclosing `</div></section>` immediately after still close correctly).

- [ ] **Step 2: Verify removal**

Run: `grep -n "1521737711867\|1519085360753" "astro-site/src/pages/ar/services.astro"`
Expected: no matches.

- [ ] **Step 3: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open `/ar/services`, confirm the services grid flows directly into the next section ("أكثر خدمتين تبدأ بهما الشركات") without an orphan image grid in between, and RTL layout is unaffected.

- [ ] **Step 5: Commit**

```bash
git add astro-site/src/pages/ar/services.astro
git commit -m "fix(ar/services): remove orphan stock photo grid with no caption or purpose"
```

---

### Task 6: Remove the mirrored office photo from `ar/about.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/about.astro:328-332` (verify exact line range first — line numbers may shift slightly from the English version; the anchor string below is unique regardless)

- [ ] **Step 1: Find the exact current block**

Run: `grep -n -B2 -A2 "1497366216548" "astro-site/src/pages/ar/about.astro"`
This confirms the exact surrounding lines before editing (expected to be a `position:relative; overflow:hidden` wrapper div around height 260, matching the English `about.astro` office-image pattern).

- [ ] **Step 2: Delete the block**

Remove the `<div>...</div>` wrapper containing:

```astro
<img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop" alt="مساحة مكتب حديثة يعمل بها فريقنا" loading="lazy" width="1400" height="260" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;" />
```

along with its enclosing wrapper div and any overlay div inside it (same shape as the English `about.astro` fix in Task 1, Step 3) — replace the whole wrapper with nothing.

- [ ] **Step 3: Verify removal**

Run: `grep -n "1497366216548" "astro-site/src/pages/ar/about.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/ar/about`, confirm no broken gap where the image was removed.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/ar/about.astro
git commit -m "fix(ar/about): remove stock photo falsely captioned as our team workspace"
```

---

### Task 7: Fix the dead-code image/caption mismatch in `results.astro` fallback data

**Files:**
- Modify: `astro-site/src/pages/results.astro:27` (WhatsApp case study caption)
- Modify: `astro-site/src/pages/results.astro:93` (Logistics case study image)

Context: this `fallbackCaseStudies` array (lines ~1-96) only renders if the live Supabase `case_studies` query fails or returns zero rows (see line ~109: `if (!error && data && data.length > 0)`). Checked 2026-07-13: the live table has 3 published rows with empty `media_sections`, so this fallback is currently dead code. Fixing it anyway for correctness (local dev without DB access, and in case the DB table is ever cleared).

- [ ] **Step 1: Verify current content**

Run: `grep -n "1494412574643\|1611746869696-d09bce200020" "astro-site/src/pages/results.astro"`
Expected: line 27 shows `photo-1611746869696-d09bce200020` (WhatsApp case study), line 93 shows `photo-1494412574643-ff11b0a5c1c3` (Logistics case study).

- [ ] **Step 2: Fix the Logistics case study image**

Current (line 93):

```astro
      { type: "image", url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80&auto=format&fit=crop", caption: "The route-optimisation dashboard used by dispatch each morning", description: "" },
```

Replace with (verified 2026-07-13 by downloading and viewing the image: this photo genuinely shows a laptop screen with an analytics dashboard — charts and KPI numbers — a real match for the caption, unlike the previous port-yard photo):

```astro
      { type: "image", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop", caption: "The route-optimisation dashboard used by dispatch each morning", description: "" },
```

- [ ] **Step 3: Fix the WhatsApp case study caption**

Current (line 27):

```astro
      { type: "image", url: "https://images.unsplash.com/photo-1611746869696-d09bce200020?w=1200&q=80&auto=format&fit=crop", caption: "The WhatsApp AI assistant qualifying a lead in real time", description: "" },
```

Replace with (verified 2026-07-13: this photo shows a phone screen with messaging-app icons — WhatsApp, Telegram, Line — not an actual conversation. No verified replacement photo of a real chat screenshot was found after several search attempts, so the caption is corrected to match what the image actually shows instead of claiming to show the AI in action):

```astro
      { type: "image", url: "https://images.unsplash.com/photo-1611746869696-d09bce200020?w=1200&q=80&auto=format&fit=crop", caption: "WhatsApp is the channel where most inbound leads reach the business first", description: "" },
```

- [ ] **Step 4: Verify the caption no longer overclaims**

Run: `grep -n "qualifying a lead in real time" "astro-site/src/pages/results.astro"`
Expected: no matches.

- [ ] **Step 5: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed.

- [ ] **Step 6: Visual check (temporary DB simulation)**

This code path only renders if the DB call fails/returns empty, so a normal `npm run dev` won't show it. Confirm correctness by reading the diff instead of visual-checking a path that's dead in dev too (same DB is used in dev). Skip the dev-server check for this task only — the `check`/`build` pass plus the diff review is the verification.

- [ ] **Step 7: Commit**

```bash
git add astro-site/src/pages/results.astro
git commit -m "fix(results): correct fallback case-study image/caption mismatch (dead code today, fixed for correctness)"
```

---

### Task 8: Remove the mirrored quote-band photo from `ar/careers.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/careers.astro:170-173`

Discovered during Task 2's code-quality review: this page has the exact same `photo-1600880292203` quote-band pattern as the English `careers.astro` (fixed in Task 2), with an Arabic caption ("زملاء يعملون معاً في مكتب حديث" — "colleagues working together in a modern office"). Not part of the original audit's page sample, but it's the same violation and the same fix applies.

- [ ] **Step 1: Confirm current content**

Run: `grep -n -B3 -A3 "1600880292203" "astro-site/src/pages/ar/careers.astro"`
Expected: shows a `<!-- QUOTE BAND -->` wrapper (currently lines 170-173) matching the English page's pre-fix structure:

```astro
<!-- QUOTE BAND -->
<div style="position:relative; overflow:hidden;">
  <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&auto=format&fit=crop" alt="زملاء يعملون معاً في مكتب حديث" loading="lazy" width="1600" height="360" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 35%;" />
  <div style="position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,104,117,0.18),rgba(0,37,59,0.35));"></div>
```

- [ ] **Step 2: Remove the `<img>`, add the same solid gradient used in the English fix**

Replace with:

```astro
<!-- QUOTE BAND -->
<div style="position:relative; overflow:hidden; background:linear-gradient(135deg,#006875,#00253b);">
  <div style="position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,104,117,0.18),rgba(0,37,59,0.35));"></div>
```

Same gradient stops as Task 2 (`#006875` / `#00253b`) — these are the RGB values already used in the overlay gradient one line below, kept consistent across both language versions of the page.

- [ ] **Step 3: Verify removal**

Run: `grep -n "1600880292203" "astro-site/src/pages/ar/careers.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed (or `build` alone if `check` hits the pre-existing memory limit).

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/ar/careers`, confirm the quote band still reads clearly in RTL against the new gradient, no broken layout.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/ar/careers.astro
git commit -m "fix(ar/careers): remove stock photo falsely captioned as our office"
```

---

### Task 9: Remove the same false office banner from `ar/contact.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/contact.astro:66-70`

Discovered during Task 4's code-quality review: same `photo-1497366216548` image, same false claim (Arabic: "مكتب Aegis AI في دبي وفريق العمل" — "Aegis AI office in Dubai and the team"), same `fetchpriority="high"` LCP pattern as the English `contact.astro` fixed in Task 4.

- [ ] **Step 1: Confirm current content**

Run: `grep -n -B3 -A2 "1497366216548" "astro-site/src/pages/ar/contact.astro"`
Expected: matches this block (currently lines 66-70):

```astro
<!-- IMAGE BANNER -->
<div style="position:relative; overflow:hidden; height:240px;">
  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop" alt="مكتب Aegis AI في دبي وفريق العمل" loading="eager" fetchpriority="high" width="1400" height="240" style="width:100%; height:100%; object-fit:cover; object-position:center 30%;" />
  <div style="position:absolute; inset:0; background:rgba(0,104,117,0.08);"></div>
</div>
```

- [ ] **Step 2: Delete the block**

Replace with nothing (pure deletion, matching Task 4's approach for the English page).

- [ ] **Step 3: Verify removal**

Run: `grep -n "1497366216548\|IMAGE BANNER" "astro-site/src/pages/ar/contact.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed (or `build` alone if `check` hits the pre-existing memory limit).

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/ar/contact`, confirm the header flows directly into the main content with no broken gap, RTL layout unaffected.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/ar/contact.astro
git commit -m "fix(ar/contact): remove stock photo falsely captioned as our Dubai office"
```

---

### Task 10: Remove the same false office banner from `ar/privacy.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/privacy.astro:74-78`

Discovered during Task 4's code-quality review: same `photo-1497366216548` image, false claim (Arabic: "مكتب Aegis AI في دبي حيث تُدار عمليات حماية البيانات والخصوصية" — "Aegis AI office in Dubai where data protection and privacy operations are managed"), same `fetchpriority="high"` LCP pattern.

**Correction (found during Task 10's own code-quality review):** the English `privacy.astro` does NOT have *this specific* image, but it has a different dishonest banner of its own (`photo-1454165804606`, alt "Aegis AI team in a consulting session discussing client data practices" — see Task 12 below). So this is not "an AR-only inconsistency being resolved for parity" as originally framed — both language versions had their own separate false-photo problem on this page, and Task 10 only fixes the Arabic one. Task 12 fixes the English one.

- [ ] **Step 1: Confirm current content**

Run: `grep -n -B3 -A2 "1497366216548" "astro-site/src/pages/ar/privacy.astro"`
Expected: matches this block (currently lines 74-78):

```astro
<!-- BANNER IMAGE -->
<div style="position:relative;overflow:hidden;height:220px;">
  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop" alt="مكتب Aegis AI في دبي حيث تُدار عمليات حماية البيانات والخصوصية" loading="eager" fetchpriority="high" width="1400" height="220" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;" />
  <div style="position:absolute;inset:0;background:rgba(0,37,59,0.10);"></div>
</div>
```

- [ ] **Step 2: Delete the block**

Replace with nothing.

- [ ] **Step 3: Verify removal**

Run: `grep -n "1497366216548\|BANNER IMAGE" "astro-site/src/pages/ar/privacy.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed (or `build` alone if `check` hits the pre-existing memory limit).

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/ar/privacy`, confirm the header flows directly into the legal-text content with no broken gap.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/ar/privacy.astro
git commit -m "fix(ar/privacy): remove stock photo falsely captioned as our Dubai office"
```

---

### Task 11: Remove the same false office photo from `services/internal-ai-tools.astro`

**Files:**
- Modify: `astro-site/src/pages/services/internal-ai-tools.astro:249-251`

Discovered during Task 4's code-quality review: same `photo-1497366216548` image, false claim ("Aegis AI Dubai office where internal AI tools are built for client teams"). Unlike Tasks 4/9/10, this one is not the page's LCP hero (it's `loading="lazy"`, mid-page), styled as a standalone rounded-corner card similar to the block removed in Task 2 from `careers.astro`.

- [ ] **Step 1: Confirm current content**

Run: `grep -n -B3 "1497366216548" "astro-site/src/pages/services/internal-ai-tools.astro"`
Expected: matches this block (currently lines 249-251):

```astro
    <div style="border-radius:20px; overflow:hidden; margin-top:2rem; box-shadow:0 20px 44px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop" alt="Aegis AI Dubai office where internal AI tools are built for client teams" loading="lazy" width="1200" height="320" style="width:100%; height:clamp(180px, 24vw, 320px); object-fit:cover; display:block;" />
    </div>
```

- [ ] **Step 2: Delete the block**

Replace with nothing (pure deletion — standalone card, no surrounding gradient/overlay to preserve).

- [ ] **Step 3: Verify removal**

Run: `grep -n "1497366216548" "astro-site/src/pages/services/internal-ai-tools.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed (or `build` alone if `check` hits the pre-existing memory limit).

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/services/internal-ai-tools`, confirm the section above flows cleanly into whatever follows with no orphaned gap.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/services/internal-ai-tools.astro
git commit -m "fix(internal-ai-tools): remove stock photo falsely captioned as our Dubai office"
```

---

### Task 12: Remove the false "team in consulting session" banner from `privacy.astro` (English)

**Files:**
- Modify: `astro-site/src/pages/privacy.astro:47-51`

Discovered during Task 10's code-quality review: while checking whether removing the AR-only banner improved EN/AR parity, the reviewer found the English `privacy.astro` has its own separate dishonest banner — a stock photo captioned as if it shows real Aegis AI staff.

- [ ] **Step 1: Confirm current content**

Run: `grep -n -B3 -A2 "1454165804606" "astro-site/src/pages/privacy.astro"`
Expected: matches this block (currently lines 47-51):

```astro
<!-- BANNER IMAGE -->
<div style="position:relative; overflow:hidden; height:220px;">
  <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80&auto=format&fit=crop" alt="Aegis AI team in a consulting session discussing client data practices" loading="lazy" width="1400" height="220" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;" />
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(249,249,255,0.55) 0%,rgba(249,249,255,0) 45%),linear-gradient(to top,rgba(0,19,32,0.25) 0%,transparent 55%);"></div>
</div>
```

- [ ] **Step 2: Delete the block**

Replace with nothing (pure deletion, same approach as Task 10's Arabic fix — this now brings EN and AR privacy pages into actual parity: neither has a banner image).

- [ ] **Step 3: Verify removal**

Run: `grep -n "1454165804606\|BANNER IMAGE" "astro-site/src/pages/privacy.astro"`
Expected: no matches.

- [ ] **Step 4: Type-check and build**

Run: `cd astro-site && npm run check && npm run build`
Expected: both succeed (or `build` alone if `check` hits the pre-existing memory limit).

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/privacy`, confirm the header flows directly into the table-of-contents/legal-text content with no broken gap.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/pages/privacy.astro
git commit -m "fix(privacy): remove stock photo falsely captioned as our team"
```

---

### Task 13: Sitewide sweep — remaining "Aegis AI team/engineers in Dubai" false-caption images

**Discovered while closing out Task 11/12's reviews**: a full-repo grep for the pattern `alt="...Aegis AI...(team|engineers|colleagues)..."` (and its Arabic equivalent `فريق Aegis`) turned up 10 more files with the same violation already fixed elsewhere in this plan — same stock-photo-claims-to-be-real-staff problem, scattered across the services template and its Arabic mirror. This is one consolidated task covering all 10, since each fix is mechanically identical to a pattern already established and reviewed (Tasks 1/2/4/9/11).

**Files and exact fixes:**

1. **`astro-site/src/pages/terms.astro:47-50`** — pure deletion (same shape as the already-fixed `privacy.astro`/`contact.astro` banners):

```astro
<!-- BANNER IMAGE -->
<div style="position:relative; overflow:hidden; height:220px;">
  <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=80&auto=format&fit=crop" alt="Aegis AI team reviewing project agreements in the office" loading="lazy" width="1400" height="220" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;" />
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(249,249,255,0.55) 0%,rgba(249,249,255,0) 45%),linear-gradient(to top,rgba(0,19,32,0.25) 0%,transparent 55%);"></div>
</div>
```
Delete the whole block.

2. **`astro-site/src/pages/services.astro:171-176`** (the "DUBAI BANNER") — this one is NOT a pure deletion: the image sits behind a stat-grid overlay that's already 74%-opaque, so remove only the `<img>` and make the overlay fully opaque instead of adding a new gradient:

Current:
```astro
<!-- DUBAI BANNER -->
<div style="width:100%; height:300px; overflow:hidden; position:relative;">
  <img src="https://images.unsplash.com/photo-1546412414-e1885259563a?w=1400&q=80&auto=format&fit=crop" alt="Sheikh Zayed Road skyline in Dubai, where the Aegis AI team is based" loading="lazy" width="1400" height="300" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 60%;" />
  <div style="width:100%; height:100%; background:rgba(0,25,42,0.74); display:flex; align-items:center; justify-content:center; position:relative;">
```
Replace with:
```astro
<!-- DUBAI BANNER -->
<div style="width:100%; height:300px; overflow:hidden; position:relative;">
  <div style="width:100%; height:100%; background:#00192a; display:flex; align-items:center; justify-content:center; position:relative;">
```
(delete the `<img>` line; change the overlay div's `background:rgba(0,25,42,0.74)` to solid `background:#00192a` — same RGB values, now fully opaque since there's no photo underneath to show through). Everything inside this div (the stat grid) is untouched.

3. **`astro-site/src/pages/services.astro:404-408`** — pure deletion (standalone card):
```astro
    <div class="deciding-strip">
      <div class="deciding-img-wrap">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop" alt="Aegis AI team in Dubai discussing which service fits a client's business" loading="lazy" width="700" height="460" />
      </div>
```
Delete only the `<div class="deciding-img-wrap">...</div>` (the `<img>` and its immediate wrapper) — check what follows (likely a sibling `deciding-content` div) to confirm the `.deciding-strip` parent still makes sense as a single-column layout after this removal; if `.deciding-strip` is a CSS grid expecting two children, note it in your report rather than guessing.

4. **`astro-site/src/pages/services/claude-agent-builds.astro:121-124`** — pure deletion (standalone card, same shape as Task 2's first `careers.astro` block):
```astro
    <div style="border-radius:24px; overflow:hidden; margin-bottom:3rem; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&auto=format&fit=crop" alt="Aegis AI engineers scoping agent guardrails on a whiteboard during a planning session in Dubai" loading="lazy" width="1200" height="380" style="width:100%; height:clamp(200px, 30vw, 380px); object-fit:cover; display:block;" />
    </div>
```
Delete the whole block.

5. **`astro-site/src/pages/services/custom-gpt-development.astro:121-124`** — pure deletion, same shape:
```astro
    <div style="border-radius:24px; overflow:hidden; margin-bottom:3rem; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80&auto=format&fit=crop" alt="Aegis AI team scoping a custom AI assistant build for a Dubai client" loading="lazy" width="1200" height="380" style="width:100%; height:clamp(200px, 30vw, 380px); object-fit:cover; display:block;" />
    </div>
```
Delete the whole block.

6. **`astro-site/src/pages/services/internal-ai-tools.astro:130-133`** — pure deletion, same shape (note: this is a DIFFERENT image from the one already removed in Task 11, higher up the same file):
```astro
    <div style="border-radius:24px; overflow:hidden; margin-bottom:3rem; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop" alt="Aegis AI engineers configuring an internal knowledge base tool at a Dubai workspace" loading="lazy" width="1200" height="380" style="width:100%; height:clamp(200px, 30vw, 380px); object-fit:cover; display:block;" />
    </div>
```
Delete the whole block.

7. **`astro-site/src/pages/services/vibe-coding.astro:218-220`** — NOT a pure deletion: this is one column of a `display:grid; grid-template-columns:1.2fr 1fr` two-column layout (`.vc-timeline-outer` — check the `<style>` block for the exact class/selector, it may be scoped or inline; find it before editing). Remove only the `<img>` and give the wrapper a solid gradient so the grid column doesn't render as an empty box:

Current:
```astro
      <div style="border-radius:20px; overflow:hidden; box-shadow:0 20px 44px rgba(0,59,92,0.10); min-height:220px;">
        <img src="https://images.unsplash.com/photo-1546412414-a38a6f0f2fd0?w=1000&q=80&auto=format&fit=crop" alt="Sheikh Zayed Road skyline in Dubai, home base for Aegis AI's engineering team" loading="lazy" width="1000" height="700" style="width:100%; height:100%; object-fit:cover; display:block;" />
      </div>
```
Replace with:
```astro
      <div style="border-radius:20px; overflow:hidden; box-shadow:0 20px 44px rgba(0,59,92,0.10); min-height:220px; background:linear-gradient(135deg,#006875,#00253b);"></div>
```

8. **`astro-site/src/pages/ar/jobs/[slug].astro:95-99`** — pure deletion (same shape as the already-fixed English `jobs/[slug].astro`):
```astro
<!-- WORKPLACE PHOTO -->
<div style="position:relative;overflow:hidden;height:220px;">
  <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80&auto=format&fit=crop" alt="فريق Aegis AI يعمل معاً في بيئة تعاونية بمكتب دبي" loading="eager" fetchpriority="high" width="1400" height="220" style="width:100%;height:100%;object-fit:cover;object-position:center 40%;" />
  <div style="position:absolute;inset:0;background:rgba(0,37,59,0.10);"></div>
</div>
```
Delete the whole block.

9. **`astro-site/src/pages/ar/services/ai-agents.astro:250-252`** — pure deletion:
```astro
    <div style="border-radius:24px;overflow:hidden;margin-bottom:2.5rem;box-shadow:0 24px 56px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1100&q=80&auto=format&fit=crop" alt="فريق Aegis AI يراقب أداء الوكيل الذكي أثناء الإطلاق" loading="lazy" width="1100" height="320" style="width:100%;height:clamp(180px,26vw,320px);object-fit:cover;display:block;" />
    </div>
```
Delete the whole block.

10. **`astro-site/src/pages/ar/services/vibe-coding.astro:281-283`** — same two-column-grid situation as item 7 (English vibe-coding), confirmed via CSS: `.vcar-timeline-outer { display:grid;grid-template-columns:1.2fr 1fr; }` and `.vcar-timeline-img { border-radius:20px;overflow:hidden;box-shadow:0 20px 44px rgba(0,59,92,0.10);min-height:220px; }` (both in this file's `<style>` block). Remove only the `<img>`, add the solid gradient to the CSS class itself (not inline, since this one uses a real class) so both the tab-switching JS and responsive breakpoint rule (`@media` block redefining `.vcar-timeline-img { min-height:200px;max-height:260px; }`) keep working unchanged:

Current:
```astro
      <div class="vcar-timeline-img">
        <img src="https://images.unsplash.com/photo-1546412414-a38a6f0f2fd0?w=1000&q=80&auto=format&fit=crop" alt="أفق شارع الشيخ زايد في دبي حيث يعمل فريق Aegis AI الهندسي" loading="lazy" width="1000" height="700" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </div>
```
Replace with:
```astro
      <div class="vcar-timeline-img"></div>
```
And in the `<style>` block, find `.vcar-timeline-img { border-radius:20px;overflow:hidden;box-shadow:0 20px 44px rgba(0,59,92,0.10);min-height:220px; }` and add a background:
```astro
.vcar-timeline-img { border-radius:20px;overflow:hidden;box-shadow:0 20px 44px rgba(0,59,92,0.10);min-height:220px;background:linear-gradient(135deg,#006875,#00253b); }
```

**Verification (apply to all 10 files):**

- [ ] `grep -rn "1551434678\|1546412414\|1522071820081\|1552664730\|1600880292203\|1522202176988\|1521737604893" astro-site/src/pages/terms.astro astro-site/src/pages/services.astro astro-site/src/pages/services/claude-agent-builds.astro astro-site/src/pages/services/custom-gpt-development.astro astro-site/src/pages/services/internal-ai-tools.astro astro-site/src/pages/services/vibe-coding.astro "astro-site/src/pages/ar/jobs/[slug].astro" astro-site/src/pages/ar/services/ai-agents.astro astro-site/src/pages/ar/services/vibe-coding.astro` — expected: no matches (each photo ID should be gone from its respective file; note some of these IDs are legitimately still used elsewhere on OTHER pages not in this list — only check the 10 files above).
- [ ] `cd astro-site && npm run check && npm run build` — both succeed (or `build` alone if `check` hits the known memory limit).
- [ ] `npm run dev`, spot-check `/terms`, `/services`, `/services/vibe-coding`, `/ar/services/vibe-coding` — confirm no broken layout, especially the two-column timeline grids (items 7 and 10) and the `.deciding-strip` section (item 3).
- [ ] Commit (one commit is fine for this consolidated task, or split per file if that's cleaner to review — implementer's choice):

```bash
git add astro-site/src/pages/terms.astro astro-site/src/pages/services.astro astro-site/src/pages/services/claude-agent-builds.astro astro-site/src/pages/services/custom-gpt-development.astro astro-site/src/pages/services/internal-ai-tools.astro astro-site/src/pages/services/vibe-coding.astro "astro-site/src/pages/ar/jobs/[slug].astro" astro-site/src/pages/ar/services/ai-agents.astro astro-site/src/pages/ar/services/vibe-coding.astro
git commit -m "fix: remove remaining stock photos falsely captioned as Aegis AI team/engineers"
```

---

## Notes for whoever picks up Phase 2+

- `team_members` (fabricated names/bios/stock photos, live in Supabase) is untouched by design — out of scope, user is handling separately. Don't fix it as a "drive-by" while touching nearby files.
- The live `case_studies` table has no Logistics row and empty `media_sections` on all 3 rows. If Phase 3 adds real case-study imagery, that's a database content task (via the Supabase Management API, credentials already available in memory), not a code change to the fallback array touched in Task 7.
- Before starting Phase 2 (shared services components), re-run `npm run check` on a clean `master` to confirm Phase 1 introduced no regressions.
