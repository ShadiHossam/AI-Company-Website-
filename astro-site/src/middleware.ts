import { defineMiddleware } from 'astro:middleware';
import { verifyJWT, extractRole } from './lib/jwt';
import { getSupabaseAdmin } from './lib/supabase';
import type { AppRole } from './lib/jwt';

const STATIC_PREFIXES = ['/_astro/', '/assets/', '/favicon', '/_image'];
const ADMIN_PUBLIC_PATHS = ['/admin/login'];
const EDITOR_ALLOWED = ['/admin/content', '/admin/blog', '/admin/media', '/admin/seo', '/admin/notifications'];
const SALES_ALLOWED = ['/admin/leads', '/admin/notifications'];

// API routes accessible to non-super_admin roles
const API_EDITOR_ALLOWED = [
  '/api/admin/content', '/api/admin/blog', '/api/admin/media',
  '/api/admin/seo', '/api/admin/notifications', '/api/admin/dashboard',
];
const API_SALES_ALLOWED = ['/api/admin/leads', '/api/admin/notifications', '/api/admin/dashboard'];

function isApiAllowed(pathname: string, role: AppRole): boolean {
  if (role === 'super_admin') return true;
  const list = role === 'editor' ? API_EDITOR_ALLOWED : API_SALES_ALLOWED;
  return list.some(p => pathname.startsWith(p));
}

function unauthorized401(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401, headers: { 'Content-Type': 'application/json' },
  });
}

function forbidden403(): Response {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403, headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip static assets
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return next();
  }

  // DB redirect check (for non-admin, non-api paths)
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_')) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('redirects')
        .select('to_path,status_code')
        .eq('from_path', pathname)
        .eq('active', true)
        .single();
      if (data && data.to_path.startsWith('/') && !data.to_path.startsWith('//')) {
        const safeCode = [301, 302, 307, 308].includes(data.status_code) ? data.status_code : 301;
        return context.redirect(data.to_path, safeCode);
      }
    } catch {
      // Table may not exist yet — continue
    }
  }

  // Maintenance mode check (public routes only)
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && pathname !== '/maintenance') {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'system.maintenance_mode')
        .single();
      if (data?.value === 'true') {
        const allowedIPs = await (async () => {
          const { data: ipData } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'system.maintenance_allowed_ips')
            .single();
          return (ipData?.value ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
        })();
        const ip = context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
        if (!allowedIPs.includes(ip)) {
          return context.redirect('/maintenance');
        }
      }
    } catch {
      // Table may not exist yet — continue
    }
  }

  // Admin auth check
  if (pathname.startsWith('/admin')) {
    // Login page is public
    if (ADMIN_PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '?'))) {
      return next();
    }

    const token = context.cookies.get('sb-access-token')?.value;
    if (!token) {
      return context.redirect('/admin/login');
    }

    let payload;
    try {
      payload = await verifyJWT(token);
    } catch {
      context.cookies.delete('sb-access-token', { path: '/' });
      return context.redirect('/admin/login?error=session_expired');
    }

    const role = extractRole(payload);
    if (!role) {
      context.cookies.delete('sb-access-token', { path: '/' });
      return context.redirect('/admin/login?error=no_role');
    }
    context.locals.user = { id: payload.sub, email: payload.email, role };

    // Role-based route guarding
    if (role === 'editor') {
      const allowed = EDITOR_ALLOWED.some(p => pathname.startsWith(p)) || pathname === '/admin';
      if (!allowed) return context.redirect('/admin?error=unauthorized');
    }
    if (role === 'sales') {
      const allowed = SALES_ALLOWED.some(p => pathname.startsWith(p)) || pathname === '/admin';
      if (!allowed) return context.redirect('/admin?error=unauthorized');
    }
  }

  // API admin auth + role check
  if (pathname.startsWith('/api/admin')) {
    const token = context.cookies.get('sb-access-token')?.value;
    if (!token) return unauthorized401();
    try {
      const payload = await verifyJWT(token);
      const role = extractRole(payload);
      if (!role) return unauthorized401();
      if (!isApiAllowed(pathname, role)) return forbidden403();
      context.locals.user = { id: payload.sub, email: payload.email, role };
    } catch {
      return unauthorized401();
    }
  }

  return next();
});
