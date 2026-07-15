# Phase 3a: Testimonials Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's static testimonials grid (which silently drops rows 4-6 that the database already returns) with a swipeable carousel that shows all fetched testimonials, and is RTL-safe from day one so Phase 4's Arabic homepage port can reuse it without changes.

**Architecture:** Confirmed by reading `astro-site/src/pages/index.astro` directly: the testimonials query (lines 47-58) fetches up to 6 rows and falls back to 3 hardcoded testimonials, but the current markup (`.bento-grid.bento-grid-3` at line 730) is a plain 3-column CSS grid with zero carousel/slider JS anywhere on the page — rows 4-6 render but are visually identical to 1-3, just wrapping to more grid rows (not actually "dropped," but the section reads as a flat grid rather than a curated, swipeable set, and doesn't scale well past 3 items). New component: `TestimonialsCarousel.astro`, taking the same `testimonials` array shape already being fetched, self-contained (owns its CSS, ported from `index.astro`'s existing `.testimonial-*` rules — `.bento-grid`/`.bento-grid-3` is a shared `global.css` utility used by *other*, unrelated sections on this page, so it is not touched or reused here).

**RTL design decision:** Carousel navigation uses `Element.scrollIntoView({ inline: 'start' })` for programmatic scrolling and an `IntersectionObserver` (scoped to the track as `root`) to detect the active card for dot indicators — both are direction-agnostic browser APIs that work correctly under `dir="rtl"` with no sign-flipping logic needed. This deliberately avoids manually reading/writing `scrollLeft`, whose sign convention differs across browsers in RTL contexts (a well-known cross-browser inconsistency) — sidestepping that class of bug entirely rather than working around it.

**Tech Stack:** Astro component, scoped `<style>`, vanilla JS (`<script>`, matching the site's existing convention of unscoped `<script>` blocks for page interactivity — no new dependency, consistent with the design spec's "prefer a small dependency-free implementation" note).

**Verification for every step:** no test framework for page/component markup — verification is `grep` to confirm old markup is gone, `cd astro-site && npm run build` succeeding, and a `npm run dev` spot-check (including testing keyboard/click navigation and confirming behavior at &gt;3 testimonials, since the current fallback only has 3 and won't visually prove the carousel is doing anything beyond a static grid — temporarily point the Supabase query at itself or check with real DB data returning &gt;3 rows if possible, or manually inspect that the track's scroll-snap behavior + prev/next buttons work with the 3 fallback cards present, since 3 cards is still enough to test all interaction states).

---

### Task 1: Create the `TestimonialsCarousel.astro` component

**Files:**
- Create: `astro-site/src/components/TestimonialsCarousel.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Testimonial {
  client_name: string;
  client_title: string | null;
  client_company: string | null;
  industry: string | null;
  client_image_url: string | null;
  quote: string;
}

interface Props {
  testimonials: Testimonial[];
}

const { testimonials } = Astro.props;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
---

<div class="tcarousel" data-testimonial-carousel>
  <div class="tcarousel-track" data-testimonial-track role="region" aria-label="Client testimonials" tabindex="0">
    {testimonials.map((t) => (
      <figure class="testimonial-card" data-testimonial-card>
        <span class="material-symbols-outlined testimonial-quote-icon" aria-hidden="true">format_quote</span>
        <blockquote class="testimonial-quote">{t.quote}</blockquote>
        <figcaption class="testimonial-footer">
          {t.client_image_url ? (
            <img class="testimonial-avatar" src={t.client_image_url} alt={t.client_name} loading="lazy" width="48" height="48" />
          ) : (
            <span class="testimonial-avatar testimonial-avatar-initials" aria-hidden="true">{getInitials(t.client_name)}</span>
          )}
          <div>
            <p class="testimonial-name">{t.client_name}</p>
            <p class="testimonial-role">{[t.client_title, t.client_company].filter(Boolean).join(', ')}</p>
          </div>
          {t.industry && <span class="testimonial-industry">{t.industry}</span>}
        </figcaption>
      </figure>
    ))}
  </div>
  {testimonials.length > 1 && (
    <div class="tcarousel-controls">
      <button type="button" class="tcarousel-btn" data-testimonial-prev aria-label="Previous testimonial">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>
      <div class="tcarousel-dots" role="tablist" aria-label="Testimonial navigation">
        {testimonials.map((_, i) => (
          <button
            type="button"
            class="tcarousel-dot"
            data-testimonial-dot
            data-index={i}
            role="tab"
            aria-selected={i === 0 ? "true" : "false"}
            aria-label={`Go to testimonial ${i + 1}`}
          ></button>
        ))}
      </div>
      <button type="button" class="tcarousel-btn" data-testimonial-next aria-label="Next testimonial">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </button>
    </div>
  )}
</div>

<style>
.tcarousel { display: flex; flex-direction: column; gap: 1.5rem; }
.tcarousel-track {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-block: 0.25rem;
  padding-inline: 0.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tcarousel-track::-webkit-scrollbar { display: none; }
.tcarousel-track:focus-visible { outline: 2px solid #006875; outline-offset: 4px; }

.testimonial-card {
  background: #fff; border: 1px solid rgba(0,37,59,0.08);
  border-radius: 20px; padding: 2rem;
  box-shadow: var(--shadow-card);
  display: flex; flex-direction: column;
  margin: 0;
  transition: box-shadow .25s var(--ease), transform .25s var(--ease);
  flex: 0 0 calc(33.333% - 1rem);
  min-width: 280px;
  scroll-snap-align: start;
}
.testimonial-card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-4px); }
.testimonial-quote-icon { color: #00e3fd; font-size: 34px; margin-bottom: 0.75rem; }
.testimonial-quote { margin: 0 0 1.75rem; color: #42474e; line-height: 1.8; font-size: 0.9375rem; flex: 1; }
.testimonial-footer {
  display: flex; align-items: center; gap: 12px;
  padding-top: 1.25rem; margin: 0;
  border-top: 1px solid rgba(0,37,59,0.08);
}
.testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.testimonial-avatar-initials {
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #00253b, #006875);
  color: #fff; font-weight: 700; font-size: 0.9375rem; letter-spacing: 0.02em;
}
.testimonial-name { margin: 0; font-weight: 700; font-size: 0.9375rem; color: #00253b; }
.testimonial-role { margin: 0; font-size: 0.8125rem; color: #72787e; }
.testimonial-industry {
  margin-inline-start: auto;
  font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #004f58;
  background: rgba(0,104,117,0.10);
  border: 1px solid rgba(0,104,117,0.20);
  border-radius: 100px; padding: 3px 10px;
  white-space: nowrap;
}

.tcarousel-controls { display: flex; align-items: center; justify-content: center; gap: 1.5rem; }
.tcarousel-btn {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: #f0f3ff; border: 1px solid rgba(0,37,59,0.10);
  color: #00253b; cursor: pointer;
  transition: background .2s, color .2s;
}
.tcarousel-btn:hover { background: #00253b; color: #fff; }
.tcarousel-btn:focus-visible { outline: 2px solid #006875; outline-offset: 2px; }
.tcarousel-dots { display: flex; gap: 8px; }
.tcarousel-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(0,37,59,0.18); border: none; padding: 0; cursor: pointer;
  transition: background .2s, transform .2s;
}
.tcarousel-dot[aria-selected="true"] { background: #006875; transform: scale(1.3); }
.tcarousel-dot:focus-visible { outline: 2px solid #006875; outline-offset: 2px; }

@media (max-width: 900px) {
  .testimonial-card { flex: 0 0 calc(50% - 0.75rem); }
}
@media (max-width: 600px) {
  .testimonial-card { flex: 0 0 calc(100% - 0.5rem); }
}
</style>

<script>
document.querySelectorAll<HTMLElement>('[data-testimonial-carousel]').forEach((root) => {
  const track = root.querySelector<HTMLElement>('[data-testimonial-track]');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-testimonial-card]'));
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-testimonial-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-testimonial-next]');
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-testimonial-dot]'));
  if (!track || cards.length === 0) return;

  let activeIndex = 0;

  function setActive(index: number) {
    activeIndex = index;
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  function scrollToIndex(index: number) {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    cards[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  prevBtn?.addEventListener('click', () => scrollToIndex(activeIndex - 1));
  nextBtn?.addEventListener('click', () => scrollToIndex(activeIndex + 1));
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => scrollToIndex(i));
  });

  // Direction-agnostic active-card detection: works the same under LTR and RTL
  // since IntersectionObserver reports visibility relative to the track's
  // viewport, not an absolute scrollLeft coordinate.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const index = cards.indexOf(entry.target as HTMLElement);
          if (index !== -1) setActive(index);
        }
      });
    },
    { root: track, threshold: [0.6] }
  );
  cards.forEach((card) => observer.observe(card));
});
</script>
```

This is a new, genuinely interactive component (not a mechanical port) — reuses the exact existing `.testimonial-card` visual design (same classes/styles as today, so the cards themselves look identical to what's on the site now) while adding scroll-snap track behavior, prev/next buttons, and dot indicators.

- [ ] **Step 2: Verify the file is syntactically valid**

Run: `cd astro-site && npm run build`
Expected: succeeds (component isn't used anywhere yet).

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/TestimonialsCarousel.astro
git commit -m "feat: add TestimonialsCarousel component with RTL-safe navigation"
```

---

### Task 2: Migrate `index.astro` to use the carousel

**Files:**
- Modify: `astro-site/src/pages/index.astro`

- [ ] **Step 1: Add the import**

Add to the frontmatter imports:
```astro
import TestimonialsCarousel from "../components/TestimonialsCarousel.astro";
```

- [ ] **Step 2: Replace the testimonials markup**

Current (`index.astro:730-749`):
```astro
    <div class="bento-grid bento-grid-3">
      {testimonials.map((t) => (
        <figure class="testimonial-card">
          <span class="material-symbols-outlined testimonial-quote-icon" aria-hidden="true">format_quote</span>
          <blockquote class="testimonial-quote">{t.quote}</blockquote>
          <figcaption class="testimonial-footer">
            {t.client_image_url ? (
              <img class="testimonial-avatar" src={t.client_image_url} alt={t.client_name} loading="lazy" width="48" height="48" />
            ) : (
              <span class="testimonial-avatar testimonial-avatar-initials" aria-hidden="true">{getInitials(t.client_name)}</span>
            )}
            <div>
              <p class="testimonial-name">{t.client_name}</p>
              <p class="testimonial-role">{[t.client_title, t.client_company].filter(Boolean).join(', ')}</p>
            </div>
            {t.industry && <span class="testimonial-industry">{t.industry}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
```

Replace with:
```astro
    <TestimonialsCarousel testimonials={testimonials} />
```

- [ ] **Step 3: Delete the now-duplicate CSS**

Delete this exact block from `index.astro`'s `<style>` (currently around lines 1085-1119, verify with grep first since prior edits in this task may shift it):

```css
  /* ── Testimonials ── */
  .testimonial-card {
    background: #fff; border: 1px solid rgba(0,37,59,0.08);
    border-radius: 20px; padding: 2rem;
    box-shadow: var(--shadow-card);
    display: flex; flex-direction: column;
    margin: 0;
    transition: box-shadow .25s var(--ease), transform .25s var(--ease);
  }
  .testimonial-card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-4px); }
  .testimonial-quote-icon { color: #00e3fd; font-size: 34px; margin-bottom: 0.75rem; }
  .testimonial-quote { margin: 0 0 1.75rem; color: #42474e; line-height: 1.8; font-size: 0.9375rem; flex: 1; }
  .testimonial-footer {
    display: flex; align-items: center; gap: 12px;
    padding-top: 1.25rem; margin: 0;
    border-top: 1px solid rgba(0,37,59,0.08);
  }
  .testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .testimonial-avatar-initials {
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #00253b, #006875);
    color: #fff; font-weight: 700; font-size: 0.9375rem; letter-spacing: 0.02em;
  }
  .testimonial-name { margin: 0; font-weight: 700; font-size: 0.9375rem; color: #00253b; }
  .testimonial-role { margin: 0; font-size: 0.8125rem; color: #72787e; }
  .testimonial-industry {
    margin-inline-start: auto;
    font-size: 0.6875rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: #004f58;
    background: rgba(0,104,117,0.10);
    border: 1px solid rgba(0,104,117,0.20);
    border-radius: 100px; padding: 3px 10px;
    white-space: nowrap;
  }
```

Do not touch `.bento-grid`/`.bento-grid-3` (defined in `global.css`, shared by other unrelated sections on this same page at lines ~373, ~450, ~793 — those usages are untouched, only the testimonials section stops using this shared class).

Also check whether `getInitials()` (the helper function used by the old markup) is still referenced elsewhere in `index.astro` after this edit — if it was only used by the testimonials section, it becomes dead code and can be left in place (harmless) or removed; if it's used elsewhere on the page, leave it untouched either way.

- [ ] **Step 4: Verify**

Run: `grep -n "testimonial-card\|testimonial-quote\|testimonial-avatar\|testimonial-footer" astro-site/src/pages/index.astro` — expected: zero matches (all moved into the component).

Run: `grep -n "TestimonialsCarousel" astro-site/src/pages/index.astro` — expected: 2 matches (import + usage).

- [ ] **Step 5: Build**

Run: `cd astro-site && npm run build`
Expected: succeeds with no errors.

- [ ] **Step 6: Visual + interaction check**

Run `npm run dev`, open `/`, scroll to the testimonials section. Confirm:
- All cards render identically in appearance to before (same border, shadow, avatar, industry tag styling).
- Clicking the next/prev arrow buttons scrolls smoothly to the adjacent card.
- Clicking a dot jumps to that specific card and marks it active (`aria-selected="true"`, visually larger/darker dot).
- Swiping/dragging the track directly (trackpad or touch emulation in devtools) also works and updates the active dot via the `IntersectionObserver`.
- Resize the viewport narrow (< 600px) and confirm cards go full-width, one at a time.
- Using browser devtools, temporarily set the carousel's container to `dir="rtl"` (e.g. via the devtools "Force RTL" or by editing the `<div class="tcarousel">` in the inspector to add `dir="rtl"`) and confirm the prev/next buttons and dot navigation still work correctly in that orientation — this is a temporary manual check standing in for Phase 4's eventual real RTL usage, since this page itself is not RTL.

- [ ] **Step 7: Commit**

```bash
git add astro-site/src/pages/index.astro
git commit -m "refactor: migrate homepage testimonials to TestimonialsCarousel"
```

---

## Notes for Phase 4

This component was deliberately built RTL-safe (see Architecture note above) so it can be reused directly for the Arabic homepage port — no rebuild needed, just import it into `ar/index.astro` with the Arabic-language testimonials data (`ar_quote` / `ar_client_title` columns, per the design spec) once that phase is ready. Confirm at that time that the Arabic testimonials data actually has more than 1 row before relying on the carousel controls being visible (the component hides prev/next/dots entirely when `testimonials.length <= 1`).
