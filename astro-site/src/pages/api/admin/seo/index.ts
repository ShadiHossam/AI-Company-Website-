import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://aegisai.ae');
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('page_seo')
    .select('*')
    .order('page_slug');

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: {
    page_slug: string;
    meta_title?: string;
    meta_description?: string;
    og_image_url?: string;
    noindex?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.page_slug) {
    return new Response(JSON.stringify({ error: 'page_slug required' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('page_seo').upsert({
    page_slug: body.page_slug,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    og_image_url: body.og_image_url ?? null,
    noindex: body.noindex ?? false,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
