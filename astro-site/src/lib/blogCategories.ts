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
}

/** Display order of the filter chips. */
export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  { slug: 'ai-agents', en: 'AI Agents', ar: 'وكلاء الذكاء الاصطناعي' },
  { slug: 'ai-automation', en: 'AI Automation', ar: 'أتمتة الأعمال' },
  { slug: 'chatbots-whatsapp', en: 'Chatbots & WhatsApp', ar: 'روبوتات المحادثة وواتساب' },
  { slug: 'voice-ai', en: 'Voice AI', ar: 'الذكاء الاصطناعي الصوتي' },
  { slug: 'industries', en: 'Industries', ar: 'القطاعات والأسواق' },
  { slug: 'security-compliance', en: 'Security & Compliance', ar: 'الأمان والامتثال' },
  { slug: 'pricing-roi', en: 'Pricing & ROI', ar: 'التكاليف والعائد' },
  { slug: 'tools-strategy', en: 'Tools & Strategy', ar: 'الأدوات والاستراتيجية' },
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
