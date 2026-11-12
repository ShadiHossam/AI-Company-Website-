// A/B TEST CONTROL: the course offer (Arabic).
//
// This file is identical in both repos:
//   shadi-hossam-website  src/data/course-offer.ts              (variant B: Shadi, the mentor)
//   AI-Company-Website-   astro-site/src/data/course-offer.ts   (variant A: Lenoo AI, the company)
//
// The landing pages at /ar/lp/ai-course and /ar/lp/marketing-course (Lenoo)
// and /ar/uae/lp/ai-course and /ar/uae/lp/marketing-course (Shadi) differ only
// in who is selling the course: the headline, the proof line and the "who
// teaches this" paragraph. Everything in this file (price, dates, how the
// sessions run, the weekly plan, FAQ, form fields, CTA label) must stay the
// same on both sides, or the test stops measuring the messenger. Change it
// here, then copy the file to the other repo.
//
// The pages are kept short on purpose: the ask is a free seat reservation, so
// the page only has to show what the course is, that it is practical, and who
// runs it.
//
// Copy is in clear standard Arabic for a UAE and Gulf audience, the same on
// both variants.
//
// PLACEHOLDERS: price and nextCohort are "TBA" until confirmed. While they are
// TBA the pages sell a free seat reservation instead of a purchase.

export type OfferSlug = "ai" | "marketing";

export interface OfferWeek {
  label: string;
  title: string;
  /** What the student walks away with that week. */
  deliverable: string;
}

export interface CourseOffer {
  slug: OfferSlug;
  title: string;
  /** Value the booking backends expect for this course. */
  formValue: string;
  /** Short duration used in headings, e.g. "6 أسابيع". */
  duration: string;
  sessions: string;
  format: string;
  level: string;
  price: string;
  nextCohort: string;
  weeks: OfferWeek[];
  faq: { question: string; answer: string }[];
}

export const CTA_LABEL = "احجز مقعدك";
export const CTA_NOTE = "الحجز مجاني، وتصلك المواعيد والسعر قبل الإعلان عنها.";

/** Shown in both heroes. The courses are practical, and both variants say so the same way. */
export const PRACTICAL_TAG = "كورس عملي بالكامل: تطبّق على مشروعك في كل جلسة";

/** Every page's shared UI text, so neither variant words the same thing differently. */
export const UI = {
  weeksTitle: "ماذا تطبّق كل أسبوع",
  youLeaveWith: "تخرج بـ:",
  faqTitle: "أسئلة شائعة",
  formTitle: "احجز مقعدك",
  name: "الاسم الكامل",
  email: "البريد الإلكتروني",
  phone: "رقم الواتساب",
  sending: "جارٍ الإرسال...",
  successTitle: "تم حجز مقعدك.",
  successText: "سنراسلك على الواتساب بالمواعيد والسعر.",
  errName: "يرجى كتابة اسمك.",
  errEmail: "يرجى كتابة بريد إلكتروني صحيح.",
  errPhone: "يرجى كتابة رقم واتساب صحيح.",
  errGeneric: "حدث خطأ. حاول مرة أخرى أو راسلنا على الواتساب.",
  factLength: "المدة",
  factFormat: "الطريقة",
  factLevel: "المستوى",
  factCohort: "الدفعة القادمة",
  cohortSoon: "تُفتح قريباً",
};

/** How every session runs. This is the "practical, not theory" promise, shown on both pages. */
export const SESSION_FLOW = {
  title: "كل جلسة تطبيق عملي، وليست محاضرة",
  steps: [
    { title: "نعرض الأداة على مثال حقيقي", text: "شرح قصير ومباشر، بدون شرائح نظرية." },
    { title: "تطبّق على مشروعك أثناء الجلسة", text: "على علامتك التجارية وعملائك وإعلاناتك، ونحن معك." },
    { title: "تخرج بنتيجة جاهزة", text: "شيء تستخدمه في عملك من اليوم التالي." },
  ],
};

const RESERVE_FAQ = {
  question: "متى يبدأ الكورس وكم سعره؟",
  answer: "نرسل المواعيد والسعر لمن حجز أولاً. الحجز مجاني ولا يُلزمك بشيء.",
};

const PRACTICAL_FAQ = {
  question: "هل الكورس نظري؟",
  answer: "لا. في كل جلسة تطبّق على مشروعك أنت وتخرج بنتيجة تستخدمها في عملك.",
};

const LIVE_FAQ = {
  question: "ماذا لو فاتتني جلسة؟",
  answer: "كل جلسة مسجّلة وتصلك في نفس اليوم.",
};

export const OFFERS: Record<OfferSlug, CourseOffer> = {
  ai: {
    slug: "ai",
    title: "الذكاء الاصطناعي للتسويق والأعمال",
    formValue: "ai",
    duration: "6 أسابيع",
    sessions: "12 جلسة مباشرة",
    format: "أونلاين + حضوري في دبي",
    level: "مبتدئ إلى متوسط",
    price: "TBA",
    nextCohort: "TBA",
    weeks: [
      { label: "الأسبوع 1", title: "تجهيز ChatGPT و Claude لعملك", deliverable: "مساحة عمل جاهزة لمشروعك" },
      { label: "الأسبوع 2", title: "كتابة أوامر تعطي نتائج ثابتة", deliverable: "مكتبة أوامر بأسلوب علامتك" },
      { label: "الأسبوع 3", title: "المحتوى والسوشيال ميديا", deliverable: "تقويم محتوى لـ 30 يوماً" },
      { label: "الأسبوع 4", title: "الإعلانات والتصاميم", deliverable: "إعلانات جاهزة للاختبار" },
      { label: "الأسبوع 5", title: "الأتمتة ووكلاء الذكاء الاصطناعي", deliverable: "أتمتة تعمل وتوفّر عليك ساعات" },
      { label: "الأسبوع 6", title: "البحث والبيانات", deliverable: "دليل الذكاء الاصطناعي الخاص بعملك" },
    ],
    faq: [
      RESERVE_FAQ,
      PRACTICAL_FAQ,
      { question: "هل أحتاج خلفية تقنية؟", answer: "لا. إذا كنت تستخدم الإيميل والمتصفح، تستطيع حضور الكورس." },
      LIVE_FAQ,
    ],
  },
  marketing: {
    slug: "marketing",
    title: "التسويق ونمو الأعمال",
    formValue: "marketing",
    duration: "8 أسابيع",
    sessions: "16 جلسة مباشرة",
    format: "أونلاين + حضوري في دبي",
    level: "مبتدئ إلى متوسط",
    price: "TBA",
    nextCohort: "TBA",
    weeks: [
      { label: "الأسبوع 1", title: "الاستراتيجية والتموضع", deliverable: "استراتيجية تسويق لمشروعك" },
      { label: "الأسبوع 2", title: "السيو والظهور في الذكاء الاصطناعي", deliverable: "خريطة كلمات مفتاحية" },
      { label: "الأسبوعان 3 و4", title: "إعلانات Meta و Google و TikTok", deliverable: "حملة إعلانية تعمل" },
      { label: "الأسبوع 5", title: "المحتوى والسوشيال ميديا", deliverable: "خطة محتوى تجلب عملاء" },
      { label: "الأسبوع 6", title: "صفحات الهبوط والمتابعة", deliverable: "صفحة هبوط ومسار متابعة" },
      { label: "الأسبوع 7", title: "تجارب النمو بالذكاء الاصطناعي", deliverable: "قائمة تجارب جاهزة للتنفيذ" },
      { label: "الأسبوع 8", title: "التحليلات و GA4", deliverable: "خطة نمو لـ 90 يوماً" },
    ],
    faq: [
      RESERVE_FAQ,
      PRACTICAL_FAQ,
      { question: "هل أحتاج خبرة في التسويق؟", answer: "لا. نبدأ من الأساسيات، مع تطبيق على مشروعك كل أسبوع." },
      LIVE_FAQ,
    ],
  },
};

export function isTba(value: string): boolean {
  return value.trim().toUpperCase() === "TBA";
}
