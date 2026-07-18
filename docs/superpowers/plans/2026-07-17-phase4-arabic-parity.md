# Phase 4: Full Arabic/English Structural Parity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) — dispatch one subagent per file listed in Tasks 2, 3, and 5 (they are independent, no shared state between page pairs except the two shared components fixed in Tasks 0–1, which must land first). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every `src/pages/ar/**` page a structural mirror of its English counterpart — same sections, same order, same shared components (`FaqAccordion`, `ProcessSteps`, `StatStrip`), translated to Arabic — per explicit user decision (2026-07-17): full structural parity, not content-preserving parity. Any Arabic-only section with no English counterpart (comparison tables, guarantee bands, category-filter tabs, "live example" cards, etc.) is deleted, not translated-and-kept.

**Architecture:** This is Phase 4 of the multi-phase site overhaul tracked in `docs/superpowers/specs/2026-07-13-site-ux-audit-fixes-design.md`. That spec's original Phase 4 scope (homepage port + FAQ unification) was too narrow — investigation for this plan (2026-07-17) found the Arabic mirrors of **all 12 service subpages never received the Phase 2a/2b/2c shared-component migrations** (`FaqAccordion`/`ProcessSteps`/`StatStrip` — confirmed via grep, zero matches for all three components across `src/pages/ar/services/*.astro`), and are in several cases (e.g. `ai-agents.astro`) structurally unrelated pages with their own bespoke sections. Scope is now: every EN/AR page pair site-wide (verified user answer: "everything at once").

**Explicitly out of scope:** the not-yet-merged Phase 3 `TestimonialsCarousel` component (exists only in the `phase3-interactive-features` worktree, not wired into `index.astro` on `master`, not part of this plan — mirror `master`'s *current* `index.astro`, which still uses a static testimonials grid). Admin pages. Pricing/plans content.

**Tech Stack:** Astro 7 components/pages, scoped `<style>`, no test framework for markup — verification is `npm run build` + `npm run dev` visual spot-check, per established project convention (see Phase 2b plan).

---

## Rules that apply to every task in this plan

1. **Section parity, not byte parity.** For each `ar/X.astro`, read the live `X.astro` in full first. The Arabic page must have the same `<section>`s, in the same order, using the same shared components. Translate meaning faithfully — do not invent stats, claims, or CTAs not present in the English source, and do not carry over any Arabic-only section.
2. **Numerals:** use Western digits (`0-9`, `%`) in all rewritten Arabic content, not Arabic-Indic digits (`٠-٩`, `٪`). Existing AR pages are inconsistent (mixed usage found via grep); Western digits are already the majority convention and match the EN source content being mirrored.
3. **FAQ data source:** `faq_items` (Supabase) has only English `question`/`answer` columns (no `question_ar`/`answer_ar` — confirmed in `supabase/schema.sql:127-133`). Arabic pages must NOT query Supabase for FAQs. Use `<FaqAccordion items={faqItems} />` with a hardcoded Arabic array translated from that page's actual current English FAQ content (the live fallback array if the EN page queries Supabase-with-fallback, or the hardcoded array if it doesn't).
4. **Keep all Arabic technical scaffolding as-is:** `ArBaseLayout`, `ArNavbar`/`ArFooter`, `dir="rtl"` / `lang="ar"`, `canonicalPath`/`enPath` props, `data-source="ar_<page>_<location>"` naming convention on CTA buttons, hreflang wiring, and **`ogImage` matching the EN page's `ogImage` value** (found in Task 1's code-quality review: the Task 1 worked example initially omitted `ogImage`, causing `/ar/services/ai-agents` to fall back to the homepage OG image instead of `/assets/og-services.jpg` for social/search link previews — fixed in that file; every other `<ArBaseLayout>` call in Tasks 2-5 must copy its corresponding EN page's `ogImage` prop value, don't drop it).
5. **Data-driven sections** (products, team members, testimonials, case studies pulled from Supabase) already use `ar_*` columns where the EN page is DB-driven — preserve that pattern; do not hardcode over live DB-driven content.
6. **Verify after every file:** `cd astro-site && npm run build` succeeds, then spot-check the page in `npm run dev` (confirm RTL layout, no leftover English strings, shared components render correctly).
7. **`serviceType` and every other ldJson field must be translated to Arabic**, not copied verbatim from EN (caught in `ai-automation.astro`'s review — one file shipped `serviceType` in English while every other ldJson field was translated). Established exceptions, confirmed acceptable: `provider.name: "Aegis AI"` (brand name stays English) and `areaServed: "United Arab Emirates"` (kept as a plain English country-name string, matching every already-approved AR service page).
8. **Page-local `<style>` blocks must use RTL-logical CSS properties, not physical ones**, when porting EN markup that uses physical `left`/`right`/`padding-left`/etc. for direction-sensitive positioning (bullet markers, icon offsets, etc.) — caught in `ai-model-finetuning.astro`'s review (`.ft-notes li::before { left:... }` sat a list bullet on the wrong side of Arabic text). Convert to `inset-inline-start`/`inset-inline-end`/`padding-inline-start`/etc. The established precedent already in the codebase for this exact pattern is `ai-training.astro:420` and `ai-strategy.astro:442`. This is distinct from Task 0's `FaqAccordion.astro` fix (that was a *shared* component used by both EN and AR pages, so the fix had to not break EN); page-local styles used only by one AR page carry no such risk — just fix them outright.
9. **When porting a sized/dimensioned element (image banners, etc.), copy EN's exact `width`/`height`/style values** — don't estimate or reuse a value from a different reference file. Caught in `ai-strategy.astro`'s review: its image banner shipped at 280px instead of matching EN's actual 420px.
10. **Genuinely dead, non-component-related CSS in the EN page's own `<style>` block may be dropped rather than ported** (confirmed acceptable in `ai-training.astro`'s review — EN had an unused `.delivery-row` rule referencing no element in its own markup; not porting it forward is fine). This is different from the `.process-grid`/`.process-connector` rules Task 1 said to leave alone — those are *used* by `ProcessSteps.astro` internally even though the page-level selector is dead; a rule with no live purpose anywhere is just EN's own latent debt and doesn't need replicating.
11. **`data-source` values on CTA buttons must be `"ar_" + the EN page's own verbatim value`, not a paraphrase or the page's file-slug.** Caught in `claude-agent-builds.astro`'s review: EN uses `"claude_agents_hero"`/`"claude_agents_cta"`, but the AR rewrite used `"ar_agent_builds_hero"`/`"ar_agent_builds_cta"` (based on the filename, not EN's actual string) — fixed to `"ar_claude_agents_hero"`/`"ar_claude_agents_cta"`. This isn't cosmetic: `src/scripts/site.ts` reads `data-source` into a hidden `page_source` field submitted with every lead, so a mismatched value breaks EN/AR lead-attribution correlation for that page. Always grep the EN page's actual `data-source` values first and prefix each with `ar_` — don't infer the value from the URL slug or page name.

---

### Task 0: Fix `FaqAccordion.astro`'s RTL bug (prerequisite for every FAQ migration below)

**Files:**
- Modify: `astro-site/src/components/FaqAccordion.astro`

**Problem:** `.faq-btn { text-align:left; ... }` (line 28) is a physical CSS value. It will NOT flip under `dir="rtl"` the way a logical value would, so once Arabic pages adopt this shared component, every FAQ question renders left-aligned — wrong for RTL reading direction. `ProcessSteps.astro` and `StatStrip.astro` don't have this problem (both use `text-align:center`, which is direction-agnostic), so this is the only shared-component fix needed before Arabic pages can safely reuse all three.

- [ ] **Step 1: Change the physical value to a logical one**

In `astro-site/src/components/FaqAccordion.astro`, line 28, change:
```css
.faq-btn { display:flex; justify-content:space-between; align-items:center; width:100%; text-align:left; padding:1.1rem 0; font-weight:600; color:#00253b; cursor:pointer; background:none; border:none; font-family:inherit; font-size:0.95rem; }
```
to:
```css
.faq-btn { display:flex; justify-content:space-between; align-items:center; width:100%; text-align:start; padding:1.1rem 0; font-weight:600; color:#00253b; cursor:pointer; background:none; border:none; font-family:inherit; font-size:0.95rem; }
```
(`text-align:start` resolves to `left` under `dir="ltr"` and `right` under `dir="rtl"` — zero visual change on the 13 English pages already using this component, correct alignment on Arabic pages.)

- [ ] **Step 2: Verify no visual change on English pages**

Run: `cd astro-site && npm run build`
Expected: succeeds. Then `npm run dev`, open `/services/ai-agents#faq` (or any EN services page), confirm FAQ questions are still left-aligned (unchanged).

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/FaqAccordion.astro
git commit -m "fix: use logical text-align in FaqAccordion so RTL pages align correctly"
```

---

### Task 1: Worked example — rewrite `ar/services/ai-agents.astro` to mirror `services/ai-agents.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/services/ai-agents.astro` (currently 453 lines, bespoke structure — full rewrite)
- Reference (read-only): `astro-site/src/pages/services/ai-agents.astro` (337 lines — the structure being mirrored)

This task is the reference implementation — its output quality/pattern is what Tasks 2 and 5 must match. The EN page has 8 sections: hero, image banner + `StatStrip`, "What Exactly Is an AI Agent?" (explain-split), agent demo tabs (interactive), agent types grid (6 cards), industry applications grid (6 cards), "How We Build and Deploy" + `ProcessSteps`, FAQ (`FaqAccordion`), final CTA band. The current AR page instead has: hero, stats strip (own markup, not `StatStrip`), a category-filter tab bar over "what we build" cards (no EN equivalent — **delete**), an agent-vs-chatbot comparison table (no EN equivalent — **delete**), a "results card" with a fake case study (no EN equivalent — **delete**), a 3-step "how it works" (own markup, not `ProcessSteps`), a money-back guarantee band (no EN equivalent — **delete**), FAQ (own markup, not `FaqAccordion`), final CTA.

- [ ] **Step 1: Add component imports and translated data arrays to frontmatter**

Replace the frontmatter (currently lines 1-63) with:

```astro
---
export const prerender = false;
import ArBaseLayout from '../../../layouts/ArBaseLayout.astro';
import FaqAccordion from '../../../components/FaqAccordion.astro';
import ProcessSteps from '../../../components/ProcessSteps.astro';
import StatStrip from '../../../components/StatStrip.astro';

const processSteps = [
  { icon: "target", step: "الخطوة 1", title: "تحديد المهمة", description: "نُحدد بدقة ما يحتاج وكيلك لفعله، والأدوات التي يحتاج الوصول إليها، وأين يبقى الإنسان جزءاً من القرار." },
  { icon: "extension", step: "الخطوة 2", title: "البناء والربط", description: "نبني الوكيل، نربطه بأدواتك، نُدرّبه على سياقك، ونُحدد الضوابط لتشغيل آمن." },
  { icon: "science", step: "الخطوة 3", title: "اختبار دقيق", description: "نختبر الوكيل بحالات استثنائية، مدخلات معقدة، وسيناريوهات حقيقية للتأكد من أنه يعمل كما هو متوقع قبل الإطلاق." },
  { icon: "monitoring", step: "الخطوة 4", title: "المراقبة والتحسين", description: "سجلات تدقيق كاملة، لوحات أداء، ودعم لمدة 90 يوماً تضمن استمرار تحسّن وكيلك بعد الإطلاق." },
];

const faqItems = [
  { question: "ما الفرق بين وكيل الذكاء الاصطناعي وروبوت المحادثة؟", answer: "روبوت المحادثة يرد على الأسئلة. وكيل الذكاء الاصطناعي يتخذ إجراءات فعلية. يمكن للوكلاء تصفح الإنترنت، كتابة وإرسال رسائل البريد الإلكتروني، تحديث نظام CRM، حجز الاجتماعات، إجراء عمليات بحث، استدعاء واجهات برمجية، وتسلسل خطوات متعددة دون انتظار توجيه. إنهم حلّالو مشكلات مستقلون، وليسوا مجرد آلات للإجابة." },
  { question: "ما مدى موثوقية وكلاء الذكاء الاصطناعي في اتخاذ القرارات؟", answer: "نُصمم الوكلاء بضوابط واضحة، نقاط موافقة للإجراءات عالية الأهمية، وتحكم بشري عند الحاجة. يتعامل الوكلاء مع القرارات عالية الحجم ومنخفضة المخاطر تلقائياً؛ أي شيء يحتاج حكماً بشرياً يُحال لشخص للموافقة. تزداد الموثوقية مع الوقت مع تعلّم الوكلاء من التغذية الراجعة." },
  { question: "هل يمكن للوكلاء العمل مع أدواتنا الحالية؟", answer: "نعم. نبني وكلاء يتصلون بأنظمتك الحالية عبر واجهات برمجية: CRM، البريد الإلكتروني، التقويم، قواعد البيانات، أدوات تواصل الفريق، وغيرها. يعمل الوكيل كطبقة ذكية فوق أنظمتك الحالية، وليس بديلاً عنها." },
  { question: "هل هناك خطر أن يقوم الوكيل بشيء خاطئ؟", answer: "نبني تسجيلاً شاملاً، إمكانية التراجع، وحدوداً للإجراءات في كل وكيل. كل إجراء يتخذه الوكيل يُسجَّل ويمكن مراجعته. بالنسبة للمهام الحساسة، نُضيف خطوة موافقة بشرية قبل تنفيذ أي إجراء لا يمكن التراجع عنه." },
  { question: "ما الفرق بين الأتمتة البسيطة ووكيل الذكاء الاصطناعي؟", answer: "الأتمتة التقليدية تتبع سيناريو ثابت: إذا حدث X، افعل Y. تتعطل بمجرد حدوث أمر غير متوقع. وكيل الذكاء الاصطناعي يُحلل الموقف، يقرر أفضل مسار للعمل، ويتكيّف عندما لا تسير الأمور كما هو مخطط لها. الأتمتة ممتازة للمهام المتكررة والمتوقعة. الوكلاء مناسبون للمهام التي تحتاج حكماً، مدخلات غير منظمة، أو خطوات متغيرة." },
  { question: "هل يمكن لوكيل واحد التعامل مع مهام متعددة ومختلفة؟", answer: "يمكن منح الوكيل قدرات وأدوات متعددة، لكننا عادة نُصمم وكلاء مُركّزين يُتقنون مهمة واحدة بشكل ممتاز. بالنسبة للمهام المعقدة التي تشمل عدة مجالات، نبني أنظمة متعددة الوكلاء: فريق من الوكلاء المتخصصين يُنسّقهم وكيل رئيسي. هذا يُنتج نتائج أكثر موثوقية من وكيل واحد عام مثقل بالمهام." },
  { question: "كم تكلفة مشروع وكيل ذكاء اصطناعي عادةً؟", answer: "يعتمد ذلك على تعقيد المهمة، عدد الأدوات التي يحتاجها الوكيل، وهل تحتاج واجهة مستخدم مخصصة أم مجرد واجهة برمجية. الوكلاء البسيطون بمهمة واحدة يبدأون بأسعار في الآلاف المنخفضة. أنظمة الوكلاء المتعددة للعمليات المعقدة تُحدد تكلفتها بشكل فردي. تشمل جميع المشاريع مكالمة استكشافية مجانية نُعطيك فيها تقديراً واضحاً قبل أي التزام." },
];

const ldJson = [
  { "@context": "https://schema.org", "@type": "Service", "name": "وكلاء الذكاء الاصطناعي وأنظمة الوكلاء", "url": "https://lenooai.com/ar/services/ai-agents", "description": "وكلاء ذكاء اصطناعي مستقلون يُحللون المهام المعقدة، يستخدمون الأدوات، وينفذون مهاماً متعددة الخطوات دون إشراف بشري مستمر.", "provider": { "@type": "Organization", "name": "Aegis AI", "url": "https://lenooai.com" }, "areaServed": "United Arab Emirates", "serviceType": "تطوير وكلاء الذكاء الاصطناعي" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://lenooai.com/ar" },
    { "@type": "ListItem", "position": 2, "name": "الخدمات", "item": "https://lenooai.com/ar/services" },
    { "@type": "ListItem", "position": 3, "name": "وكلاء الذكاء الاصطناعي", "item": "https://lenooai.com/ar/services/ai-agents" }
  ] },
  { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqItems.map((f) => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } })) }
];
---
```

- [ ] **Step 2: Replace the hero + image banner (currently lines 65-96)**

```astro
<ArBaseLayout
  title="وكلاء الذكاء الاصطناعي وأنظمة الوكلاء لشركات الإمارات | Aegis AI"
  description="ذكاء اصطناعي لا يكتفي بالإجابة، بل يتصرف. بصفتنا وكالة ذكاء اصطناعي في دبي، نبني وكلاء ذكاء اصطناعي مستقلين لشركات الإمارات، يُحللون، يقررون، وينفذون."
  canonicalPath="/ar/services/ai-agents"
  enPath="/services/ai-agents"
  ogImage="/assets/og-services.jpg"
  ldJson={ldJson}
>

<header class="hero-section">
  <div class="container" style="text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:4px;background:rgba(0,227,253,0.12);border:1px solid rgba(0,227,253,0.28);border-radius:100px;padding:6px 16px;color:#a8f2ff;font-size:0.875rem;font-weight:600;margin-bottom:1.5rem;" aria-label="مسار التنقل"><a href="/ar" style="color:inherit;text-decoration:none;opacity:0.65;">الرئيسية</a><span style="opacity:0.4;padding:0 4px;"> / </span><a href="/ar/services" style="color:inherit;text-decoration:none;opacity:0.65;">الخدمات</a><span style="opacity:0.4;padding:0 4px;"> / </span>وكلاء الذكاء الاصطناعي</div>
    <h1>ذكاء اصطناعي <span class="gradient-text">يُفكر، يُقرر، ويتصرف دون انتظار التعليمات</span></h1>
    <p style="color:rgba(255,255,255,0.72); font-size:1.125rem; max-width:640px; margin:1.5rem auto 2.5rem; line-height:1.8;">
      معظم أدوات الذكاء الاصطناعي تكتفي بالرد. الوكلاء يبادرون. يُحللون المشكلات المعقدة، يستخدمون الأدوات، يتخذون القرارات، وينجزون مهاماً متعددة الخطوات بشكل مستقل، على نطاق واسع، على مدار الساعة.
    </p>
    <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
      <button onclick="openModal(this)" data-source="ar_agents_hero" class="btn-primary">ابنِ أول وكيل لك</button>
      <a href="#agent-types" class="btn-outline">استعرض أنواع الوكلاء ↓</a>
    </div>
  </div>
</header>

<div style="width:100%; height:280px; overflow:hidden; position:relative;">
  <img src="https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1400&q=80&auto=format&fit=crop" alt="وكلاء الذكاء الاصطناعي واتخاذ القرار المستقل" loading="eager" fetchpriority="high" width="1400" height="280" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center;" />
  <div style="width:100%; height:100%; background:rgba(0,25,42,0.78); display:flex; align-items:center; justify-content:center; position:relative;">
    <div style="position:absolute; inset:0; background-image:radial-gradient(circle, rgba(0,227,253,0.07) 1px, transparent 1px); background-size:24px 24px;"></div>
    <StatStrip stats={[
      { value: "24/7", caption: "الوكلاء يعملون على مدار الساعة، بلا توقف وبلا إجازات" },
      { value: "متعدد الخطوات", caption: "الوكلاء يُسلسلون عشرات الإجراءات لإنجاز مهام معقدة" },
      { value: "تكيّفي", caption: "الوكلاء يُعدّلون أسلوبهم بناءً على ما يكتشفونه" },
    ]} />
  </div>
  <div style="position:absolute; inset:0; background:linear-gradient(to top,#f9f9ff 0%,transparent 100%); pointer-events:none;"></div>
</div>
```

Note: `class="hero-section"` (not the current file's `page-hero`) and the plain `<StatStrip>` banner (not the current file's `.badge-amber` pill) — matching the EN page's actual classes so the shared/global CSS applies identically. Verify `hero-section` styling exists in `global.css` and renders correctly in Step 8's visual check; if `ArNavbar`'s hero styling depends on a different class name than `Navbar`'s, keep whichever class the *other already-working* AR pages under `ar/services/` use for their hero (check `ar/services/ai-strategy.astro` or similar once Task 2 has migrated a second file, to confirm the class name convention holds) — flag and resolve before Task 2 starts if `hero-section` doesn't render correctly here.

- [ ] **Step 3: Replace "What Exactly Is an AI Agent?" section**

```astro
<section class="section" aria-labelledby="explain-heading">
  <div class="container">
    <div class="explain-split">
      <div>
        <h2 id="explain-heading" style="margin-bottom:1.5rem;">ما هو وكيل الذكاء الاصطناعي بالضبط؟</h2>
        <p style="color:#42474e; font-size:1.0625rem; line-height:1.85; margin-bottom:1.25rem;">
          وكيل الذكاء الاصطناعي هو نظام برمجي قادر على إدراك بيئته، والتفكير في مشكلة ما، واتخاذ إجراءات لتحقيق هدف معين، دون الحاجة لإنسان يوجّه كل خطوة. على عكس روبوت المحادثة الذي ينتظر الأسئلة ويجيب عليها واحداً تلو الآخر، يُمنح الوكيل مهمة ويكتشف بنفسه كيف يُنجزها: ما المعلومات التي يحتاجها، وأي الأدوات يستدعيها، وبأي ترتيب، وكيف يتعامل مع النتائج التي تصله.
        </p>
        <p style="color:#42474e; font-size:1.0625rem; line-height:1.85;">
          الفرق العملي كبير. اطلب من روبوت محادثة أن يجد أفضل 20 عميلاً محتملاً، يتحقق من تحديثاتهم على لينكدإن، ويُعدّ رسائل تواصل مخصصة، وستحصل على قائمة مهام كرد. أعطِ نفس المهمة لوكيل ذكاء اصطناعي مبني جيداً، وسيبحث عن العملاء المحتملين، يقرأ بيانات لينكدإن، يُعدّ 20 رسالة بريد إلكتروني مخصصة، ويضعها في نظام CRM الخاص بك جاهزة للمراجعة. الوكيل يُنجز العمل؛ أنت تتخذ القرارات التي تحتاج فعلاً لحكمك.
        </p>
      </div>
      <div class="explain-img-wrap">
        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80&auto=format&fit=crop" alt="فريق في دبي يُراجع قائمة مهام وكيل ذكاء اصطناعي على حاسوب محمول" loading="lazy" width="800" height="600" />
      </div>
    </div>
    <p style="color:#42474e; font-size:1.0625rem; line-height:1.85; max-width:800px; margin:2rem auto 0;">
      بالنسبة للشركات، فجوة القدرات هذه هائلة. معظم الشركات لديها موظفون يقضون من 20 إلى 40 بالمئة من وقتهم في مهام منظمة، متكررة، وتعتمد على أدوات محددة: توجيه رسائل البريد الإلكتروني، تحديث السجلات، نقل البيانات من نظام إلى آخر، الجدولة، المتابعات، والمراقبة. هذه بالضبط المهام التي صُمم وكلاء الذكاء الاصطناعي لها. نشر الوكلاء في هذه المهام لا يُقلل عدد الموظفين؛ بل يُحرّر فريقك للتركيز على العمل الذي يحتاج حكماً وعلاقات إنسانية حقيقية.
    </p>
  </div>
</section>
```

- [ ] **Step 4: Replace the agent demo tabs section**

```astro
<section class="section" style="background:#e7eeff;" aria-labelledby="demo-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="demo-heading">شاهد وكيلاً أثناء العمل</h2>
      <p style="color:#42474e; font-size:1.0625rem;">اختر دوراً أدناه لترى ما يفعله الوكيل فعلياً، خطوة بخطوة، من لحظة استلامه المهمة حتى لحظة تسليم النتيجة.</p>
    </div>
    <div class="agent-demo" data-agent-demo>
      <div class="tab-buttons" role="tablist" aria-label="نوع مثال الوكيل">
        <button type="button" class="tab-btn active" role="tab" aria-selected="true" data-tab="sales">المبيعات والتواصل</button>
        <button type="button" class="tab-btn" role="tab" aria-selected="false" data-tab="research">البحث والتحليل</button>
        <button type="button" class="tab-btn" role="tab" aria-selected="false" data-tab="support">خدمة العملاء</button>
      </div>
      <div class="tab-panel" data-panel="sales">
        <div class="demo-step"><span class="demo-step-num">1</span><p><strong>المهمة المستلمة:</strong> «ابحث عن 20 عميلاً محتملاً في قطاع العقارات وأعدّ رسائل تواصل مخصصة.»</p></div>
        <div class="demo-step"><span class="demo-step-num">2</span><p><strong>الوكيل يتصرف:</strong> يسحب جهات الاتصال المطابقة من نظام CRM، يتحقق من نشاط كل منهم الأخير على لينكدإن، ويُعدّ رسالة بريد إلكتروني مخصصة تُشير لتفصيل محدد عن كل عميل محتمل.</p></div>
        <div class="demo-step"><span class="demo-step-num">3</span><p><strong>النتيجة المُسلّمة:</strong> 20 رسالة بريد إلكتروني جاهزة في نظام CRM الخاص بك، بانتظار مندوب المبيعات لمراجعتها وإرسالها. بلا صفحة فارغة، بلا بحث يدوي.</p></div>
      </div>
      <div class="tab-panel hidden" data-panel="research">
        <div class="demo-step"><span class="demo-step-num">1</span><p><strong>المهمة المستلمة:</strong> «لخّص ما غيّره أكبر 5 منافسين لنا في تسعيرهم هذا الربع.»</p></div>
        <div class="demo-step"><span class="demo-step-num">2</span><p><strong>الوكيل يتصرف:</strong> يبحث في مصادر عامة، يقرأ صفحات التسعير والتغطية الإعلامية، يُراجع التواريخ، ويُنظّم النتائج حسب كل منافس.</p></div>
        <div class="demo-step"><span class="demo-step-num">3</span><p><strong>النتيجة المُسلّمة:</strong> تقرير منظم من صفحة واحدة مع ذكر المصادر، يصلك خلال دقائق بدلاً من يوم كامل من البحث اليدوي.</p></div>
      </div>
      <div class="tab-panel hidden" data-panel="support">
        <div class="demo-step"><span class="demo-step-num">1</span><p><strong>المهمة المستلمة:</strong> عميل يُرسل بريداً إلكترونياً يسأل عن موقع طلبه وهل لا يزال بالإمكان تعديله.</p></div>
        <div class="demo-step"><span class="demo-step-num">2</span><p><strong>الوكيل يتصرف:</strong> يتحقق من حالة الطلب، يتأكد إن كان قد شُحن، ويرد بالإجابة، أو بتأكيد التعديل إن كان لا يزال ممكناً.</p></div>
        <div class="demo-step"><span class="demo-step-num">3</span><p><strong>النتيجة المُسلّمة:</strong> يحصل العميل على إجابة خلال ثوانٍ، في أي وقت من اليوم، ويُسجَّل الطلب تلقائياً لفريقك.</p></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Replace the agent types grid (id="agent-types" — the hero's "See Agent Types" link targets this)**

```astro
<section id="agent-types" class="section" aria-labelledby="agents-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="agents-heading">أنواع وكلاء الذكاء الاصطناعي التي نبنيها</h2>
      <p style="color:#42474e; font-size:1.0625rem;">أمثلة شائعة، وليست قائمة نهائية. كل وكيل يُبنى خصيصاً لحالة استخدامك، يُدرَّب على سياقك، ويُدمج مع أدواتك الحالية. إذا لم تجد فكرتك ضمن هذه الأمثلة، شاركنا بها.</p>
    </div>
    <div class="feature-ledger">
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">trending_up</span></div>
        <h3>وكلاء المبيعات والتواصل</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يبحثون عن العملاء المحتملين، يُخصّصون رسائل التواصل، يُرسلون المتابعات، ويُحدّثون نظام CRM، ويديرون مئات المحادثات في وقت واحد.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">manage_search</span></div>
        <h3>وكلاء البحث والتحليل</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يبحثون على الإنترنت، يقرأون المستندات، يُلخّصون النتائج، ويُسلّمون تقارير منظمة. ساعات من البحث تُنجز خلال دقائق.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">support_agent</span></div>
        <h3>وكلاء خدمة العملاء</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يتعاملون مع الدعم من المستوى الأول والثاني بشكل مستقل: يتحققون من حالة الطلبات، يُعالجون المرتجعات، يُصعّدون الحالات الاستثنائية، ولا يتركون عميلاً بالانتظار.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">calendar_month</span></div>
        <h3>وكلاء الجدولة والعمليات</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يُنسّقون التقاويم، يحجزون الاجتماعات، يديرون التوفر، ويتعاملون مع اللوجستيات، مما يُحرّر فريقك من التنسيق المتكرر ذهاباً وإياباً.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">gavel</span></div>
        <h3>وكلاء الامتثال والمراقبة</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يُراقبون البيانات، يُحددون الحالات الشاذة، يُراجعون المستندات للتحقق من الامتثال للسياسات، وينبّهون الأشخاص المعنيين، باستمرار ودون كلل.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">build_circle</span></div>
        <h3>أنظمة وكلاء مخصصة</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">أنظمة متعددة الوكلاء يتعاون فيها وكلاء متخصصون: واحد يبحث، وآخر يكتب، وثالث يُراجع، ورابع يُنشر، وكلهم يُنسّقهم وكيل رئيسي.</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Replace the industry applications grid**

```astro
<section class="section" style="background:#f0f3ff;" aria-labelledby="industries-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="industries-heading">وكلاء الذكاء الاصطناعي في العمل: تطبيقات حسب القطاع</h2>
      <p style="color:#42474e; font-size:1.0625rem;">كل قطاع لديه مهام متكررة وعالية الحجم يمكن أن يتولاها الوكلاء. إليك أمثلة محددة عن كيفية استخدام الشركات في قطاعات مختلفة للوكلاء اليوم.</p>
    </div>
    <div style="border-radius:24px; overflow:hidden; margin-bottom:3rem; box-shadow:0 24px 56px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop" alt="فريق عمليات يُراجع مهام الوكلاء في اجتماع تخطيط" loading="lazy" width="1200" height="380" style="width:100%; height:clamp(200px, 30vw, 380px); object-fit:cover; display:block;" />
    </div>
    <div class="builds-grid">
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">real_estate_agent</span></div>
        <h3>العقارات</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يُؤهّل الوكلاء العملاء المحتملين الواردين، يبحثون عن العقارات المطابقة لمعايير المشتري، يُرسلون تنبيهات بالعروض الجديدة، يُجدولون المعاينات، ويُتابعون مع العملاء المحتملين بالوتيرة المناسبة تماماً، كل ذلك دون جهد يدوي من موظفيك.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">storefront</span></div>
        <h3>التجارة الإلكترونية والتجزئة</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">وكلاء خدمة العملاء يتعاملون مع حالة الطلبات، المرتجعات، وأسئلة المنتجات على مدار الساعة. وكلاء مراقبة المخزون يُنبّهون عند انخفاض المخزون ويُطلقون إجراءات إعادة الطلب. وكلاء تحليل الأسعار يُتابعون المنافسين ويُعدّلون توصيات التسعير.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">local_shipping</span></div>
        <h3>اللوجستيات والعمليات</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">يُراقب الوكلاء حالة الشحنات عبر شركات النقل المختلفة، يتواصلون مع العملاء استباقياً عند حدوث تأخير، يُحدّثون الأنظمة الداخلية، ويُصعّدون الاستثناءات لفريق العمليات فقط عند الحاجة الفعلية لتدخل بشري.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">hotel</span></div>
        <h3>الضيافة</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">وكلاء الحجز يتعاملون مع رحلة الاستفسار حتى التأكيد، يُجيبون عن أسئلة العقار، يُديرون التحقق من التوفر، ويُرسلون رسائل مخصصة قبل الوصول، مما يُقلّل العبء على مكتب الاستقبال دون التأثير على جودة الخدمة.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">account_balance</span></div>
        <h3>المالية والخدمات المهنية</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">وكلاء البحث يجمعون البيانات المالية، يُحللون تقارير الشركات، ويُعدّون مذكرات استثمارية. وكلاء الامتثال يُراقبون المستندات وينبّهون عند مخالفة السياسات. وكلاء التسجيل يجمعون بيانات العملاء ويُجرون فحوصات الخلفية، ليتفرغ فريقك لبناء العلاقات واتخاذ القرارات المهمة.</p>
      </div>
      <div class="card">
        <div class="icon-box"><span class="material-symbols-outlined" aria-hidden="true" style="color:#006875; font-size:24px;">health_and_safety</span></div>
        <h3>الرعاية الصحية والعيادات</h3>
        <p style="color:#42474e; font-size:0.875rem; line-height:1.7;">وكلاء جدولة المواعيد يُديرون الحجز، إعادة الجدولة، والتذكيرات. الوكلاء الإداريون يتعاملون مع أوراق الموافقة المسبقة من شركات التأمين. وكلاء متابعة المرضى يُرسلون تعليمات الخروج ويجمعون التقييمات بعد الزيارة تلقائياً.</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 7: Replace "How We Build and Deploy" + FAQ + final CTA + scripts/styles**

```astro
<section class="section" style="background:#e7eeff;" aria-labelledby="how-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="how-heading">كيف نبني وننشر وكيلك</h2>
    </div>
    <div style="border-radius:20px; overflow:hidden; margin-bottom:2.5rem; box-shadow:0 20px 48px rgba(0,59,92,0.10);">
      <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80&auto=format&fit=crop" alt="أرضية تجزئة مدعومة بالذكاء الاصطناعي في دبي حيث يُراقب وكيل المخزون والتسعير" loading="lazy" width="1200" height="320" style="width:100%; height:clamp(180px, 26vw, 320px); object-fit:cover; display:block;" />
    </div>
    <ProcessSteps steps={processSteps} />
  </div>
</section>

<section class="section" style="background:#f9f9ff;" aria-labelledby="faq-heading">
  <div class="container" style="max-width:720px;">
    <div class="section-header">
      <h2 id="faq-heading">الأسئلة الشائعة</h2>
    </div>
    <FaqAccordion items={faqItems} />
  </div>
</section>

<div class="cta-band">
  <div style="position:relative; z-index:1; text-align:center;">
    <p class="cta-eyebrow">مكالمة استكشافية مجانية</p>
    <h2 style="font-size:clamp(1.75rem,3vw,2.5rem); margin-bottom:1rem;">هل أنت مستعد لنشر أول وكيل ذكاء اصطناعي لك؟</h2>
    <p style="font-size:1.125rem; max-width:36rem; margin:0 auto 2rem; line-height:1.7;">أخبرنا بما تريد أتمتته. بصفتنا وكالة ذكاء اصطناعي مقرها دبي، سنُصمم وكيلاً يتولى المهمة ونُريك بالضبط كيف يعمل قبل أن نبنيه.</p>
    <div class="cta-trust-badges">
      <span class="cta-trust-badge">✓ مجاني 100%</span>
      <span class="cta-trust-badge">✓ بدون التزام</span>
      <span class="cta-trust-badge">✓ ضمان استرداد</span>
    </div>
    <button onclick="openModal(this)" data-source="ar_agents_cta" class="btn-primary" style="font-size:1.125rem; padding:1.125rem 2.75rem;">احجز مكالمتك الاستكشافية المجانية</button>
    <p style="font-size:.875rem; margin-top:1rem; color:#94a3b8;">مكالمة 30 دقيقة · بدون ضغط للبيع</p>
  </div>
</div>

<script>
document.querySelectorAll('[data-agent-demo]').forEach((demo) => {
  demo.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      demo.querySelectorAll('.tab-btn').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      demo.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = (btn as HTMLElement).dataset.tab;
      demo.querySelector(`[data-panel="${target}"]`)?.classList.remove('hidden');
    });
  });
});
</script>

</ArBaseLayout>

<style>
.icon-box { width:48px; height:48px; border-radius:14px; background:rgba(0,227,253,0.12); border:1px solid rgba(0,227,253,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:1rem; }
.builds-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.explain-split { display:grid; grid-template-columns:1.3fr 1fr; gap:3rem; align-items:center; max-width:1080px; margin:0 auto; }
.explain-img-wrap { border-radius:20px; overflow:hidden; box-shadow:0 20px 48px rgba(0,59,92,0.12); }
.explain-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; min-height:280px; }
.agent-demo { max-width:820px; margin:0 auto; background:#fff; border-radius:20px; padding:2rem; box-shadow:0 8px 32px rgba(0,37,59,0.06); }
.tab-buttons { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.75rem; border-bottom:1px solid rgba(0,37,59,0.10); padding-bottom:1.25rem; }
.tab-btn { background:#f0f3ff; border:1px solid transparent; border-radius:100px; padding:0.625rem 1.25rem; font-size:0.875rem; font-weight:600; color:#42474e; cursor:pointer; font-family:inherit; transition:background .2s, color .2s, border-color .2s; }
.tab-btn:hover { color:#006875; }
.tab-btn:focus-visible { outline:2px solid #006875; outline-offset:2px; }
.tab-btn.active { background:#00253b; color:#fff; border-color:#00253b; }
.tab-panel.hidden { display:none; }
.demo-step { display:flex; gap:1rem; align-items:flex-start; padding:0.875rem 0; border-bottom:1px solid rgba(0,37,59,0.07); }
.demo-step:last-child { border-bottom:none; }
.demo-step-num { flex-shrink:0; width:28px; height:28px; border-radius:50%; background:rgba(0,227,253,0.15); color:#006875; font-weight:700; font-size:0.8125rem; display:flex; align-items:center; justify-content:center; }
.demo-step p { color:#42474e; font-size:0.9375rem; line-height:1.65; margin:0; }
@media(max-width:900px) { .builds-grid { grid-template-columns:1fr 1fr; } .explain-split { grid-template-columns:1fr; } .explain-img-wrap img { min-height:220px; } }
@media(max-width:600px) { .builds-grid { grid-template-columns:1fr; } }
</style>
```

Note: this is a byte-for-byte port of the EN page's own `<style>` block (with the `.process-grid`/`.process-connector` rules omitted, same as Phase 2b did for EN pages, since `ProcessSteps.astro` now owns those). Confirm `.hero-section`, `.gradient-text`, `.btn-primary`, `.btn-outline`, `.cta-band`, `.cta-eyebrow`, `.cta-trust-badges`, `.cta-trust-badge`, `.section`, `.section-header`, `.feature-ledger`, `.card` classes all already exist in the AR global stylesheet (they should — `ArNavbar`/`ArFooter`/`ArBaseLayout` share `global.css` with the EN layouts per existing site architecture) before relying on them; if any is missing, add it to this file's `<style>` block rather than silently rendering unstyled.

- [ ] **Step 8: Verify**

Run: `cd astro-site && npm run build` — expected: succeeds.
Run: `npm run dev`, open `/ar/services/ai-agents` — confirm: RTL layout throughout, all 8 sections present in the same order as `/services/ai-agents`, `StatStrip`/`ProcessSteps`/`FaqAccordion` render correctly with Arabic text, tab demo switches panels on click, no leftover English strings, no console errors, breadcrumb/CTA links resolve to `/ar/...` paths.

- [ ] **Step 9: Commit**

```bash
git add astro-site/src/pages/ar/services/ai-agents.astro
git commit -m "feat(ar): rewrite ai-agents to mirror English structure and shared components"
```

---

### Task 2: Apply the same transformation to the remaining 11 Arabic service subpages

**Files (each `astro-site/src/pages/ar/services/<name>.astro`, mirroring `astro-site/src/pages/services/<name>.astro`):**
- `ai-automation.astro`
- `ai-integration.astro`
- `ai-model-finetuning.astro`
- `ai-strategy.astro`
- `ai-training.astro`
- `claude-agent-builds.astro`
- `custom-ai-development.astro`
- `custom-gpt-development.astro`
- `internal-ai-tools.astro`
- `prompt-engineering.astro`
- `vibe-coding.astro`

Dispatch one subagent per file (independent, no shared state). Each subagent must:
1. Read the live EN file in full (`astro-site/src/pages/services/<name>.astro`).
2. Read the live AR file in full (`astro-site/src/pages/ar/services/<name>.astro`).
3. Follow Task 1's exact pattern: import `FaqAccordion`/`ProcessSteps`/`StatStrip` where the EN file uses them (check each file individually — `ai-strategy.astro` and `ai-training.astro` do NOT use `ProcessSteps`, per the Phase 2b plan's scope note; `services.astro` hub and `internal-ai-tools.astro` do NOT use `StatStrip` — verify per-file, don't assume uniformity), rewrite every section to match the EN section list below in the same order, translate faithfully, delete any AR-only section, keep `ArBaseLayout`/`enPath`/`canonicalPath`/RTL scaffolding, use Western numerals, source FAQ content from the EN page's live fallback/hardcoded array (never Supabase — see Rule 3 above).
4. Apply Rule 6 (build + dev spot-check) before moving to the next file.

Required EN section order per file (from `<!-- -->` comments and `<h2>`s, verified 2026-07-17 — re-verify against the live file before writing, as content may have shifted since):

| File | Section order (hero implicit as first) |
|---|---|
| `ai-automation.astro` | hero → image+`StatStrip` → "What Is AI Automation" (explain) → "AI Automation We Commonly Build" → "What Businesses Are Automating Right Now" (industry examples) → "From Discovery to Live Automation" (`ProcessSteps`) → FAQ (`FaqAccordion`) → final CTA |
| `ai-integration.astro` | hero → image+`StatStrip` → "What Does AI Integration Actually Mean" → "AI Integrations We Deliver" → "What AI Integration Looks Like in Practice" (scenarios) → "How We Add AI to Your Existing Stack" (`ProcessSteps`) → FAQ → final CTA |
| `ai-model-finetuning.astro` | hero → image+`StatStrip` → "What Is AI Model Fine-Tuning" → "Fine-Tuning vs. Prompting" (comparison — EN has this, keep it) → "Tasks Where Fine-Tuning Delivers the Most Value" → "From Raw Data to Deployed Model" (`ProcessSteps`) → FAQ → final CTA |
| `ai-strategy.astro` | hero → image banner (no `StatStrip` — EN has a different hero-stat treatment per Phase 2c decision, normalized to standard `StatStrip` size; re-check current EN markup for exact current implementation before assuming) → "Why AI Strategy Is Not Optional" → "Who Needs an AI Strategy Sprint" → "What's Included in the Strategy Sprint" → "Key Areas We Assess in Your Business" (6 dimensions) → "What a 12-Month Roadmap Actually Looks Like" (tabs — no `ProcessSteps`, this page uses a tabbed roadmap per Phase 2 spec's Task-3d note) → FAQ → final CTA |
| `ai-training.astro` | hero → image/stat banner → "Why Team Training Is the Missing Piece" → "Why Most AI Investments Don't Deliver" (problem) → "Choose the Right Program for Your Team" (programs) → "What Each Role Actually Learns" → "Everything Your Team Needs to Succeed" (included — no `ProcessSteps`, per Phase 2 spec this page has no such section) → FAQ → final CTA |
| `claude-agent-builds.astro` | hero → image+`StatStrip` → "What Makes a Production-Ready AI Agent Different" → "What Every Agent We Build Includes" → "AI Agents We Build for Businesses" → "What an Agent Run Actually Looks Like" (interactive walkthrough) → "Why Our AI Agents Perform Better in Production" → "How We Build and Deploy Your AI Agent" (`ProcessSteps`) → FAQ → final CTA |
| `custom-ai-development.astro` | hero → image (no `StatStrip` per Phase 2c scope note) → "Why Off-the-Shelf AI Isn't Enough" → "Off-the-Shelf AI vs. Custom AI" (interactive toggle) → "What We Build For You" → "What Every Custom AI Project Includes" → "From Discovery to Launch" (`ProcessSteps`) → FAQ → final CTA |
| `custom-gpt-development.astro` | hero → image+`StatStrip` → "What Is a Custom AI Assistant" → "Custom AI Assistants We Build" → "See It In Action" (flip cards) → "From Brief to Live AI" (`ProcessSteps`) → FAQ → final CTA |
| `internal-ai-tools.astro` | hero → image (no `StatStrip` — hub-style page, per Phase 2c scope note) → "What Are Internal AI Tools" → "The Problem With Generic AI Tools" → "Internal AI Tools We Build" → "The Real Cost of Not Having Internal AI" (ROI) → "Built for Every Department" (interactive tabs) → "From Your Data to a Working Tool" (`ProcessSteps`) → FAQ → final CTA |
| `prompt-engineering.astro` | hero → image+`StatStrip` → "What Is Prompt Engineering" → "What We Do in a Prompt Engineering Engagement" → "Where Prompt Engineering Makes the Biggest Difference" → "Same Task, Rewritten Prompt" (before/after toggle) → "How a Prompt Engineering Engagement Works" (`ProcessSteps`) → FAQ → final CTA |
| `vibe-coding.astro` | hero → image+`StatStrip` → "What Is Vibe Coding" → "What You Can Ship With Vibe Coding" → "Is Vibe Coding Right for Your Project" → "The Timeline Difference" (interactive toggle) → "How We Ship Your Product Fast" (`ProcessSteps`) → FAQ → final CTA |

For pages with an EN-only *interactive* section this plan hasn't detailed (tabbed roadmap, flip cards, before/after toggle, department tabs, timeline toggle, agent-run walkthrough) — these are NOT part of the Phase 2d `Tabs.astro` migration (still NOT STARTED per the master spec) and each currently has its own bespoke JS in the EN file. Port that section's markup, data, and `<script>` verbatim-structurally (same interaction pattern, same JS logic, translated visible strings/data only — do not alter the interaction behavior itself, that's out of scope for this content-parity plan).

- [ ] For each of the 11 files: read EN source, read AR source, rewrite per the pattern and rules above, verify (build + dev spot-check), commit individually:
```bash
git add astro-site/src/pages/ar/services/<name>.astro
git commit -m "feat(ar): rewrite <name> to mirror English structure and shared components"
```

---

### Task 3: `ar/services.astro` (services hub) — mirror `services.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/services.astro` (currently 311 lines)
- Reference: `astro-site/src/pages/services.astro` (505 lines)

EN section order: 3 "core services" spotlight blocks (each with its own `<h2>`, no shared component) → Dubai banner → "More Ways We Help You Win With AI" (grid of remaining 9 services) → "still deciding" strip → FAQ (`FaqAccordion` if the EN hub uses it — verify; Phase 2a's plan says "10 sub-pages + the hub" both use the working `+`-icon FAQ pattern, confirm whether that means the hub already calls the component or just uses matching markup, and migrate to the component if not) → guarantee strip.

Per Phase 1, the current AR file also has an orphan two-photo grid with no caption/heading/link — delete it (this was already flagged in the original Phase 4 spec scope as a simple deletion, now folded into this full rewrite).

- [ ] **Step 1:** Read `astro-site/src/pages/services.astro` in full.
- [ ] **Step 2:** Read `astro-site/src/pages/ar/services.astro` in full.
- [ ] **Step 3:** Rewrite following Task 1's pattern: same section order, `FaqAccordion` for the FAQ section with a translated array sourced from the EN hub's live FAQ content, delete the orphan photo grid and any other AR-only section, translate all copy faithfully, keep `ArBaseLayout` scaffolding.
- [ ] **Step 4:** Verify (`npm run build`, `npm run dev` spot-check `/ar/services`).
- [ ] **Step 5:** Commit:
```bash
git add astro-site/src/pages/ar/services.astro
git commit -m "feat(ar): rewrite services hub to mirror English structure"
```

---

### Task 4: `ar/index.astro` (homepage) — mirror `index.astro`

**Files:**
- Modify: `astro-site/src/pages/ar/index.astro` (currently 685 lines)
- Reference: `astro-site/src/pages/index.astro` (currently 1222 lines on `master` — confirmed this does NOT include the unmerged Phase 3 `TestimonialsCarousel`, still a static grid; re-verify this is still true at execution time by grepping for `TestimonialsCarousel` in `index.astro` before starting, in case Phase 3 merges to `master` first)

This is the largest single file in the plan — 13 sections. EN section order (from the earlier grep, re-verify against the live file first): hero (full-bleed Dubai skyline) → stat band (animated count-up) → authority/"why now" → "who this is for" → services → industries photo cards → interactive picker ("which AI service fits") → "what makes us different" → comparison table → process → testimonials → FAQ preview → blog/resources preview → final CTA.

Given the size, dispatch this as its own subagent (not bundled with Task 2/3/5) with explicit instruction to work section-by-section, verifying the build after each section lands rather than attempting the full 13-section rewrite in one uninterrupted pass — the file is large enough that a single verify-at-the-end approach risks losing track of an error's origin.

- [ ] **Step 1:** Read `astro-site/src/pages/index.astro` in full (all ~1200 lines — use multiple `Read` calls with `offset` if needed).
- [ ] **Step 2:** Read `astro-site/src/pages/ar/index.astro` in full.
- [ ] **Step 3:** For each of the 13 EN sections in order: locate the corresponding AR section (if one exists) or note it's missing, rewrite/add it to match the EN structure, translate faithfully, reuse `ar_*` Supabase columns for any DB-driven content (testimonials, blog posts) exactly as the current AR homepage likely already does for its existing sections — check before assuming which sections are currently DB-driven vs. hardcoded.
- [ ] **Step 4:** Delete any current AR-only section not in the EN list above.
- [ ] **Step 5:** Verify (`npm run build`, `npm run dev` spot-check `/ar`, confirm the interactive picker and count-up stat band both function in Arabic/RTL).
- [ ] **Step 6:** Commit:
```bash
git add astro-site/src/pages/ar/index.astro
git commit -m "feat(ar): rewrite homepage to mirror English hero/stat-band/picker/testimonials structure"
```

---

### Task 5: Remaining page pairs — audit and reconcile

**Files (14 pairs, `astro-site/src/pages/<name>.astro` / `astro-site/src/pages/ar/<name>.astro` unless noted):**
- `about.astro`
- `careers.astro`
- `contact.astro`
- `products.astro`
- `results.astro`
- `industries/hospitality.astro`
- `industries/logistics.astro`
- `industries/real-estate.astro`
- `industries/retail.astro`
- `privacy.astro`
- `terms.astro`
- `blog.astro`
- `blog/[slug].astro` (Arabic counterpart: `ar/blog/[slug].astro`)
- `jobs/[slug].astro` (Arabic counterpart: `ar/jobs/[slug].astro`)

These pairs are closer in line count than the service pages (see the size comparison below — most are within 10-20% of each other), which means the gap is more likely per-section content drift and missing shared-component adoption than a wholesale structural mismatch, but each still needs the same verification, not an assumption of parity:

| Pair | EN lines | AR lines |
|---|---|---|
| `about.astro` | 397 | 529 |
| `careers.astro` | 384 | 412 |
| `contact.astro` | 621 | 576 |
| `products.astro` | 342 | 380 |
| `results.astro` | 403 | 470 |
| `privacy.astro` | 299 | 296 |
| `terms.astro` | 301 | 308 |
| `blog.astro` | 322 | 156 |
| `blog/[slug].astro` | 231 | 276 |
| `jobs/[slug].astro` | 490 | 474 |
| `industries/hospitality.astro` | 447 | 489 |
| `industries/logistics.astro` | 656 | 489 |
| `industries/real-estate.astro` | 447 | 491 |
| `industries/retail.astro` | 432 | 486 |

`blog.astro` (322 vs 156 lines) is the largest gap here and should be treated with the same section-by-section rigor as Task 4, not the lighter audit pass described below.

Dispatch one subagent per file. Each subagent must:
1. Read both the EN and AR file in full.
2. Diff their section lists (`<!-- -->` comments / `<h2>`s), same method used above.
3. Where sections match 1:1: verify the AR translation is faithful and check whether the EN section uses a Phase 2 shared component (`FaqAccordion` at minimum — all of these pages have an FAQ section per the Phase 4a investigation note) that the AR section hasn't adopted yet; migrate it if not, following Task 1's FAQ pattern (translated array, no Supabase query for AR).
4. Where EN has a section AR lacks: add it, translated, in the correct position.
5. Where AR has a section EN lacks: delete it.
6. Verify (Rule 6) and commit individually:
```bash
git add astro-site/src/pages/ar/<name>.astro
git commit -m "feat(ar): reconcile <name> to mirror English structure and shared components"
```

`privacy.astro`/`terms.astro` are legal text — verify these translate the same legal provisions in the same order (a missing clause in a legal page is a compliance risk, not just a content gap); flag any provision present in one language and not the other for the user rather than inventing legal language.

---

### Task 6: Sitewide verification

- [ ] **Step 1:** Full build: `cd astro-site && npm run build` — expected: succeeds with zero errors across all ~28 modified files.
- [ ] **Step 2:** `npm run dev`, spot-check every page pair touched in Tasks 1-5 (at minimum: `/ar`, `/ar/services`, `/ar/services/ai-agents`, 2 more services pages of your choice, `/ar/about`, `/ar/contact`, `/ar/results`, one `industries/*` page, `/ar/blog`) — confirm RTL layout, no leftover English strings, shared components render, no console errors.
- [ ] **Step 3:** Confirm hreflang/canonical wiring still resolves correctly both directions (EN page's `arPath` points to the AR page and vice versa) for at least 3 of the rewritten pages — check via view-source or the `ArBaseLayout`/`BaseLayout` head output.
- [ ] **Step 4:** Per [[project_multi_domain_o2switch]] and [[project_git_surgery_care]] memory notes: after merging to `master`, redeploy to all 3 targets (Vercel if connected, `aicompany.usine.site` staging, `lenooai.com` production) — do not assume `git push` alone deploys `lenooai.com` (separate o2switch app, confirmed in a prior session).
- [ ] **Step 5:** Update `docs/superpowers/specs/2026-07-13-site-ux-audit-fixes-design.md`'s Phase 4 section to reflect the actual scope executed here (structural parity across the full site, not just the homepage port + FAQ unification originally scoped) — future readers of that spec should not be misled about what "Phase 4" ended up covering.
