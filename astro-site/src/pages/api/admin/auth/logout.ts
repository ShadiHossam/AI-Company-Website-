import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  // Revoke the Supabase session server-side as well, so a copied access token's
  // refresh token stops working. Best effort: the cookies are cleared regardless.
  const token = cookies.get('sb-access-token')?.value;
  if (token) {
    try {
      const { error } = await getSupabaseAdmin().auth.admin.signOut(token);
      if (error) console.error('[logout] signOut failed:', error.message);
    } catch (e) {
      console.error('[logout] signOut failed:', e);
    }
  }
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
