import { getSupabaseAdmin } from './supabase';

export interface SectionField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  default: string;
}

export interface PageConfig {
  slug: string;
  title: string;
  path: string;
  description: string;
  sections: { heading: string; fields: SectionField[] }[];
}

export const PAGE_CONFIGS: PageConfig[] = [
  {
    slug: 'home',
    title: 'Home',
    path: '/',
    description: 'Hero section, stats bar, and main CTA.',
    sections: [
      {
        heading: 'Hero',
        fields: [
          { key: 'hero_eyebrow', label: 'Eyebrow Pill Text', type: 'text', default: 'The only Dubai AI partner with a 100% refund guarantee' },
          { key: 'hero_h1_line1', label: 'Headline Line 1', type: 'text', default: 'Custom AI Systems +' },
          { key: 'hero_h1_line2', label: 'Headline Line 2 (gradient)', type: 'text', default: 'Team Training, in One Package.' },
          { key: 'hero_subtext', label: 'Sub-text', type: 'textarea', default: 'We build AI that fits your workflows and train your people to use it — for Dubai SMEs in real estate, retail, hospitality, and logistics.' },
          { key: 'hero_cta', label: 'CTA Button Text', type: 'text', default: 'Book Free Strategy Call' },
        ],
      },
      {
        heading: 'Stats Bar',
        fields: [
          { key: 'stat_1_value', label: 'Stat 1 Value', type: 'text', default: '100%' },
          { key: 'stat_1_label', label: 'Stat 1 Label', type: 'text', default: 'Refund Guarantee' },
          { key: 'stat_2_value', label: 'Stat 2 Value', type: 'text', default: 'AR/EN' },
          { key: 'stat_2_label', label: 'Stat 2 Label', type: 'text', default: 'Bilingual' },
          { key: 'stat_3_value', label: 'Stat 3 Value', type: 'text', default: '90-Day' },
          { key: 'stat_3_label', label: 'Stat 3 Label', type: 'text', default: 'Support Included' },
        ],
      },
    ],
  },
  {
    slug: 'about',
    title: 'About',
    path: '/about',
    description: 'Mission headline and hero intro text.',
    sections: [
      {
        heading: 'Hero',
        fields: [
          { key: 'hero_eyebrow', label: 'Eyebrow Text', type: 'text', default: 'About Us' },
          { key: 'hero_h1', label: 'Headline', type: 'textarea', default: 'We Believe Every Business Deserves AI That Actually Works.' },
          { key: 'hero_subtext', label: 'Sub-text', type: 'textarea', default: 'Not just enterprise giants. Not just tech companies. Every business in Dubai should be able to use AI to grow faster, waste less, and work smarter.' },
        ],
      },
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    path: '/services',
    description: 'Services hero and CTA text.',
    sections: [
      {
        heading: 'Hero',
        fields: [
          { key: 'hero_eyebrow', label: 'Eyebrow Text', type: 'text', default: 'What We Offer' },
          { key: 'hero_h1', label: 'Headline', type: 'text', default: 'Three Services. One Mission.' },
          { key: 'hero_subtext', label: 'Sub-text', type: 'textarea', default: "We don't just build AI tools — we make your business genuinely AI-ready. From strategy to build to team training, we cover the full process." },
          { key: 'hero_cta', label: 'CTA Button Text', type: 'text', default: 'Book a Free Consultation' },
        ],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    path: '/contact',
    description: 'Contact page headline and intro copy.',
    sections: [
      {
        heading: 'Hero',
        fields: [
          { key: 'hero_eyebrow', label: 'Eyebrow Text', type: 'text', default: 'Get In Touch' },
          { key: 'hero_h1', label: 'Headline', type: 'textarea', default: "Let's Talk About Your AI Opportunity." },
          { key: 'hero_subtext', label: 'Sub-text', type: 'textarea', default: "Book a free 30-minute call. Tell us about your business. We'll tell you honestly if and how AI can help — and what it would cost." },
        ],
      },
    ],
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    path: '/pricing',
    description: 'Pricing hero and CTA copy.',
    sections: [
      {
        heading: 'Hero',
        fields: [
          { key: 'hero_eyebrow', label: 'Eyebrow Text', type: 'text', default: 'Customized Pricing' },
          { key: 'hero_h1', label: 'Headline', type: 'textarea', default: 'Every Project is Scoped Specifically for You.' },
          { key: 'hero_subtext', label: 'Sub-text', type: 'textarea', default: "We don't believe in one-size-fits-all pricing. Your business, workflow complexity, and goals are unique — so your quote will be too. Book a free 30-minute discovery call and we'll give you a clear, honest number." },
          { key: 'hero_cta_primary', label: 'Primary CTA Text', type: 'text', default: 'Book Free Discovery Call →' },
          { key: 'hero_cta_secondary', label: 'Secondary CTA Text', type: 'text', default: 'Send Us a Message' },
        ],
      },
    ],
  },
];

export async function loadPageContent(pageSlug: string): Promise<Record<string, string>> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('page_content')
      .select('section_key, value')
      .eq('page_slug', pageSlug);
    if (error || !data) return {};
    return Object.fromEntries(data.map(r => [r.section_key, r.value]));
  } catch {
    return {};
  }
}

export function getVal(
  db: Record<string, string>,
  key: string,
  fallback: string
): string {
  return db[key] !== undefined && db[key] !== '' ? db[key] : fallback;
}
