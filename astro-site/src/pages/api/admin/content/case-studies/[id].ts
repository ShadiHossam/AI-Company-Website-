import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://lenooai.com';
  return import.meta.env.DEV || origin === siteUrl;
};

const ALLOWED_FIELDS = [
  'title', 'slug', 'industry', 'delivery_time', 'challenge', 'solution', 'featured', 'published', 'media_sections',
  'ar_title', 'ar_industry', 'ar_delivery_time', 'ar_challenge', 'ar_solution', 'ar_timeline_items', 'ar_results',
];

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', params.id!)
      .single();

    if (error) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of ALLOWED_FIELDS) {
      if (field in body) updates[field] = body[field];
    }

    const { data, error } = await supabase
      .from('case_studies')
      .update(updates)
      .eq('id', params.id!)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_log').insert({
      admin_email: locals.user.email,
      action: 'case_study.updated',
      entity_type: 'case_study',
      entity_id: params.id,
    });

    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const { error } = await supabase.from('case_studies').update({ deleted_at: new Date().toISOString() }).eq('id', params.id!);
    if (error) throw error;

    await supabase.from('activity_log').insert({
      admin_email: locals.user.email,
      action: 'case_study.deleted',
      entity_type: 'case_study',
      entity_id: params.id,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
