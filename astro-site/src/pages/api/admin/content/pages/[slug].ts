import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { PAGE_CONFIGS } from '../../../../../lib/page-content';

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { slug } = params;
  const pageConfig = PAGE_CONFIGS.find(p => p.slug === slug);
  if (!pageConfig) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('page_content')
    .select('section_key, value, updated_at')
    .eq('page_slug', slug);

  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

  return new Response(JSON.stringify(data ?? []), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { slug } = params;
  const pageConfig = PAGE_CONFIGS.find(p => p.slug === slug);
  if (!pageConfig) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  let body: { fields: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const allKeys = pageConfig.sections.flatMap(s => s.fields.map(f => f.key));
  const validFields = Object.fromEntries(
    Object.entries(body.fields).filter(([k]) => allKeys.includes(k))
  );

  const upserts = Object.entries(validFields).map(([section_key, value]) => ({
    page_slug: slug,
    section_key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('page_content')
    .upsert(upserts, { onConflict: 'page_slug,section_key' });

  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
