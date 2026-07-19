import type { APIRoute } from 'astro';

const BASE = 'https://lenooai.com';

interface PageEntry {
  url: string;
  lastmod: string;
  priority: string;
  changefreq: string;
  arUrl?: string;
}

const NOW = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

const PAGES: PageEntry[] = [
  { url: '/',                                  lastmod: NOW, priority: '1.0', changefreq: 'weekly',  arUrl: '/ar' },
  { url: '/services',                          lastmod: NOW, priority: '0.8', changefreq: 'monthly', arUrl: '/ar/services' },
  { url: '/services/custom-ai-development',   lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/custom-ai-development' },
  { url: '/services/ai-agents',               lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-agents' },
  { url: '/services/ai-automation',           lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-automation' },
  { url: '/services/ai-training',             lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-training' },
  { url: '/services/ai-strategy',             lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-strategy' },
  { url: '/services/ai-integration',         lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-integration' },
  { url: '/services/internal-ai-tools',       lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/internal-ai-tools' },
  { url: '/services/custom-gpt-development', lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/custom-gpt-development' },
  { url: '/services/vibe-coding',             lastmod: NOW, priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/vibe-coding' },
  { url: '/services/ai-model-finetuning',    lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/claude-agent-builds',    lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/services/prompt-engineering',     lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/real-estate',           lastmod: NOW, priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/real-estate' },
  { url: '/industries/retail',                lastmod: NOW, priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/retail' },
  { url: '/industries/hospitality',           lastmod: NOW, priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/hospitality' },
  { url: '/industries/logistics',             lastmod: NOW, priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/logistics' },
  { url: '/about',                             lastmod: NOW, priority: '0.6', changefreq: 'monthly', arUrl: '/ar/about' },
  { url: '/blog',                              lastmod: NOW, priority: '0.6', changefreq: 'weekly',  arUrl: '/ar/blog' },
  { url: '/contact',                           lastmod: NOW, priority: '0.6', changefreq: 'monthly', arUrl: '/ar/contact' },
  { url: '/careers',                           lastmod: NOW, priority: '0.5', changefreq: 'weekly',  arUrl: '/ar/careers' },
];

const AR_ONLY: PageEntry[] = [
  { url: '/ar',                                  lastmod: NOW, priority: '0.9', changefreq: 'weekly'  },
  { url: '/ar/services',                         lastmod: NOW, priority: '0.8', changefreq: 'monthly' },
  { url: '/ar/services/custom-ai-development',  lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-agents',              lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-automation',          lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-training',            lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-strategy',            lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-integration',        lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/internal-ai-tools',      lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/custom-gpt-development', lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/vibe-coding',            lastmod: NOW, priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/industries/real-estate',          lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/industries/retail',               lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/industries/hospitality',          lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/industries/logistics',            lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/about',                            lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/contact',                          lastmod: NOW, priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/blog',                             lastmod: NOW, priority: '0.6', changefreq: 'weekly'  },
  { url: '/ar/careers',                          lastmod: NOW, priority: '0.5', changefreq: 'weekly'  },
];

function urlEntry(page: PageEntry): string {
  const hreflang = page.arUrl
    ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}${page.url}"/>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}${page.arUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${page.url}"/>`
    : '';
  return `  <url>
    <loc>${BASE}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${hreflang}
  </url>`;
}

function arUrlEntry(page: PageEntry): string {
  const enUrl = page.url.replace(/^\/ar/, '') || '/';
  return `  <url>
    <loc>${BASE}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}${page.url}"/>
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${enUrl}"/>
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
${AR_ONLY.map(arUrlEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
