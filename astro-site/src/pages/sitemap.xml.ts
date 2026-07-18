import type { APIRoute } from 'astro';

// Crawlers and SEO tools conventionally probe /sitemap.xml even when robots.txt
// points elsewhere. Redirect it to the real sitemap index instead of 404ing.
export const GET: APIRoute = () => {
  return new Response(null, {
    status: 301,
    headers: { Location: '/sitemap_index.xml' },
  });
};
