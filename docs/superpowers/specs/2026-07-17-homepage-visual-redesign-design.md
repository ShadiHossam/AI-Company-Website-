# Homepage Visual Redesign — Design Spec

## Background

User feedback (external reviewers) called the current site design "fully AI-generated" — generic and interchangeable with any other AI-SaaS landing page. Diagnosis of the current CSS confirmed the specific tells: navy/cyan radial-gradient "blob" glows behind every hero, glassmorphism cards, cyan gradient-text headlines, large uniform border-radius, and Plus Jakarta Sans — a combination extremely common across AI-tool sites built with AI website generators.

Scope for this round, per earlier decision: **visual system only**. Page structure, copy, and IA stay as-is. Only color, typography, imagery, and component styling change.

## Process

Explored via a visual-companion brainstorming session (mockups at `.superpowers/brainstorm/`): started from ui-ux-pro-max design-system search output, then pivoted hard after the user provided three real reference Dribbble shots (HackerRank B2B SaaS, ZeBeyond Engineering Platform, Wollo social-media landing) and Playwright-screenshotted them directly since they're JS-rendered SPAs. Two rounds of mockups missed the actual reference DNA (used a bold geometric sans and an indigo accent that don't appear in any of the three shots); a close re-read of the screenshots corrected course. The approved direction is a faithful adaptation of the **Wollo** reference, with a real photo added per the user's follow-up ("first option with image").

## Chosen Direction: "Wollo-faithful" white/serif system

### Colors

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page background |
| `--bg-alt` | `#f7f8fb` | Section tint (services, testimonial) |
| `--ink` | `#0b0f19` | Primary text, primary button fill |
| `--ink-soft` | `#12141a` | Headline text |
| `--muted` | `#5b6472` | Body copy, secondary text |
| `--muted-soft` | `#8891a0` | Labels, captions |
| `--accent` | `#0f9d63` | Headline emphasis (italic), stat highlights, small badges — mint/emerald, matches 2 of the 3 reference shots |
| `--line` | `#eceef3` | Hairline dividers, card borders |

No gradient gets used as a background fill anywhere. The only gradients in the system are the two small inline accent orbs (see Signature Device below) — intentionally decorative, not structural.

### Typography

- **Headings:** Fraunces (variable, optical size axis), weight 400–700, regular for the base headline, *italic* for the accented phrase within a headline. This is the single biggest correction from the initial mockup rounds — the reference shots use an elegant editorial serif, not a bold geometric sans.
- **Body / UI:** Inter, weight 400–700.
- **Arabic `/ar/` mirror:** out of scope for this pass. Keep the existing IBM Plex Sans Arabic body font for now. Pairing a serif-editorial feel into the Arabic headline is a real open question, flagged for the Arabic-parity phase — not blocking this English homepage pilot.

### Signature decorative device

Two small inline gradient-orb accents (roughly 0.85em circles, one conic pink/violet/teal, one radial amber/orange/violet) placed inline within specific words of the hero headline. This directly replaces the old "gradient blob behind the hero" pattern — same idea of a soft gradient moment, but shrunk down, placed with intent inside the text instead of diffused across the whole background.

### Imagery

Real photography (Dubai skyline / team), not stock-glassmorphism panels. Rounded corners (18px) on photo containers. The hero photo carries a small frosted info badge overlaid in the bottom-left corner (guarantee stat), the only place translucency is used, and it's a single small badge, not a full-panel glass effect.

### Components

- **Nav:** the mockups show a serif wordmark, plain text links, a "Log in"-style link plus a solid black pill CTA — this is the *aspirational* nav treatment shown in the brainstorming mockups. **The implementation plan scopes this out**: the real nav is a shared `BaseLayout` component used by every page on the site, not homepage-only, so restyling it is deferred to the future rest-of-site rollout phase rather than done as part of this homepage pilot. The homepage keeps the current nav as-is for now.
- **Buttons:** solid `--ink` fill for primary (pill/rounded-rect), 1px `--line` outline for secondary. No gradient fills.
- **Stat strip:** 3-column, hairline-divided, serif numerals.
- **Service cards:** photo-topped, `--bg-alt` fill, serif card titles, no drop shadow.
- **Testimonial:** centered serif italic pull-quote on `--bg-alt`, avatar + name/role row.

### One explicit judgment call

The brainstorming mockups presented each option as a screenshot-style "card floating on a gray backdrop" (mimicking how Dribbble presents shots). That framing device is being **dropped** for the real implementation — it only exists because a Dribbble shot is a picture of a site, not the site itself. The actual homepage renders full-bleed white, normal page chrome, no artificial outer padding or rounded viewport corners.

## New addition: motion graphics

The user asked for motion graphics on top of the approved visual concept. `motion` (successor to Framer Motion, framework-agnostic vanilla JS API) was already installed into `astro-site/package.json` earlier in this session.

Motion is applied in these places only (kept restrained — the visual direction is calm/editorial, not flashy):

1. **Scroll-reveal:** hero copy, stat strip, each service card, and the testimonial fade + slide up a small amount as they enter the viewport.
2. **Hover micro-interactions:** buttons and service cards get a subtle lift/scale on hover (150–250ms).
3. **Inline gradient orbs:** slow continuous rotation on the conic-gradient orb, a slow pulse on the radial one — small, ambient, not attention-grabbing.
4. All motion respects `prefers-reduced-motion: reduce` (disable scroll-reveal delays and the orb animations; keep instant state changes).

## Scope of this implementation pass

**Homepage only** (`astro-site/src/pages/index.astro` + a new stylesheet / component-level CSS for this system), matching what was prototyped and approved. This is a deliberate pilot — the user asked to see the homepage before this rolls out to the rest of the site. Rest-of-site rollout is a separate future phase, not part of this plan.

Existing homepage copy, section order, and functionality (modal booking flow, Supabase-backed testimonials, count-up stat script) are preserved. Only the visual layer and the addition of motion changes.

## Deferred: Fable 5 design polish pass

A Fable 5 review pass (typography/contrast sanity check, pinning exact motion timing values, an Arabic-typeface suggestion for the future `/ar/` phase) was attempted but blocked — 5 consecutive attempts across 3 narrow sub-tasks all failed with `529 Overloaded` from the Fable endpoint. Decision: proceed to implementation with the spec as written above (values already reasonable) rather than block on it. **Retry this pass later** once Fable 5 access recovers, and apply any small corrections it surfaces as a follow-up patch rather than a respec.

## Out of scope

- Any change to IA, page structure beyond the homepage, or copy.
- Arabic homepage (`ar/index.astro`) — separate future phase per the existing Phase 4 plan.
- Removing `motion` vs. keeping GSAP conversations from earlier — no GSAP was actually installed, only `motion`, so there's no duplicate-library cleanup needed.
