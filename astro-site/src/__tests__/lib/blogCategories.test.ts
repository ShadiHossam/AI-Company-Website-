import { describe, it, expect } from 'vitest';
import { BLOG_CATEGORIES, categoryGroup, categoryBySlug, categoryLabel } from '../../lib/blogCategories';

// Every category live in blog_posts or waiting in the scheduled article batch
// as of 2026-09-27. A new cluster that lands unmapped only shows under "All".
const KNOWN = [
  'AI Agents & Automation Foundations', 'AgentOps, Monitoring & Maintenance',
  'Workflow Automation & Integrations', 'Department & Function Workflows',
  'Feeders for Live Service Pages', 'Chatbots & Conversational AI',
  'WhatsApp & Messaging Automation', 'Arabic & Bilingual AI (in English)',
  'Voice AI & Phone Automation', 'Industry Verticals', 'Emirates, Cities & Free Zones',
  'AI Security, Guardrails & Trust', 'UAE Compliance, PDPL & Data',
  'Cost, Pricing, ROI & Hiring', 'Templates, Checklists & Calculators',
  'Tools, Platforms & Comparisons', 'Adoption, Training & Change',
  'AI Search Visibility (AEO / GEO)', 'Data, RAG & Knowledge Systems',
  'أساسيات أتمتة الأعمال بالذكاء الاصطناعي', 'روبوتات المحادثة العربية',
  'واتساب للأعمال والأتمتة', 'الذكاء الاصطناعي الصوتي باللهجات الخليجية',
  'قطاعات الأعمال في الخليج', 'الأسواق الخليجية',
  'الامتثال وحماية البيانات في الخليج', 'التكاليف والأسعار وعائد الاستثمار',
];

describe('blogCategories', () => {
  it('maps every known category to a group', () => {
    for (const raw of KNOWN) expect(categoryGroup(raw), raw).toBeDefined();
  });

  it('gives every group at least one category', () => {
    const used = new Set(KNOWN.map((raw) => categoryGroup(raw)!.slug));
    for (const c of BLOG_CATEGORIES) expect(used.has(c.slug), c.slug).toBe(true);
  });

  it('groups Arabic and English clusters on the same topic together', () => {
    expect(categoryGroup('قطاعات الأعمال في الخليج')?.slug).toBe(categoryGroup('Industry Verticals')?.slug);
    expect(categoryGroup('روبوتات المحادثة العربية')?.slug).toBe('chatbots-whatsapp');
  });

  it('ignores surrounding whitespace and returns undefined for unknown input', () => {
    expect(categoryGroup('  Industry Verticals ')?.slug).toBe('industries');
    expect(categoryGroup('Something New')).toBeUndefined();
    expect(categoryGroup(null)).toBeUndefined();
  });

  it('looks groups up by slug', () => {
    expect(categoryBySlug('voice-ai')?.en).toBe('Voice AI');
    expect(categoryBySlug('nope')).toBeUndefined();
    expect(categoryBySlug(null)).toBeUndefined();
  });

  it('labels posts with the short group name, falling back to the raw value', () => {
    expect(categoryLabel('AI Agents & Automation Foundations', 'en')).toBe('AI Agents');
    expect(categoryLabel('قطاعات الأعمال في الخليج', 'ar')).toBe('القطاعات والأسواق');
    expect(categoryLabel('Something New', 'en')).toBe('Something New');
  });
});
