import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendApplicationNotification } from '../../lib/resend';

export const prerender = false;

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

const CSRF_CHECK = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const POST: APIRoute = async ({ request }) => {
  if (!CSRF_CHECK(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  const { job_id, job_title, full_name, email, cv_url, cover_letter, phone, linkedin_url, portfolio_url, how_heard } = body;

  if (!job_id?.trim() || !job_title?.trim() || !full_name?.trim() || !email?.trim() || !cv_url?.trim() || !cover_letter?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: inserted, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: job_id.trim(),
      job_title: job_title.trim(),
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      linkedin_url: linkedin_url?.trim() || null,
      portfolio_url: portfolio_url?.trim() || null,
      cv_url: cv_url.trim(),
      cover_letter: cover_letter.trim(),
      how_heard: how_heard?.trim() || null,
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
          { id: inserted.id, full_name: full_name.trim(), email: email.trim(), job_title: job_title.trim(), phone: phone?.trim(), linkedin_url: linkedin_url?.trim(), cv_url: cv_url.trim() },
          adminEmail
        );
      }
    } catch (e) {
      console.error('[apply] email error:', e);
    }
  })();

  return new Response(JSON.stringify({ success: true, id: inserted.id }), { status: 200 });
};
