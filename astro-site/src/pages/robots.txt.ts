import type { APIRoute } from 'astro';

export const prerender = false;

// IS_STAGING (not DEPLOY_TARGET) gates indexability: DEPLOY_TARGET only selects the
// Node vs Vercel adapter, and both the staging mirror and lenooai.com production now
// run on the Node adapter — so indexability needs its own flag.
const isStaging = import.meta.env.IS_STAGING === 'true';

const PRODUCTION_ROBOTS = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /maintenance

Sitemap: https://lenooai.com/sitemap_index.xml
`;

// Note: /_astro/ is deliberately NOT disallowed. It holds the site's compiled
// CSS and JS, and blocking it stops Googlebot from rendering pages the way a
// visitor sees them, which costs mobile-usability and layout signals across
// every URL. Blocking a static asset directory saves no crawl budget worth
// having.

// Staging deployments must not be crawled or indexed at all.
const STAGING_ROBOTS = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = () => {
  return new Response(isStaging ? STAGING_ROBOTS : PRODUCTION_ROBOTS, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
