import type { APIRoute } from 'astro';

// Legacy URL. The sitemap index used to live here and may still be submitted
// in Search Console, so send it to the canonical /sitemap.xml instead of 404ing.
export const GET: APIRoute = () => {
  return new Response(null, {
    status: 301,
    headers: { Location: '/sitemap.xml' },
  });
};
