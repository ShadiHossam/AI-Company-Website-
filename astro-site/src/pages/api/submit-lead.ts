import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendAdminNotification, sendLeadAutoReply } from '../../lib/resend';
import { isTrustedOrigin } from '../../lib/trusted-origin';
import { getClientIp, createRateLimiter } from '../../lib/request-safety';
import { COMPANY } from '../../config/company';

export const prerender = false;

// In-memory, per process: 5 submissions per IP per 10 minutes.
const checkRateLimit = createRateLimiter(5, 10 * 60 * 1000);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // CSRF: only accept requests from our own origin
  if (!isTrustedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  if (!raw || typeof raw !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  // Keep only string fields, capped in length, so a null or number can't crash
  // .trim() (a 500) and a huge value can't bloat the row or the emails.
  const body: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') body[k] = v.slice(0, k === 'main_challenge' || k === 'notes' ? 5000 : 300);
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email.trim())) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  // IP rate limiting
  const ip = getClientIp(request, clientAddress);
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

  // Insert notification (the lead is already saved, so a failure here is only logged)
  const { error: notifyError } = await supabase.from('notifications').insert({
    type: isDuplicate ? 'duplicate_lead' : 'new_lead',
    message: isDuplicate
      ? `New lead from ${full_name} (${company_name}) — same email submitted before`
      : `New lead from ${full_name} (${company_name})`,
    related_id: leadId,
  });
  if (notifyError) console.error('[submit-lead] notification insert failed:', notifyError.message);

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

      const cfg = Object.fromEntries((configRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
      const adminEmail = cfg['integration.admin_notify_email'];
      // leadRow uses `null` for an unset optional DB column, which is the right
      // convention for a Postgres insert; LeadData's optional fields are typed
      // `string | undefined` since email templates just want "field omitted".
      // Spreading leadRow straight in mixed the two conventions, so build the
      // email-facing shape explicitly instead.
      const lead = {
        id: leadId,
        full_name: leadRow.full_name,
        company_name: leadRow.company_name,
        work_email: leadRow.work_email,
        whatsapp: leadRow.whatsapp,
        industry: leadRow.industry ?? undefined,
        budget_range: leadRow.budget_range ?? undefined,
        meeting_format: leadRow.meeting_format ?? undefined,
        preferred_date: leadRow.preferred_date ?? undefined,
        preferred_time: leadRow.preferred_time ?? undefined,
        page_source: leadRow.page_source ?? undefined,
        job_title: leadRow.job_title ?? undefined,
        company_size: leadRow.company_size ?? undefined,
        main_challenge: leadRow.main_challenge ?? undefined,
        notes: leadRow.notes ?? undefined,
        duplicate_email: isDuplicate,
      };

      // A failed admin notification must not stop the visitor's auto-reply.
      if (adminEmail) {
        await sendAdminNotification(lead, adminEmail).catch((e) =>
          console.error('[submit-lead] admin notification failed:', e));
      }
      await sendLeadAutoReply(
        lead,
        cfg['company.phone'] || COMPANY.phone,
        cfg['company.email'] || COMPANY.email,
        cfg['company.whatsapp'] || COMPANY.whatsapp,
      );

      // Mark auto_reply_sent (only reached when the send succeeded)
      const { error: markError } = await supabase.from('leads').update({ auto_reply_sent: true }).eq('id', leadId);
      if (markError) console.error('[submit-lead] auto_reply_sent update failed:', markError);
    } catch (e) {
      console.error('[submit-lead] email error:', e);
    }
  })();

  return new Response(JSON.stringify({ success: true, id: leadId }), { status: 200 });
};
