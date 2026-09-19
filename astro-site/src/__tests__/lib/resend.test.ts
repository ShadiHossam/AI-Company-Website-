import { describe, it, expect } from 'vitest';
import { adminNotificationEmail, leadAutoReplyEmail, staleLeadDigestEmail } from '../../lib/resend';

const lead = {
  id: 'lead-1',
  full_name: 'Sara Al Mansoori',
  company_name: 'Gulf Dental Group',
  work_email: 'sara@gulfdental.ae',
  whatsapp: '+971 50 123 4567',
};

describe('leadAutoReplyEmail', () => {
  const reply = (extra = {}) =>
    leadAutoReplyEmail({ ...lead, ...extra }, '+971 50 195 1590', 'info@lenooai.com', '971501951590');

  it('promises a 24-hour reply, never 4 hours', () => {
    const { html } = reply();
    expect(html).toContain('within 24 hours');
    expect(html).not.toMatch(/\b4 (business )?hours/);
  });

  it('greets by first name and escapes user input', () => {
    const { html } = reply({ full_name: '<b>Sara</b> Al Mansoori', company_name: 'A & B <Co>' });
    expect(html).toContain('Thanks, &lt;b&gt;Sara&lt;/b&gt;.');
    expect(html).toContain('A &amp; B &lt;Co&gt;');
    expect(html).not.toContain('<b>Sara</b>');
  });

  it('uses the configured contact details', () => {
    const { html } = reply();
    expect(html).toContain('https://wa.me/971501951590');
    expect(html).toContain('mailto:info@lenooai.com');
    expect(html).toContain('tel:+971501951590');
  });

  it('formats the meeting date and omits the row when there is no meeting', () => {
    expect(reply({ meeting_format: 'Video call', preferred_date: '2026-09-22', preferred_time: '11:00' }).html)
      .toMatch(/Video call · Tue 22 Sept?, 11:00/);
    expect(reply().html).not.toContain('Your preferred meeting');
  });

  it('has no em dash in the subject', () => {
    expect(reply().subject).not.toContain('—');
  });
});

describe('adminNotificationEmail', () => {
  it('shows what the lead needs and flags repeat submissions', () => {
    const { html, subject } = adminNotificationEmail({
      ...lead,
      main_challenge: 'Front desk\nchases insurance approvals',
      duplicate_email: true,
    });
    expect(subject).toBe('New lead: Sara Al Mansoori, Gulf Dental Group');
    expect(html).toContain('Front desk<br>chases insurance approvals');
    expect(html).toContain('submitted the form before');
  });

  it('drops empty fields instead of rendering dashes', () => {
    const { html } = adminNotificationEmail(lead);
    expect(html).not.toContain('>Budget<');
    expect(html).not.toContain('>—<');
    expect(html).not.toContain('What they need');
  });
});

describe('staleLeadDigestEmail', () => {
  it('pluralises the subject', () => {
    expect(staleLeadDigestEmail([lead]).subject).toBe('1 lead needs a follow-up');
    expect(staleLeadDigestEmail([lead, lead]).subject).toBe('2 leads need a follow-up');
  });
});
