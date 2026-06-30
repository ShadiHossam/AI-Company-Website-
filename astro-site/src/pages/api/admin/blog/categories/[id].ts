import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const PATCH: APIRoute = async ({ locals, request, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = params;
  let body: any;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const updates: Record<string, any> = {};
  if (body.name !== undefined) {
    updates.name = body.name.trim();
    if (!updates.name) {
      return new Response(JSON.stringify({ error: 'Name cannot be empty' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!body.slug) updates.slug = slugify(updates.name);
  }
  if (body.slug !== undefined) updates.slug = body.slug.trim();
  if (body.description !== undefined) updates.description = body.description || null;
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blog_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'Name or slug already in use' : error.message;
    return new Response(JSON.stringify({ error: msg }), { status: 409, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('blog_categories').delete().eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
