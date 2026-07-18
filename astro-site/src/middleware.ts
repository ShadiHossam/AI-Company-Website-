import { defineMiddleware } from 'astro:middleware';
import { verifyJWT, extractRole } from './lib/jwt';
import { getSupabaseAdmin } from './lib/supabase';

const supabaseConfigured = (() => {
  const url = import.meta.env.SUPABASE_URL ?? '';
  return url.length > 0 && !url.includes('placeholder');
})();

// DEPLOY_TARGET only selects the Node vs Vercel adapter — both the staging mirror and
// lenooai.com production run the Node adapter now, so the HTTPS-pending CSP carve-out
// below stays keyed off it (both o2switch-hosted domains lack a trusted cert until
// AutoSSL issues one).
const isNodeAdapter = import.meta.env.DEPLOY_TARGET === 'o2switch';

// Staging deployments (e.g. the o2switch mirror subdomain) must never be indexed —
// canonical tags alone are a hint, not a directive, so this blocks crawlers outright.
// Deliberately separate from isNodeAdapter: lenooai.com is also o2switch-hosted now,
// but must stay indexable.
const isStaging = import.meta.env.IS_STAGING === 'true';

// Vercel's edge layer applies these from vercel.json, but that file only takes effect
// on Vercel — the o2switch Node server never reads it, so without this every response
// there would ship with zero CSP/clickjacking/MIME-sniffing protection. Applied
// unconditionally so both deploy targets get them (redundant-but-harmless on Vercel,
// since Response.headers.set() just overwrites the value Vercel already set).
// Only the vendor origins for currently-configured integrations belong here — verified
// against live site_config (2026-07-16): every integration.* key is empty except a
// placeholder Mailchimp URL, so no tracking/chat vendor is actually wired up yet. Add an
// origin back only when its integration is turned on for real in the admin settings.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co",
  // 'self' is required for the sandboxed snippet-preview iframe (admin/settings/snippets) —
  // safe because that iframe uses sandbox="allow-scripts" with no allow-same-origin, so
  // embedded content still can't touch this page's DOM, cookies, or storage.
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Forces every same-origin request onto HTTPS — correct on Vercel (always valid HTTPS),
  // but would break an o2switch-hosted domain while it's still serving plain HTTP with
  // no trusted cert (AutoSSL pending), so it's left out there.
  ...(isNodeAdapter ? [] : ['upgrade-insecure-requests']),
].join('; ');

function applySecurityHeaders(response: Response): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', CSP);
}

const STATIC_PREFIXES = ['/_astro/', '/assets/', '/favicon', '/_image'];
const ADMIN_PUBLIC_PATHS = ['/admin/login'];
const API_PUBLIC_PATHS = ['/api/admin/auth/login', '/api/admin/auth/logout'];

// In-memory cache: full redirects table as Map<from_path, {to_path, status_code}>
let redirectsMap: Map<string, { to_path: string; status_code: number }> | null = null;
let redirectsExp = 0;
const REDIRECTS_TTL = 60_000;

async function getRedirectFor(pathname: string): Promise<{ to_path: string; status_code: number } | null> {
  const now = Date.now();
  if (!redirectsMap || now >= redirectsExp) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('redirects')
        .select('from_path, to_path, status_code')
        .eq('active', true);
      redirectsMap = new Map((data ?? []).map((r: { from_path: string; to_path: string; status_code: number }) => [r.from_path, { to_path: r.to_path, status_code: r.status_code }]));
      redirectsExp = now + REDIRECTS_TTL;
    } catch {
      redirectsMap = redirectsMap ?? new Map();
      redirectsExp = now + 5_000;
    }
  }
  return redirectsMap.get(pathname) ?? null;
}

// In-memory cache: maintenance mode state (batches both config keys into one query)
let maintenanceState: { enabled: boolean; allowedIPs: string[] } | null = null;
let maintenanceExp = 0;
const MAINTENANCE_TTL = 30_000;

async function getMaintenanceState(): Promise<{ enabled: boolean; allowedIPs: string[] }> {
  const now = Date.now();
  if (maintenanceState && now < maintenanceExp) return maintenanceState;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['system.maintenance_mode', 'system.maintenance_allowed_ips']);
    const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    maintenanceState = {
      enabled: map['system.maintenance_mode'] === 'true',
      allowedIPs: (map['system.maintenance_allowed_ips'] ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    maintenanceExp = now + MAINTENANCE_TTL;
    return maintenanceState;
  } catch {
    maintenanceState = maintenanceState ?? { enabled: false, allowedIPs: [] };
    maintenanceExp = Date.now() + 5_000;
    return maintenanceState;
  }
}

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
  settings:      ['/admin/settings', '/admin/trash'],
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
  settings:      ['/api/admin/config', '/api/admin/banner', '/api/admin/redirects', '/api/admin/snippets', '/api/admin/trash'],
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

// Plain 403 response (no redirect) for authenticated-but-insufficient-permission page
// requests — redirecting to /admin/login would loop, since that page bounces any
// holder of a valid session cookie straight back to /admin.
function forbiddenPage(): Response {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>Forbidden</title>' +
      '<body style="font-family:sans-serif;padding:4rem;text-align:center;">' +
      '<h1>403 — Forbidden</h1><p>Your account does not have access to this section.</p>' +
      '<a href="/">Back to site</a></body>',
    { status: 403, headers: { 'Content-Type': 'text/html' } }
  );
}

export function __resetCachesForTest() {
  redirectsMap = null;
  redirectsExp = 0;
  maintenanceState = null;
  maintenanceExp = 0;
  roleCache.clear();
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip static assets (still gets security headers — Vercel's edge rule covers these too)
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    const response = await next();
    applySecurityHeaders(response);
    return response;
  }

  // DB redirect check + maintenance check (public routes only) — both use in-memory caches
  const isPublicRoute = supabaseConfigured && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_');
  if (isPublicRoute) {
    // Redirect lookup: O(1) Map lookup after first warm (cache refreshes every 60s)
    const redirect = await getRedirectFor(pathname);
    if (redirect && redirect.to_path.startsWith('/') && !redirect.to_path.startsWith('//')) {
      const safeCode = ([301, 302, 307, 308].includes(redirect.status_code) ? redirect.status_code : 301) as 301 | 302 | 307 | 308;
      return context.redirect(redirect.to_path, safeCode);
    }

    // Maintenance check: cached for 30s; batches both config keys into one query
    if (pathname !== '/maintenance') {
      const maintenance = await getMaintenanceState();
      if (maintenance.enabled) {
        const ip = context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
        if (!maintenance.allowedIPs.includes(ip)) {
          return context.redirect('/maintenance');
        }
      }
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
      // The bare /admin dashboard queries data directly (not through the section-gated
      // API), so it requires the 'dashboard' section like any other admin page rather
      // than being open to any authenticated-but-sectionless role. Fail closed with a
      // plain 403 (not a redirect) — /admin/login bounces any valid-cookie holder
      // straight back to /admin, which would loop.
      const allowed = isAdminPathAllowed(pathname, sections);
      if (!allowed) return forbiddenPage();
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

  const response = await next();

  applySecurityHeaders(response);

  if (isStaging) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Add edge-cache headers for public HTML pages that haven't set their own Cache-Control.
  // Vercel will serve cached HTML from the edge CDN and revalidate in the background.
  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_') &&
    !response.headers.has('Cache-Control')
  ) {
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  }

  return response;
});
