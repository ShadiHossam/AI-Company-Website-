import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

export const PATCH: APIRoute = async ({ request, locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
  }

  let body: { active?: boolean; to_path?: string; status_code?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const SAFE_PATH = /^\/[\w\-/.]*$/;
  const ALLOWED_STATUS_CODES = [301, 302, 307, 308];

  const updates: Record<string, unknown> = {};
  if (body.active !== undefined) updates.active = body.active;

  if (body.to_path !== undefined) {
    if (!SAFE_PATH.test(body.to_path)) {
      return new Response(JSON.stringify({ error: 'to_path must be a simple relative path starting with /' }), { status: 400 });
    }
    updates.to_path = body.to_path;
  }

  if (body.status_code !== undefined) {
    if (!ALLOWED_STATUS_CODES.includes(body.status_code)) {
      return new Response(JSON.stringify({ error: `status_code must be one of ${ALLOWED_STATUS_CODES.join(', ')}` }), { status: 400 });
    }
    updates.status_code = body.status_code;
  }

  if (Object.keys(updates).length === 0) {
    return new Response(JSON.stringify({ error: 'No updates provided' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('redirects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};

export const DELETE: APIRoute = async ({ request, locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('redirects').delete().eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
