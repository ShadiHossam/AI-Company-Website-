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

export const GET: APIRoute = async () => {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('site_config').select('key, value').in('key', PUBLIC_KEYS);
  const config: Record<string, string> = {};
  (data ?? []).forEach(r => { if (r.value) config[r.key] = r.value; });
  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
};
