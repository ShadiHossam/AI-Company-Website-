import { getSupabaseAdmin } from './supabase';
import { todayInDubai } from './scheduledPosts';
import { isArabicOnlyPost } from './post-lang';
import { buildLiveBlogPaths } from './deadLinks';
import { buildTwinMap } from './postTwins';
import { getCollectionBlogPaths } from './collectionSlugs';

export interface LiveBlogIndex {
  /** Every published post's directly servable EN/AR path. */
  paths: Set<string>;
  /** Own path → other-language twin path, for posts linked by `twin_slug`. */
  twins: Map<string, string>;
}

// Every published post's EN/AR path, used to prune links to unpublished posts in
// article bodies, plus the language-twin map built from the same rows. Each blog
// post render used to fetch every published row; the set changes at most once a
// day (scheduled publishing), so it is cached for 60s. On a failed read the last
// good index is kept: an empty set would turn every in-body link into plain text.
let cache: { index: LiveBlogIndex; exp: number } | null = null;
const TTL = 60_000;

export async function getLiveBlogIndex(): Promise<LiveBlogIndex> {
  const now = Date.now();
  if (cache && now < cache.exp) return cache.index;

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('slug, lang, title, ar_title, twin_slug, noindex')
    .eq('status', 'published')
    .lte('pub_date', todayInDubai())
    .is('deleted_at', null);

  if (error || !data) {
    if (error) console.error('[liveBlogPaths] read failed:', error.message);
    const stale = cache?.index ?? { paths: new Set<string>(), twins: new Map<string, string>() };
    cache = { index: stale, exp: now + 5_000 };
    return stale;
  }

  const paths = buildLiveBlogPaths(data, isArabicOnlyPost);
  // Collection-backed posts are live too, and are not in blog_posts.
  for (const path of await getCollectionBlogPaths()) paths.add(path);
  const index = { paths, twins: buildTwinMap(data, isArabicOnlyPost) };
  cache = { index, exp: now + TTL };
  return index;
}

export async function getLiveBlogPaths(): Promise<Set<string>> {
  return (await getLiveBlogIndex()).paths;
}

export function __resetLiveBlogPathsForTest() {
  cache = null;
}
