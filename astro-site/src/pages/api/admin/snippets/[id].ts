import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('snippets').select('*').eq('id', params.id).single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Snippet not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PATCH: APIRoute = async ({ locals, request, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = params;
  let body: any;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) {
    updates.name = body.name.trim();
    if (!updates.name) {
      return new Response(JSON.stringify({ error: 'Name cannot be empty' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
  if (body.category !== undefined) updates.category = body.category || null;
  if (body.code !== undefined) updates.code = body.code;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('snippets').update(updates).eq('id', id).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('snippets').delete().eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
