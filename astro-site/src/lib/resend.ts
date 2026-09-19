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
// Shared layout, built from the site's own tokens (global.css): navy-to-teal
// hero gradient, cyan accent, teal gradient buttons. Email clients ignore
// <style> blocks and flexbox unevenly, so it is tables and inline styles, and
// every gradient has a solid bgcolor fallback for Outlook.
// ---------------------------------------------------------------------------

const SITE = 'https://lenooai.com';
const NAVY = '#00253b';
const NAVY_DEEP = '#001320';
const TEAL = '#006875';
const CYAN = '#00e3fd';
const INK = '#111c2d';
const MUTED = '#5b6470';
const LINE = '#e6ebf2';
const SOFT = '#f7f8fb';
const GRAD_HERO = 'linear-gradient(115deg, #00253b 0%, #0b3d54 55%, #006875 100%)';
const GRAD_CTA = 'linear-gradient(90deg, #006875 0%, #008a9a 55%, #00b8cf 100%)';
const FONT = `-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const DISPLAY = `'SF Pro Rounded', ui-rounded, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

interface Hero {
  eyebrow: string;
  title: string;      // already escaped
  highlight?: string; // second line in cyan with the site's underline accent
  intro?: string;     // already escaped
}

function heroBlock(h: Hero): string {
  return `
      <tr><td bgcolor="${NAVY}" style="background:${NAVY}; background-image:${GRAD_HERO}; padding:32px 40px 40px;">
        <a href="${SITE}"><img src="${SITE}/assets/brand/logo-white.png" width="137" height="24" alt="Lenoo AI" style="display:block; border:0;"></a>
        <p style="margin:36px 0 12px; font-family:${FONT}; font-size:12px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:${CYAN};">&#10022;&nbsp; ${h.eyebrow}</p>
        <h1 style="margin:0; font-family:${DISPLAY}; font-size:32px; line-height:1.18; font-weight:800; color:#ffffff;">${h.title}${h.highlight ? `<br><span style="color:${CYAN};">${h.highlight}</span>` : ''}</h1>
        ${h.highlight ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;"><tr><td width="88" height="4" style="width:88px; height:4px; line-height:4px; font-size:0; background:${CYAN}; border-radius:2px;">&nbsp;</td></tr></table>` : ''}
        ${h.intro ? `<p style="margin:18px 0 0; font-family:${FONT}; font-size:16px; line-height:1.6; color:rgba(255,255,255,0.82);">${h.intro}</p>` : ''}
      </td></tr>`;
}

// The same promises the site makes in its hero and footer.
function trustStrip(): string {
  const items = [
    ['100% refund', 'guarantee'],
    ['90 days', 'of support'],
  ];
  const cells = items.map(([a, b], i) => `
        <td width="${Math.floor(100 / items.length)}%" align="center" valign="top" style="padding:18px 8px; font-family:${FONT}; ${i ? `border-left:1px solid ${LINE};` : ''}">
          <div style="font-size:14px; line-height:1.3; font-weight:800; color:${NAVY};"><span style="color:${TEAL};">&#10022;</span> ${a}</div>
          <div style="font-size:13px; line-height:1.4; color:${MUTED};">${b}</div>
        </td>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0; background:${SOFT}; border:1px solid ${LINE}; border-radius:12px;"><tr>${cells}</tr></table>`;
}

function brandFooter(note?: string): string {
  const link = (href: string, label: string) =>
    `<a href="${href}" style="color:#ffffff; text-decoration:none; font-weight:600;">${label}</a>`;
  return `
      <tr><td bgcolor="${NAVY_DEEP}" style="background:${NAVY_DEEP}; padding:28px 40px 30px; font-family:${FONT};">
        <img src="${SITE}/assets/brand/logo-white.png" width="103" height="18" alt="Lenoo AI" style="display:block; border:0; margin-bottom:12px;">
        <p style="margin:0 0 16px; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.7);">Dubai's AI agency. Custom AI systems, agents and automation, built around how your business already works.</p>
        <p style="margin:0 0 18px; font-size:13px; line-height:1.6;">
          ${link(`${SITE}/services`, 'Services')} <span style="color:rgba(255,255,255,0.35);">&nbsp;·&nbsp;</span>
          ${link(`${SITE}/blog`, 'Blog')} <span style="color:rgba(255,255,255,0.35);">&nbsp;·&nbsp;</span>
          ${link(`${SITE}/about`, 'About')} <span style="color:rgba(255,255,255,0.35);">&nbsp;·&nbsp;</span>
          ${link(`${SITE}/ar`, 'العربية')}
        </p>
        <p style="margin:0; padding-top:16px; border-top:1px solid rgba(255,255,255,0.12); font-size:12px; line-height:1.7; color:rgba(255,255,255,0.55);">
          ${note ? `${note}<br>` : ''}Lenoo AI · Dubai, UAE · Sun to Thu, 9am to 6pm GST ·
          <a href="${SITE}/privacy" style="color:rgba(255,255,255,0.55); text-decoration:underline;">Privacy</a>
        </p>
      </td></tr>`;
}

function shell(opts: { preheader: string; hero: Hero; body: string; footerNote?: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Lenoo AI</title>
</head>
<body style="margin:0; padding:0; background:#eef2f6;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 6px 24px rgba(0,37,59,0.08);">
      ${heroBlock(opts.hero)}
      <tr><td style="padding:36px 40px 36px; font-family:${FONT}; color:${INK};">
        ${opts.body}
      </td></tr>
      ${brandFooter(opts.footerNote)}
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function sectionLabel(text: string): string {
  return `<p style="margin:0 0 12px; font-family:${FONT}; font-size:12px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${TEAL};">${text}</p>`;
}

function para(text: string, extra = ''): string {
  return `<p style="margin:0 0 16px; font-size:16px; line-height:1.65; color:${INK}; ${extra}">${text}</p>`;
}

// Bulletproof buttons: a padded table cell keeps its shape in Outlook. Primary
// uses the site's teal CTA gradient, with a solid teal fallback.
function button(href: string, label: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const cell = variant === 'primary'
    ? `bgcolor="${TEAL}" style="background:${TEAL}; background-image:${GRAD_CTA}; border-radius:10px;"`
    : `style="background:#ffffff; border:1.5px solid ${NAVY}; border-radius:10px;"`;
  const color = variant === 'primary' ? '#ffffff' : NAVY;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table; margin:0 8px 10px 0;">
    <tr><td ${cell}>
      <a href="${href}" style="display:inline-block; padding:14px 24px; font-family:${FONT}; font-size:15px; font-weight:700; color:${color}; text-decoration:none;">${label}&nbsp;&rarr;</a>
    </td></tr>
  </table>`;
}

// Label/value rows; rows with no value are dropped rather than shown as a dash.
function detailsTable(rows: Array<[string, string | null | undefined]>): string {
  const filled = rows.filter(([, v]) => v && v.trim());
  if (!filled.length) return '';
  const trs = filled.map(([k, v], i) => `
    <tr>
      <td style="padding:12px 18px; width:34%; font-size:13px; font-weight:600; color:${MUTED}; ${i ? `border-top:1px solid ${LINE};` : ''}">${k}</td>
      <td style="padding:12px 18px; font-size:15px; color:${INK}; ${i ? `border-top:1px solid ${LINE};` : ''}">${v}</td>
    </tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 26px; background:${SOFT}; border:1px solid ${LINE}; border-radius:12px; font-family:${FONT};">${trs}</table>`;
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
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
    <td width="4" style="width:4px; background:${CYAN}; border-radius:2px;">&nbsp;</td>
    <td style="padding:14px 18px; background:${SOFT}; font-size:16px; line-height:1.6; color:${INK};">${esc(text).replace(/\n/g, '<br>')}</td>
  </tr></table>`;
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
    ${lead.duplicate_email ? `<p style="margin:0 0 22px; display:inline-block; padding:7px 12px; background:#fff4e0; border-radius:8px; font-size:13px; font-weight:700; color:#8a5300;">This email has submitted the form before</p>` : ''}
    ${lead.main_challenge ? `${sectionLabel('What they need')}${quote(lead.main_challenge)}` : ''}
    ${lead.notes ? `${sectionLabel('Notes')}${quote(lead.notes)}` : ''}
    ${sectionLabel('Contact details')}
    ${detailsTable([
      ['Email', `<a href="mailto:${esc(lead.work_email)}" style="color:${TEAL}; font-weight:600;">${esc(lead.work_email)}</a>`],
      ['WhatsApp', esc(lead.whatsapp)],
      ['Industry', esc(lead.industry)],
      ['Company size', esc(lead.company_size)],
      ['Budget', esc(lead.budget_range)],
      ['Meeting', meetingText(lead)],
    ])}
    <div>
      ${button(`${SITE}/admin/leads/${esc(lead.id)}`, 'Open in admin')}
      ${wa ? button(`https://wa.me/${wa}`, 'WhatsApp', 'secondary') : ''}
      ${button(`mailto:${esc(lead.work_email)}`, 'Email', 'secondary')}
    </div>`;
  return {
    subject: `New lead: ${lead.full_name}, ${lead.company_name}`,
    html: shell({
      preheader: `${lead.full_name} from ${lead.company_name} just asked for a consultation.`,
      hero: {
        eyebrow: `New lead${source ? ` · ${source}` : ''}`,
        title: esc(lead.full_name),
        intro: [lead.job_title, lead.company_name].filter(Boolean).map(esc).join(' at '),
      },
      body,
      footerNote: 'Sent by the lenooai.com contact form. The customer already received the automatic confirmation.',
    }),
  };
}

export function leadAutoReplyEmail(
  lead: LeadData, companyPhone: string, companyEmail: string, companyWhatsApp: string,
): { subject: string; html: string } {
  const wa = (companyWhatsApp ?? '').replace(/\D/g, '');
  const tel = (companyPhone ?? '').replace(/[^\d+]/g, '');
  const steps = [
    ['We review your request', 'A consultant reads what you sent before contacting you.'],
    ['We contact you within 24 hours', 'On WhatsApp or email, to confirm a time that suits you.'],
    ['We meet', 'You walk us through the work your team repeats every week. We tell you what can be automated and what it would cost.'],
  ].map(([title, rest], i, all) => `
    <tr>
      <td width="44" valign="top" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td width="30" height="30" align="center" valign="middle" bgcolor="${NAVY}" style="width:30px; height:30px; border-radius:15px; background:${NAVY}; color:${CYAN}; font-family:${DISPLAY}; font-size:14px; font-weight:800;">${i + 1}</td>
        </tr></table>
      </td>
      <td valign="top" style="padding:4px 0 ${i < all.length - 1 ? '20px' : '4px'}; font-family:${FONT};">
        <div style="font-size:16px; font-weight:700; color:${NAVY}; margin-bottom:3px;">${title}</div>
        <div style="font-size:15px; line-height:1.55; color:${MUTED};">${rest}</div>
      </td>
    </tr>`).join('');
  const body = `
    ${sectionLabel('What happens next')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">${steps}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px; border:1px solid ${LINE}; border-radius:12px;">
      <tr><td style="padding:20px 22px; font-family:${FONT};">
        <p style="margin:0 0 10px; font-size:15px; font-weight:800; color:${NAVY};">Before the call, have these ready</p>
        <table role="presentation" cellpadding="0" cellspacing="0">
          ${[
            'The one task that takes your team the most hours each week',
            'The tools you use today: CRM, WhatsApp, spreadsheets, accounting',
            'Who on your team would use the system day to day',
          ].map(t => `<tr><td valign="top" style="padding:3px 10px 3px 0; color:${TEAL}; font-size:14px;">&#10022;</td><td style="padding:3px 0; font-size:15px; line-height:1.55; color:${INK};">${t}</td></tr>`).join('')}
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 14px; font-size:16px; line-height:1.6; color:${INK};">Want to talk sooner? We're on WhatsApp.</p>
    <div>${wa ? button(`https://wa.me/${wa}`, 'Message us on WhatsApp') : ''}</div>
    <p style="margin:6px 0 28px; font-size:14px; line-height:1.7; color:${MUTED};">
      Or email <a href="mailto:${esc(companyEmail)}" style="color:${TEAL}; font-weight:600;">${esc(companyEmail)}</a>${tel ? ` · call <a href="tel:${tel}" style="color:${TEAL}; font-weight:600; white-space:nowrap;">${esc(companyPhone)}</a>` : ''}
    </p>
    ${trustStrip()}`;
  return {
    subject: `We've received your consultation request`,
    html: shell({
      preheader: `Thanks for reaching out. We'll contact you within 24 hours to confirm a time.`,
      hero: {
        eyebrow: 'Request received',
        title: `Thanks, ${esc(firstName(lead.full_name))}.`,
        highlight: `We've got your request.`,
        intro: `Your consultation request for <strong style="color:#ffffff;">${esc(lead.company_name)}</strong> is with our team in Dubai.`,
      },
      body,
    }),
  };
}

export function applicationNotificationEmail(app: ApplicationData): { subject: string; html: string } {
  const body = `
    ${sectionLabel('Applicant details')}
    ${detailsTable([
      ['Email', `<a href="mailto:${esc(app.email)}" style="color:${TEAL}; font-weight:600;">${esc(app.email)}</a>`],
      ['Phone', esc(app.phone)],
      ['LinkedIn', app.linkedin_url ? `<a href="${esc(app.linkedin_url)}" style="color:${TEAL}; font-weight:600;">${esc(app.linkedin_url)}</a>` : ''],
    ])}
    <div>
      ${button(esc(app.cv_url), 'Download CV')}
      ${button(`${SITE}/admin/applications`, 'Open in admin', 'secondary')}
    </div>`;
  return {
    subject: `New application: ${app.full_name} for ${app.job_title}`,
    html: shell({
      preheader: `${app.full_name} applied for ${app.job_title}.`,
      hero: { eyebrow: 'New application', title: esc(app.full_name), intro: `Applied for ${esc(app.job_title)}` },
      body,
      footerNote: 'Sent by the lenooai.com careers form.',
    }),
  };
}

export function staleLeadDigestEmail(leads: LeadData[]): { subject: string; html: string } {
  const n = leads.length;
  const rows = leads.map((l, i) => {
    const wa = (l.whatsapp ?? '').replace(/\D/g, '');
    const top = i ? `border-top:1px solid ${LINE};` : '';
    return `<tr>
      <td style="padding:14px 18px; ${top}">
        <div style="font-size:15px; font-weight:700; color:${NAVY};">${esc(l.full_name)}</div>
        <div style="font-size:13px; color:${MUTED};">${esc(l.company_name)}</div>
      </td>
      <td align="right" style="padding:14px 18px; font-size:14px; white-space:nowrap; ${top}">
        ${wa ? `<a href="https://wa.me/${wa}" style="color:${TEAL}; font-weight:700; text-decoration:none;">WhatsApp</a> &nbsp;·&nbsp; ` : ''}
        <a href="${SITE}/admin/leads/${esc(l.id)}" style="color:${TEAL}; font-weight:700; text-decoration:none;">Open</a>
      </td>
    </tr>`;
  }).join('');
  const body = `
    ${para('Nobody has replied to these yet. A short message now still beats silence.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 26px; background:${SOFT}; border:1px solid ${LINE}; border-radius:12px; font-family:${FONT};">${rows}</table>
    ${button(`${SITE}/admin/leads`, 'See all leads')}`;
  return {
    subject: `${n} lead${n > 1 ? 's' : ''} need${n > 1 ? '' : 's'} a follow-up`,
    html: shell({
      preheader: `${n} lead${n > 1 ? 's are' : ' is'} still waiting for a reply.`,
      hero: { eyebrow: 'Follow-up reminder', title: `${n} lead${n > 1 ? 's have' : ' has'} waited 5+ days` },
      body,
    }),
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
