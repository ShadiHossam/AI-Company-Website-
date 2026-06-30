import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const slug = params.slug;
  if (slug !== 'privacy' && slug !== 'terms') {
    return new Response(JSON.stringify({ error: 'Invalid slug' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const slug = params.slug;
  if (slug !== 'privacy' && slug !== 'terms') {
    return new Response(JSON.stringify({ error: 'Invalid slug' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { sections, last_updated } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (sections !== undefined) updates.sections = sections;
    if (last_updated !== undefined) updates.last_updated = last_updated;

    const { data, error } = await supabase
      .from('legal_pages')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
