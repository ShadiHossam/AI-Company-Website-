import type { APIRoute } from 'astro';
import { supabaseBrowser } from '../../../../lib/supabase-browser';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const origin = request.headers.get('origin');
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
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

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
  }

  if (!supabaseBrowser) {
    return new Response(JSON.stringify({ error: 'Auth not configured' }), { status: 503 });
  }

  const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  const { access_token, refresh_token, expires_in } = data.session;

  cookies.set('sb-access-token', access_token, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    maxAge: expires_in,
  });
  cookies.set('sb-refresh-token', refresh_token, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
