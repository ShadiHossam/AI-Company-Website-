import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

const VALID_SECTIONS = [
  'dashboard', 'blog', 'content', 'media', 'leads', 'jobs',
  'applications', 'notifications', 'seo', 'activity', 'settings', 'users',
];

function parseRole(key: string, value: string) {
  const name = key.replace('admin.role.', '');
  try {
    const data = JSON.parse(value);
    return { name, label: data.label ?? name, sections: data.sections ?? [], is_builtin: data.is_builtin ?? false };
  } catch {
    return null;
  }
}

// GET /api/admin/roles — list all roles
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site_config')
    .select('key,value')
    .eq('section', 'admin_roles')
    .order('key');

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  const roles = (data ?? []).map(r => parseRole(r.key, r.value)).filter(Boolean);
  return new Response(JSON.stringify({ data: roles }), { status: 200 });
};

// POST /api/admin/roles — create custom role (super_admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (locals.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: { name: string; label: string; sections: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.name || !body.label || !Array.isArray(body.sections)) {
    return new Response(JSON.stringify({ error: 'name, label, and sections required' }), { status: 400 });
  }

  const name = body.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (name === 'super_admin') {
    return new Response(JSON.stringify({ error: 'Cannot create a role named super_admin' }), { status: 400 });
  }

  const sections = body.sections.filter(s => VALID_SECTIONS.includes(s));
  const value = JSON.stringify({ label: body.label, sections, is_builtin: false });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('site_config')
    .insert({ key: `admin.role.${name}`, value, type: 'json', label: `${body.label} Role`, section: 'admin_roles' });

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ data: { name, label: body.label, sections, is_builtin: false } }), { status: 201 });
};
