import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF_CHECK = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

// GET /api/admin/leads — paginated list with filters + CSV export
export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  const format   = url.searchParams.get('format');
  const status   = url.searchParams.get('status');
  const industry = url.searchParams.get('industry');
  const search   = url.searchParams.get('search');
  const dateFrom = url.searchParams.get('date_from');
  const dateTo   = url.searchParams.get('date_to');
  const page     = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = 50;

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status)   query = query.eq('status', status);
  if (industry) query = query.eq('industry', industry);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo)   query = query.lte('created_at', dateTo + 'T23:59:59Z');
  if (search)   query = query.or(`full_name.ilike.%${search}%,company_name.ilike.%${search}%,work_email.ilike.%${search}%`);

  if (format === 'csv') {
    // Return all records for CSV
    const { data } = await query.limit(10000);
    const cols = ['id','created_at','full_name','company_name','work_email','whatsapp','job_title','industry','company_size','main_challenge','budget_range','ai_experience','meeting_format','preferred_date','preferred_time','notes','source','page_source','utm_source','utm_medium','utm_campaign','status','assigned_to','internal_notes','next_action','next_action_date','estimated_value_aed','tags'];
    const header = cols.join(',');
    const rows = (data ?? []).map(r =>
      cols.map(c => {
        const v = (r as Record<string, unknown>)[c];
        if (v === null || v === undefined) return '';
        if (Array.isArray(v)) return `"${v.join(';')}"`;
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    );
    return new Response([header, ...rows].join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  const from = (page - 1) * pageSize;
  const { data, count } = await query.range(from, from + pageSize - 1);
  return new Response(JSON.stringify({ leads: data ?? [], total: count ?? 0, page, pageSize }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// PATCH /api/admin/leads — bulk status update
export const PATCH: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const { ids, status } = await request.json();
  if (!ids?.length || !status) {
    return new Response(JSON.stringify({ error: 'ids and status required' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('leads').update({ status }).in('id', ids);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
