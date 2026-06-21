import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';

export const prerender = false;

let bannerCache: { data: unknown; exp: number } | null = null;
const BANNER_TTL = 60_000;

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (bannerCache && now < bannerCache.exp) {
    return new Response(JSON.stringify(bannerCache.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }

  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('announcement_banner')
    .select('*')
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[banner] db error:', error.message);
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }

  bannerCache = { data: data ?? null, exp: now + BANNER_TTL };
  return new Response(JSON.stringify(data ?? null), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });
};
