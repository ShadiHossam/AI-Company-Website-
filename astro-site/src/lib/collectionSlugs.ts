/**
 * Blog paths served from the content collection rather than from Supabase.
 *
 * Posts reach /blog/<slug> by two routes: a `blog_posts` row, or a markdown
 * file under src/content/blog that the route falls back to. Anything deciding
 * whether a blog link is live has to consult both, or it will treat a perfectly
 * good collection post as unpublished — which is exactly what happened to
 * /blog/getting-started-with-ai-dubai, the most-linked article on the site.
 *
 * Kept separate from deadLinks.ts so that module stays free of `astro:content`
 * and can be unit-tested outside an Astro build.
 */
export async function getCollectionBlogPaths(): Promise<string[]> {
  try {
    const { getCollection } = await import('astro:content');
    const posts = await getCollection('blog');
    return posts.map((p) => `/blog/${p.id}`);
  } catch {
    // The collection is optional; an empty list just means nothing extra is live.
    return [];
  }
}
