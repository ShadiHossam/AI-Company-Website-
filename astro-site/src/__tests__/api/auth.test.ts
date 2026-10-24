import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase-browser', () => ({
  supabaseBrowser: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

const signOut = vi.fn().mockResolvedValue({ error: null });
vi.mock('../../lib/supabase', () => ({
  getSupabaseAdmin: () => ({ auth: { admin: { signOut } } }),
}));

import { supabaseBrowser } from '../../lib/supabase-browser';
import { POST as loginPOST } from '../../pages/api/admin/auth/login';
import { POST as logoutPOST } from '../../pages/api/admin/auth/logout';

// ---- helpers ----------------------------------------------------------------

function makeLoginCtx(body: unknown, origin = 'https://lenooai.com') {
  const cookieStore = new Map<string, { value: string; options?: Record<string, unknown> }>();
  return {
    request: new Request('https://lenooai.com/api/admin/auth/login', {
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
    (supabaseBrowser!.auth.signInWithPassword as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { session: null }, error: { message: 'Invalid' } });

    const ctx = makeLoginCtx({ email: 'admin@test.com', password: 'wrong' });
    const res = await loginPOST(ctx as any);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Invalid credentials');
  });

  it('returns 200 and sets auth cookies on success', async () => {
    (supabaseBrowser!.auth.signInWithPassword as ReturnType<typeof vi.fn>)
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
    // The refresh token is never stored in a cookie.
    expect(ctx.cookies.set).not.toHaveBeenCalledWith('sb-refresh-token', expect.anything(), expect.anything());
  });
});

// ---- logout -----------------------------------------------------------------

describe('POST /api/admin/auth/logout', () => {
  beforeEach(() => signOut.mockClear());

  const makeLogoutCtx = (token?: string) => ({
    request: new Request('https://lenooai.com/api/admin/auth/logout', {
      method: 'POST',
      headers: { origin: 'https://lenooai.com' },
    }),
    cookies: { delete: vi.fn(), get: vi.fn(() => (token ? { value: token } : undefined)) },
  });

  it('revokes the Supabase session, deletes both auth cookies and returns 200', async () => {
    const ctx = makeLogoutCtx('access-tok');
    const res = await logoutPOST(ctx as any);

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(signOut).toHaveBeenCalledWith('access-tok');
    expect(ctx.cookies.delete).toHaveBeenCalledWith('sb-access-token', { path: '/' });
    expect(ctx.cookies.delete).toHaveBeenCalledWith('sb-refresh-token', { path: '/' });
  });

  it('still clears cookies when revoking the session fails', async () => {
    signOut.mockRejectedValueOnce(new Error('network'));
    const ctx = makeLogoutCtx('access-tok');
    const res = await logoutPOST(ctx as any);

    expect(res.status).toBe(200);
    expect(ctx.cookies.delete).toHaveBeenCalledWith('sb-access-token', { path: '/' });
  });

  it('skips revocation when there is no session cookie', async () => {
    const res = await logoutPOST(makeLogoutCtx() as any);
    expect(res.status).toBe(200);
    expect(signOut).not.toHaveBeenCalled();
  });
});
