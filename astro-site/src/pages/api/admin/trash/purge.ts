import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { TRASH_ENTITIES } from './index';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let body: { entity_type?: string; id?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const cfg = body.entity_type ? TRASH_ENTITIES[body.entity_type] : undefined;
  if (!cfg || !body.id) {
    return new Response(JSON.stringify({ error: 'entity_type and id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = getSupabaseAdmin();
  // Only ever purge rows already sitting in the trash — never a live row.
  const { error } = await supabase.from(cfg.table).delete().eq('id', body.id).not('deleted_at', 'is', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  await supabase.from('activity_log').insert({
    action: `${body.entity_type}.purged`,
    entity_type: body.entity_type,
    entity_id: body.id,
    user_id: locals.user.id,
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
