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
}

export async function sendAdminNotification(lead: LeadData, adminEmail: string): Promise<void> {
  const resend = getResend();
  const source = lead.page_source ? ` (via ${esc(lead.page_source.replace(/_/g, ' '))})` : '';
  const safeWhatsapp = (lead.whatsapp ?? '').replace(/\D/g, '');
  await resend.emails.send({
    from: 'Aegis AI Leads <noreply@aegisai.ae>',
    to: adminEmail,
    subject: `New Lead: ${lead.full_name} from ${lead.company_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #00e3fd;">New Lead Submitted${source}</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Name</td><td style="padding:8px;">${esc(lead.full_name)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px; font-weight:bold;">Company</td><td style="padding:8px;">${esc(lead.company_name)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Email</td><td style="padding:8px;">${esc(lead.work_email)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px; font-weight:bold;">WhatsApp</td><td style="padding:8px;">${esc(lead.whatsapp)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Industry</td><td style="padding:8px;">${esc(lead.industry ?? '—')}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px; font-weight:bold;">Budget</td><td style="padding:8px;">${esc(lead.budget_range ?? '—')}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Meeting</td><td style="padding:8px;">${esc(lead.meeting_format ?? '—')} · ${esc(lead.preferred_date ?? '—')} ${esc(lead.preferred_time ?? '')}</td></tr>
        </table>
        <p style="margin-top:24px;">
          <a href="https://aegisai.ae/admin/leads/${esc(lead.id)}" style="background:#00e3fd; color:#0a0f1a; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">View Lead in Admin →</a>
        </p>
        <p style="color:#666; font-size:12px;">Quick actions:
          <a href="https://wa.me/${safeWhatsapp}">Open WhatsApp</a> ·
          <a href="mailto:${esc(lead.work_email)}">Send Email</a>
        </p>
      </div>
    `,
  });
}

export async function sendLeadAutoReply(lead: LeadData, companyPhone: string, companyEmail: string, companyWhatsApp: string): Promise<void> {
  const resend = getResend();
  const meetingLine = lead.meeting_format
    ? `<p><strong>Meeting type:</strong> ${esc(lead.meeting_format)}${lead.preferred_date ? ` · ${esc(lead.preferred_date)}` : ''}${lead.preferred_time ? ` · ${esc(lead.preferred_time)}` : ''}</p>`
    : '';
  await resend.emails.send({
    from: 'Aegis AI <hello@aegisai.ae>',
    to: lead.work_email,
    subject: `We've received your consultation request — Aegis AI`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #1a1a2e;">
        <div style="background: #0a0f1a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #00e3fd; margin: 0; font-size: 22px;">Aegis AI</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="margin-top:0;">Hi ${esc(lead.full_name)},</h2>
          <p>Thank you for reaching out. We've received your consultation request and our team will be in touch within <strong>4 business hours</strong>.</p>
          <div style="background:#f8fafc; border-left: 4px solid #00e3fd; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
            <p style="margin:0 0 8px;"><strong>Your request summary:</strong></p>
            <p style="margin:4px 0;"><strong>Company:</strong> ${esc(lead.company_name)}</p>
            <p style="margin:4px 0;"><strong>Industry:</strong> ${esc(lead.industry ?? '—')}</p>
            ${meetingLine}
          </div>
          <p>In the meantime, feel free to reach us directly:</p>
          <ul style="padding-left: 20px;">
            <li>📱 WhatsApp: <a href="https://wa.me/${companyWhatsApp}">Message us now</a></li>
            <li>📧 Email: <a href="mailto:${companyEmail}">${companyEmail}</a></li>
            <li>📞 Phone: ${companyPhone}</li>
          </ul>
          <p style="color:#666; font-size:13px; margin-top:32px; border-top:1px solid #e5e7eb; padding-top:16px;">
            Aegis AI · Dubai, UAE · Sun – Thu, 9am – 6pm GST<br>
            <a href="https://aegisai.ae/privacy" style="color:#999;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendApplicationNotification(
  app: { id: string; full_name: string; email: string; job_title: string; phone?: string; linkedin_url?: string; cv_url: string },
  adminEmail: string
): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: 'Aegis AI Careers <noreply@aegisai.ae>',
    to: adminEmail,
    subject: `New Application: ${esc(app.full_name)} for ${esc(app.job_title)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #00e3fd;">New Job Application</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Name</td><td style="padding:8px;">${esc(app.full_name)}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px; font-weight:bold;">Email</td><td style="padding:8px;">${esc(app.email)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Phone</td><td style="padding:8px;">${esc(app.phone ?? '—')}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px; font-weight:bold;">Role</td><td style="padding:8px;">${esc(app.job_title)}</td></tr>
          ${app.linkedin_url ? `<tr><td style="padding:8px; font-weight:bold;">LinkedIn</td><td style="padding:8px;"><a href="${esc(app.linkedin_url)}">${esc(app.linkedin_url)}</a></td></tr>` : ''}
        </table>
        <p style="margin-top:24px; display:flex; gap:12px;">
          <a href="https://aegisai.ae/admin/applications" style="background:#00e3fd; color:#0a0f1a; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">View in Admin →</a>
          <a href="${esc(app.cv_url)}" style="background:#f0f3ff; color:#00253b; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block; margin-left:8px;">Download CV →</a>
        </p>
      </div>
    `,
  });
}

export async function sendStaleLeadDigest(leads: LeadData[], adminEmail: string): Promise<void> {
  if (!leads.length) return;
  const resend = getResend();
  const rows = leads.map(l =>
    `<tr><td style="padding:8px;">${esc(l.full_name)}</td><td style="padding:8px;">${esc(l.company_name)}</td><td style="padding:8px;"><a href="https://wa.me/${(l.whatsapp ?? '').replace(/\D/g, '')}">WhatsApp</a></td><td style="padding:8px;"><a href="https://aegisai.ae/admin/leads/${esc(l.id)}">View</a></td></tr>`
  ).join('');
  await resend.emails.send({
    from: 'Aegis AI <noreply@aegisai.ae>',
    to: adminEmail,
    subject: `⏰ ${leads.length} lead${leads.length > 1 ? 's' : ''} need follow-up — Aegis AI`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>Leads awaiting follow-up (5+ days)</h2>
        <table style="width:100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
          <thead><tr style="background:#f5f5f5;">
            <th style="padding:8px; text-align:left;">Name</th>
            <th style="padding:8px; text-align:left;">Company</th>
            <th style="padding:8px; text-align:left;">WhatsApp</th>
            <th style="padding:8px; text-align:left;">Admin</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><a href="https://aegisai.ae/admin/leads" style="background:#00e3fd; color:#0a0f1a; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">View All Leads →</a></p>
      </div>
    `,
  });
}
