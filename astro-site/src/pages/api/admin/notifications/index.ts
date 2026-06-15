import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://aegisai.ae');
};

const PAGE_SIZE = 20;

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getSupabaseAdmin();
  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data, count, page, pageSize: PAGE_SIZE }), { status: 200 });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: { ids?: string[]; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (body.all) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  } else if (body.ids && body.ids.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', body.ids);

    if (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  } else {
    return new Response(JSON.stringify({ error: 'ids array or all:true required' }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
