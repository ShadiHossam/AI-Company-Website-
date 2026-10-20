import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../lib/supabase';
import { getCollection } from 'astro:content';
import { isArabicOnlyPost } from '../lib/post-lang';
import { postPath, postSection, type PostSection } from '../lib/postPaths';

const BASE = 'https://lenooai.com';

export const GET: APIRoute = async () => {
  const seenSlugs = new Set<string>();
  const urlBlocks: string[] = [];
  // Section hubs (/abu-dhabi, /ar/abu-dhabi) 404 until a post in them is live,
  // so they are listed here, from the same rows, instead of the page sitemap.
  const enSections = new Set<PostSection>();
  const arSections = new Set<PostSection>();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, pub_date, updated_at, ar_title')
      .eq('status', 'published')
      .eq('noindex', false)
      .is('deleted_at', null)
      .order('pub_date', { ascending: false });

    if (!error && data) {
      for (const post of data) {
        seenSlugs.add(post.slug);
        const section = postSection(post.slug);
        if (section) {
          if (isArabicOnlyPost(post)) arSections.add(section);
          else enSections.add(section);
          if (post.ar_title) arSections.add(section);
        }
        const en = `${BASE}${postPath(post.slug, 'en')}`;
        const ar = `${BASE}${postPath(post.slug, 'ar')}`;
        const lastmod = (post.updated_at ?? post.pub_date ?? new Date().toISOString())
          .replace(/(\.\d+)?Z$/, '+00:00');

        // An Arabic-only post has no English version, so /ar/blog/<slug> is its
        // single canonical URL. Emitting /blog/<slug> as well listed the same
        // Arabic article twice and labelled one copy as the English and
        // x-default version. /blog/<slug> now 301s here, so it stays out of the
        // sitemap entirely.
        if (isArabicOnlyPost(post)) {
          urlBlocks.push(`  <url>
    <loc>${ar}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${ar}"/>
  </url>`);
          continue;
        }

        const hreflang = post.ar_title
          ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${ar}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`
          : '';
        urlBlocks.push(`  <url>
    <loc>${en}</loc>
    <lastmod>${lastmod}</lastmod>${hreflang}
  </url>${post.ar_title ? `
  <url>
    <loc>${ar}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${ar}"/>
    <xhtml:link rel="alternate" hreflang="en-ae" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>
  </url>` : ''}`);
      }
    }
  } catch {
    // DB unreachable — fall through to content-collection posts below
  }

  const sections = new Set([...enSections, ...arSections]);
  for (const section of sections) {
    const en = `${BASE}/${section}`;
    const ar = `${BASE}/ar/${section}`;
    const both = enSections.has(section) && arSections.has(section);
    const alternates = both
      ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${ar}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`
      : '';
    if (enSections.has(section)) urlBlocks.push(`  <url>
    <loc>${en}</loc>${alternates}
  </url>`);
    if (arSections.has(section)) urlBlocks.push(`  <url>
    <loc>${ar}</loc>${alternates}
  </url>`);
  }

  // Content-collection posts (local markdown) are the site's fallback content
  // source whenever Supabase has no rows for a slug — see blog.astro / blog/[slug].astro.
  try {
    const collectionPosts = await getCollection('blog');
    for (const post of collectionPosts) {
      if (seenSlugs.has(post.id)) continue;
      const lastmod = (post.data.updatedDate ?? post.data.pubDate ?? new Date())
        .toISOString()
        .replace(/\.\d{3}Z$/, '+00:00');
      urlBlocks.push(`  <url>
    <loc>${BASE}${postPath(post.id)}</loc>
    <lastmod>${lastmod}</lastmod>
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
