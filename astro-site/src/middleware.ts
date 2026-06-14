import { defineMiddleware } from 'astro:middleware';
import { verifyJWT, extractRole } from './lib/jwt';
import { getSupabaseAdmin } from './lib/supabase';

const supabaseConfigured = (() => {
  const url = import.meta.env.SUPABASE_URL ?? '';
  return url.length > 0 && !url.includes('placeholder');
})();

const STATIC_PREFIXES = ['/_astro/', '/assets/', '/favicon', '/_image'];
const ADMIN_PUBLIC_PATHS = ['/admin/login'];
const API_PUBLIC_PATHS = ['/api/admin/auth/login', '/api/admin/auth/logout'];

// Section key → admin page prefixes
const SECTION_ADMIN: Record<string, string[]> = {
  dashboard:     ['/admin'],
  blog:          ['/admin/blog'],
  content:       ['/admin/content'],
  media:         ['/admin/media'],
  leads:         ['/admin/leads'],
  jobs:          ['/admin/jobs'],
  applications:  ['/admin/applications'],
  notifications: ['/admin/notifications'],
  seo:           ['/admin/seo'],
  activity:      ['/admin/activity'],
  settings:      ['/admin/settings'],
  users:         ['/admin/settings/users'],
};

// Section key → API prefixes
const SECTION_API: Record<string, string[]> = {
  dashboard:     ['/api/admin/dashboard'],
  blog:          ['/api/admin/blog'],
  content:       ['/api/admin/content'],
  media:         ['/api/admin/media'],
  leads:         ['/api/admin/leads'],
  jobs:          ['/api/admin/jobs'],
  applications:  ['/api/admin/applications'],
  notifications: ['/api/admin/notifications'],
  seo:           ['/api/admin/seo'],
  activity:      ['/api/admin/activity'],
  settings:      ['/api/admin/config', '/api/admin/banner', '/api/admin/redirects'],
  users:         ['/api/admin/users'],
};

// Short-lived in-memory cache: role name → { sections, expiry }
const roleCache = new Map<string, { sections: string[]; exp: number }>();
const CACHE_TTL = 60_000;

async function getAllowedSections(roleName: string): Promise<string[]> {
  const hit = roleCache.get(roleName);
  if (hit && Date.now() < hit.exp) return hit.sections;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', `admin.role.${roleName}`)
      .single();
    if (!data) return [];
    const roleData = JSON.parse(data.value) as { sections?: string[] };
    const sections: string[] = roleData.sections ?? [];
    roleCache.set(roleName, { sections, exp: Date.now() + CACHE_TTL });
    return sections;
  } catch {
    return [];
  }
}

function isAdminPathAllowed(pathname: string, sections: string[]): boolean {
  return sections.some(s => {
    const paths = SECTION_ADMIN[s] ?? [];
    return paths.some(p => pathname === p || pathname.startsWith(p + '/') || (s === 'dashboard' && pathname === '/admin'));
  });
}

function isApiPathAllowed(pathname: string, sections: string[]): boolean {
  return sections.some(s => {
    const paths = SECTION_API[s] ?? [];
    return paths.some(p => pathname.startsWith(p));
  });
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

  // DB redirect check (public routes)
  if (supabaseConfigured && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_')) {
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
  if (supabaseConfigured && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && pathname !== '/maintenance') {
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

  // Admin page auth + role check
  if (pathname.startsWith('/admin')) {
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

    // super_admin: unrestricted
    if (role !== 'super_admin') {
      const sections = await getAllowedSections(role);
      const allowed = pathname === '/admin' || isAdminPathAllowed(pathname, sections);
      if (!allowed) return context.redirect('/admin?error=unauthorized');
    }
  }

  // API admin auth + role check
  if (pathname.startsWith('/api/admin') && !API_PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    const token = context.cookies.get('sb-access-token')?.value;
    if (!token) return unauthorized401();
    try {
      const payload = await verifyJWT(token);
      const role = extractRole(payload);
      if (!role) return unauthorized401();
      context.locals.user = { id: payload.sub, email: payload.email, role };
      if (role !== 'super_admin') {
        const sections = await getAllowedSections(role);
        if (!isApiPathAllowed(pathname, sections)) return forbidden403();
      }
    } catch {
      return unauthorized401();
    }
  }

  return next();
});
