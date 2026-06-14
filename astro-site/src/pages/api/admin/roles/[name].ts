import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://aegisai.ae');
};

const VALID_SECTIONS = [
  'dashboard', 'blog', 'content', 'media', 'leads', 'jobs',
  'applications', 'notifications', 'seo', 'activity', 'settings', 'users',
];

// PATCH /api/admin/roles/[name] — update label/sections
export const PATCH: APIRoute = async ({ request, locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (locals.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const roleName = params.name;
  if (!roleName || roleName === 'super_admin') {
    return new Response(JSON.stringify({ error: 'Cannot modify super_admin role' }), { status: 400 });
  }

  let body: { label?: string; sections?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', `admin.role.${roleName}`)
    .single();

  if (!existing) {
    return new Response(JSON.stringify({ error: 'Role not found' }), { status: 404 });
  }

  let current: Record<string, unknown> = {};
  try { current = JSON.parse(existing.value); } catch {}

  if (body.label) current.label = body.label;
  if (Array.isArray(body.sections)) {
    current.sections = body.sections.filter(s => VALID_SECTIONS.includes(s));
  }

  const { error } = await supabase
    .from('site_config')
    .update({ value: JSON.stringify(current) })
    .eq('key', `admin.role.${roleName}`);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data: { name: roleName, ...current } }), { status: 200 });
};

// DELETE /api/admin/roles/[name] — delete custom role only
export const DELETE: APIRoute = async ({ request, locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (locals.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const roleName = params.name;
  if (!roleName || roleName === 'super_admin') {
    return new Response(JSON.stringify({ error: 'Cannot delete super_admin role' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', `admin.role.${roleName}`)
    .single();

  if (!existing) {
    return new Response(JSON.stringify({ error: 'Role not found' }), { status: 404 });
  }

  let roleData: { is_builtin?: boolean } = {};
  try { roleData = JSON.parse(existing.value); } catch {}

  if (roleData.is_builtin) {
    return new Response(JSON.stringify({ error: 'Cannot delete a built-in role' }), { status: 400 });
  }

  const { error } = await supabase
    .from('site_config')
    .delete()
    .eq('key', `admin.role.${roleName}`);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
