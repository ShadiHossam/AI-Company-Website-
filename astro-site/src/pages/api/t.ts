import type { APIRoute } from 'astro';
import { appendLine, hashIp } from '../../lib/analytics-store';

export const prerender = false;

// First-party analytics collector for /js/ln-track.js (ported from New Golden
// Office's /t/c.php). Appends one JSON line per beacon to
// <ANALYTICS_DIR>/YYYY-MM-DD.ndjson via lib/analytics-store. No database
// round trip, so it adds nothing noticeable per visit. Bad or foreign requests
// get a silent 204.

const MAX = 32768;
const BOT_UA = /bot|crawl|spider|slurp|lighthouse|headless|pagespeed|preview|curl|wget|python|httpclient/i;
const OWN_HOST = /(^|\.)(lenooai\.com|usine\.site)$/;

const done = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });

function hostOf(url: string): string {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (Number(request.headers.get('content-length') || 0) > MAX) return done();

  // Only accept beacons sent from our own pages.
  let origin = request.headers.get('origin') || '';
  if (!origin || origin === 'null') origin = request.headers.get('referer') || '';
  const host = hostOf(origin);
  const local = host === 'localhost' || host === '127.0.0.1';
  const allowed = OWN_HOST.test(host) || (local && (import.meta.env.DEV || !!process.env.ANALYTICS_DEV));
  if (!allowed) return done();

  const ua = (request.headers.get('user-agent') || '').slice(0, 200);
  if (!ua || BOT_UA.test(ua)) return done();

  let raw: string;
  try { raw = await request.text(); } catch { return done(); }
  if (!raw || raw.length > MAX) return done();
  let d: Record<string, unknown>;
  try { d = JSON.parse(raw); } catch { return done(); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return done();

  const k = d.k;
  if (k !== 'visit' && k !== 'lead' && k !== 'optout') return done();
  if (typeof d.uid !== 'string' || !/^u_[a-z0-9]{8,24}$/.test(d.uid)) return done();
  if (k !== 'optout' && (typeof d.vid !== 'string' || !/^s_[a-z0-9]{8,24}$/.test(d.vid))) return done();

  // Server-side fields. The raw IP is never stored, only a salted hash.
  let ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  if (!ip) { try { ip = clientAddress; } catch { /* adapter without it */ } }
  d.ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  try { d.ip = hashIp(ip); } catch { d.ip = ''; }
  d.ua = ua;
  d.cc = (request.headers.get('cf-ipcountry') || '').slice(0, 4);
  const city = request.headers.get('cf-ipcity');
  const reg = request.headers.get('cf-region');
  if (city) d.city = city.slice(0, 60);
  if (reg) d.reg = reg.slice(0, 60);

  const line = JSON.stringify(d);
  if (line.length > MAX + 2048) return done();
  try { await appendLine(line); } catch { /* disk full / read-only: drop it */ }
  return done();
};

export const ALL: APIRoute = () => new Response(null, { status: 405 });
