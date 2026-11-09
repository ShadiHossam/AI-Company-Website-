import type { APIRoute } from 'astro';
import { timingSafeEqual, createHash } from 'node:crypto';
import { loadRange, parseRange, addDays } from '../../../lib/analytics-store';
import { buildSummary, type SavedLead } from '../../../lib/hub-summary';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { getClientIp, createRateLimiter } from '../../../lib/request-safety';

export const prerender = false;

// Read-only feed for the "All sites" hub in the New Golden Office admin.
//   GET /api/hub/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
//   Authorization: Bearer <HUB_API_KEY>   (or X-Hub-Key: <HUB_API_KEY>)
// HUB_API_KEY is set in the Node app's environment on the server (at least
// 32 characters); without it the endpoint stays off (404). The same key is
// saved in the hub: All sites → Manage sites → Lenoo AI → Admin connection.
// Format: see lib/hub-summary.ts.

const allow = createRateLimiter(60, 10 * 60 * 1000);
const MAX_DAYS = 190;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
});

// Hashing both sides first makes the compare constant-time whatever the lengths.
function keyOk(sent: string, expected: string): boolean {
  const a = createHash('sha256').update(sent).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b) && sent.length > 0;
}

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  const expected = process.env.HUB_API_KEY || import.meta.env.HUB_API_KEY || '';
  if (expected.length < 32) return json({ error: 'Not found' }, 404);

  let address: string | undefined;
  try { address = clientAddress; } catch { /* adapter without it */ }
  if (!allow(getClientIp(request, address))) return json({ error: 'Too many requests' }, 429);

  const auth = request.headers.get('authorization') || '';
  const sent = auth.startsWith('Bearer ') ? auth.slice(7).trim() : (request.headers.get('x-hub-key') || '').trim();
  if (!keyOk(sent, expected)) return json({ error: 'Unauthorized' }, 401);

  const fromQ = url.searchParams.get('from');
  const toQ = url.searchParams.get('to');
  const { from, to } = parseRange(fromQ, toQ);
  if (Date.parse(to) - Date.parse(from) > MAX_DAYS * 86400000) return json({ error: 'Range too long' }, 400);

  const range = await loadRange(from, to);

  // Saved form leads. One extra day each side: the hub filters by its own time zone.
  let saved: SavedLead[] = [];
  const errors: string[] = [];
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('leads')
      .select('id, created_at, full_name, company_name, work_email, whatsapp, source, page_source, utm_source, utm_medium, utm_campaign, status')
      .gte('created_at', addDays(from, -1) + 'T00:00:00Z')
      .lte('created_at', addDays(to, 1) + 'T23:59:59Z')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error) errors.push('saved leads: ' + error.message);
    else saved = (data ?? []) as SavedLead[];
  } catch (e) {
    errors.push('saved leads: ' + (e instanceof Error ? e.message : 'unavailable'));
  }

  return json({ ...buildSummary(range, saved, from, to), errors });
};

export const ALL: APIRoute = () => json({ error: 'Method not allowed' }, 405);
