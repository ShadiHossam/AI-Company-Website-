import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blog_authors')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let body: any;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const name = (body.name ?? '').trim();
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const slug = (body.slug ?? '').trim() || slugify(name);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('blog_authors')
    .insert({
      name,
      slug,
      bio: body.bio || null,
      email: body.email || null,
      avatar_url: body.avatar_url || null,
      website: body.website || null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'An author with that slug already exists' : error.message;
    return new Response(JSON.stringify({ error: msg }), { status: 409, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
