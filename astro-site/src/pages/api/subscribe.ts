import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { isTrustedOrigin } from '../../lib/trusted-origin';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendSubscriberNotification, sendNewsletterWelcome } from '../../lib/resend';
import { COMPANY } from '../../config/company';

export const prerender = false;

// Resend segment "General" that newsletter signups are added to.
const NEWSLETTER_SEGMENT_ID = '5efd3d1b-5de9-49f9-b626-d73af4f19c63';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory IP rate limit store — resets per cold start, same approach as submit-lead
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

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  // CSRF: only accept requests from our own origin
  if (!isTrustedOrigin(request)) return json({ error: 'Forbidden' }, 403);

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Honeypot: if filled, silently succeed without subscribing
  if (body.website) return json({ success: true }, 200);

  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return json({ error: 'Invalid email' }, 400);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  if (!checkRateLimit(ip)) return json({ error: 'Too many requests' }, 429);

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  // Resend's create acts as an upsert and never reports a duplicate, so look the
  // contact up first. Only a first signup gets the welcome email and the admin alert.
  const existing = await resend.contacts.get(email);
  if (existing.data) return json({ success: true }, 200);

  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: NEWSLETTER_SEGMENT_ID }],
  });

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
