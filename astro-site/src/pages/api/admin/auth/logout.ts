import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const cookieOpts = { path: '/', httpOnly: true, secure: true, sameSite: 'lax' as const };
  cookies.delete('sb-access-token', cookieOpts);
  cookies.delete('sb-refresh-token', cookieOpts);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
