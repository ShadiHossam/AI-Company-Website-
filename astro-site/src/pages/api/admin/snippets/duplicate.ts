import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let body: { id?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!body.id) {
    return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = getSupabaseAdmin();
  const { data: source, error: fetchErr } = await supabase.from('snippets').select('*').eq('id', body.id).single();

  if (fetchErr || !source) {
    return new Response(JSON.stringify({ error: 'Snippet not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const { data, error } = await supabase
    .from('snippets')
    .insert({ name: `${source.name} (Copy)`, category: source.category, code: source.code })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
