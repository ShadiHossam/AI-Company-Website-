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
    .from('redirects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: { from_path: string; to_path: string; status_code?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const ALLOWED_STATUS_CODES = [301, 302, 307, 308];

  if (!body.from_path || !body.to_path) {
    return new Response(JSON.stringify({ error: 'from_path and to_path required' }), { status: 400 });
  }

  const SAFE_PATH = /^\/[\w\-/.]*$/;
  if (!SAFE_PATH.test(body.from_path)) {
    return new Response(JSON.stringify({ error: 'from_path must be a simple relative path starting with /' }), { status: 400 });
  }

  if (!SAFE_PATH.test(body.to_path)) {
    return new Response(JSON.stringify({ error: 'to_path must be a simple relative path starting with /' }), { status: 400 });
  }

  if (body.status_code !== undefined && !ALLOWED_STATUS_CODES.includes(body.status_code)) {
    return new Response(JSON.stringify({ error: `status_code must be one of ${ALLOWED_STATUS_CODES.join(', ')}` }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('redirects')
    .insert({
      from_path: body.from_path,
      to_path: body.to_path,
      status_code: body.status_code ?? 301,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 201 });
};
