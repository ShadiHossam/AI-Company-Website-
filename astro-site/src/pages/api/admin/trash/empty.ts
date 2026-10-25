import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { TRASH_ENTITIES } from './index';
import { logActivity } from '../../../../lib/activityLog';

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = getSupabaseAdmin();
  let purged = 0;

  for (const cfg of Object.values(TRASH_ENTITIES)) {
    const { count } = await supabase
      .from(cfg.table)
      .delete({ count: 'exact' })
      .not('deleted_at', 'is', null);
    purged += count ?? 0;
  }

  await logActivity({
    action: 'trash.emptied',
    entity_type: 'trash',
    entity_id: null,
    admin_email: locals.user.email,
    after_value: { purged },
  });

  return new Response(JSON.stringify({ ok: true, purged }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
