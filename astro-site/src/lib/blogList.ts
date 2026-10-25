import { getSupabaseAdmin } from './supabase';
import { todayInDubai } from './scheduledPosts';

export interface BlogListRow {
  id: string;
  title: string;
  ar_title: string | null;
  description: string;
  ar_description: string | null;
  slug: string;
  category: string;
  pub_date: string;
  author_name: string;
  og_image: string;
}

// /blog and /ar/blog both list every published post and then filter/paginate in
// memory. Every ?page=/?category=/?q= variant used to re-run that full query, so
// a crawler walking the variants hit the database once per URL. One shared list,
// cached for 2 minutes, serves both indexes.
// Returns null when the database can't be read and there is no earlier list.
let cache: { rows: BlogListRow[]; exp: number } | null = null;
const TTL = 120_000;

export async function getPublishedPostList(): Promise<BlogListRow[] | null> {
  const now = Date.now();
  if (cache && now < cache.exp) return cache.rows;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('id, title, ar_title, description, ar_description, slug, category, pub_date, author_name, og_image')
      .eq('status', 'published')
      .lte('pub_date', todayInDubai())
      .is('deleted_at', null)
      .order('pub_date', { ascending: false });
    if (error || !data) throw new Error(error?.message ?? 'no data');
    cache = { rows: data as BlogListRow[], exp: now + TTL };
    return cache.rows;
  } catch (err) {
    console.error('[blogList] read failed:', err);
    if (cache) {
      // Keep serving the last good list, and retry in 5s.
      cache.exp = now + 5_000;
      return cache.rows;
    }
    return null;
  }
}

export function __resetBlogListForTest() {
  cache = null;
}
