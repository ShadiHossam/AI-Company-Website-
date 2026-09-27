/**
 * Blog filter groups.
 *
 * blog_posts.category holds the long cluster names the article pipeline writes
 * ("AI Agents & Automation Foundations", "قطاعات الأعمال في الخليج", ...). There
 * are 25+ of them and several hold one or two posts, which made a poor filter.
 * Visitors filter by these eight groups instead; the stored category is left
 * alone so scheduled articles pick up a group the day they publish.
 */

export interface BlogCategory {
  slug: string;
  en: string;
  ar: string;
  /** Meta description for the filtered listing. Under 155 characters. */
  enDescription: string;
  arDescription: string;
}

/** Display order of the filter chips. */
export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  { slug: 'ai-agents', en: 'AI Agents', ar: 'وكلاء الذكاء الاصطناعي',
    enDescription: 'AI agent guides for UAE businesses: what agents can decide on their own, how to scope one, what it costs, and where to keep a human in the loop.',
    arDescription: 'أدلة وكلاء الذكاء الاصطناعي لشركات الإمارات: ما الذي يقرره الوكيل وحده، كيف تحددون نطاقه، كم يكلف، وأين يبقى القرار للإنسان.',
  },
  { slug: 'ai-automation', en: 'AI Automation', ar: 'أتمتة الأعمال',
    enDescription: 'AI automation guides for UAE teams: invoices, reporting, onboarding, follow-ups and the other repeat work worth handing to software, with AED costs.',
    arDescription: 'أدلة أتمتة الأعمال لفرق الإمارات: الفواتير، التقارير، استقبال العملاء، والمتابعات، وكل عمل متكرر يستحق أن تتولاه الأنظمة، مع التكلفة بالدرهم.',
  },
  { slug: 'chatbots-whatsapp', en: 'Chatbots & WhatsApp', ar: 'روبوتات المحادثة وواتساب',
    enDescription: 'Chatbot and WhatsApp automation guides for the UAE: Arabic and English bots, WhatsApp Business API rules, costs, and the flows that turn chats into sales.',
    arDescription: 'أدلة روبوتات المحادثة وأتمتة واتساب في الإمارات: بوتات بالعربية والإنجليزية، قواعد واتساب للأعمال، التكلفة، والتدفقات التي تحوّل المحادثات إلى مبيعات.',
  },
  { slug: 'voice-ai', en: 'Voice AI', ar: 'الذكاء الاصطناعي الصوتي',
    enDescription: 'Voice AI guides for UAE businesses: AI phone agents in Arabic and English, call booking, telemarketing rules, and what a voice agent really costs.',
    arDescription: 'أدلة الذكاء الاصطناعي الصوتي لشركات الإمارات: وكلاء هاتف بالعربية والإنجليزية، حجز المكالمات، قواعد التسويق الهاتفي، والتكلفة الفعلية.',
  },
  { slug: 'industries', en: 'Industries', ar: 'القطاعات والأسواق',
    enDescription: 'How AI works in UAE sectors and cities: real estate, clinics, retail, law firms, logistics and more, with examples from Dubai, Abu Dhabi and Sharjah.',
    arDescription: 'كيف يعمل الذكاء الاصطناعي في قطاعات الإمارات ومدنها: العقارات، العيادات، التجزئة، المحاماة، اللوجستيات، مع أمثلة من دبي وأبوظبي والشارقة.',
  },
  { slug: 'security-compliance', en: 'Security & Compliance', ar: 'الأمان والامتثال',
    enDescription: 'AI security and compliance for UAE companies: PDPL, TDRA and data residency rules, audit trails, and how to keep AI systems safe from misuse.',
    arDescription: 'أمن الذكاء الاصطناعي والامتثال لشركات الإمارات: قانون حماية البيانات، قرارات 2024، مكان تخزين البيانات، سجلات التدقيق، وحماية الأنظمة من سوء الاستخدام.',
  },
  { slug: 'pricing-roi', en: 'Pricing & ROI', ar: 'التكاليف والعائد',
    enDescription: 'What AI projects cost in the UAE, in dirhams: price bands by project type, hidden costs, and how to work out the return before you sign.',
    arDescription: 'كم تكلف مشاريع الذكاء الاصطناعي في الإمارات بالدرهم: شرائح الأسعار حسب نوع المشروع، التكاليف الخفية، وكيف تحسبون العائد قبل التوقيع.',
  },
  { slug: 'tools-strategy', en: 'Tools & Strategy', ar: 'الأدوات والاستراتيجية',
    enDescription: 'Choosing AI tools and planning adoption in the UAE: platform comparisons, AI search visibility, data readiness, and getting your team to use it.',
    arDescription: 'اختيار أدوات الذكاء الاصطناعي وتخطيط تبنيها في الإمارات: مقارنات المنصات، الظهور في محركات الإجابة، جاهزية البيانات، وتدريب الفريق.',
  },
];

const GROUP_OF: Record<string, string> = {
  // English clusters
  'AI Agents & Automation Foundations': 'ai-agents',
  'AgentOps, Monitoring & Maintenance': 'ai-agents',
  'Workflow Automation & Integrations': 'ai-automation',
  'Department & Function Workflows': 'ai-automation',
  'Feeders for Live Service Pages': 'ai-automation',
  'Chatbots & Conversational AI': 'chatbots-whatsapp',
  'WhatsApp & Messaging Automation': 'chatbots-whatsapp',
  'Arabic & Bilingual AI (in English)': 'chatbots-whatsapp',
  'Voice AI & Phone Automation': 'voice-ai',
  'Industry Verticals': 'industries',
  'Emirates, Cities & Free Zones': 'industries',
  'AI Security, Guardrails & Trust': 'security-compliance',
  'UAE Compliance, PDPL & Data': 'security-compliance',
  'Cost, Pricing, ROI & Hiring': 'pricing-roi',
  'Templates, Checklists & Calculators': 'pricing-roi',
  'Tools, Platforms & Comparisons': 'tools-strategy',
  'Adoption, Training & Change': 'tools-strategy',
  'AI Search Visibility (AEO / GEO)': 'tools-strategy',
  'Data, RAG & Knowledge Systems': 'tools-strategy',
  // Arabic clusters
  'أساسيات أتمتة الأعمال بالذكاء الاصطناعي': 'ai-automation',
  'روبوتات المحادثة العربية': 'chatbots-whatsapp',
  'واتساب للأعمال والأتمتة': 'chatbots-whatsapp',
  'الذكاء الاصطناعي الصوتي باللهجات الخليجية': 'voice-ai',
  'قطاعات الأعمال في الخليج': 'industries',
  'الأسواق الخليجية': 'industries',
  'الامتثال وحماية البيانات في الخليج': 'security-compliance',
  'التكاليف والأسعار وعائد الاستثمار': 'pricing-roi',
};

const BY_SLUG = new Map(BLOG_CATEGORIES.map((c) => [c.slug, c]));

/** The filter group a stored category belongs to, or undefined if unmapped. */
export function categoryGroup(raw: string | null | undefined): BlogCategory | undefined {
  if (!raw) return undefined;
  const slug = GROUP_OF[raw.trim()];
  return slug ? BY_SLUG.get(slug) : undefined;
}

/** Looks up a group by its URL slug (the ?category= value). */
export function categoryBySlug(slug: string | null | undefined): BlogCategory | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

/**
 * The badge text for a post: the short group name, falling back to the stored
 * category so an unmapped cluster still shows something rather than nothing.
 */
export function categoryLabel(raw: string, lang: 'en' | 'ar'): string {
  return categoryGroup(raw)?.[lang] ?? raw;
}
