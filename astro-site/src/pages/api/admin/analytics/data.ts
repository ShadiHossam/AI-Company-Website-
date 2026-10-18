import type { APIRoute } from 'astro';
import { cleanup, loadRange, parseRange, slimLead, slimVisit } from '../../../../lib/analytics-store';

export const prerender = false;

// Visits and leads for one date range (Dubai dates), for the Analytics page.
// Access: middleware lets super_admin and roles with the 'analytics' section through.
export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  cleanup();
  const r = parseRange(url.searchParams.get('from'), url.searchParams.get('to'));
  const range = await loadRange(r.from, r.to);
  return new Response(JSON.stringify({
    from: r.from, to: r.to, today: r.today, bad: range.bad,
    visits: range.visits.map(slimVisit),
    leads: range.leads.map(slimLead),
  }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
