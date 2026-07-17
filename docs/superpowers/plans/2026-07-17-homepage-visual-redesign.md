# Homepage Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Aegis AI homepage (`astro-site/src/pages/index.astro`) from the current navy/cyan gradient-blob-and-glassmorphism look to the approved white/serif/mint-accent "Wollo-faithful" system, without changing page structure, copy, or any Supabase-backed/interactive functionality.

**Architecture:** All new styling lives in one new stylesheet, scoped under a single wrapper class (`.hp-redesign`) added around the homepage's content, so nothing in `global.css` is touched and no other page is affected — this is a homepage-only pilot per the design spec. Font loading uses `@fontsource` packages (matches the existing project convention, no external CDN dependency). Motion is added via the `motion` npm package (already installed), split into a pure/testable config module and a DOM-wiring script.

**Tech Stack:** Astro (plain CSS, no Tailwind), `@fontsource-variable/fraunces`, `@fontsource/inter`, `motion` (npm), Vitest (for the pure motion-config unit test only — the existing suite doesn't cover markup/CSS).

**Design spec:** `docs/superpowers/specs/2026-07-17-homepage-visual-redesign-design.md` — read this first for full rationale.

**Reference structural map** (from investigation, keep for context while executing):
- `astro-site/src/pages/index.astro` is 1222 lines. Frontmatter (lines 1–217) loads `pc`/`g()` CMS getter, Supabase `testimonials` (with 3-item fallback), `getInitials()`, `latestPosts` (Supabase blog posts, may be empty), `truncate()`, and JSON-LD schema. `BaseLayout` wraps everything (opens ~219, closes ~891). A local `<style>` block runs from ~894–1222.
- Two `<script is:inline>` blocks exist: count-up animation (~298–340, reads `[data-countup]`) and the picker/quiz interactivity (~633–653, reads `.picker-btn`/`data-target`/`#picker-hint`/`.picker-panel`, toggles `.active`/`.show`).
- Three booking-modal triggers call `onclick="openModal(this)"` (defined outside this file) — **do not rename, remove, or change the `data-source` attribute values** on these: `data-source="homepage_hero"` (hero), `data-source="homepage_picker"` (×5, inside picker panels), `data-source="homepage_cta_bottom"` (final CTA).
- `global.css` (998 lines) hardcodes colors directly in most rules rather than using its own `:root` custom properties — this is why we scope everything under `.hp-redesign` instead of trying to redefine shared tokens.

## Explicit scope decisions (stated up front, not re-litigated per task)

1. **Nav and footer are NOT restyled.** They're shared `BaseLayout` components used by every page on the site; restyling them is out of scope for a homepage-only pilot. Only the content between the hero and the final CTA band changes.
2. **All 14 homepage sections get the new token system** (colors, typography, button/card treatment), even though only the hero/stat-band/services/testimonial were explicitly mocked up during brainstorming. A homepage that's half old-navy-cyan and half new-white-mint would look broken, not like a coherent pilot. Sections without an explicit mockup (Authority, Who This Is For, Industries, Picker, Value grid, Comparison table, Process thread, FAQ preview, Blog preview) get the same design tokens applied to their existing layout structure — no new bespoke layouts invented for them.
3. The body-wide film-grain overlay (`body::after` in `global.css`) and the body background gradient are left alone (site-wide, not homepage-scoped) — the `.hp-redesign` wrapper sets its own opaque white background, which fully covers the old body background wherever homepage content renders.

---

## Task 1: Foundation — fonts, design tokens, scoping wrapper

**Files:**
- Modify: `astro-site/package.json` (add font packages)
- Create: `astro-site/src/styles/homepage-redesign.css`
- Modify: `astro-site/src/pages/index.astro:219-227` (import CSS, open wrapper div) and `astro-site/src/pages/index.astro:889-891` (close wrapper div, before `</BaseLayout>`)

- [ ] **Step 1: Install font packages**

Run: `cd astro-site && npm install @fontsource-variable/fraunces @fontsource/inter`
Expected: `package.json` dependencies gain `@fontsource-variable/fraunces` and `@fontsource/inter`, `npm install` exits 0.

- [ ] **Step 2: Create the design-token stylesheet**

Create `astro-site/src/styles/homepage-redesign.css`:

```css
/* ── Homepage Redesign — scoped design system ──
   Everything here is scoped under .hp-redesign so it only affects the
   homepage content between the hero and the final CTA. Nav/footer and every
   other page keep using global.css untouched. */

@import '@fontsource-variable/fraunces';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';

.hp-redesign {
  --hp-bg: #ffffff;
  --hp-bg-alt: #f7f8fb;
  --hp-ink: #0b0f19;
  --hp-ink-soft: #12141a;
  --hp-muted: #5b6472;
  --hp-muted-soft: #8891a0;
  --hp-accent: #0f9d63;
  --hp-line: #eceef3;

  background: var(--hp-bg);
  font-family: 'Inter', sans-serif;
  color: var(--hp-ink);
}

.hp-redesign h1,
.hp-redesign h2,
.hp-redesign h3,
.hp-redesign h4 {
  font-family: 'Fraunces', serif;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--hp-ink-soft);
  text-wrap: balance;
}

.hp-redesign .hp-accent {
  color: var(--hp-accent);
  font-style: italic;
}

.hp-redesign ::selection {
  background: rgba(15, 157, 99, 0.22);
  color: var(--hp-ink);
}

/* Buttons — replace the cyan-gradient .btn-primary / navy-outline .btn-outline
   from global.css with the flat-ink pill system from the design spec. */
.hp-redesign .btn-primary {
  background: var(--hp-ink);
  color: #ffffff;
  border-radius: 100px;
  box-shadow: none;
}
.hp-redesign .btn-primary::before { display: none; }
.hp-redesign .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -10px rgba(11, 15, 25, 0.35);
}
.hp-redesign .btn-outline {
  border-color: var(--hp-line);
  color: var(--hp-ink);
  border-radius: 100px;
  background: #ffffff;
}
.hp-redesign .btn-outline:hover {
  background: var(--hp-bg-alt);
  box-shadow: none;
}

/* Kill the old cyan gradient-text trick everywhere on the homepage; the new
   accent device is the inline gradient orb (added per-section below) plus
   the italic mint .hp-accent span. */
.hp-redesign .gradient-text {
  background: none;
  -webkit-text-fill-color: currentColor;
  color: var(--hp-ink-soft);
}

/* Inline gradient-orb accent, used inside hero and CTA headlines */
.hp-redesign .hp-orb {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  border-radius: 50%;
  vertical-align: middle;
  margin: 0 0.12em;
  transform: translateY(-0.08em);
}
.hp-redesign .hp-orb-a {
  background: conic-gradient(from 200deg, #ff8bd6, #7c6cf0, #3adfc4, #ff8bd6);
}
.hp-redesign .hp-orb-b {
  background: radial-gradient(circle at 30% 30%, #ffd28a, #ff7a59 60%, #7c3aed 100%);
}

@media (prefers-reduced-motion: reduce) {
  .hp-redesign .hp-orb { animation: none !important; }
}
```

- [ ] **Step 3: Wrap the homepage content and import the stylesheet**

In `astro-site/src/pages/index.astro`, add the import to the frontmatter block (near the other imports, around line 6):

```astro
import "../styles/homepage-redesign.css";
```

Then find the opening of the page content — the line right after `<BaseLayout ...>` opens (around line 219–226, immediately before `<header class="hero-section hero-home">` at line 227) — and add a wrapper div:

```astro
<div class="hp-redesign">
```

Find the closing of the page content — immediately after the final CTA section's closing `</section>` tag and before `</BaseLayout>` (around line 889–891) — and close the wrapper:

```astro
</div>
```

- [ ] **Step 4: Verify it builds**

Run: `cd astro-site && npm run build`
Expected: build succeeds with no errors. (Visual confirmation happens once later tasks add content inside the wrapper — right now this step only proves the wrapper/import doesn't break the build.)

- [ ] **Step 5: Commit**

```bash
git add astro-site/package.json astro-site/package-lock.json astro-site/src/styles/homepage-redesign.css astro-site/src/pages/index.astro
git commit -m "feat(homepage): add design-token stylesheet and scoping wrapper for redesign"
```

---

## Task 2: Hero section restyle

**Files:**
- Modify: `astro-site/src/pages/index.astro:227-267`
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

- [ ] **Step 1: Replace the hero markup**

Replace the full hero block (`astro-site/src/pages/index.astro:227-267`, from `<header class="hero-section hero-home">` through its closing `</header>`) with:

```astro
<header class="hero-section hero-home hp-hero">
  <div class="container">
    <div class="hp-hero-copy">
      <div class="hp-hero-eyebrow"><span class="hp-hero-eyebrow-dot"></span>Dubai's AI Agency for Growing Businesses</div>
      <h1>
        Dubai's AI agency building systems<span class="hp-orb hp-orb-a" aria-hidden="true"></span> that actually fit how your business <span class="hp-accent">already works</span><span class="hp-orb hp-orb-b" aria-hidden="true"></span>.
      </h1>
      <p class="hp-hero-lede">
        Custom AI systems, agents, and automation for Dubai companies, built around how you already work. Every project includes team training, 90 days of support, and a 100% refund guarantee.
      </p>
      <div class="hp-hero-cta-row">
        <button onclick="openModal(this)" data-source="homepage_hero" class="btn-primary">
          {g('hero_cta', 'Book Free Strategy Call')}
          <span class="material-symbols-outlined" aria-hidden="true" style="font-size:20px;">arrow_forward</span>
        </button>
        <a href="/services" class="btn-outline">
          Explore Services
          <span class="material-symbols-outlined" aria-hidden="true" style="font-size:20px;">arrow_forward</span>
        </a>
      </div>
    </div>
    <div class="hp-hero-photo">
      <Image
        src={heroDubai}
        widths={[640, 960, 1280, 1920]}
        sizes="(max-width: 900px) 100vw, 1100px"
        format="avif"
        quality={70}
        alt="Dubai skyline at dusk with the Burj Khalifa and Downtown towers"
        loading="eager"
        fetchpriority="high"
      />
      <div class="hp-hero-photo-badge">
        <span class="hp-hero-photo-badge-num">100%</span>
        <span class="hp-hero-photo-badge-label">Refund guarantee on every engagement, no risk to try Aegis</span>
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Add the hero CSS**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
.hp-redesign .hp-hero {
  background: var(--hp-bg);
  padding: 4rem 0 0;
  position: static;
}
.hp-redesign .hp-hero .hero-bg-overlay,
.hp-redesign .hp-hero .hero-bg-img {
  display: none;
}
.hp-redesign .hp-hero-copy {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}
.hp-redesign .hp-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--hp-muted);
  margin-bottom: 1.5rem;
}
.hp-redesign .hp-hero-eyebrow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--hp-accent);
}
.hp-redesign .hp-hero-copy h1 {
  font-size: clamp(2.25rem, 4.5vw, 3.25rem);
  line-height: 1.2;
  margin: 0 0 1.5rem;
}
.hp-redesign .hp-hero-lede {
  font-family: 'Inter', sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--hp-muted);
  max-width: 46rem;
  margin: 0 auto 2rem;
}
.hp-redesign .hp-hero-cta-row {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}
.hp-redesign .hp-hero-photo {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  max-width: 1100px;
  margin: 0 auto;
}
.hp-redesign .hp-hero-photo img {
  width: 100%;
  height: auto;
  max-height: 520px;
  object-fit: cover;
  display: block;
}
.hp-redesign .hp-hero-photo-badge {
  position: absolute;
  left: 24px;
  bottom: 24px;
  right: 24px;
  max-width: 320px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.hp-redesign .hp-hero-photo-badge-num {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--hp-accent);
}
.hp-redesign .hp-hero-photo-badge-label {
  font-size: 0.8125rem;
  color: var(--hp-ink);
  line-height: 1.4;
}
@media (max-width: 640px) {
  .hp-redesign .hp-hero-photo-badge { position: static; margin-top: 12px; max-width: none; }
}
```

- [ ] **Step 3: Verify in the dev server**

Run: `cd astro-site && npm run dev`, open `http://localhost:4321/` in a browser.
Expected: hero shows a white background, serif headline with the italicized mint "already works" phrase and two small gradient orb dots inline, the Dubai photo below the headline (not as a full-bleed background), the guarantee badge overlaid on the photo's bottom-left corner. Both CTA buttons still open the booking modal / navigate to `/services`.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/pages/index.astro astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle hero section to white/serif design"
```

---

## Task 3: Stat band restyle

**Files:**
- Modify: `astro-site/src/pages/index.astro:270-296` (markup, only if class names need adjusting — they don't, this is CSS-only)
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

The stat-band markup (`.stat-band`, `.stat-band-grid`, `.stat-band-item`, `.stat-band-icon`, `.stat-band-number` with `data-countup`/`data-suffix`, `.stat-band-label`) stays exactly as-is — the count-up script at lines 298–340 depends on `[data-countup]`/`data-suffix` attributes, which this task does not touch. Only the CSS changes.

- [ ] **Step 1: Add the stat-band override CSS**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
.hp-redesign .stat-band {
  background: var(--hp-bg);
  border-top: 1px solid var(--hp-line);
  border-bottom: 1px solid var(--hp-line);
  padding: 0;
}
.hp-redesign .stat-band-grid {
  max-width: 1100px;
  margin: 0 auto;
}
.hp-redesign .stat-band-item {
  padding: 2rem 1.5rem;
}
.hp-redesign .stat-band-icon {
  background: var(--hp-bg-alt);
  color: var(--hp-accent);
  border: 1px solid var(--hp-line);
}
.hp-redesign .stat-band-icon-amber {
  background: var(--hp-bg-alt);
  color: var(--hp-accent);
}
.hp-redesign .stat-band-number {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  background: none;
  -webkit-text-fill-color: currentColor;
  color: var(--hp-ink-soft);
}
.hp-redesign .stat-band-label {
  color: var(--hp-muted);
}
```

- [ ] **Step 2: Verify in the dev server**

Refresh `http://localhost:4321/`.
Expected: the stat band (100% Refund Guarantee / Free Strategy Call / 90-Day Support) now sits on a white background with hairline top/bottom borders instead of the dark navy gradient panel, numerals in serif, icons in a light mint-tinted chip instead of glowing cyan circles. Count-up animation on page load still works (the "100%" and "90-Day" numbers should still animate up from 0 the first time the section scrolls into view).

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle stat band to light design"
```

---

## Task 4: Motion module (pure config + DOM wiring)

**Files:**
- Create: `astro-site/src/lib/homepage-motion-config.ts`
- Test: `astro-site/src/__tests__/lib/homepage-motion-config.test.ts`
- Create: `astro-site/src/scripts/homepage-motion.ts`
- Modify: `astro-site/src/pages/index.astro` (add script tag near the end of the wrapper, before `</div>` closing `.hp-redesign`)

The existing Vitest config runs in `environment: 'node'` and only covers `src/lib/**`, `src/pages/api/admin/**`, `src/middleware.ts` — there's no DOM/jsdom test setup for markup. So the animation *decisions* (durations, distances, easing, what reduced-motion does) go in a pure function in `src/lib` that's genuinely unit-testable; the DOM wiring (querying elements, calling `motion`'s `animate`/`inView`) is a separate script that isn't unit tested, only verified in-browser — same pattern the codebase already uses for the count-up script.

- [ ] **Step 1: Write the failing test for the motion config**

Create `astro-site/src/__tests__/lib/homepage-motion-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getRevealTransition, getHoverLift, getOrbAnimation } from '../../lib/homepage-motion-config';

describe('getRevealTransition', () => {
  it('returns a slide-up fade-in transition when motion is allowed', () => {
    const t = getRevealTransition(false);
    expect(t).toEqual({ opacity: [0, 1], y: [16, 0], duration: 0.5, easing: [0.16, 1, 0.3, 1] });
  });

  it('returns an instant, motionless transition when reduced motion is requested', () => {
    const t = getRevealTransition(true);
    expect(t).toEqual({ opacity: [1, 1], y: [0, 0], duration: 0, easing: 'linear' });
  });
});

describe('getHoverLift', () => {
  it('returns a subtle lift when motion is allowed', () => {
    const t = getHoverLift(false);
    expect(t).toEqual({ scale: 1.015, y: -2, duration: 0.2 });
  });

  it('returns no movement when reduced motion is requested', () => {
    const t = getHoverLift(true);
    expect(t).toEqual({ scale: 1, y: 0, duration: 0 });
  });
});

describe('getOrbAnimation', () => {
  it('returns slow ambient rotation/pulse config when motion is allowed', () => {
    const t = getOrbAnimation(false);
    expect(t).toEqual({ rotateDurationSeconds: 18, pulseDurationSeconds: 4 });
  });

  it('returns null (no animation) when reduced motion is requested', () => {
    expect(getOrbAnimation(true)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd astro-site && npx vitest run src/__tests__/lib/homepage-motion-config.test.ts`
Expected: FAIL — `Cannot find module '../../lib/homepage-motion-config'`.

- [ ] **Step 3: Write the motion config module**

Create `astro-site/src/lib/homepage-motion-config.ts`:

```ts
export type RevealTransition = {
  opacity: [number, number];
  y: [number, number];
  duration: number;
  easing: [number, number, number, number] | 'linear';
};

export function getRevealTransition(prefersReducedMotion: boolean): RevealTransition {
  if (prefersReducedMotion) {
    return { opacity: [1, 1], y: [0, 0], duration: 0, easing: 'linear' };
  }
  return { opacity: [0, 1], y: [16, 0], duration: 0.5, easing: [0.16, 1, 0.3, 1] };
}

export type HoverLift = {
  scale: number;
  y: number;
  duration: number;
};

export function getHoverLift(prefersReducedMotion: boolean): HoverLift {
  if (prefersReducedMotion) {
    return { scale: 1, y: 0, duration: 0 };
  }
  return { scale: 1.015, y: -2, duration: 0.2 };
}

export type OrbAnimation = {
  rotateDurationSeconds: number;
  pulseDurationSeconds: number;
};

export function getOrbAnimation(prefersReducedMotion: boolean): OrbAnimation | null {
  if (prefersReducedMotion) {
    return null;
  }
  return { rotateDurationSeconds: 18, pulseDurationSeconds: 4 };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd astro-site && npx vitest run src/__tests__/lib/homepage-motion-config.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the DOM wiring script**

Create `astro-site/src/scripts/homepage-motion.ts`:

```ts
import { animate, inView } from 'motion';
import { getRevealTransition, getHoverLift, getOrbAnimation } from '../lib/homepage-motion-config';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initScrollReveal() {
  const reduced = prefersReducedMotion();
  const targets = document.querySelectorAll<HTMLElement>(
    '.hp-hero-copy, .hp-hero-photo, .stat-band-item, .service-card, .testimonial-card'
  );
  targets.forEach((el) => {
    const t = getRevealTransition(reduced);
    el.style.opacity = String(t.opacity[0]);
    inView(el, () => {
      animate(el, { opacity: t.opacity, y: t.y }, { duration: t.duration, easing: t.easing });
    }, { margin: '0px 0px -10% 0px' });
  });
}

function initHoverLift() {
  const reduced = prefersReducedMotion();
  const lift = getHoverLift(reduced);
  if (lift.duration === 0) return;
  const targets = document.querySelectorAll<HTMLElement>('.btn-primary, .btn-outline, .service-card');
  targets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      animate(el, { scale: lift.scale, y: lift.y }, { duration: lift.duration });
    });
    el.addEventListener('mouseleave', () => {
      animate(el, { scale: 1, y: 0 }, { duration: lift.duration });
    });
  });
}

function initOrbAnimation() {
  const reduced = prefersReducedMotion();
  const orbConfig = getOrbAnimation(reduced);
  if (!orbConfig) return;
  const rotating = document.querySelectorAll<HTMLElement>('.hp-orb-a');
  rotating.forEach((el) => {
    animate(el, { rotate: 360 }, { duration: orbConfig.rotateDurationSeconds, repeat: Infinity, easing: 'linear' });
  });
  const pulsing = document.querySelectorAll<HTMLElement>('.hp-orb-b');
  pulsing.forEach((el) => {
    animate(
      el,
      { scale: [1, 1.12, 1] },
      { duration: orbConfig.pulseDurationSeconds, repeat: Infinity, easing: 'ease-in-out' }
    );
  });
}

export function initHomepageMotion() {
  initScrollReveal();
  initHoverLift();
  initOrbAnimation();
}

initHomepageMotion();
```

- [ ] **Step 6: Load the script from the homepage**

In `astro-site/src/pages/index.astro`, immediately before the closing `</div>` of the `.hp-redesign` wrapper (added in Task 1, Step 3), add:

```astro
<script>
  import '../scripts/homepage-motion.ts';
</script>
```

- [ ] **Step 7: Verify in the dev server**

Refresh `http://localhost:4321/` with dev tools open, no console errors. Scroll down: hero copy/photo, each stat item, each service card, and the testimonials should fade+slide up as they enter view. Hover a button or service card: subtle lift. The two hero headline orbs: one slowly rotates, the other slowly pulses.

Then in browser dev tools, enable "Emulate CSS prefers-reduced-motion: reduce" (Chrome DevTools → Rendering tab), refresh: content should appear immediately with no fade/slide, hover should not lift, orbs should be static.

- [ ] **Step 8: Run the full test suite to confirm no regressions**

Run: `cd astro-site && npm run test`
Expected: all existing tests still pass, plus the 6 new `homepage-motion-config` tests.

- [ ] **Step 9: Commit**

```bash
git add astro-site/src/lib/homepage-motion-config.ts astro-site/src/__tests__/lib/homepage-motion-config.test.ts astro-site/src/scripts/homepage-motion.ts astro-site/src/pages/index.astro
git commit -m "feat(homepage): add restrained scroll-reveal and hover motion"
```

---

## Task 5: Services bento grid restyle

**Files:**
- Modify: `astro-site/src/pages/index.astro:407-482`
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

This section currently has the heaviest inline-style debt (per-card `style="font-size:1.25rem; font-weight:700; color:#00253b; ..."` repeated 6×, plus inline styles on each "Learn More" link). Replace the inline styles with classes.

- [ ] **Step 1: Replace the services section markup**

Replace `astro-site/src/pages/index.astro:407-482` (the full `<section id="services" ...>` through its closing `</section>`) with:

```astro
<section id="services" class="section hp-services" aria-labelledby="services-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="services-heading">The Full AI Adoption Journey, in One Place</h2>
      <p>We cover everything your business needs to adopt AI well: from knowing where to start, to building the right systems, to making sure your team actually uses them.</p>
    </div>
    <div class="bento-grid bento-grid-3 hp-service-grid">
      <div class="service-card hp-service-card">
        <div class="service-icon hp-service-icon">
          <span class="material-symbols-outlined" aria-hidden="true">smart_toy</span>
        </div>
        <h3>AI Agents</h3>
        <p>Custom AI agents that handle specific tasks in your business automatically, from customer interactions to data processing and decision-making.</p>
        <a href="/services" class="hp-service-link">Learn More <span class="material-symbols-outlined" aria-hidden="true" style="font-size:18px;">arrow_forward</span></a>
      </div>
      <div class="service-card hp-service-card">
        <div class="service-icon hp-service-icon">
          <span class="material-symbols-outlined" aria-hidden="true">group</span>
        </div>
        <h3>AI Team Training</h3>
        <p>Most AI investments fail because teams don't adopt them. We train your people to use AI confidently in their daily work, role-specific, hands-on, and tailored to your industry.</p>
        <a href="/services/ai-training" class="hp-service-link">Learn More <span class="material-symbols-outlined" aria-hidden="true" style="font-size:18px;">arrow_forward</span></a>
      </div>
      <div class="service-card hp-service-card">
        <div class="service-icon hp-service-icon">
          <span class="material-symbols-outlined" aria-hidden="true">bolt</span>
        </div>
        <h3>Workflow Automation</h3>
        <p>Connect your tools and automate repetitive processes so your team stops doing things manually. We map your workflow and build the automation around it.</p>
        <a href="/services" class="hp-service-link">Learn More <span class="material-symbols-outlined" aria-hidden="true" style="font-size:18px;">arrow_forward</span></a>
      </div>
      <div class="service-card hp-service-card">
        <div class="service-icon hp-service-icon">
          <span class="material-symbols-outlined" aria-hidden="true">dns</span>
        </div>
        <h3>Internal Systems</h3>
        <p>Custom dashboards, portals, and internal tools built for how your team works. Not generic software that needs workarounds, but something built specifically for your process.</p>
        <a href="/services" class="hp-service-link">Learn More <span class="material-symbols-outlined" aria-hidden="true" style="font-size:18px;">arrow_forward</span></a>
      </div>
      <div class="service-card hp-service-card">
        <div class="service-icon hp-service-icon">
          <span class="material-symbols-outlined" aria-hidden="true">monitor_heart</span>
        </div>
        <h3>Custom AI Development</h3>
        <p>Fully bespoke AI solutions built around your specific workflows and requirements. Integrated with the tools you already use, built to last.</p>
        <a href="/services/custom-ai-development" class="hp-service-link">Learn More <span class="material-symbols-outlined" aria-hidden="true" style="font-size:18px;">arrow_forward</span></a>
      </div>
      <div class="service-card hp-service-card">
        <div class="service-icon hp-service-icon">
          <span class="material-symbols-outlined" aria-hidden="true">bar_chart</span>
        </div>
        <h3>AI Strategy</h3>
        <p>We map where AI makes the most sense in your business and give you a clear plan before you spend anything. Know exactly what you are getting into before we start.</p>
        <a href="/services" class="hp-service-link">Learn More <span class="material-symbols-outlined" aria-hidden="true" style="font-size:18px;">arrow_forward</span></a>
      </div>
    </div>
  </div>
</section>
```

> Note: this preserves the exact 6 services, icons, hrefs, and copy from the original — only the per-card inline `style=""` attributes on `<h3>`/`<p>`/`<a>` are removed in favor of the new `hp-service-*` classes below.

- [ ] **Step 2: Add the services CSS**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
.hp-redesign .hp-services {
  background: var(--hp-bg);
}
.hp-redesign .hp-service-card {
  background: var(--hp-bg-alt);
  border: 1px solid var(--hp-line);
  border-radius: 16px;
  box-shadow: none;
  padding: 1.75rem;
}
.hp-redesign .hp-service-card:hover {
  box-shadow: none;
  border-color: var(--hp-accent);
}
.hp-redesign .hp-service-icon {
  background: #ffffff;
  border: 1px solid var(--hp-line);
  color: var(--hp-accent);
}
.hp-redesign .hp-service-card h3 {
  font-size: 1.1875rem;
  margin-bottom: 0.75rem;
}
.hp-redesign .hp-service-card p {
  color: var(--hp-muted);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}
.hp-redesign .hp-service-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--hp-accent);
  text-decoration: none;
}
```

- [ ] **Step 3: Verify in the dev server**

Refresh `http://localhost:4321/#services`.
Expected: 6 service cards on a light gray-tinted background, mint accent icon chip and "Learn More" links, no navy text, cards fade up on scroll (per Task 4's reveal) and lift slightly on hover.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/pages/index.astro astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle services grid, remove inline styles"
```

---

## Task 6: Testimonials restyle (CSS-only)

**Files:**
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

This section (`astro-site/src/pages/index.astro:764-792`) has zero inline styles and every class is locally scoped and fully defined in `index.astro`'s own `<style>` block — do not touch the markup or the `.map()`/conditional logic over `testimonials`, only add CSS overrides.

- [ ] **Step 1: Add the testimonial override CSS**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
.hp-redesign .testimonial-card {
  background: var(--hp-bg-alt);
  border: 1px solid var(--hp-line);
  box-shadow: none;
}
.hp-redesign .testimonial-card:hover {
  box-shadow: none;
  transform: none;
  border-color: var(--hp-accent);
}
.hp-redesign .testimonial-quote-icon {
  color: var(--hp-accent);
}
.hp-redesign .testimonial-quote {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 500;
  color: var(--hp-ink-soft);
}
.hp-redesign .testimonial-name {
  color: var(--hp-ink);
}
.hp-redesign .testimonial-role {
  color: var(--hp-muted);
}
.hp-redesign .testimonial-avatar-initials {
  background: var(--hp-accent);
  color: #ffffff;
}
.hp-redesign .testimonial-industry {
  background: var(--hp-bg);
  border: 1px solid var(--hp-line);
  color: var(--hp-muted);
}
```

- [ ] **Step 2: Verify in the dev server**

Refresh and scroll to the testimonials section.
Expected: testimonial cards on a light gray-tinted background with hairline borders, quote text in italic serif, quote icon in mint. Confirm real Supabase testimonials (or the 3 fallback ones if Supabase has none published) still render correctly with avatar images or initials fallback.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle testimonials section"
```

---

## Task 7: Authority, Who This Is For, and Industries sections

**Files:**
- Modify: `astro-site/src/pages/index.astro:342-405` (remove inline `style="background:#fff;"` on the "Who This Is For" section wrapper; remove inline `style="margin-bottom:1.5rem;"` on the Authority `<h2>`)
- Modify: `astro-site/src/pages/index.astro:484-530` (Industries section — no markup change needed, CSS-only)
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

- [ ] **Step 1: Remove the two inline styles**

In `astro-site/src/pages/index.astro`:
- Line ~342 area: change `<section class="section" aria-labelledby="authority-heading">` — this one has no inline background, leave the section tag as-is, but find the `<h2 style="margin-bottom:1.5rem;">` inside it and change it to `<h2>` (remove the inline style; spacing is handled by the new CSS below).
- Line ~374: change `<section class="section" style="background:#fff;" aria-labelledby="who-heading">` to `<section class="section hp-who" aria-labelledby="who-heading">`.

- [ ] **Step 2: Add class hooks to Industries section wrapper**

Find `<section class="section" style="background:#fff;" aria-labelledby="industries-heading">` (~line 484) and change it to `<section class="section hp-industries" aria-labelledby="industries-heading">`.

- [ ] **Step 3: Add the CSS for all three sections**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
/* Authority */
.hp-redesign .authority-eyebrow {
  color: var(--hp-accent);
}
.hp-redesign .authority-para {
  color: var(--hp-muted);
}
.hp-redesign .authority-badge {
  background: var(--hp-bg-alt);
  border: 1px solid var(--hp-line);
  color: var(--hp-ink);
}
.hp-redesign .authority-link {
  color: var(--hp-accent);
}

/* Who This Is For */
.hp-redesign .hp-who {
  background: var(--hp-bg);
}
.hp-redesign .statement-row {
  border-bottom-color: var(--hp-line);
}
.hp-redesign .statement-row:hover {
  border-bottom-color: var(--hp-accent);
}
.hp-redesign .statement-row > .statement-icon {
  background: var(--hp-bg-alt);
  border-color: var(--hp-line);
  color: var(--hp-accent);
}
.hp-redesign .statement-row > h3 {
  color: var(--hp-ink-soft);
}
.hp-redesign .statement-row > p {
  color: var(--hp-muted);
}

/* Industries */
.hp-redesign .hp-industries {
  background: var(--hp-bg-alt);
}
.hp-redesign .industry-icon {
  color: var(--hp-accent);
}
.hp-redesign .industry-link {
  color: var(--hp-accent);
}
```

- [ ] **Step 4: Verify in the dev server**

Refresh and scroll through the Authority, "Who This Is For" (statement rows), and Industries sections.
Expected: no more navy/cyan accent colors, consistent mint accent, alternating white / light-gray section backgrounds instead of the old white / `#e7eeff` pairing.

- [ ] **Step 5: Commit**

```bash
git add astro-site/src/pages/index.astro astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle authority, who-this-is-for, and industries sections"
```

---

## Task 8: Picker/quiz, value grid, and comparison table

**Files:**
- Modify: `astro-site/src/pages/index.astro:532-726` (class hooks only — see below, no id/class renames on JS-coupled elements)
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

**Critical constraint:** the picker section's script (lines ~633–653) selects `.picker-btn`, `.picker-panel`, `#picker-hint`, and matches each button's `data-target` to a panel's `id` (`picker-leads`, `picker-repetitive`, `picker-start`, `picker-tools`, `picker-adoption`). **None of these class names, the `id` values, or the `data-target` values may change.** Only add new CSS rules targeting the existing selectors — do not rename them.

- [ ] **Step 1: Add a section-level class hook to the picker wrapper**

Find `<section id="picker" class="section" aria-labelledby="picker-heading">` (~line 532) and change to `<section id="picker" class="section hp-picker" aria-labelledby="picker-heading">` — this only adds a class, `id="picker"` (the anchor target) stays exactly as-is.

- [ ] **Step 2: Add class hooks to value grid and comparison table wrappers**

Find `<section class="section" style="background:#fff;" aria-labelledby="different-heading">` (~line 655) and change to `<section class="section hp-different" aria-labelledby="different-heading">`.

Find `<section class="section" style="background:#e7eeff;" aria-labelledby="compare-heading">` (~line 695) and change to `<section class="section hp-compare" aria-labelledby="compare-heading">`.

- [ ] **Step 3: Add the CSS for all three sections**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
/* Picker / quiz */
.hp-redesign .hp-picker {
  background: var(--hp-bg-alt);
}
.hp-redesign .picker-btn {
  border-color: var(--hp-line);
  color: var(--hp-ink);
  background: #ffffff;
}
.hp-redesign .picker-btn.active,
.hp-redesign .picker-btn[aria-expanded="true"] {
  background: var(--hp-ink);
  border-color: var(--hp-ink);
  color: #ffffff;
}
.hp-redesign .picker-hint {
  color: var(--hp-muted);
}
.hp-redesign .picker-panel {
  background: #ffffff;
  border: 1px solid var(--hp-line);
}
.hp-redesign .picker-card-label {
  color: var(--hp-accent);
}
.hp-redesign .picker-card-title {
  color: var(--hp-ink-soft);
}
.hp-redesign .picker-card-desc {
  color: var(--hp-muted);
}
.hp-redesign .picker-learn-link {
  color: var(--hp-accent);
}

/* What Makes Us Different (value grid) */
.hp-redesign .hp-different {
  background: var(--hp-bg);
}
.hp-redesign .value-card {
  background: var(--hp-bg-alt);
  border: 1px solid var(--hp-line);
  box-shadow: none;
}

/* Comparison table */
.hp-redesign .hp-compare {
  background: var(--hp-bg-alt);
}
.hp-redesign .compare-table {
  background: #ffffff;
  border: 1px solid var(--hp-line);
}
.hp-redesign .check-yes {
  color: var(--hp-accent);
}
```

- [ ] **Step 4: Verify in the dev server**

Refresh, scroll to the picker section: click each of the 5 "I am..." buttons and confirm the matching panel still shows/hides correctly (this is the regression risk — if it breaks, a class/id got renamed by mistake). Confirm each panel's "Book Free Strategy Call" button still opens the booking modal. Then check the value grid and comparison table sections for the new light styling.

- [ ] **Step 5: Commit**

```bash
git add astro-site/src/pages/index.astro astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle picker, value grid, and comparison table"
```

---

## Task 9: Process thread, FAQ preview, blog preview, and final CTA

**Files:**
- Modify: `astro-site/src/pages/index.astro:864-889` (final CTA — remove inline styles on `<h2>` and its gradient-text span)
- Modify: `astro-site/src/styles/homepage-redesign.css` (append)

- [ ] **Step 1: Replace the final CTA's inline-styled headline**

Find the final CTA section (~lines 864–889). Locate the `<h2 style="font-size:clamp(1.75rem,4vw,3rem); font-weight:800; letter-spacing:-0.03em; margin-bottom:1.5rem;">` and its inner gradient-text span (`style="background:linear-gradient(135deg,#00e3fd,#9cf0ff);..."`). Replace that `<h2>...</h2>` block with:

```astro
<h2 class="hp-cta-heading">
  Ready to see where AI fits <span class="hp-accent">in your business?</span>
</h2>
```

Leave the rest of the final CTA section (trust badges, button, bottom icon row) as-is — those get restyled via CSS only in Step 2 below.

- [ ] **Step 2: Add the CSS for process thread, FAQ preview, blog preview, and final CTA**

Append to `astro-site/src/styles/homepage-redesign.css`:

```css
/* Process thread */
.hp-redesign .thread-node {
  background: #ffffff;
  border-color: var(--hp-line);
  color: var(--hp-accent);
}
.hp-redesign .thread-step-final .thread-node {
  background: var(--hp-accent);
  border-color: var(--hp-accent);
  color: #ffffff;
}
.hp-redesign .process-thread::before {
  background: linear-gradient(to right, transparent, var(--hp-line) 7%, var(--hp-line) 93%, transparent);
}

/* FAQ preview */
.hp-redesign .faq-item {
  border-color: var(--hp-line);
}
.hp-redesign .faq-question {
  color: var(--hp-ink-soft);
}
.hp-redesign .faq-answer {
  color: var(--hp-muted);
}

/* Blog / resources preview */
.hp-redesign .resource-card {
  border: 1px solid var(--hp-line);
  box-shadow: none;
}
.hp-redesign .resource-card-pill {
  background: var(--hp-bg-alt);
  color: var(--hp-accent);
}
.hp-redesign .resource-card-title {
  color: var(--hp-ink-soft);
}
.hp-redesign .resource-card-excerpt {
  color: var(--hp-muted);
}
.hp-redesign .resource-card-link {
  color: var(--hp-accent);
}

/* Final CTA */
.hp-redesign .cta-band {
  background: var(--hp-bg-alt);
  border-color: var(--hp-line);
  box-shadow: none;
}
.hp-redesign .cta-band::before,
.hp-redesign .cta-band::after {
  display: none;
}
.hp-redesign .cta-band p {
  color: var(--hp-muted);
}
.hp-redesign .hp-cta-heading {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  margin-bottom: 1.5rem;
}
.hp-redesign .cta-trust-badge {
  background: #ffffff;
  border: 1px solid var(--hp-line);
  color: var(--hp-muted);
}
```

- [ ] **Step 3: Verify in the dev server**

Scroll through the process thread, FAQ preview, blog preview (if `latestPosts` has entries — check by looking for at least one published blog post in Supabase, or accept it may not render if empty, that's existing behavior), and final CTA.
Expected: no remaining navy/cyan colors anywhere on the page. The final CTA's "in your business?" phrase is italic mint instead of the old cyan gradient. The bottom booking button (`data-source="homepage_cta_bottom"`) still opens the modal.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/pages/index.astro astro-site/src/styles/homepage-redesign.css
git commit -m "feat(homepage): restyle process thread, faq preview, blog preview, and final CTA"
```

---

## Task 10: Full verification pass

**Files:** none modified — this task only runs checks.

- [ ] **Step 1: Full build**

Run: `cd astro-site && npm run build`
Expected: exits 0, no errors or warnings about the new files.

- [ ] **Step 2: Type check**

Run: `cd astro-site && npm run check`
Expected: no new type errors introduced (pre-existing errors, if any, are not this plan's responsibility to fix).

- [ ] **Step 3: Full test suite**

Run: `cd astro-site && npm run test`
Expected: all tests pass, including the 6 new `homepage-motion-config` tests from Task 4.

- [ ] **Step 4: Full manual walkthrough in the dev server**

Run: `cd astro-site && npm run dev`, open `http://localhost:4321/`, and scroll the entire page top to bottom.

Checklist:
- No navy (`#00253b`) or cyan (`#00e3fd`) colors visible anywhere between the hero and final CTA.
- Nav and footer look unchanged (out of scope, should still be the old style — this confirms the `.hp-redesign` scoping didn't leak).
- All 3 booking-modal buttons (`homepage_hero`, `homepage_picker` ×5, `homepage_cta_bottom`) open the modal.
- Picker/quiz buttons still show/hide the correct panel.
- Count-up stat animation still triggers on scroll.
- Scroll-reveal and hover-lift motion work; re-check with `prefers-reduced-motion: reduce` emulated in dev tools — everything should appear instantly with no animation.
- Resize to mobile width (375px) and tablet width (768px) in dev tools — no horizontal scroll, hero photo badge stacks below the photo instead of overlapping it (per the `@media (max-width: 640px)` rule in Task 2).

- [ ] **Step 5: Report results**

No commit for this task (verification only). If any check fails, fix it as a follow-up commit referencing which task/step introduced the regression, then re-run this task's checklist.
