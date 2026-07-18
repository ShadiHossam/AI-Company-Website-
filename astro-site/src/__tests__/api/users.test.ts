import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { POST as invitePOST } from '../../pages/api/admin/users/invite';

function makeAdminSupabase(result: { data: unknown; error: null | { message: string } }) {
  const supabase = {
    from: vi.fn().mockReturnValue(makeChain({ data: { key: 'admin.role.editor' }, error: null })),
    auth: {
      admin: {
        inviteUserByEmail: vi.fn().mockResolvedValue(result),
      },
    },
  };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return supabase;
}

describe('POST /api/admin/users/invite', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ email: 'x@y.com', role: 'editor' }) };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 403 when user is not super_admin', async () => {
    const ctx = {
      locals: makeLocals({ role: 'editor' }),
      request: makeRequest({ email: 'x@y.com', role: 'editor' }),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('Forbidden');
  });

  it('returns 403 on CSRF failure (wrong origin)', async () => {
    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ email: 'x@y.com', role: 'editor' }, 'POST', 'https://evil.com'),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON body', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://lenooai.com/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', origin: 'https://lenooai.com' },
        body: 'not-json',
      }),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when email is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ role: 'editor' }),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('email and role required');
  });

  it('returns 400 when role is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ email: 'new@user.com' }),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('email and role required');
  });

  it('invites user and returns 200 on success', async () => {
    const inviteData = { id: 'new-user-id', email: 'new@user.com' };
    makeAdminSupabase({ data: inviteData, error: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ email: 'new@user.com', role: 'editor' }),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(inviteData);
  });

  it('returns 500 when Supabase invite fails', async () => {
    makeAdminSupabase({ data: null, error: { message: 'User already registered' } });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ email: 'existing@user.com', role: 'editor' }),
    };
    const res = await invitePOST(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('User already registered');
  });

  it('calls inviteUserByEmail with correct email and role metadata', async () => {
    const { auth } = makeAdminSupabase({ data: {}, error: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ email: 'new@user.com', role: 'sales' }),
    };
    await invitePOST(ctx as any);

    expect(auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'new@user.com',
      { data: { role: 'sales' } }
    );
  });
});
