import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF_CHECK = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

// GET /api/admin/jobs/[id]
export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('jobs').select('*').eq('id', params.id!).single();
  if (error || !data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify({ job: data }), { headers: { 'Content-Type': 'application/json' } });
};

// PUT /api/admin/jobs/[id]
export const PUT: APIRoute = async ({ locals, request, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const allowed = ['title', 'department', 'location', 'job_type', 'description', 'requirements', 'nice_to_have', 'benefits', 'salary_range', 'published', 'sort_order'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('jobs').update(update).eq('id', params.id!).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ job: data }), { headers: { 'Content-Type': 'application/json' } });
};

// DELETE /api/admin/jobs/[id]
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('jobs').delete().eq('id', params.id!);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
