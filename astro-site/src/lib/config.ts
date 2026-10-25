import { getSupabaseAdmin } from './supabase';

export type SiteConfig = Record<string, string>;

// The booking modal reads this on every page render (BaseLayout/ArBaseLayout),
// so it is cached in memory for 60s like page-content.ts. A failed read is
// retried after 5s instead of being cached for the full minute.
let siteConfigCache: { data: SiteConfig; exp: number } | null = null;
const SITE_CONFIG_TTL = 60_000;

export async function getSiteConfig(): Promise<SiteConfig> {
  const now = Date.now();
  if (siteConfigCache && now < siteConfigCache.exp) return siteConfigCache.data;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('site_config').select('key,value');
  if (error || !data) {
    if (error) console.error('[config] site_config read failed:', error.message);
    const stale = siteConfigCache?.data ?? {};
    siteConfigCache = { data: stale, exp: now + 5_000 };
    return stale;
  }
  const result = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
  siteConfigCache = { data: result, exp: now + SITE_CONFIG_TTL };
  return result;
}

export function __resetSiteConfigCacheForTest() {
  siteConfigCache = null;
}

export async function getSiteConfigSection(section: string): Promise<SiteConfig> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site_config')
    .select('key,value')
    .eq('section', section);
  if (error || !data) return {};
  return Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
}

export async function updateSiteConfig(updates: Array<{ key: string; value: string }>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site_config').upsert(updates, { onConflict: 'key' });
  if (error) throw new Error(`site_config upsert failed: ${error.message}`);
  siteConfigCache = null;
}
