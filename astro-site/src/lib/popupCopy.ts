// Copy for the booking / WhatsApp popup (components/ContactPopup.astro), in
// English and Arabic. Ported from New Golden Office's lib/popupCopy.ts.
//
// One entry per service intent, matched by longest path prefix, so a visitor
// on /services/ai-agents/voice-agents gets voice-agent copy and one on
// /services/ai-automation gets automation copy. Blog posts use the copy of
// their filter group (lib/blogCategories.ts). Headlines name the visitor's
// situation; the sub-line says what we do about it and how small the next step
// is. Every promise here is one the site already makes elsewhere (free
// 30-minute consultation, no sales pressure, reply within 24 hours Sunday to
// Thursday, Arabic and English). Don't add new promises without the owner.
// House style (see CLAUDE.md): no em dashes, none of the listed AI words.
//
// `primary` picks the big button: 'book' opens the booking form (the sitewide
// modal: details, then a Calendly slot), 'wa' opens WhatsApp for a quick
// question.

import { categoryGroup } from './blogCategories';

export type PopupLang = 'en' | 'ar';

export interface PopupCopy {
  /** Stable key, sent with tracking events so copy can be compared. */
  section: string;
  headline: string;
  sub: string;
  /** Pre-filled WhatsApp text, worded as the visitor would say it. */
  waMessage: string;
  primary: 'book' | 'wa';
}

export interface PopupUi {
  book: string;
  wa: string;
  later: string;
  close: string;
  status: string;
  closed: string;
  trust: string;
}

export const POPUP_UI: Record<PopupLang, PopupUi> = {
  en: {
    book: 'Book a free 30-min call',
    wa: 'Message us on WhatsApp',
    later: 'Not now',
    close: 'Close',
    status: 'Available now',
    closed: "We're offline right now. WhatsApp messages get a reply from 9am Dubai time, Sunday to Thursday.",
    trust: '✓ Free consultation · ✓ No sales pressure · ✓ Reply within 24 hours',
  },
  ar: {
    book: 'احجز مكالمة مجانية لمدة 30 دقيقة',
    wa: 'راسلنا على واتساب',
    later: 'ليس الآن',
    close: 'إغلاق',
    status: 'متاحون الآن',
    closed: 'نحن خارج ساعات العمل الآن. نرد على رسائل واتساب من الساعة 9 صباحًا بتوقيت دبي، من الأحد إلى الخميس.',
    trust: '✓ استشارة مجانية · ✓ بدون ضغط للبيع · ✓ نرد خلال 24 ساعة',
  },
};

type Entry = Omit<PopupCopy, 'section'>;

const COPY: Record<PopupLang, Record<string, Entry>> = {
  en: {
    home: {
      headline: 'Is your team spending hours on work software could do?',
      sub: 'In a free 30-minute call we find the first process worth automating and what it would take to build.',
      waMessage: "Hi Lenoo AI, I'd like to talk about automating part of our work.",
      primary: 'book',
    },
    agents: {
      headline: 'Thinking about an AI agent for sales, support or bookings?',
      sub: 'Tell us the job you want it to do. In a free 30-minute call we scope the agent, the tools it needs and where a person stays in charge.',
      waMessage: "Hi Lenoo AI, I'm interested in an AI agent for my business.",
      primary: 'book',
    },
    voice: {
      headline: 'Missing calls after hours or when the team is busy?',
      sub: 'An AI voice agent can answer in Arabic and English, book appointments and pass serious leads to your team. Book a free call to see how it would work for you.',
      waMessage: "Hi Lenoo AI, I'd like to know more about AI voice agents.",
      primary: 'book',
    },
    automation: {
      headline: 'Still copying data between spreadsheets, email and your CRM?',
      sub: "Walk us through the process in a free 30-minute call and we'll tell you which steps can run on their own.",
      waMessage: "Hi Lenoo AI, I'd like to automate some of our manual processes.",
      primary: 'book',
    },
    whatsapp: {
      headline: 'Getting more WhatsApp messages than your team can answer?',
      sub: 'We set up WhatsApp automation that replies, qualifies and books, in Arabic and English. Message us and see how it feels from the customer side.',
      waMessage: "Hi Lenoo AI, I'd like to automate our WhatsApp replies.",
      primary: 'wa',
    },
    chatbots: {
      headline: 'Want a chatbot that answers customers like your best staff member?',
      sub: 'We build chatbots in Arabic and English that answer from your own content. Book a free call to scope yours.',
      waMessage: "Hi Lenoo AI, I'm interested in a chatbot for our website or WhatsApp.",
      primary: 'book',
    },
    arabic: {
      headline: 'Need AI that understands your Arabic-speaking customers?',
      sub: "Our chatbots and voice agents handle Arabic and English in the same conversation. Book a free call and we'll show you how it works.",
      waMessage: "Hi Lenoo AI, I'd like to know more about your Arabic AI solutions.",
      primary: 'book',
    },
    strategy: {
      headline: 'Not sure which AI projects are worth the money?',
      sub: 'In a free 30-minute call we look at how your business runs and rank the ideas by cost and payback.',
      waMessage: "Hi Lenoo AI, I'd like help deciding where AI makes sense for us.",
      primary: 'book',
    },
    training: {
      headline: 'Want your team using AI tools properly, not just trying them?',
      sub: 'We run practical AI training for UAE teams, built around the work they do every day. Book a free call to plan a session.',
      waMessage: "Hi Lenoo AI, I'd like to ask about AI training for our team.",
      primary: 'book',
    },
    vibe: {
      headline: 'Building with AI coding tools and hitting walls?',
      sub: "Book a free call. We'll look at what you're building and what it takes to get it into production.",
      waMessage: "Hi Lenoo AI, I'm building something with AI coding tools and need help.",
      primary: 'book',
    },
    custom: {
      headline: "Have an AI idea that off-the-shelf tools can't handle?",
      sub: 'Tell us what it needs to do. In a free 30-minute call we scope the build, the data it needs and a realistic timeline.',
      waMessage: "Hi Lenoo AI, I have an idea for a custom AI tool and I'd like to discuss it.",
      primary: 'book',
    },
    ops: {
      headline: 'Already running AI agents and want them to stay reliable?',
      sub: 'We monitor, test and maintain AI agents in production. Book a free call to go through your setup.',
      waMessage: "Hi Lenoo AI, I'd like support running our AI agents.",
      primary: 'book',
    },
    compliance: {
      headline: 'Worried about data privacy and UAE rules for your AI tools?',
      sub: "Book a free call and we'll go through what your AI setup needs to stay within UAE data and security rules.",
      waMessage: "Hi Lenoo AI, I have questions about AI compliance and data security.",
      primary: 'book',
    },
    industries: {
      headline: "Wondering what AI could take off your team's plate?",
      sub: "We've mapped AI use cases for your sector. Book a free 30-minute call and we'll pick the ones that fit your business.",
      waMessage: "Hi Lenoo AI, I'd like to know how AI could help in our industry.",
      primary: 'book',
    },
    pricing: {
      headline: 'Want a real number for your project?',
      sub: "Send us a short description on WhatsApp or book a free call, and we'll tell you what drives the cost in your case.",
      waMessage: "Hi Lenoo AI, I'd like a cost estimate. Here's what we need:",
      primary: 'wa',
    },
    blog: {
      headline: 'Reading up because you have an AI project in mind?',
      sub: 'Send us your question on WhatsApp or book a free 30-minute call. We reply within 24 hours, Sunday to Thursday.',
      waMessage: 'Hi Lenoo AI, I have a question after reading your blog.',
      primary: 'wa',
    },
    about: {
      headline: "Want to know if we're the right team for your project?",
      sub: "Book a free 30-minute call. No sales pressure, just an honest view of what AI can and can't do for you.",
      waMessage: "Hi Lenoo AI, I'd like to talk about working with you.",
      primary: 'book',
    },
    default: {
      headline: 'Wondering where AI fits in your business?',
      sub: "Book a free 30-minute call. We'll look at how your team works today and point to the first task worth automating.",
      waMessage: "Hi Lenoo AI, I'd like to talk about AI for my business.",
      primary: 'book',
    },
  },
  ar: {
    home: {
      headline: 'هل يقضي فريقك ساعات في أعمال يمكن أن تنجزها الأنظمة؟',
      sub: 'في مكالمة مجانية مدتها 30 دقيقة نحدد أول عملية تستحق الأتمتة وما يلزم لبنائها.',
      waMessage: 'مرحباً Lenoo AI، أود التحدث عن أتمتة جزء من أعمالنا',
      primary: 'book',
    },
    agents: {
      headline: 'تفكر في وكيل ذكاء اصطناعي للمبيعات أو خدمة العملاء أو الحجوزات؟',
      sub: 'أخبرنا بالمهمة التي تريده أن يقوم بها. في مكالمة مجانية مدتها 30 دقيقة نحدد نطاق الوكيل والأدوات التي يحتاجها وأين يبقى القرار للإنسان.',
      waMessage: 'مرحباً Lenoo AI، أنا مهتم بوكيل ذكاء اصطناعي لشركتي',
      primary: 'book',
    },
    voice: {
      headline: 'تفوتك مكالمات بعد ساعات العمل أو في أوقات الضغط؟',
      sub: 'وكيل الذكاء الاصطناعي الصوتي يرد بالعربية والإنجليزية، ويحجز المواعيد، ويحوّل العملاء الجادين إلى فريقك. احجز مكالمة مجانية لترى كيف يعمل لديك.',
      waMessage: 'مرحباً Lenoo AI، أود معرفة المزيد عن الوكلاء الصوتيين',
      primary: 'book',
    },
    automation: {
      headline: 'ما زلتم تنقلون البيانات يدويًا بين الجداول والبريد ونظام العملاء؟',
      sub: 'اشرح لنا العملية في مكالمة مجانية مدتها 30 دقيقة، ونخبرك بالخطوات التي يمكن أن تعمل وحدها.',
      waMessage: 'مرحباً Lenoo AI، أود أتمتة بعض العمليات اليدوية لدينا',
      primary: 'book',
    },
    whatsapp: {
      headline: 'رسائل واتساب أكثر مما يستطيع فريقك الرد عليه؟',
      sub: 'نبني أتمتة واتساب ترد على العملاء وتفرز الجادين منهم وتحجز المواعيد، بالعربية والإنجليزية. راسلنا وجرّب التجربة من جهة العميل.',
      waMessage: 'مرحباً Lenoo AI، أود أتمتة الرد على رسائل واتساب',
      primary: 'wa',
    },
    chatbots: {
      headline: 'تريد روبوت محادثة يرد على العملاء مثل أفضل موظفيك؟',
      sub: 'نبني روبوتات محادثة بالعربية والإنجليزية تجيب من محتواك أنت. احجز مكالمة مجانية لتحديد ما تحتاجه.',
      waMessage: 'مرحباً Lenoo AI، أنا مهتم بروبوت محادثة لموقعنا أو واتساب',
      primary: 'book',
    },
    arabic: {
      headline: 'تحتاج ذكاءً اصطناعيًا يفهم عملاءك الناطقين بالعربية؟',
      sub: 'روبوتات المحادثة والوكلاء الصوتيون لدينا يتعاملون مع العربية والإنجليزية في المحادثة نفسها. احجز مكالمة مجانية ونريك كيف يعمل.',
      waMessage: 'مرحباً Lenoo AI، أود معرفة المزيد عن حلول الذكاء الاصطناعي بالعربية',
      primary: 'book',
    },
    strategy: {
      headline: 'لست متأكدًا أي مشاريع الذكاء الاصطناعي تستحق الاستثمار؟',
      sub: 'في مكالمة مجانية مدتها 30 دقيقة ننظر في طريقة عمل شركتك ونرتب الأفكار حسب التكلفة والعائد.',
      waMessage: 'مرحباً Lenoo AI، أحتاج مساعدة في تحديد أين يفيدنا الذكاء الاصطناعي',
      primary: 'book',
    },
    training: {
      headline: 'تريد أن يستخدم فريقك أدوات الذكاء الاصطناعي بشكل صحيح؟',
      sub: 'نقدم تدريبًا عمليًا لفرق العمل في الإمارات مبنيًا على مهامهم اليومية. احجز مكالمة مجانية لتخطيط الجلسة.',
      waMessage: 'مرحباً Lenoo AI، أود الاستفسار عن تدريب فريقنا على الذكاء الاصطناعي',
      primary: 'book',
    },
    vibe: {
      headline: 'تبني مشروعًا بأدوات البرمجة بالذكاء الاصطناعي وتواجه عقبات؟',
      sub: 'احجز مكالمة مجانية. ننظر فيما تبنيه وما يلزم لإطلاقه بشكل فعلي.',
      waMessage: 'مرحباً Lenoo AI، أبني مشروعًا بأدوات البرمجة بالذكاء الاصطناعي وأحتاج مساعدة',
      primary: 'book',
    },
    custom: {
      headline: 'لديك فكرة لا تكفيها الأدوات الجاهزة؟',
      sub: 'أخبرنا بما يجب أن تفعله. في مكالمة مجانية مدتها 30 دقيقة نحدد نطاق البناء والبيانات المطلوبة وجدولًا زمنيًا واقعيًا.',
      waMessage: 'مرحباً Lenoo AI، لدي فكرة لأداة ذكاء اصطناعي مخصصة وأود مناقشتها',
      primary: 'book',
    },
    ops: {
      headline: 'لديك وكلاء ذكاء اصطناعي يعملون وتريدهم أن يبقوا موثوقين؟',
      sub: 'نراقب وكلاء الذكاء الاصطناعي ونختبرهم ونصونهم أثناء التشغيل. احجز مكالمة مجانية لمراجعة نظامك.',
      waMessage: 'مرحباً Lenoo AI، أحتاج دعمًا في تشغيل وكلاء الذكاء الاصطناعي لدينا',
      primary: 'book',
    },
    compliance: {
      headline: 'قلق بشأن خصوصية البيانات وأنظمة الإمارات لأدوات الذكاء الاصطناعي؟',
      sub: 'احجز مكالمة مجانية ونراجع معك ما يحتاجه نظامك ليبقى ضمن قواعد البيانات والأمن في الإمارات.',
      waMessage: 'مرحباً Lenoo AI، لدي أسئلة عن الامتثال وأمن البيانات في الذكاء الاصطناعي',
      primary: 'book',
    },
    industries: {
      headline: 'ما الأعمال التي يمكن أن يتولاها الذكاء الاصطناعي عن فريقك؟',
      sub: 'جمعنا استخدامات الذكاء الاصطناعي في قطاعك. احجز مكالمة مجانية مدتها 30 دقيقة ونختار منها ما يناسب شركتك.',
      waMessage: 'مرحباً Lenoo AI، أود معرفة كيف يفيد الذكاء الاصطناعي قطاعنا',
      primary: 'book',
    },
    pricing: {
      headline: 'تريد رقمًا حقيقيًا لتكلفة مشروعك؟',
      sub: 'أرسل لنا وصفًا قصيرًا على واتساب أو احجز مكالمة مجانية، ونوضح لك ما الذي يحدد التكلفة في حالتك.',
      waMessage: 'مرحباً Lenoo AI، أود تقديرًا للتكلفة. هذا ما نحتاجه:',
      primary: 'wa',
    },
    blog: {
      headline: 'تقرأ لأن لديك مشروع ذكاء اصطناعي في ذهنك؟',
      sub: 'أرسل سؤالك على واتساب أو احجز مكالمة مجانية مدتها 30 دقيقة. نرد خلال 24 ساعة، من الأحد إلى الخميس.',
      waMessage: 'مرحباً Lenoo AI، لدي سؤال بعد قراءة مدونتكم',
      primary: 'wa',
    },
    about: {
      headline: 'تريد أن تعرف إن كنا الفريق المناسب لمشروعك؟',
      sub: 'احجز مكالمة مجانية مدتها 30 دقيقة. بدون ضغط للبيع، فقط رأي صريح فيما يمكن للذكاء الاصطناعي أن يقدمه لك وما لا يمكنه.',
      waMessage: 'مرحباً Lenoo AI، أود التحدث عن العمل معكم',
      primary: 'book',
    },
    default: {
      headline: 'أين يمكن أن يفيد الذكاء الاصطناعي شركتك؟',
      sub: 'احجز مكالمة مجانية مدتها 30 دقيقة. ننظر في طريقة عمل فريقك اليوم ونحدد أول مهمة تستحق الأتمتة.',
      waMessage: 'مرحباً Lenoo AI، أود التحدث عن الذكاء الاصطناعي لشركتي',
      primary: 'book',
    },
  },
};

// Path prefix (without /ar) -> copy key. Longest match wins.
const PREFIXES: [string, string][] = [
  ['/services/ai-agents/voice-agents', 'voice'],
  ['/services/arabic-ai/voice-agents', 'voice'],
  ['/services/arabic-ai/chatbots', 'chatbots'],
  ['/services/arabic-ai', 'arabic'],
  ['/services/ai-agents', 'agents'],
  ['/services/ai-automation', 'automation'],
  ['/services/whatsapp-ai-automation', 'whatsapp'],
  ['/services/ai-chatbot-development', 'chatbots'],
  ['/services/custom-gpt-development', 'chatbots'],
  ['/services/ai-strategy', 'strategy'],
  ['/services/ai-training', 'training'],
  ['/services/vibe-coding', 'vibe'],
  ['/services/custom-ai-development', 'custom'],
  ['/services/internal-ai-tools', 'custom'],
  ['/services/claude-agent-builds', 'custom'],
  ['/services/ai-integration', 'custom'],
  ['/services/prompt-engineering', 'custom'],
  ['/services/ai-model-finetuning', 'custom'],
  ['/services/agentops', 'ops'],
  ['/services/ai-maintenance', 'ops'],
  ['/services/ai-compliance-uae', 'compliance'],
  ['/services/ai-agent-security', 'compliance'],
  ['/industries', 'industries'],
  ['/pricing', 'pricing'],
  ['/blog', 'blog'],
  ['/about', 'about'],
].sort((a, b) => b[0].length - a[0].length) as [string, string][];

// Blog filter group (lib/blogCategories.ts) -> copy key.
const GROUP_KEY: Record<string, string> = {
  'ai-agents': 'agents',
  'ai-automation': 'automation',
  'chatbots-whatsapp': 'whatsapp',
  'voice-ai': 'voice',
  industries: 'industries',
  'security-compliance': 'compliance',
  'pricing-roi': 'pricing',
  'tools-strategy': 'strategy',
};

// No popup where the visitor is already contacting us, applying for a job, or
// reading legal pages.
const NO_POPUP = /^\/(contact|careers|jobs|privacy|terms|maintenance|404)(\/|$)/;

export interface PopupContext {
  /** Blog posts pass their stored category for article-aware copy. */
  category?: string;
}

export function resolvePopupCopy(pathname: string, lang: PopupLang, ctx: PopupContext = {}): PopupCopy | null {
  const path = (pathname.replace(/^\/ar(?=\/|$)/, '') || '/').replace(/\/$/, '') || '/';
  if (NO_POPUP.test(path)) return null;

  let key = path === '/' ? 'home' : 'default';
  const group = ctx.category ? categoryGroup(ctx.category) : undefined;
  if (group && GROUP_KEY[group.slug]) {
    key = GROUP_KEY[group.slug];
  } else {
    for (const [prefix, k] of PREFIXES) {
      if (path === prefix || path.startsWith(prefix + '/')) { key = k; break; }
    }
  }
  const entry = COPY[lang][key] ?? COPY[lang].default;
  return { section: `${lang}-${key}`, ...entry };
}
