import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { isTrustedOrigin } from '../../lib/trusted-origin';
import { getClientIp, createRateLimiter } from '../../lib/request-safety';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendSubscriberNotification, sendNewsletterWelcome } from '../../lib/resend';
import { COMPANY } from '../../config/company';

export const prerender = false;

// Resend segment "General" that newsletter signups are added to.
const NEWSLETTER_SEGMENT_ID = '5efd3d1b-5de9-49f9-b626-d73af4f19c63';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory, per process: 5 submissions per IP per 10 minutes.
const checkRateLimit = createRateLimiter(5, 10 * 60 * 1000);

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // CSRF: only accept requests from our own origin
  if (!isTrustedOrigin(request)) return json({ error: 'Forbidden' }, 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ error: 'Invalid JSON' }, 400);

  // Honeypot: if filled, silently succeed without subscribing
  if (body.website) return json({ success: true }, 200);

  const email = (typeof body.email === 'string' ? body.email : '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return json({ error: 'Invalid email' }, 400);

  const ip = getClientIp(request, clientAddress);
  if (!checkRateLimit(ip)) return json({ error: 'Too many requests' }, 429);

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  // Resend's create acts as an upsert and never reports a duplicate, so look the
  // contact up first. Only a first signup gets the welcome email and the admin alert.
  let error: { message: string } | null;
  try {
    const existing = await resend.contacts.get(email);
    if (existing.data) return json({ success: true }, 200);

    ({ error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: NEWSLETTER_SEGMENT_ID }],
    }));
  } catch (err) {
    // A network failure reaching Resend used to escape as an unhandled 500.
    error = { message: String(err) };
  }

  if (error) {
    console.error('[subscribe] Resend error:', error.message);
    return json({ error: 'Subscription failed' }, 502);
  }

  // Emails are best-effort: the contact is saved, so a failed send must not fail the signup
  try {
    await sendNewsletterWelcome(email, COMPANY.email);
  } catch (err) {
    console.error('[subscribe] Welcome email failed:', err);
  }

  try {
    const { data } = await getSupabaseAdmin()
      .from('site_config')
      .select('value')
      .eq('key', 'integration.admin_notify_email')
      .maybeSingle();
    const adminEmail = (data as { value?: string } | null)?.value;
    const pageUrl = request.headers.get('referer') ?? '';
    if (adminEmail) await sendSubscriberNotification(email, pageUrl, adminEmail);
  } catch (err) {
    console.error('[subscribe] Admin notification failed:', err);
  }

  return json({ success: true }, 200);
};
