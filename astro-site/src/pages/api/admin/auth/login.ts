import type { APIRoute } from 'astro';
import { supabaseBrowser } from '../../../../lib/supabase-browser';
import { getClientIp, createRateLimiter } from '../../../../lib/request-safety';

export const prerender = false;

// Brute-force protection, in memory per process: 10 attempts per IP and 10 per
// email address per 15 minutes. The per-email limit stops a password-spraying
// run that rotates IPs from hammering one admin account.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const checkIpLimit = createRateLimiter(10, LOGIN_WINDOW_MS);
const checkEmailLimit = createRateLimiter(10, LOGIN_WINDOW_MS);

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const origin = request.headers.get('origin');
  const siteUrl = import.meta.env.SITE_URL ?? 'https://lenooai.com';
  if (!import.meta.env.DEV && origin !== siteUrl) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let email: string, password: string;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
  }

  const ip = getClientIp(request, clientAddress);
  // Count the attempt against both limits before checking either.
  const ipOk = checkIpLimit(ip);
  const emailOk = checkEmailLimit(email.trim().toLowerCase());
  if (!ipOk || !emailOk) {
    return new Response(JSON.stringify({ error: 'Too many login attempts. Try again later.' }), { status: 429 });
  }

  if (!supabaseBrowser) {
    return new Response(JSON.stringify({ error: 'Auth not configured' }), { status: 503 });
  }

  const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  // Only the access token is kept: nothing ever used the refresh token, and a
  // 30-day cookie holding it just widened what a stolen cookie jar would give away.
  const { access_token, expires_in } = data.session;

  cookies.set('sb-access-token', access_token, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    maxAge: expires_in,
  });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
