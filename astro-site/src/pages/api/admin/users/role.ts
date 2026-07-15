import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (locals.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: { uid: string; role: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.uid || !body.role) {
    return new Response(JSON.stringify({ error: 'uid and role required' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // super_admin is always valid; other roles must exist in site_config
  if (body.role !== 'super_admin') {
    const { data: roleRow } = await supabase
      .from('site_config')
      .select('key')
      .eq('key', `admin.role.${body.role}`)
      .single();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
    }
  }

  const { data, error } = await supabase.auth.admin.updateUserById(body.uid, {
    user_metadata: { role: body.role },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};
