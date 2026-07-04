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
      .from('testimonials')
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
    const { client_name, quote, client_title, client_company, client_image_url, industry, ar_quote, ar_client_title, published = false, featured = false, sort_order = 0 } = body;

    if (!client_name || !quote) {
      return new Response(JSON.stringify({ error: 'client_name and quote are required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert({ client_name, quote, client_title, client_company, client_image_url, industry, ar_quote, ar_client_title, published, featured, sort_order })
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
