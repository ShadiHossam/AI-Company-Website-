import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from './helpers';

// astro:middleware is a virtual Astro module — mock it so Vitest can resolve it
vi.mock('astro:middleware', () => ({
  defineMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock('../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock('../lib/jwt', () => ({
  verifyJWT: vi.fn(),
  extractRole: vi.fn(),
}));

import { getSupabaseAdmin } from '../lib/supabase';
import { verifyJWT, extractRole } from '../lib/jwt';
import { onRequest, __resetCachesForTest } from '../middleware';

// ---- helpers ----------------------------------------------------------------

function makeCtx(overrides: {
  pathname?: string;
  token?: string | null;
  headers?: Record<string, string>;
  ip?: string;
} = {}) {
  const { pathname = '/', token = null, headers = {}, ip } = overrides;

  const cookies = new Map<string, string>();
  if (token !== null) cookies.set('sb-access-token', token);

  const ctx: any = {
    url: new URL(`https://aegisai.ae${pathname}`),
    request: new Request(`https://aegisai.ae${pathname}`, {
      headers: {
        ...(ip ? { 'x-forwarded-for': ip } : {}),
        ...headers,
      },
    }),
    cookies: {
      get: (key: string) => cookies.has(key) ? { value: cookies.get(key) } : undefined,
      delete: vi.fn(),
    },
    locals: {} as any,
    redirect: vi.fn((path: string, _code?: number) => new Response(null, {
      status: 302,
      headers: { location: path },
    })),
  };
  return ctx;
}

function noRedirects() {
  const chain = makeChain({ data: null, error: null });
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return supabase;
}

// ---- tests ------------------------------------------------------------------

describe('static assets passthrough', () => {
  it('skips all logic for /_astro/ paths', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/_astro/main.js' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalledOnce();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('skips logic for /assets/ paths', async () => {
    noRedirects();
    const ctx = makeCtx({ pathname: '/assets/logo.png' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('DB redirect check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects when a matching active redirect row is found', async () => {
    const chain = makeChain({ data: [{ from_path: '/old-path', to_path: '/new-path', status_code: 301 }], error: null });
    const supabase = { from: vi.fn().mockReturnValue(chain) };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = makeCtx({ pathname: '/old-path' });
    const next = vi.fn();
    const res = await onRequest(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledWith('/new-path', 301);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when no redirect row is found', async () => {
    // redirects query returns null, maintenance returns null
    const chain = makeChain({ data: null, error: null });
    const supabase = { from: vi.fn().mockReturnValue(chain) };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = makeCtx({ pathname: '/about' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('maintenance mode', () => {
  beforeEach(() => { vi.clearAllMocks(); __resetCachesForTest(); });

  it('redirects to /maintenance when enabled and IP not in allowlist', async () => {
    // The middleware fetches both maintenance config keys in a single batched query
    const supabase = {
      from: vi.fn().mockReturnValue(makeChain({
        data: [
          { key: 'system.maintenance_mode', value: 'true' },
          { key: 'system.maintenance_allowed_ips', value: '10.0.0.1' },
        ],
        error: null,
      })),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = makeCtx({ pathname: '/about', ip: '1.2.3.4' });
    const next = vi.fn();
    await onRequest(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledWith('/maintenance');
  });

  it('does NOT redirect when visitor IP is in the allowlist', async () => {
    let callCount = 0;
    const supabase = {
      from: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return makeChain({ data: null, error: null });
        if (callCount === 2) return makeChain({ data: { value: 'true' }, error: null });
        return makeChain({ data: { value: '10.0.0.1,10.0.0.2' }, error: null });
      }),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = makeCtx({ pathname: '/about', ip: '10.0.0.1' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);

    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('skips maintenance check for /maintenance path', async () => {
    // only the redirects check fires, maintenance check is skipped
    const supabase = { from: vi.fn().mockReturnValue(makeChain({ data: null, error: null })) };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = makeCtx({ pathname: '/maintenance' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('admin auth guard', () => {
  beforeEach(() => { vi.clearAllMocks(); __resetCachesForTest(); });

  it('allows /admin/login without a token', async () => {
    const ctx = makeCtx({ pathname: '/admin/login' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);
    expect(next).toHaveBeenCalledOnce();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('redirects to /admin/login when no token present', async () => {
    const ctx = makeCtx({ pathname: '/admin/blog', token: null });
    const next = vi.fn();
    await onRequest(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/admin/login');
  });

  it('redirects with session_expired when token is invalid', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('JWTExpired'));

    const ctx = makeCtx({ pathname: '/admin/blog', token: 'bad.token' });
    const next = vi.fn();
    await onRequest(ctx, next);

    expect(ctx.cookies.delete).toHaveBeenCalledWith('sb-access-token', { path: '/' });
    expect(ctx.redirect).toHaveBeenCalledWith('/admin/login?error=session_expired');
  });

  it('sets locals.user and calls next for valid super_admin token', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u1', email: 'admin@test.com', role: 'super_admin', exp: 9999999999,
    });
    (extractRole as ReturnType<typeof vi.fn>).mockReturnValueOnce('super_admin');

    const ctx = makeCtx({ pathname: '/admin/blog', token: 'valid.token' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);

    expect(ctx.locals.user).toEqual({ id: 'u1', email: 'admin@test.com', role: 'super_admin' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('redirects editor attempting to access a sales-only path', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u2', email: 'ed@test.com', role: 'editor', exp: 9999999999,
    });
    (extractRole as ReturnType<typeof vi.fn>).mockReturnValueOnce('editor');

    const ctx = makeCtx({ pathname: '/admin/leads', token: 'editor.token' });
    const next = vi.fn();
    await onRequest(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledWith('/admin?error=unauthorized');
  });

  it('allows editor to access /admin/content', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u2', email: 'ed@test.com', role: 'editor', exp: 9999999999,
    });
    (extractRole as ReturnType<typeof vi.fn>).mockReturnValueOnce('editor');
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      from: vi.fn().mockReturnValue(makeChain({
        data: { value: JSON.stringify({ sections: ['content', 'blog', 'media'] }) },
        error: null,
      })),
    });

    const ctx = makeCtx({ pathname: '/admin/content/faq', token: 'editor.token' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('redirects sales attempting to access /admin/blog', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u3', email: 'sales@test.com', role: 'sales', exp: 9999999999,
    });
    (extractRole as ReturnType<typeof vi.fn>).mockReturnValueOnce('sales');

    const ctx = makeCtx({ pathname: '/admin/blog', token: 'sales.token' });
    const next = vi.fn();
    await onRequest(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledWith('/admin?error=unauthorized');
  });

  it('allows sales to access /admin/leads', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u3', email: 'sales@test.com', role: 'sales', exp: 9999999999,
    });
    (extractRole as ReturnType<typeof vi.fn>).mockReturnValueOnce('sales');
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      from: vi.fn().mockReturnValue(makeChain({
        data: { value: JSON.stringify({ sections: ['leads'] }) },
        error: null,
      })),
    });

    const ctx = makeCtx({ pathname: '/admin/leads', token: 'sales.token' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);

    expect(next).toHaveBeenCalledOnce();
  });
});

describe('API admin auth guard', () => {
  beforeEach(() => { vi.clearAllMocks(); __resetCachesForTest(); });

  it('returns 401 JSON when no token present on /api/admin/*', async () => {
    const ctx = makeCtx({ pathname: '/api/admin/leads', token: null });
    const next = vi.fn();
    const res = await onRequest(ctx, next);

    expect((res as Response).status).toBe(401);
    const body = await (res as Response).json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 JSON when token is invalid on /api/admin/*', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('invalid'));

    const ctx = makeCtx({ pathname: '/api/admin/leads', token: 'bad.token' });
    const next = vi.fn();
    const res = await onRequest(ctx, next);

    expect((res as Response).status).toBe(401);
  });

  it('sets locals.user and calls next for valid API token', async () => {
    (verifyJWT as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      sub: 'u1', email: 'admin@test.com', role: 'super_admin', exp: 9999999999,
    });
    (extractRole as ReturnType<typeof vi.fn>).mockReturnValueOnce('super_admin');

    const ctx = makeCtx({ pathname: '/api/admin/leads', token: 'valid.token' });
    const next = vi.fn().mockResolvedValue(new Response('ok'));
    await onRequest(ctx, next);

    expect(ctx.locals.user).toEqual({ id: 'u1', email: 'admin@test.com', role: 'super_admin' });
    expect(next).toHaveBeenCalledOnce();
  });
});
