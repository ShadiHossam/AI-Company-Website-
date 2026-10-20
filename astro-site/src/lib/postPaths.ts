/**
 * Public URL for a blog_posts row.
 *
 * Most posts live at /blog/<slug>. A post whose slug starts with a section
 * prefix (e.g. `abu-dhabi/chatbot-hotel`) lives at the site root under that
 * section instead: /abu-dhabi/chatbot-hotel, and /ar/abu-dhabi/chatbot-hotel
 * for the Arabic side. The section routes rewrite to the blog renderer, so the
 * row itself is an ordinary blog post; only its URL differs.
 *
 * Every place that turns a slug into a link must go through here, or section
 * posts get linked at /blog/abu-dhabi/..., which only 301s.
 */

export const POST_SECTIONS = ['abu-dhabi'] as const;
export type PostSection = (typeof POST_SECTIONS)[number];

/** The section a slug belongs to, or null for a plain /blog post. */
export function postSection(slug: string): PostSection | null {
  for (const s of POST_SECTIONS) if (slug.startsWith(`${s}/`)) return s;
  return null;
}

export function postPath(slug: string, lang: 'en' | 'ar' = 'en'): string {
  const prefix = lang === 'ar' ? '/ar' : '';
  return postSection(slug) ? `${prefix}/${slug}` : `${prefix}/blog/${slug}`;
}

/** Display name and index path of a section, for breadcrumbs and hubs. */
export const SECTION_META: Record<PostSection, { en: string; ar: string }> = {
  'abu-dhabi': { en: 'Abu Dhabi', ar: 'أبوظبي' },
};
