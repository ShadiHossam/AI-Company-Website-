// A/B TEST CONTROL: the course offer (Arabic).
//
// This file is identical in both repos:
//   shadi-hossam-website  src/data/course-offer.ts              (variant B: Shadi, the mentor)
//   AI-Company-Website-   astro-site/src/data/course-offer.ts   (variant A: Lenoo AI, the company)
//
// The landing pages at /ar/lp/ai-course and /ar/lp/marketing-course (Lenoo)
// and /ar/uae/lp/ai-course and /ar/uae/lp/marketing-course (Shadi) differ only
// in who is selling the course: the hero, the proof strip and the "who teaches
// this" section. Everything in this file (price, dates, curriculum, how the
// sessions run, outcomes, what's included, FAQ, form fields, CTA label) must
// stay the same on both sides, or the test stops measuring the messenger.
// Change it here, then copy the file to the other repo.
//
// Copy is in clear standard Arabic for a UAE and Gulf audience. Both variants
// use the same Arabic, so the dialect is not a difference between them.
//
// PLACEHOLDERS: price and nextCohort are "TBA" until confirmed. While they are
// TBA the pages sell a free seat reservation instead of a purchase.

export type OfferSlug = "ai" | "marketing";

export interface OfferModule {
  label: string;
  title: string;
  lessons: string[];
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
  pains: { title: string; text: string }[];
  outcomes: string[];
  modules: OfferModule[];
  whoFor: string[];
  notFor: string[];
  faq: { question: string; answer: string }[];
}

export const CTA_LABEL = "احجز مقعدك";
export const CTA_NOTE = "الحجز مجاني، وتصلك المواعيد والسعر قبل الإعلان عنها.";

/** Shown in both heroes. The courses are practical, and both variants say so the same way. */
export const PRACTICAL_TAG = "كورس عملي بالكامل: تطبّق على مشروعك في كل جلسة";

/** Every page's shared UI text, so neither variant words the same thing differently. */
export const UI = {
  seeCurriculum: "شاهد المنهج",
  painsTitle: "هل هذا يشبه وضعك؟",
  outcomesTitle: (duration: string) => `خلال ${duration} ستتمكن من`,
  curriculumTitle: "ماذا نطبّق، أسبوعاً بأسبوع",
  curriculumLead: "كل أسبوع ينتهي بشيء تستخدمه في عملك من اليوم التالي.",
  youLeaveWith: "تخرج بـ:",
  whoForTitle: "هذا الكورس مناسب لـ",
  notForTitle: "غير مناسب لـ",
  includedTitle: "ماذا تحصل عليه",
  priceLabel: "السعر",
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
  priceTba: "يُعلن لمن حجز مقعده أولاً",
};

/** How every session runs. This is the "practical, not theory" promise, shown on both pages. */
export const SESSION_FLOW = {
  title: "كل جلسة تطبيق عملي، وليست محاضرة",
  lead: "لا شرائح نظرية ولا محاضرات طويلة. كل جلسة تسير بنفس الطريقة:",
  steps: [
    { title: "نعرض الأداة على مثال حقيقي", text: "شرح قصير ومباشر على الشاشة، على حالة من عمل حقيقي." },
    { title: "تطبّق على مشروعك أثناء الجلسة", text: "تعمل على مشروعك أنت: علامتك التجارية، عملاؤك، إعلاناتك، ونحن معك مباشرة." },
    { title: "تخرج بنتيجة جاهزة للاستخدام", text: "كل جلسة تنتهي بشيء تستخدمه في عملك من اليوم التالي." },
  ],
};

export const OFFER_INCLUDED = [
  { title: "جلستان مباشرتان أسبوعياً", text: "اسأل واحصل على الإجابة فوراً، وطبّق أمامنا." },
  { title: "كل جلسة مسجّلة", text: "فاتتك جلسة؟ شاهدها في أي وقت." },
  { title: "قوالب وأدلة عمل", text: "مكتبات أوامر وقوائم تحقق وقوالب تبقى معك." },
  { title: "مجموعة خاصة للدفعة", text: "مجموعة واتساب لمشاركة النتائج وحل المشكلات." },
  { title: "ملاحظات على مشروعك", text: "ملاحظات شخصية على مشروعك النهائي، مطبّقة على عملك." },
  { title: "شهادة إتمام", text: "تضيفها إلى ملفك على LinkedIn." },
];

const RESERVE_FAQ = {
  question: "متى يبدأ الكورس وكم سعره؟",
  answer:
    "نرسل المواعيد والسعر لمن حجز مقعده أولاً، قبل نشرها. الحجز مجاني ولا يُلزمك بشيء، وإذا لم يناسبك الموعد أو السعر فلا تسجّل.",
};

const PRACTICAL_FAQ = {
  question: "هل الكورس نظري؟",
  answer:
    "لا. كل جلسة تطبيق عملي على مشروعك أنت. نشرح الأداة باختصار، ثم تطبّق معنا مباشرة، وتخرج بنتيجة تستخدمها في عملك.",
};

const LIVE_FAQ = {
  question: "ماذا لو لم أستطع حضور جلسة مباشرة؟",
  answer: "كل جلسة تُسجَّل وتُرسَل في نفس اليوم، فتلحق بها وتطرح أسئلتك في مجموعة الدفعة.",
};

const TEAM_FAQ = {
  question: "هل تستطيع شركتي حجز الكورس لكل الفريق؟",
  answer: "نعم. نقدّم نسخاً خاصة للفرق، مبنية على مجالكم وأدواتكم. اذكر ذلك عند الحجز وسنتواصل معك.",
};

export const OFFERS: Record<OfferSlug, CourseOffer> = {
  ai: {
    slug: "ai",
    title: "الذكاء الاصطناعي للتسويق والأعمال",
    formValue: "ai",
    duration: "6 أسابيع",
    sessions: "12 جلسة مباشرة",
    format: "أونلاين مباشر + حضوري في دبي",
    level: "من المبتدئ إلى المتوسط",
    price: "TBA",
    nextCohort: "TBA",
    pains: [
      {
        title: "النتائج تشبه ما يكتبه الجميع",
        text: "جرّبت ChatGPT، لكن ما يخرج منه عام، فتعيد كتابة معظمه وتتساءل ما الفائدة.",
      },
      {
        title: "لا يوجد نظام، فيبقى العمل يدوياً",
        text: "تعرف أن الذكاء الاصطناعي يوفّر عليك ساعات كل أسبوع، لكن بدون طريقة ثابتة يبقى العمل يدوياً.",
      },
      {
        title: "أدوات كثيرة ولا تعرف ماذا تختار",
        text: "كل أسبوع أداة جديدة، ولا تعرف أيها يستحق وقتك ومالك.",
      },
    ],
    outcomes: [
      "تكتب أوامر (Prompts) تعطيك نتيجة صالحة للاستخدام من أول أو ثاني محاولة",
      "تبني مكتبة أوامر لأسلوب علامتك التجارية وعروضك وجمهورك",
      "تُنتج محتوى شهر كامل ونسخاً إعلانية متعددة خلال بضع ساعات",
      "تربط Claude بأدوات مثل Google Drive وInstagram ونظام إدارة العملاء",
      "تؤتمت المهام المتكررة بدون برمجة",
      "تعرف أي أدوات الذكاء الاصطناعي تستحق الدفع وأيها تتجاهل",
    ],
    modules: [
      {
        label: "الأسبوع 1",
        title: "تجهيز أدواتك على مشروعك",
        lessons: [
          "إعداد ChatGPT وClaude بتعليمات خاصة بعملك",
          "متى تستخدم ChatGPT أو Claude أو Gemini، بأمثلة من عمل حقيقي",
          "إنشاء مشاريع (Projects) جاهزة لمهامك اليومية",
        ],
        deliverable: "مساحة عمل مُعدّة وجاهزة لمشروعك",
      },
      {
        label: "الأسبوع 2",
        title: "كتابة الأوامر بطريقة تعطي نتائج ثابتة",
        lessons: [
          "هيكل الأمر الذي يعطي نتائج ثابتة، تطبّقه على مهامك",
          "تزويد الذكاء الاصطناعي بأسلوبك وعروضك ومعلومات عملائك",
          "بناء مكتبة أوامر يستخدمها فريقك",
        ],
        deliverable: "مكتبة أوامر مضبوطة على أسلوب علامتك",
      },
      {
        label: "الأسبوع 3",
        title: "الذكاء الاصطناعي للمحتوى والسوشيال ميديا",
        lessons: [
          "تقويم محتوى وأفكار افتتاحية وسكريبتات في دقائق",
          "تحويل فكرة واحدة إلى عشرة أشكال من المحتوى",
          "مراجعة حساباتك على السوشيال ميديا بالذكاء الاصطناعي",
        ],
        deliverable: "تقويم محتوى لـ 30 يوماً مع الأفكار والسكريبتات",
      },
      {
        label: "الأسبوع 4",
        title: "الذكاء الاصطناعي للإعلانات والتصاميم",
        lessons: [
          "نسخ إعلانية متعددة لـ Meta وGoogle وTikTok",
          "أدوات الصور والفيديو بالذكاء الاصطناعي لإعلاناتك",
          "اختبار زوايا إعلانية أكثر وبسرعة أكبر",
        ],
        deliverable: "مجموعة إعلانات جاهزة للاختبار",
      },
      {
        label: "الأسبوع 5",
        title: "الأتمتة ووكلاء الذكاء الاصطناعي (AI Agents)",
        lessons: [
          "ربط الذكاء الاصطناعي بالأدوات التي تستخدمها اليوم",
          "أتمتة بدون برمجة للعملاء المحتملين والتقارير والمتابعة",
          "ما يستطيع وكلاء الذكاء الاصطناعي فعله لفريق صغير اليوم",
        ],
        deliverable: "أتمتة تعمل وتوفّر عليك ساعات كل أسبوع",
      },
      {
        label: "الأسبوع 6",
        title: "البحث والبيانات ودليلك العملي",
        lessons: [
          "تحليل المنافسين والسوق بالذكاء الاصطناعي",
          "تحويل الجداول والتقارير إلى قرارات",
          "المشروع النهائي: دليل الذكاء الاصطناعي الخاص بعملك",
        ],
        deliverable: "دليلك الخاص للذكاء الاصطناعي، مع ملاحظات عليه",
      },
    ],
    whoFor: [
      "المسوّقين الذين يريدون إنتاج محتوى وحملات أكثر بدون توظيف",
      "أصحاب المشاريع والمؤسسين الذين لا يعرفون من أين يبدأون مع الذكاء الاصطناعي",
      "فرق الوكالات التي تريد طرق عمل ثابتة بالذكاء الاصطناعي لعملائها",
      "كل من جرّب ChatGPT وحصل على نتائج عامة",
    ],
    notFor: [
      "المبرمجين الذين يبحثون عن كورس برمجة أو تعلّم آلة",
      "من يبحث عن محاضرات نظرية ولا يريد التطبيق",
    ],
    faq: [
      RESERVE_FAQ,
      PRACTICAL_FAQ,
      {
        question: "هل أحتاج خلفية تقنية؟",
        answer: "لا. إذا كنت تستخدم البريد الإلكتروني والمتصفح، تستطيع حضور الكورس. كل شيء يُطبَّق خطوة بخطوة.",
      },
      {
        question: "هل أحتاج اشتراكات مدفوعة في الأدوات؟",
        answer: "النسخ المجانية من ChatGPT وClaude تكفي للبداية. نوضح متى يستحق الاشتراك المدفوع، فلا تدفع إلا على ما تستخدمه.",
      },
      LIVE_FAQ,
      TEAM_FAQ,
    ],
  },
  marketing: {
    slug: "marketing",
    title: "التسويق ونمو الأعمال",
    formValue: "marketing",
    duration: "8 أسابيع",
    sessions: "16 جلسة مباشرة",
    format: "أونلاين مباشر + حضوري في دبي",
    level: "من المبتدئ إلى المتوسط",
    price: "TBA",
    nextCohort: "TBA",
    pains: [
      {
        title: "تصرف على الإعلانات ولا تعرف ما الذي ينجح",
        text: "المال يخرج كل شهر، والعملاء المحتملون يأتون أحياناً، ولا أحد يستطيع أن يقول لك أي جزء يغطي تكلفته.",
      },
      {
        title: "تعلّمت التسويق على شكل قطع متفرقة",
        text: "فيديو عن إعلانات Meta، ومقال عن السيو، وكورس عن المحتوى. لا شيء منها يجتمع في خطة تستطيع تنفيذها.",
      },
      {
        title: "البحث تغيّر وخطتك لم تتغيّر",
        text: "الناس يسألون ChatGPT وإجابات Google الذكية قبل أن يضغطوا على أي رابط، ومعظم خطط التسويق ما زالت تتجاهل ذلك.",
      },
    ],
    outcomes: [
      "تبني استراتيجية تسويق وخطة قنوات من الصفر",
      "تبحث عن الكلمات المفتاحية وتطبّق السيو على صفحاتك، وتظهر في إجابات الذكاء الاصطناعي (GEO)",
      "تطلق حملات على Meta وGoogle وTikTok وتحسّن نتائجها",
      "تخطط لمحتوى يجلب عملاء، لا إعجابات فقط",
      "تكتشف نقاط الضعف في مسار البيع وصفحات الهبوط وتصلحها",
      "تُعدّ تتبّع GA4 وتقرأ الأرقام المهمة",
    ],
    modules: [
      {
        label: "الأسبوع 1",
        title: "الاستراتيجية والتموضع",
        lessons: [
          "دراسة جمهورك وبناء شخصيات العملاء",
          "تموضع وعروض تحقق مبيعات",
          "اختيار القنوات وتحديد الميزانية",
        ],
        deliverable: "استراتيجية تسويق من صفحة واحدة لمشروعك",
      },
      {
        label: "الأسبوع 2",
        title: "السيو والظهور في الذكاء الاصطناعي (SEO وGEO)",
        lessons: [
          "البحث عن كلمات مفتاحية عليها طلب حقيقي",
          "السيو داخل الصفحة والأساسيات التقنية",
          "كيف تجعل ChatGPT وGemini وAI Overviews يذكرون علامتك",
        ],
        deliverable: "خريطة كلمات مفتاحية وقائمة تحقق للسيو",
      },
      {
        label: "الأسبوعان 3 و4",
        title: "الإعلانات المدفوعة",
        lessons: [
          "إعلانات Meta: هيكل الحملة والجماهير والبكسل",
          "حملات Google Search وPerformance Max",
          "إعلانات TikTok ومحتوى بأسلوب صنّاع المحتوى",
          "الميزانيات والمزايدة، وتوسيع الإعلان الرابح وإيقاف الخاسر",
        ],
        deliverable: "حملة إعلانية حقيقية تعمل، مُعدّة بالطريقة الصحيحة",
      },
      {
        label: "الأسبوع 5",
        title: "المحتوى والسوشيال ميديا",
        lessons: [
          "استراتيجية محتوى مرتبطة بأهداف العمل",
          "الافتتاحيات والأشكال ووتيرة النشر",
          "تحويل المتابعين إلى عملاء",
        ],
        deliverable: "خطة محتوى مرتبطة بأهداف المبيعات",
      },
      {
        label: "الأسبوع 6",
        title: "مسار البيع والتحويل",
        lessons: [
          "صفحات هبوط تحقق تحويلات",
          "جذب العملاء المحتملين والمتابعة بالإيميل والواتساب",
          "اختبارات A/B بسيطة",
        ],
        deliverable: "صفحة هبوط ومسار متابعة",
      },
      {
        label: "الأسبوع 7",
        title: "تجارب النمو والذكاء الاصطناعي",
        lessons: [
          "حلقات النمو والتجارب السريعة",
          "استخدام الذكاء الاصطناعي لتسريع البحث والكتابة والتصميم",
          "اختيار التجارب التي تستحق التنفيذ",
        ],
        deliverable: "قائمة تجارب نمو جاهزة للتنفيذ",
      },
      {
        label: "الأسبوع 8",
        title: "التحليلات والتقارير",
        lessons: [
          "GA4 والتحويلات وتتبّع UTM",
          "الأرقام المهمة، والأرقام التي لا تهم",
          "المشروع النهائي: خطة نمو كاملة لمشروع حقيقي",
        ],
        deliverable: "لوحة GA4 وخطة نمو لـ 90 يوماً",
      },
    ],
    whoFor: [
      "المسوّقين في بداية طريقهم الذين يريدون مهارات كاملة ومنظّمة",
      "أصحاب المشاريع الذين يريدون إدارة تسويقهم بأنفسهم أو متابعته بشكل صحيح",
      "المتخصصين في السوشيال ميديا أو التصميم أو المبيعات الذين ينتقلون إلى دور تسويق كامل",
      "كل من يصرف على الإعلانات ولا يعرف ما الذي ينجح",
    ],
    notFor: [
      "المسوّقين أصحاب الخبرة الذين يديرون ميزانيات متعددة القنوات يومياً",
      "من يبحث عن محاضرات نظرية أو طريق مختصر بدون تطبيق",
    ],
    faq: [
      RESERVE_FAQ,
      PRACTICAL_FAQ,
      {
        question: "هل أحتاج خبرة في التسويق؟",
        answer: "لا. نبدأ من الأساسيات ونبني عليها، مع تطبيق عملي على مشروعك كل أسبوع.",
      },
      {
        question: "هل أحتاج ميزانية إعلانات؟",
        answer: "ليس لحضور الكورس. في أسابيع الإعلانات تساعدك ميزانية تجربة صغيرة، ونوضح لك كيف تبدأ بأقل مبلغ.",
      },
      LIVE_FAQ,
      TEAM_FAQ,
    ],
  },
};

export function isTba(value: string): boolean {
  return value.trim().toUpperCase() === "TBA";
}
