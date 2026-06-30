import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();

  // Cascade deletes blog_post_tags rows via FK constraint
  const { error } = await supabase.from('blog_tags').delete().eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
