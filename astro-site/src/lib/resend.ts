import { Resend } from 'resend';

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function getResend() {
  return new Resend(import.meta.env.RESEND_API_KEY);
}

interface LeadData {
  id?: string;
  full_name: string;
  company_name: string;
  work_email: string;
  whatsapp: string;
  industry?: string;
  budget_range?: string;
  meeting_format?: string;
  preferred_date?: string;
  preferred_time?: string;
  page_source?: string;
  job_title?: string;
  company_size?: string;
  main_challenge?: string;
  notes?: string;
  duplicate_email?: boolean;
}

interface ApplicationData {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  phone?: string;
  linkedin_url?: string;
  cv_url: string;
}

// ---------------------------------------------------------------------------
// Shared layout. Email clients ignore <style> blocks and flexbox unevenly, so
// everything is tables and inline styles; the logo is a hosted PNG because
// Gmail strips SVG.
// ---------------------------------------------------------------------------

const SITE = 'https://lenooai.com';
const NAVY = '#00253b';
const TEAL = '#006875';
const CYAN = '#00e3fd';
const INK = '#111c2d';
const MUTED = '#5b6470';
const LINE = '#e3e8ee';
const FONT = `-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

function shell(opts: { preheader: string; body: string; footer?: string }): string {
  const footer = opts.footer ?? `Lenoo AI · Dubai, UAE · Sun to Thu, 9am to 6pm GST<br>
    <a href="${SITE}" style="color:${MUTED}; text-decoration:underline;">lenooai.com</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/privacy" style="color:${MUTED}; text-decoration:underline;">Privacy Policy</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Lenoo AI</title>
</head>
<body style="margin:0; padding:0; background:#f0f3f7;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f3f7;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid ${LINE};">
      <tr><td style="background:${NAVY}; padding:26px 40px;">
        <a href="${SITE}"><img src="${SITE}/assets/brand/logo-white.png" width="149" height="26" alt="Lenoo AI" style="display:block; border:0;"></a>
      </td></tr>
      <tr><td style="height:3px; line-height:3px; font-size:0; background:${CYAN};">&nbsp;</td></tr>
      <tr><td style="padding:40px 40px 32px; font-family:${FONT}; color:${INK};">
        ${opts.body}
      </td></tr>
      <tr><td style="padding:20px 40px 28px; border-top:1px solid ${LINE}; font-family:${FONT}; font-size:12px; line-height:1.7; color:${MUTED};">
        ${footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function eyebrow(text: string): string {
  return `<p style="margin:0 0 10px; font-size:12px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${TEAL};">${text}</p>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px; font-size:26px; line-height:1.25; font-weight:800; color:${NAVY};">${text}</h1>`;
}

function para(text: string, extra = ''): string {
  return `<p style="margin:0 0 16px; font-size:16px; line-height:1.65; color:${INK}; ${extra}">${text}</p>`;
}

// Bulletproof button: a padded table cell, so it keeps its shape in Outlook.
function button(href: string, label: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const bg = variant === 'primary' ? CYAN : '#ffffff';
  const border = variant === 'primary' ? CYAN : '#c9d2dc';
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table; margin:0 8px 8px 0;">
    <tr><td style="background:${bg}; border:1px solid ${border}; border-radius:8px;">
      <a href="${href}" style="display:inline-block; padding:12px 22px; font-family:${FONT}; font-size:15px; font-weight:700; color:${NAVY}; text-decoration:none;">${label}</a>
    </td></tr>
  </table>`;
}

// Label/value rows; rows with no value are dropped rather than shown as a dash.
function detailsTable(rows: Array<[string, string | null | undefined]>): string {
  const filled = rows.filter(([, v]) => v && v.trim());
  if (!filled.length) return '';
  const trs = filled.map(([k, v], i) => `
    <tr>
      <td style="padding:11px 16px; width:34%; font-size:13px; font-weight:600; color:${MUTED}; ${i ? `border-top:1px solid ${LINE};` : ''}">${k}</td>
      <td style="padding:11px 16px; font-size:15px; color:${INK}; ${i ? `border-top:1px solid ${LINE};` : ''}">${v}</td>
    </tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px; background:#f7f9fb; border:1px solid ${LINE}; border-radius:10px; font-family:${FONT};">${trs}</table>`;
}

function humanDate(iso?: string): string | undefined {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(`${iso}T00:00:00Z`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function meetingText(lead: LeadData): string {
  const when = [humanDate(lead.preferred_date), lead.preferred_time].filter(Boolean).join(', ');
  return [lead.meeting_format, when].filter(Boolean).map(esc).join(' · ');
}

// page_source arrives as a path ("/contact") or a slug ("services_ai_agents").
function sourceLabel(src?: string): string {
  if (!src || src === 'unknown') return '';
  return src.startsWith('/') ? src : src.replace(/_/g, ' ');
}

// Multi-line free text from the form, escaped, with line breaks kept.
function quote(text: string): string {
  return `<div style="margin:0 0 20px; padding:14px 18px; background:#f7f9fb; border-left:3px solid ${CYAN}; border-radius:0 8px 8px 0; font-size:15px; line-height:1.6; color:${INK};">${esc(text).replace(/\n/g, '<br>')}</div>`;
}

function firstName(full: string): string {
  return (full ?? '').trim().split(/\s+/)[0] ?? '';
}

// ---------------------------------------------------------------------------
// Templates. Exported separately from the send functions so they can be
// previewed and tested without calling Resend.
// ---------------------------------------------------------------------------

export function adminNotificationEmail(lead: LeadData): { subject: string; html: string } {
  const source = esc(sourceLabel(lead.page_source));
  const wa = (lead.whatsapp ?? '').replace(/\D/g, '');
  const body = `
    ${eyebrow(`New lead${source ? ` · ${source}` : ''}`)}
    ${heading(esc(lead.full_name))}
    ${para([lead.job_title, lead.company_name].filter(Boolean).map(esc).join(' at '), `color:${MUTED}; margin-bottom:${lead.duplicate_email ? '12px' : '24px'};`)}
    ${lead.duplicate_email ? `<p style="margin:0 0 20px; display:inline-block; padding:6px 12px; background:#fff4e0; border-radius:6px; font-size:13px; font-weight:600; color:#8a5300;">This email has submitted the form before</p>` : ''}
    ${lead.main_challenge ? `${eyebrow('What they need')}${quote(lead.main_challenge)}` : ''}
    ${lead.notes ? `${eyebrow('Notes')}${quote(lead.notes)}` : ''}
    ${detailsTable([
      ['Email', `<a href="mailto:${esc(lead.work_email)}" style="color:${TEAL};">${esc(lead.work_email)}</a>`],
      ['WhatsApp', esc(lead.whatsapp)],
      ['Industry', esc(lead.industry)],
      ['Company size', esc(lead.company_size)],
      ['Budget', esc(lead.budget_range)],
      ['Meeting', meetingText(lead)],
    ])}
    <div>
      ${button(`${SITE}/admin/leads/${esc(lead.id)}`, 'Open in admin')}
      ${wa ? button(`https://wa.me/${wa}`, 'WhatsApp them', 'secondary') : ''}
      ${button(`mailto:${esc(lead.work_email)}`, 'Email them', 'secondary')}
    </div>`;
  return {
    subject: `New lead: ${lead.full_name}, ${lead.company_name}`,
    html: shell({
      preheader: `${lead.full_name} from ${lead.company_name} just asked for a consultation.`,
      body,
      footer: `Sent by the lenooai.com contact form. The customer has already received an automatic confirmation.`,
    }),
  };
}

export function leadAutoReplyEmail(
  lead: LeadData, companyPhone: string, companyEmail: string, companyWhatsApp: string,
): { subject: string; html: string } {
  const wa = (companyWhatsApp ?? '').replace(/\D/g, '');
  const tel = (companyPhone ?? '').replace(/[^\d+]/g, '');
  const steps = [
    ['We review your request.', 'A consultant reads what you sent before contacting you.'],
    ['We contact you within 24 hours', 'on WhatsApp or email to confirm a time.'],
    ['We meet.', 'You walk us through the work your team repeats every week, and we tell you what can be automated and what it would cost.'],
  ].map(([title, rest], i) => `
    <tr>
      <td width="38" valign="top" style="padding:0 0 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td width="26" height="26" align="center" valign="middle" style="width:26px; height:26px; border-radius:13px; background:${NAVY}; color:#ffffff; font-family:${FONT}; font-size:13px; font-weight:700;">${i + 1}</td>
        </tr></table>
      </td>
      <td valign="top" style="padding:3px 0 14px; font-size:15px; line-height:1.55; color:${INK};"><strong>${title}</strong> ${rest}</td>
    </tr>`).join('');
  const body = `
    ${eyebrow('Request received')}
    ${heading(`Thanks, ${esc(firstName(lead.full_name))}. We've got it.`)}
    ${para(`Your consultation request for <strong>${esc(lead.company_name)}</strong> is with our team. Here's what happens next:`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px; font-family:${FONT};">${steps}</table>
    ${meetingText(lead) ? detailsTable([['Your preferred meeting', meetingText(lead)]]) : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px; background:#f7f9fb; border:1px solid ${LINE}; border-radius:10px;">
      <tr><td style="padding:18px 20px; font-family:${FONT}; color:${INK};">
        <p style="margin:0 0 8px; font-size:15px; font-weight:700; color:${NAVY};">To get the most out of the call, have these ready:</p>
        <p style="margin:0; font-size:15px; line-height:1.7;">
          · The one task that takes your team the most hours each week<br>
          · The tools you use today (CRM, WhatsApp, spreadsheets, accounting)<br>
          · Who on your team would use the system day to day
        </p>
      </td></tr>
    </table>
    ${para('Have a question before then? Message us directly:', 'margin-bottom:14px;')}
    <div>
      ${wa ? button(`https://wa.me/${wa}`, 'Message us on WhatsApp') : ''}
    </div>
    <p style="margin:8px 0 0; font-size:14px; line-height:1.7; color:${MUTED};">
      Or email <a href="mailto:${esc(companyEmail)}" style="color:${TEAL};">${esc(companyEmail)}</a>
      ${tel ? ` · call <a href="tel:${tel}" style="color:${TEAL}; white-space:nowrap;">${esc(companyPhone)}</a>` : ''}
    </p>`;
  return {
    subject: `We've received your consultation request`,
    html: shell({
      preheader: `Thanks for reaching out. We'll contact you within 24 hours to confirm a time.`,
      body,
    }),
  };
}

export function applicationNotificationEmail(app: ApplicationData): { subject: string; html: string } {
  const body = `
    ${eyebrow('New application')}
    ${heading(esc(app.full_name))}
    ${para(`Applied for <strong>${esc(app.job_title)}</strong>`, `color:${MUTED}; margin-bottom:24px;`)}
    ${detailsTable([
      ['Email', `<a href="mailto:${esc(app.email)}" style="color:${TEAL};">${esc(app.email)}</a>`],
      ['Phone', esc(app.phone)],
      ['LinkedIn', app.linkedin_url ? `<a href="${esc(app.linkedin_url)}" style="color:${TEAL};">${esc(app.linkedin_url)}</a>` : ''],
    ])}
    <div>
      ${button(esc(app.cv_url), 'Download CV')}
      ${button(`${SITE}/admin/applications`, 'Open in admin', 'secondary')}
    </div>`;
  return {
    subject: `New application: ${app.full_name} for ${app.job_title}`,
    html: shell({
      preheader: `${app.full_name} applied for ${app.job_title}.`,
      body,
      footer: 'Sent by the lenooai.com careers form.',
    }),
  };
}

export function staleLeadDigestEmail(leads: LeadData[]): { subject: string; html: string } {
  const n = leads.length;
  const rows = leads.map((l, i) => {
    const wa = (l.whatsapp ?? '').replace(/\D/g, '');
    const top = i ? `border-top:1px solid ${LINE};` : '';
    return `<tr>
      <td style="padding:12px 16px; ${top}">
        <div style="font-size:15px; font-weight:700; color:${INK};">${esc(l.full_name)}</div>
        <div style="font-size:13px; color:${MUTED};">${esc(l.company_name)}</div>
      </td>
      <td align="right" style="padding:12px 16px; font-size:14px; white-space:nowrap; ${top}">
        ${wa ? `<a href="https://wa.me/${wa}" style="color:${TEAL}; font-weight:600;">WhatsApp</a> &nbsp;·&nbsp; ` : ''}
        <a href="${SITE}/admin/leads/${esc(l.id)}" style="color:${TEAL}; font-weight:600;">Open</a>
      </td>
    </tr>`;
  }).join('');
  const body = `
    ${eyebrow('Follow-up reminder')}
    ${heading(`${n} lead${n > 1 ? 's have' : ' has'} waited 5+ days`)}
    ${para('Nobody has replied to these yet. A quick message now still beats silence.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px; background:#f7f9fb; border:1px solid ${LINE}; border-radius:10px; font-family:${FONT};">${rows}</table>
    ${button(`${SITE}/admin/leads`, 'See all leads')}`;
  return {
    subject: `${n} lead${n > 1 ? 's' : ''} need${n > 1 ? '' : 's'} a follow-up`,
    html: shell({ preheader: `${n} lead${n > 1 ? 's are' : ' is'} still waiting for a reply.`, body }),
  };
}

// ---------------------------------------------------------------------------
// Senders
// ---------------------------------------------------------------------------

export async function sendAdminNotification(lead: LeadData, adminEmail: string): Promise<void> {
  const { subject, html } = adminNotificationEmail(lead);
  await getResend().emails.send({
    from: 'Lenoo AI Leads <noreply@lenooai.com>',
    to: adminEmail,
    replyTo: lead.work_email,
    subject,
    html,
  });
}

export async function sendLeadAutoReply(lead: LeadData, companyPhone: string, companyEmail: string, companyWhatsApp: string): Promise<void> {
  const { subject, html } = leadAutoReplyEmail(lead, companyPhone, companyEmail, companyWhatsApp);
  await getResend().emails.send({
    from: 'Lenoo AI <hello@lenooai.com>',
    to: lead.work_email,
    // Replies should land in the inbox the email tells people to use.
    replyTo: companyEmail,
    subject,
    html,
  });
}

export async function sendApplicationNotification(app: ApplicationData, adminEmail: string): Promise<void> {
  const { subject, html } = applicationNotificationEmail(app);
  await getResend().emails.send({
    from: 'Lenoo AI Careers <noreply@lenooai.com>',
    to: adminEmail,
    replyTo: app.email,
    subject,
    html,
  });
}

export async function sendStaleLeadDigest(leads: LeadData[], adminEmail: string): Promise<void> {
  if (!leads.length) return;
  const { subject, html } = staleLeadDigestEmail(leads);
  await getResend().emails.send({
    from: 'Lenoo AI <noreply@lenooai.com>',
    to: adminEmail,
    subject,
    html,
  });
}
