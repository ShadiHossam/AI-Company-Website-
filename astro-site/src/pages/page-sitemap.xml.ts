import type { APIRoute } from 'astro';

const BASE = 'https://aegisai.ae';

interface PageEntry {
  url: string;
  lastmod: string;
  priority: string;
  changefreq: string;
}

const PAGES: PageEntry[] = [
  { url: '/',                                  lastmod: '2025-06-10T00:00:00+00:00', priority: '1.0', changefreq: 'weekly'  },
  { url: '/services',                          lastmod: '2025-06-10T00:00:00+00:00', priority: '0.8', changefreq: 'monthly' },
  { url: '/products',                          lastmod: '2025-06-10T00:00:00+00:00', priority: '0.8', changefreq: 'monthly' },
  { url: '/pricing',                           lastmod: '2025-06-10T00:00:00+00:00', priority: '0.8', changefreq: 'monthly' },
  { url: '/services/custom-ai-development',   lastmod: '2025-06-10T00:00:00+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/services/ai-training',             lastmod: '2025-06-10T00:00:00+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/services/ai-strategy',             lastmod: '2025-06-10T00:00:00+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/results',                           lastmod: '2025-06-10T00:00:00+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/industries/real-estate',           lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/retail',                lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/hospitality',           lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/logistics',             lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/about',                             lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog',                              lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'weekly'  },
  { url: '/contact',                           lastmod: '2025-06-10T00:00:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/faq',                               lastmod: '2025-06-10T00:00:00+00:00', priority: '0.5', changefreq: 'monthly' },
  { url: '/privacy',                           lastmod: '2025-06-10T00:00:00+00:00', priority: '0.3', changefreq: 'yearly'  },
  { url: '/terms',                             lastmod: '2025-06-10T00:00:00+00:00', priority: '0.3', changefreq: 'yearly'  },
];

function urlEntry(page: PageEntry): string {
  return `  <url>
    <loc>${BASE}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${PAGES.map(urlEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
