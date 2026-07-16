import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF_CHECK = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://lenooai.com';
  return import.meta.env.DEV || origin === siteUrl;
};

// PATCH /api/admin/applications/[id] — update status
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  let body: { status?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const validStatuses = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('job_applications').update({ status: body.status }).eq('id', params.id!);
  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

// DELETE /api/admin/applications/[id]
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('job_applications').delete().eq('id', params.id!);
  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
