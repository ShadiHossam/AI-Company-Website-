import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { DELETE } from '../../pages/api/admin/users/delete';
import { PATCH as ROLE_PATCH } from '../../pages/api/admin/users/role';

function makeAdminSupabase(deleteResult = { error: null }, updateResult = { data: {}, error: null }) {
  const supabase = {
    from: vi.fn().mockReturnValue(makeChain({ data: { key: 'admin.role.editor' }, error: null })),
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue(deleteResult),
        updateUserById: vi.fn().mockResolvedValue(updateResult),
      },
    },
  };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return supabase;
}

// ============================================================
// DELETE /api/admin/users/delete
// ============================================================

describe('DELETE /api/admin/users/delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ uid: 'u2' }, 'DELETE') };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not super_admin', async () => {
    const ctx = {
      locals: makeLocals({ role: 'editor' }),
      request: makeRequest({ uid: 'u2' }, 'DELETE'),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('Forbidden');
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ uid: 'u2' }, 'DELETE', 'https://evil.com'),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'bad',
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when uid is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({}, 'DELETE'),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('uid required');
  });

  it('returns 400 when uid matches current user (self-deletion)', async () => {
    const ctx = {
      locals: makeLocals({ id: 'user-1' }),
      request: makeRequest({ uid: 'user-1' }, 'DELETE'),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Cannot delete your own account');
  });

  it('deletes the user and returns 200', async () => {
    makeAdminSupabase({ error: null });

    const ctx = {
      locals: makeLocals({ id: 'current-user', role: 'super_admin' }),
      request: makeRequest({ uid: 'other-user' }, 'DELETE'),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('returns 500 when Supabase admin delete fails', async () => {
    makeAdminSupabase({ error: { message: 'User not found' } });

    const ctx = {
      locals: makeLocals({ id: 'current-user', role: 'super_admin' }),
      request: makeRequest({ uid: 'ghost-user' }, 'DELETE'),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('User not found');
  });
});

// ============================================================
// PATCH /api/admin/users/role
// ============================================================

describe('PATCH /api/admin/users/role', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ uid: 'u2', role: 'editor' }, 'PATCH') };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not super_admin', async () => {
    const ctx = {
      locals: makeLocals({ role: 'editor' }),
      request: makeRequest({ uid: 'u2', role: 'sales' }, 'PATCH'),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ uid: 'u2', role: 'editor' }, 'PATCH', 'https://evil.com'),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'bad',
      }),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when uid is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ role: 'editor' }, 'PATCH'),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('uid and role required');
  });

  it('returns 400 when role is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ uid: 'u2' }, 'PATCH'),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('updates user role and returns 200', async () => {
    const updated = { id: 'u2', user_metadata: { role: 'editor' } };
    makeAdminSupabase({ error: null }, { data: updated, error: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ uid: 'u2', role: 'editor' }, 'PATCH'),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(updated);
  });

  it('calls updateUserById with correct metadata', async () => {
    const { auth } = makeAdminSupabase({ error: null }, { data: {}, error: null });
    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ uid: 'u2', role: 'sales' }, 'PATCH'),
    };
    await ROLE_PATCH(ctx as any);
    expect(auth.admin.updateUserById).toHaveBeenCalledWith('u2', {
      user_metadata: { role: 'sales' },
    });
  });

  it('returns 500 when Supabase update fails', async () => {
    makeAdminSupabase({ error: null }, { data: null, error: { message: 'update failed' } });
    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: makeRequest({ uid: 'u2', role: 'editor' }, 'PATCH'),
    };
    const res = await ROLE_PATCH(ctx as any);
    expect(res.status).toBe(500);
  });
});
