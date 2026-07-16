import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../lib/supabase';
import { getCollection } from 'astro:content';

const BASE = 'https://lenooai.com';

export const GET: APIRoute = async () => {
  const seenSlugs = new Set<string>();
  const urlBlocks: string[] = [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, pub_date, updated_date, ar_title')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('pub_date', { ascending: false });

    if (!error && data) {
      for (const post of data) {
        seenSlugs.add(post.slug);
        const lastmod = (post.updated_date ?? post.pub_date ?? new Date().toISOString())
          .replace('Z', '+00:00');
        const hreflang = post.ar_title
          ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE}/ar/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/blog/${post.slug}"/>`
          : '';
        urlBlocks.push(`  <url>
    <loc>${BASE}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>${hreflang}
  </url>${post.ar_title ? `
  <url>
    <loc>${BASE}/ar/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE}/ar/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}/blog/${post.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/blog/${post.slug}"/>
  </url>` : ''}`);
      }
    }
  } catch {
    // DB unreachable — fall through to content-collection posts below
  }

  // Content-collection posts (local markdown) are the site's fallback content
  // source whenever Supabase has no rows for a slug — see blog.astro / blog/[slug].astro.
  try {
    const collectionPosts = await getCollection('blog');
    for (const post of collectionPosts) {
      if (seenSlugs.has(post.id)) continue;
      const lastmod = (post.data.updatedDate ?? post.data.pubDate ?? new Date())
        .toISOString()
        .replace('Z', '+00:00');
      urlBlocks.push(`  <url>
    <loc>${BASE}/blog/${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  } catch {
    // No content collection available
  }

  const entries = urlBlocks.join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
