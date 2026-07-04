import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { name, title, bio, image_url, sort_order, active, ar_name, ar_title, ar_bio } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (title !== undefined) updates.title = title;
    if (bio !== undefined) updates.bio = bio;
    if (image_url !== undefined) updates.image_url = image_url;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (active !== undefined) updates.active = active;
    if (ar_name !== undefined) updates.ar_name = ar_name;
    if (ar_title !== undefined) updates.ar_title = ar_title;
    if (ar_bio !== undefined) updates.ar_bio = ar_bio;

    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', params.id!)
      .select()
      .single();

    if (error) throw error;
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
    const { error } = await supabase.from('team_members').update({ deleted_at: new Date().toISOString() }).eq('id', params.id!);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
