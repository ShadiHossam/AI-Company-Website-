import { getSupabaseAdmin } from './supabase';

export type SiteConfig = Record<string, string>;

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('site_config').select('key,value');
  if (error || !data) return {};
  return Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
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
  await supabase.from('site_config').upsert(updates, { onConflict: 'key' });
}
