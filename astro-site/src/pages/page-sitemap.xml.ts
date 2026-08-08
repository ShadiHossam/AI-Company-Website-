import type { APIRoute } from 'astro';

const BASE = 'https://lenooai.com';

interface PageEntry {
  url: string;
  lastmod: string;
  priority: string;
  changefreq: string;
  arUrl?: string;
}

// Each lastmod below is the real last-edit date of that page's source file
// (from `git log -1 --format=%cI -- <file>`), converted to UTC. Update the
// value for a page when you actually change its content — do not replace
// these with a shared build-time "now", which would make every URL claim
// it was modified on every deploy regardless of whether it changed.
const PAGES: PageEntry[] = [
  { url: '/',                                  lastmod: '2026-07-20T20:07:25+00:00', priority: '1.0', changefreq: 'weekly',  arUrl: '/ar' },
  { url: '/services',                          lastmod: '2026-07-19T06:21:05+00:00', priority: '0.8', changefreq: 'monthly', arUrl: '/ar/services' },
  { url: '/services/custom-ai-development',   lastmod: '2026-07-19T12:51:47+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/custom-ai-development' },
  { url: '/services/ai-agents',               lastmod: '2026-08-02T13:53:23+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-agents' },
  { url: '/services/ai-agents/dubai',                          lastmod: '2026-08-02T13:39:32+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/abu-dhabi',                      lastmod: '2026-08-02T13:39:32+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/agencies',                       lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/development',                    lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/for-real-estate',                lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/voice-agents',                   lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/customer-support',               lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/sales',                          lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/use-cases',                      lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/templates',                      lastmod: '2026-08-02T13:52:02+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/vs-agentic-ai',                  lastmod: '2026-08-02T14:15:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/architecture',                   lastmod: '2026-08-02T13:52:02+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools',                          lastmod: '2026-08-02T13:36:29+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/gumloop',                  lastmod: '2026-08-02T13:36:30+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/lindy',                    lastmod: '2026-08-02T13:36:30+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/pipedream',                lastmod: '2026-08-02T13:36:30+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/salesforce-agentforce',    lastmod: '2026-08-02T13:36:30+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-agents/tools/n8n-ai-agent',             lastmod: '2026-08-02T13:36:30+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-automation/tools/n8n',                  lastmod: '2026-08-02T21:13:59+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/vibe-coding/tools',                        lastmod: '2026-08-02T21:35:53+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/ai-automation',           lastmod: '2026-07-19T12:51:47+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-automation' },
  { url: '/services/ai-training',             lastmod: '2026-07-19T06:21:05+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-training' },
  { url: '/services/ai-strategy',             lastmod: '2026-07-19T06:21:05+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-strategy' },
  { url: '/services/ai-integration',         lastmod: '2026-07-19T12:51:47+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/ai-integration' },
  { url: '/services/internal-ai-tools',       lastmod: '2026-07-19T12:51:47+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/internal-ai-tools' },
  { url: '/services/custom-gpt-development', lastmod: '2026-07-19T12:51:47+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/custom-gpt-development' },
  { url: '/services/vibe-coding',             lastmod: '2026-07-19T12:51:47+00:00', priority: '0.7', changefreq: 'monthly', arUrl: '/ar/services/vibe-coding' },
  { url: '/services/ai-model-finetuning',    lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/claude-agent-builds',    lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/services/prompt-engineering',     lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/real-estate',           lastmod: '2026-07-19T06:21:05+00:00', priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/real-estate' },
  { url: '/industries/retail',                lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/retail' },
  { url: '/industries/hospitality',           lastmod: '2026-07-19T06:21:05+00:00', priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/hospitality' },
  { url: '/industries/logistics',             lastmod: '2026-07-19T06:21:05+00:00', priority: '0.6', changefreq: 'monthly', arUrl: '/ar/industries/logistics' },
  { url: '/industries/consulting',            lastmod: '2026-08-02T20:59:59+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/education',             lastmod: '2026-08-03T04:11:17+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/finance-banking',       lastmod: '2026-08-03T04:27:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/healthcare',            lastmod: '2026-08-03T16:52:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/hr-recruitment',        lastmod: '2026-08-03T17:48:00+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/insurance',             lastmod: '2026-08-03T18:08:05+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/legal',                 lastmod: '2026-08-03T18:55:47+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/manufacturing',         lastmod: '2026-08-04T04:08:56+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/marketing',             lastmod: '2026-08-04T04:22:01+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/marketing/analytics-attribution', lastmod: '2026-08-04T18:38:37+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/marketing/content-writing',        lastmod: '2026-08-04T19:35:55+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/industries/marketing/email-marketing',         lastmod: '2026-08-08T09:34:38+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/about',                             lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly', arUrl: '/ar/about' },
  { url: '/blog',                              lastmod: '2026-07-19T06:21:05+00:00', priority: '0.6', changefreq: 'weekly',  arUrl: '/ar/blog' },
  { url: '/contact',                           lastmod: '2026-07-21T19:48:27+00:00', priority: '0.6', changefreq: 'monthly', arUrl: '/ar/contact' },
  { url: '/careers',                           lastmod: '2026-07-19T12:51:47+00:00', priority: '0.5', changefreq: 'weekly',  arUrl: '/ar/careers' },
];

const AR_ONLY: PageEntry[] = [
  { url: '/ar',                                  lastmod: '2026-07-19T12:51:47+00:00', priority: '0.9', changefreq: 'weekly'  },
  { url: '/ar/services',                         lastmod: '2026-07-19T11:36:43+00:00', priority: '0.8', changefreq: 'monthly' },
  { url: '/ar/services/custom-ai-development',  lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-agents',              lastmod: '2026-07-19T11:36:43+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-automation',          lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-automation/accounting', lastmod: '2026-08-05T18:26:06+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/services/ai-automation/dubai',      lastmod: '2026-08-05T18:26:06+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/services/ai-training',            lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-strategy',            lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/ai-integration',        lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/internal-ai-tools',      lastmod: '2026-07-19T11:36:43+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/custom-gpt-development', lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/services/vibe-coding',            lastmod: '2026-07-18T14:23:08+00:00', priority: '0.7', changefreq: 'monthly' },
  { url: '/ar/industries/real-estate',          lastmod: '2026-07-19T11:36:43+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/industries/retail',               lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/industries/hospitality',          lastmod: '2026-07-19T11:36:43+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/industries/logistics',            lastmod: '2026-07-19T11:36:43+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/about',                            lastmod: '2026-07-19T12:51:47+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/contact',                          lastmod: '2026-08-05T18:26:06+00:00', priority: '0.6', changefreq: 'monthly' },
  { url: '/ar/blog',                             lastmod: '2026-07-19T11:36:43+00:00', priority: '0.6', changefreq: 'weekly'  },
  { url: '/ar/careers',                          lastmod: '2026-08-05T18:26:06+00:00', priority: '0.5', changefreq: 'weekly'  },
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
