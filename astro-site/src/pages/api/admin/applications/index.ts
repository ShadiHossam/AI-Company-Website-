import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

// GET /api/admin/applications?job_id=&status=
export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  const jobId  = url.searchParams.get('job_id');
  const status = url.searchParams.get('status');

  let query = supabase
    .from('job_applications')
    .select('*, jobs(title, department)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (jobId)  query = query.eq('job_id', jobId);
  if (status) query = query.eq('status', status);

  const { data, count, error } = await query;
  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  return new Response(JSON.stringify({ applications: data ?? [], total: count ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
