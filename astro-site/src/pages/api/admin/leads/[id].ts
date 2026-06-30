import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF_CHECK = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('leads').select('*').eq('id', params.id!).single();
  if (error) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  // Activity log for this lead
  const { data: activity } = await supabase
    .from('activity_log')
    .select('*')
    .eq('entity_id', params.id!)
    .order('created_at', { ascending: false })
    .limit(50);

  return new Response(JSON.stringify({ lead: data, activity: activity ?? [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const ALLOWED_FIELDS = ['status', 'internal_notes', 'assigned_to', 'budget_range', 'ai_experience', 'meeting_format', 'preferred_date', 'preferred_time', 'notes', 'next_action', 'next_action_date', 'estimated_value_aed', 'tags'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k)));

  // Capture before state for audit log
  const { data: before } = await supabase.from('leads').select('*').eq('id', params.id!).single();
  const { data: updated, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', params.id!)
    .select()
    .single();

  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

  // Write audit log entry
  if (before && updates.status && updates.status !== before.status) {
    await supabase.from('activity_log').insert({
      admin_email:  locals.user.email,
      action:       'lead.status_changed',
      entity_type:  'lead',
      entity_id:    params.id,
      before_value: { status: before.status },
      after_value:  { status: updates.status },
    });
  } else if (updates.internal_notes !== undefined) {
    await supabase.from('activity_log').insert({
      admin_email:  locals.user.email,
      action:       'lead.notes_updated',
      entity_type:  'lead',
      entity_id:    params.id,
      before_value: null,
      after_value:  { note_added: true },
    });
  }

  return new Response(JSON.stringify({ lead: updated }), { status: 200 });
};
