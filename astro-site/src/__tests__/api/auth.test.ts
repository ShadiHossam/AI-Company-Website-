import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase-browser', () => ({
  supabaseBrowser: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

import { supabaseBrowser } from '../../lib/supabase-browser';
import { POST as loginPOST } from '../../pages/api/admin/auth/login';
import { POST as logoutPOST } from '../../pages/api/admin/auth/logout';

// ---- helpers ----------------------------------------------------------------

function makeLoginCtx(body: unknown, origin = 'https://aegisai.ae') {
  const cookieStore = new Map<string, { value: string; options?: Record<string, unknown> }>();
  return {
    request: new Request('https://aegisai.ae/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(origin ? { origin } : {}),
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    cookies: {
      set: vi.fn((key: string, value: string, options?: Record<string, unknown>) =>
        cookieStore.set(key, { value, options })
      ),
      get: (key: string) => cookieStore.get(key),
    },
    redirect: vi.fn(),
    _cookieStore: cookieStore,
  };
}

// ---- login ------------------------------------------------------------------

describe('POST /api/admin/auth/login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid JSON body', async () => {
    const ctx = makeLoginCtx('not-json');
    const res = await loginPOST(ctx as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request');
  });

  it('returns 400 when email is missing', async () => {
    const ctx = makeLoginCtx({ password: 'secret' });
    const res = await loginPOST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Email and password required');
  });

  it('returns 400 when password is missing', async () => {
    const ctx = makeLoginCtx({ email: 'admin@test.com' });
    const res = await loginPOST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Email and password required');
  });

  it('returns 403 when origin does not match (production mode)', async () => {
    const ctx = makeLoginCtx(
      { email: 'admin@test.com', password: 'pass' },
      'https://evil.com',
    );
    const res = await loginPOST(ctx as any);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('Forbidden');
  });

  it('returns 401 on invalid credentials', async () => {
    (supabaseBrowser.auth.signInWithPassword as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { session: null }, error: { message: 'Invalid' } });

    const ctx = makeLoginCtx({ email: 'admin@test.com', password: 'wrong' });
    const res = await loginPOST(ctx as any);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Invalid credentials');
  });

  it('returns 200 and sets auth cookies on success', async () => {
    (supabaseBrowser.auth.signInWithPassword as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'access-tok',
            refresh_token: 'refresh-tok',
            expires_in: 3600,
          },
        },
        error: null,
      });

    const ctx = makeLoginCtx({ email: 'admin@test.com', password: 'correct' });
    const res = await loginPOST(ctx as any);

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(ctx.cookies.set).toHaveBeenCalledWith('sb-access-token', 'access-tok', expect.any(Object));
    expect(ctx.cookies.set).toHaveBeenCalledWith('sb-refresh-token', 'refresh-tok', expect.any(Object));
  });
});

// ---- logout -----------------------------------------------------------------

describe('POST /api/admin/auth/logout', () => {
  it('deletes both auth cookies and returns 200', async () => {
    const ctx = {
      cookies: { delete: vi.fn() },
    };
    const res = await logoutPOST(ctx as any);

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(ctx.cookies.delete).toHaveBeenCalledWith('sb-access-token', { path: '/' });
    expect(ctx.cookies.delete).toHaveBeenCalledWith('sb-refresh-token', { path: '/' });
  });
});
