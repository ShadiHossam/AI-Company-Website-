import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendApplicationNotification } from '../../lib/resend';
import { isTrustedOrigin } from '../../lib/trusted-origin';
import { getClientIp, createRateLimiter, normaliseWebUrl } from '../../lib/request-safety';

export const prerender = false;

// In-memory, per process: 5 submissions per IP per 10 minutes.
const checkRateLimit = createRateLimiter(5, 10 * 60 * 1000);

export const POST: APIRoute = async ({ request, clientAddress }) => {
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
  // Every field is read as a string capped at a sane length, so a null, number or
  // huge value can't crash .trim() or bloat the row.
  const field = (k: string, max = 500) => {
    const v = (raw as Record<string, unknown>)[k];
    return typeof v === 'string' ? v.slice(0, max) : '';
  };
  const body = {
    job_id: field('job_id'), job_title: field('job_title'), full_name: field('full_name'),
    email: field('email', 254), cv_url: field('cv_url', 1000), cover_letter: field('cover_letter', 10000),
    phone: field('phone', 50), linkedin_url: field('linkedin_url', 1000),
    portfolio_url: field('portfolio_url', 1000), how_heard: field('how_heard'),
  };

  const ip = getClientIp(request, clientAddress);
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  const { job_id, job_title, full_name, email, cv_url, cover_letter, phone, linkedin_url, portfolio_url, how_heard } = body;

  if (!job_id.trim() || !job_title.trim() || !full_name.trim() || !email.trim() || !cv_url.trim() || !cover_letter.trim()) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  // Links are rendered as <a href> in the admin, so they must parse as http(s)
  // URLs (a scheme regex let "java\tscript:" through). The CV is the object path
  // /api/cv-upload issued in the private bucket, never a URL, so an applicant
  // can't point admins at a page of their choosing.
  const cvPath = cv_url.trim();
  const linkedinUrl = normaliseWebUrl(linkedin_url);
  const portfolioUrl = normaliseWebUrl(portfolio_url);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx?)$/.test(cvPath)
    || (linkedin_url.trim() && !linkedinUrl) || (portfolio_url.trim() && !portfolioUrl)) {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: inserted, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: job_id.trim(),
      job_title: job_title.trim(),
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      cv_url: cvPath,
      cover_letter: cover_letter.trim(),
      how_heard: how_heard.trim() || null,
      status: 'new',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[apply] insert error:', error.message);
    return new Response(JSON.stringify({ error: 'Submission failed' }), { status: 500 });
  }

  ;(async () => {
    try {
      const { data: configRows } = await supabase
        .from('site_config')
        .select('key, value')
        .eq('key', 'integration.admin_notify_email');
      const adminEmail = configRows?.[0]?.value;
      if (adminEmail) {
        await sendApplicationNotification(
          { id: inserted.id, full_name: full_name.trim(), email: email.trim(), job_title: job_title.trim(), phone: phone.trim(), linkedin_url: linkedinUrl ?? undefined, cv_url: cvPath },
          adminEmail
        );
      }
    } catch (e) {
      console.error('[apply] email error:', e);
    }
  })();

  return new Response(JSON.stringify({ success: true, id: inserted.id }), { status: 200 });
};
