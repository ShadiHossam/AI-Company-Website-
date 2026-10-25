import { getSupabaseAdmin } from './supabase';
import { todayInDubai } from './scheduledPosts';
import { isArabicOnlyPost } from './post-lang';
import { buildLiveBlogPaths } from './deadLinks';
import { getCollectionBlogPaths } from './collectionSlugs';

// Every published post's EN/AR path, used to prune links to unpublished posts in
// article bodies. Each blog post render used to fetch every published row; the
// set changes at most once a day (scheduled publishing), so it is cached for 60s.
// On a failed read the last good set is kept: an empty set would turn every
// in-body link into plain text.
let cache: { paths: Set<string>; exp: number } | null = null;
const TTL = 60_000;

export async function getLiveBlogPaths(): Promise<Set<string>> {
  const now = Date.now();
  if (cache && now < cache.exp) return cache.paths;

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('slug, title, ar_title')
    .eq('status', 'published')
    .lte('pub_date', todayInDubai())
    .is('deleted_at', null);

  if (error || !data) {
    if (error) console.error('[liveBlogPaths] read failed:', error.message);
    const stale = cache?.paths ?? new Set<string>();
    cache = { paths: stale, exp: now + 5_000 };
    return stale;
  }

  const paths = buildLiveBlogPaths(data, isArabicOnlyPost);
  // Collection-backed posts are live too, and are not in blog_posts.
  for (const path of await getCollectionBlogPaths()) paths.add(path);
  cache = { paths, exp: now + TTL };
  return paths;
}

export function __resetLiveBlogPathsForTest() {
  cache = null;
}
