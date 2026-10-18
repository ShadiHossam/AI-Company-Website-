import type { APIRoute } from 'astro';
import { journey, loadRange, parseRange } from '../../../../lib/analytics-store';

export const prerender = false;

// One visit's full journey (every page with its clicks), for the Analytics page drawer.
export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  const vid = url.searchParams.get('vid') ?? '';
  if (!/^s_[a-z0-9]{8,24}$/.test(vid)) return new Response(JSON.stringify({ error: 'bad id' }), { status: 400 });
  const r = parseRange(url.searchParams.get('from'), url.searchParams.get('to'));
  const j = journey(await loadRange(r.from, r.to), vid);
  if (!j) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
  return new Response(JSON.stringify(j), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
