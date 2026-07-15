import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendAdminNotification, sendLeadAutoReply } from '../../lib/resend';
import { isTrustedOrigin } from '../../lib/trusted-origin';

export const prerender = false;

// In-memory IP rate limit store — resets per cold start, good enough for serverless
const ipHits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  // CSRF: only accept requests from our own origin
  if (!isTrustedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Honeypot: if filled, silently succeed without inserting
  if (body.website) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // Required fields
  const { full_name, company_name, work_email, whatsapp } = body;
  if (!full_name?.trim() || !company_name?.trim() || !work_email?.trim() || !whatsapp?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // IP rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  const supabase = getSupabaseAdmin();

  // Duplicate email check
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('work_email', work_email.trim().toLowerCase())
    .limit(1);
  const isDuplicate = (existing?.length ?? 0) > 0;

  // Insert lead
  const leadRow = {
    full_name:       full_name.trim(),
    company_name:    company_name.trim(),
    work_email:      work_email.trim().toLowerCase(),
    whatsapp:        whatsapp.trim(),
    job_title:       body.job_title?.trim() ?? null,
    industry:        body.industry ?? null,
    company_size:    body.company_size ?? null,
    main_challenge:  body.main_challenge?.trim() ?? null,
    budget_range:    body.budget_range ?? null,
    ai_experience:   body.ai_experience ?? null,
    meeting_format:  body.meeting_format ?? null,
    preferred_date:  body.preferred_date || null,
    preferred_time:  body.preferred_time ?? null,
    notes:           body.notes?.trim() ?? null,
    source:          body.source ?? 'modal',
    page_source:     body.page_source ?? 'unknown',
    utm_source:      body.utm_source ?? null,
    utm_medium:      body.utm_medium ?? null,
    utm_campaign:    body.utm_campaign ?? null,
    ip_address:      ip,
    duplicate_email: isDuplicate,
    status:          'new',
  };

  const { data: inserted, error } = await supabase
    .from('leads')
    .insert(leadRow)
    .select('id')
    .single();

  if (error) {
    console.error('[submit-lead] insert error:', error.message);
    return new Response(JSON.stringify({ error: 'Submission failed' }), { status: 500 });
  }

  const leadId = inserted.id;

  // Insert notification
  await supabase.from('notifications').insert({
    type: isDuplicate ? 'duplicate_lead' : 'new_lead',
    message: isDuplicate
      ? `New lead from ${full_name} (${company_name}) — same email submitted before`
      : `New lead from ${full_name} (${company_name})`,
    related_id: leadId,
  });

  // Fire-and-forget emails — never block the response
  ;(async () => {
    try {
      const { data: configRows } = await supabase
        .from('site_config')
        .select('key, value')
        .in('key', [
          'integration.admin_notify_email',
          'company.phone',
          'company.email',
          'company.whatsapp',
        ]);

      const cfg = Object.fromEntries((configRows ?? []).map(r => [r.key, r.value]));
      const adminEmail = cfg['integration.admin_notify_email'];
      const lead = { ...leadRow, id: leadId };

      if (adminEmail) {
        await sendAdminNotification(lead, adminEmail);
      }
      await sendLeadAutoReply(
        lead,
        cfg['company.phone'] ?? '+971 4 321 8888',
        cfg['company.email'] ?? 'hello@lenooai.com',
        cfg['company.whatsapp'] ?? '971501234567',
      );

      // Mark auto_reply_sent
      await supabase.from('leads').update({ auto_reply_sent: true }).eq('id', leadId);
    } catch (e) {
      console.error('[submit-lead] email error:', e);
    }
  })();

  return new Response(JSON.stringify({ success: true, id: leadId }), { status: 200 });
};
