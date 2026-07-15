import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://lenooai.com';
  return import.meta.env.DEV || origin === siteUrl;
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('client_logos')
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
    const { company_name, logo_url, website_url, industry, ar_industry, show_on_homepage = false, active = true, sort_order = 0 } = body;

    if (!company_name || !logo_url) {
      return new Response(JSON.stringify({ error: 'company_name and logo_url are required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('client_logos')
      .insert({ company_name, logo_url, website_url, industry, ar_industry, show_on_homepage, active, sort_order })
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
