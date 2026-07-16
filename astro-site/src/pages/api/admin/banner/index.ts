import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('announcement_banner')
    .select('*')
    .order('id');

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
    id?: string;
    message: string;
    cta_text?: string;
    cta_url?: string;
    bg_color?: string;
    text_color?: string;
    active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    ar_message?: string;
    ar_cta_text?: string;
    ar_cta_url?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.message) {
    return new Response(JSON.stringify({ error: 'message required' }), { status: 400 });
  }

  // Reject javascript: and data: scheme URLs to prevent stored XSS
  for (const url of [body.cta_url, body.ar_cta_url]) {
    if (url) {
      const scheme = url.trim().toLowerCase();
      if (scheme.startsWith('javascript:') || scheme.startsWith('data:')) {
        return new Response(JSON.stringify({ error: 'Invalid cta_url scheme' }), { status: 400 });
      }
    }
  }

  const supabase = getSupabaseAdmin();

  const record: Record<string, unknown> = {
    message: body.message,
    cta_text: body.cta_text ?? null,
    cta_url: body.cta_url ?? null,
    bg_color: body.bg_color ?? '#00e3fd',
    text_color: body.text_color ?? '#0a0f1a',
    active: body.active ?? false,
    starts_at: body.starts_at ?? null,
    ends_at: body.ends_at ?? null,
    ar_message: body.ar_message || null,
    ar_cta_text: body.ar_cta_text || null,
    ar_cta_url: body.ar_cta_url || null,
  };

  if (body.id) {
    record.id = body.id;
  }

  const { data, error } = await supabase
    .from('announcement_banner')
    .upsert(record)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};
