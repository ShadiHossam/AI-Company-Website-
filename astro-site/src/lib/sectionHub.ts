import { getSupabaseAdmin } from './supabase';
import { isArabicOnlyPost } from './post-lang';
import { categoryLabel } from './blogCategories';
import { postPath, type PostSection } from './postPaths';
import { todayInDubai } from './scheduledPosts';

interface SectionPostRow {
  slug: string;
  title: string;
  description: string | null;
  ar_title: string | null;
  ar_description: string | null;
  category: string;
  pub_date: string | null;
  og_image: string | null;
  og_image_alt: string | null;
}

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
 * section has nothing live yet (the hub page answers 404), and null when the
 * database is unreachable (the hub answers 503, so crawlers retry instead of
 * dropping a live hub as a 404).
 */
export async function loadSectionCards(section: PostSection, lang: 'en' | 'ar'): Promise<SectionCard[] | null> {
  const ar = lang === 'ar';
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug, title, description, ar_title, ar_description, category, pub_date, og_image, og_image_alt')
      .like('slug', `${section}/%`)
      .eq('status', 'published')
      .lte('pub_date', todayInDubai())
      .is('deleted_at', null)
      .order('pub_date', { ascending: false });
    if (error) {
      console.error('[sectionHub] read failed:', error.message);
      return null;
    }

    return ((data ?? []) as SectionPostRow[])
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
  } catch (err) {
    console.error('[sectionHub] read failed:', err);
    return null;
  }
}
