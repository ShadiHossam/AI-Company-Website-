# Course landing pages: Lenoo vs Shadi A/B test

## What is being tested
One variable: **who sells the course**.

| | Variant A: Lenoo (the company) | Variant B: Shadi (the mentor) |
|---|---|---|
| AI course | lenooai.com/lp/ai-course | shadihossam.com/en/uae/lp/ai-course/ |
| Marketing course | lenooai.com/lp/marketing-course | shadihossam.com/en/uae/lp/marketing-course/ |
| Voice | "we", agency, structured program | "I", first person, a person you can ask |
| Hero visual | Program-at-a-glance panel | Shadi's portrait |
| Proof under hero | Dubai agency, client work, certificate | 250+ projects, 25+ sites, founder |
| "Who teaches" | Taught by the team that does the work | Why I'm teaching this |

Everything else is the control and lives in `course-offer.ts`, which must be
byte-identical in both repos: price, dates, curriculum, outcomes, what's
included, FAQ, CTA label ("Reserve my seat"), form fields (name, email, WhatsApp),
section order. Check with `cmp` before launching.

## How to run it
1. Same ad set, same creative, same audience, same budget. Split by URL (two ads
   in one ad set, or a 50/50 split test). Tag every link:
   `?utm_source=meta&utm_medium=paid&utm_campaign=course-ab-1&utm_content=lenoo|shadi`
2. Primary metric: reservation rate = `generate_lead` / unique visitors, per variant.
   Both pages send `generate_lead` with `lp_variant` and `course` to GA4.
   Secondary: `lp_cta_click`, `lp_form_start`, and later, paid enrollments per lead.
3. Where the leads land: Lenoo in Supabase `leads` (source `course_lp`, variant in
   `notes`); Shadi in `course-bookings.csv` (variant in the message column).
4. Run until each variant has at least 100 reservations or 4 weeks, whichever is
   later. Don't stop early because one side looks ahead after a few days.
5. Judge on enrollments too: a cheaper lead that never pays is not a win.

## Tests to run after this one (one change at a time, on the winning page)
1. Headline: outcome ("in 6 weeks") vs pain ("tired of generic ChatGPT output")
2. CTA: free reservation vs "Book a 10-minute call" vs real price + pay now
3. Price display: shown vs "announced to reserved seats"
4. Proof: numbers vs student testimonials (once real ones exist)
5. Form length: 3 fields vs adding "What do you want to use it for?"
