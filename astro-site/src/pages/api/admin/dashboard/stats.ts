import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo  = new Date(Date.now() - 7  * 86400000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { count: newToday },
    { count: qualifiedWeek },
    { data: pipeline },
    { count: unreadNotifs },
    { data: recentLeads },
    { data: hotLeads },
    { data: contentStats },
    { data: allLeads },
    { data: sparkData },
    { data: monthData },
    { data: sourceData },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .gte('created_at', today),
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .eq('status', 'qualified')
      .gte('created_at', weekAgo),
    supabase.from('leads').select('status, estimated_value_aed')
      .not('status', 'in', '(closed_won,closed_lost)'),
    supabase.from('notifications').select('*', { count: 'exact', head: true })
      .eq('read', false),
    supabase.from('leads').select('id, full_name, company_name, status, page_source, created_at, tags, duplicate_email')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('leads').select('id, full_name, company_name, whatsapp, work_email, status, next_action_date')
      .eq('status', 'qualified')
      .lt('updated_at', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString())
      .limit(5),
    supabase.from('blog_posts').select('status'),
    supabase.from('leads').select('status'),
    supabase.from('leads').select('created_at, status').gte('created_at', sevenDaysAgo),
    supabase.from('leads').select('created_at').gte('created_at', thirtyDaysAgo),
    supabase.from('leads').select('page_source, utm_source').gte('created_at', thirtyDaysAgo),
  ]);

  const pipelineAED = (pipeline ?? []).reduce((sum, l) => sum + (l.estimated_value_aed ?? 0), 0);
  const stageBreakdown: Record<string, { count: number; aed: number }> = {};
  for (const l of pipeline ?? []) {
    if (!stageBreakdown[l.status]) stageBreakdown[l.status] = { count: 0, aed: 0 };
    stageBreakdown[l.status].count++;
    stageBreakdown[l.status].aed += l.estimated_value_aed ?? 0;
  }

  const published = (contentStats ?? []).filter(p => p.status === 'published').length;
  const drafts    = (contentStats ?? []).filter(p => p.status === 'draft').length;

  // Funnel from all leads
  const funnelOrder = ['new', 'contacted', 'qualified', 'proposal_sent', 'closed_won'];
  const allStatuses: Record<string, number> = {};
  for (const l of allLeads ?? []) {
    allStatuses[l.status] = (allStatuses[l.status] ?? 0) + 1;
  }
  const funnelCounts = funnelOrder.map(s => allStatuses[s] ?? 0);

  // 7-day sparklines (day 0 = 7 days ago, day 6 = today)
  const sparkNew = Array(7).fill(0);
  const sparkQualified = Array(7).fill(0);
  const now = Date.now();
  for (const row of sparkData ?? []) {
    const dayIdx = 6 - Math.floor((now - new Date(row.created_at).getTime()) / 86400000);
    if (dayIdx >= 0 && dayIdx < 7) {
      sparkNew[dayIdx]++;
      if (row.status === 'qualified') sparkQualified[dayIdx]++;
    }
  }

  // 30-day bar chart
  const barCounts = Array(30).fill(0);
  for (const row of monthData ?? []) {
    const dayIdx = 29 - Math.floor((now - new Date(row.created_at).getTime()) / 86400000);
    if (dayIdx >= 0 && dayIdx < 30) barCounts[dayIdx]++;
  }
  const barLabels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const row of sourceData ?? []) {
    const key = (row.utm_source || row.page_source || 'direct').replace(/_/g, ' ');
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  }
  const sourceEntries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const sourceLabels = sourceEntries.map(([k]) => k);
  const sourceValues = sourceEntries.map(([, v]) => v);

  return new Response(JSON.stringify({
    newToday:       newToday ?? 0,
    qualifiedWeek:  qualifiedWeek ?? 0,
    pipelineAED,
    unreadNotifs:   unreadNotifs ?? 0,
    stageBreakdown,
    funnelOrder,
    funnelCounts,
    sparklines:     { new: sparkNew, qualified: sparkQualified },
    barChart:       { labels: barLabels, counts: barCounts },
    sourceBreakdown: { labels: sourceLabels, counts: sourceValues },
    recentLeads:    recentLeads ?? [],
    hotLeads:       hotLeads ?? [],
    blog:           { published, drafts },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
