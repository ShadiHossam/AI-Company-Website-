import { getSupabaseAdmin } from './supabase';
import { isArabicOnlyPost } from './post-lang';
import { categoryLabel } from './blogCategories';
import { postPath, type PostSection } from './postPaths';

export interface SectionCard {
  href: string;
  title: string;
  excerpt: string;
  category: string;
  date: Date | null;
  image?: string;
  imageAlt: string;
}

/**
 * Published posts of a section in one language, newest first. Empty when the
 * section has nothing live yet or the database is unreachable; the hub page
 * answers 404 in that case rather than serving an empty index.
 */
export async function loadSectionCards(section: PostSection, lang: 'en' | 'ar'): Promise<SectionCard[]> {
  const ar = lang === 'ar';
  try {
    const { data } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug, title, description, ar_title, ar_description, category, pub_date, og_image, og_image_alt')
      .like('slug', `${section}/%`)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('pub_date', { ascending: false });

    return (data ?? [])
      .filter((r) => (ar ? !!r.ar_title : !isArabicOnlyPost(r)))
      .map((r) => ({
        href: postPath(r.slug, lang),
        title: (ar ? r.ar_title : r.title) ?? r.title,
        excerpt: (ar ? r.ar_description : r.description) ?? '',
        category: categoryLabel(r.category, lang),
        date: r.pub_date ? new Date(r.pub_date) : null,
        image: r.og_image && r.og_image !== '/assets/og-blog.jpg' ? r.og_image : undefined,
        imageAlt: r.og_image_alt ?? (ar ? r.ar_title : r.title) ?? '',
      }));
  } catch {
    return [];
  }
}
