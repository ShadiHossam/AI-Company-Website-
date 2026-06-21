export const prerender = false;
import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../lib/supabase';

const PUBLIC_KEYS = [
  'integration.ga_measurement_id',
  'integration.gtm_container_id',
  'integration.clarity_project_id',
  'integration.hotjar_site_id',
  'integration.meta_pixel_id',
  'integration.linkedin_insight_id',
  'integration.google_ads_id',
  'integration.tiktok_pixel_id',
  'integration.intercom_app_id',
  'integration.crisp_website_id',
  'integration.tawkto_property_id',
  'integration.hubspot_portal_id',
];

let configCache: { data: Record<string, string>; exp: number } | null = null;
const CONFIG_TTL = 300_000; // 5 minutes — same as Cache-Control max-age

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (configCache && now < configCache.exp) {
    return new Response(JSON.stringify(configCache.data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
  }
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('site_config').select('key, value').in('key', PUBLIC_KEYS);
  const config: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string }) => { if (r.value) config[r.key] = r.value; });
  configCache = { data: config, exp: now + CONFIG_TTL };
  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
};
