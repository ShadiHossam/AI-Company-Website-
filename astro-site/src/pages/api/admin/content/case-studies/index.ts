import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return new Response(JSON.stringify(data ?? []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const {
      title, slug, industry, delivery_time, challenge, solution, featured = false, published = false, media_sections = [],
      ar_title = null, ar_industry = null, ar_delivery_time = null, ar_challenge = null, ar_solution = null,
      ar_timeline_items = null, ar_results = null,
    } = body;

    if (!title || !slug) {
      return new Response(JSON.stringify({ error: 'title and slug are required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('case_studies')
      .insert({
        title, slug, industry, delivery_time, challenge, solution, featured, published, media_sections,
        ar_title, ar_industry, ar_delivery_time, ar_challenge, ar_solution, ar_timeline_items, ar_results,
      })
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
