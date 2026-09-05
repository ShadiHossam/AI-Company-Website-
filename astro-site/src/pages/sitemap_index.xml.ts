import type { APIRoute } from 'astro';

const BASE = 'https://lenooai.com';

/**
 * Latest <lastmod> found in a child sitemap, or null if it has none.
 *
 * The index used to stamp both children with `new Date()` on every request,
 * which told Google that both sitemaps had changed every single time it
 * fetched the index. That is the fastest way to teach a crawler to ignore your
 * lastmod values entirely, and it wastes the crawl budget the signal exists to
 * direct. Reading the real dates back out of the children keeps the index
 * honest and costs one internal fetch each.
 */
async function latestLastmod(url: string, request: Request): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { cookie: request.headers.get('cookie') ?? '' } });
    if (!res.ok) return null;
    const dates = [...(await res.text()).matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
    if (dates.length === 0) return null;
    return dates.reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b));
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const children = [`${BASE}/page-sitemap.xml`, `${BASE}/post-sitemap.xml`];
  const lastmods = await Promise.all(children.map(url => latestLastmod(url, request)));

  // Fall back to the current time only when a child could not be read at all —
  // an unknown date is better reported as "now" than omitted, since a missing
  // lastmod gives Google nothing to prioritise on.
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

  const entries = children
    .map(
      (url, i) => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmods[i] ?? now}</lastmod>
  </sitemap>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
