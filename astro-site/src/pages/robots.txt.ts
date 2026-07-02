import type { APIRoute } from 'astro';

export const prerender = false;

const isMirrorDeployment = import.meta.env.DEPLOY_TARGET === 'o2switch';

const PRODUCTION_ROBOTS = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /maintenance
Disallow: /_astro/

Sitemap: https://aegisai.ae/sitemap_index.xml
`;

// Mirror/staging deployments must not be crawled or indexed at all.
const MIRROR_ROBOTS = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = () => {
  return new Response(isMirrorDeployment ? MIRROR_ROBOTS : PRODUCTION_ROBOTS, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
