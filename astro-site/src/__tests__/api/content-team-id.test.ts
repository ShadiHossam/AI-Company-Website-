import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { PATCH, DELETE } from '../../pages/api/admin/content/team/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('PATCH /api/admin/content/team/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 't1' }, request: makeRequest({ name: 'Bob' }, 'PATCH') };
    expect((await PATCH(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: makeRequest({ name: 'Bob' }, 'PATCH', 'https://evil.com'),
    };
    expect((await PATCH(ctx as any)).status).toBe(403);
  });

  it('updates team member and returns 200', async () => {
    const updated = { id: 't1', name: 'Bob Updated', title: 'CTO' };
    makeSupabase({ data: updated, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: makeRequest({ name: 'Bob Updated' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  it('only sends provided fields in update', async () => {
    const { chain } = makeSupabase({ data: {}, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: makeRequest({ title: 'CTO', active: false }, 'PATCH'),
    };
    await PATCH(ctx as any);
    expect(chain['update']).toHaveBeenCalledWith({ title: 'CTO', active: false });
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('constraint') });
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: makeRequest({ name: 'X' }, 'PATCH'),
    };
    expect((await PATCH(ctx as any)).status).toBe(500);
  });
});

describe('DELETE /api/admin/content/team/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 't1' },
      request: new Request('https://lenooai.com', { method: 'DELETE', headers: { origin: 'https://lenooai.com' } }),
    };
    expect((await DELETE(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: new Request('https://lenooai.com', { method: 'DELETE', headers: { origin: 'https://evil.com' } }),
    };
    expect((await DELETE(ctx as any)).status).toBe(403);
  });

  it('deletes team member and returns 200', async () => {
    makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: new Request('https://lenooai.com', { method: 'DELETE', headers: { origin: 'https://lenooai.com' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('FK violation') });
    const ctx = {
      locals: makeLocals(),
      params: { id: 't1' },
      request: new Request('https://lenooai.com', { method: 'DELETE', headers: { origin: 'https://lenooai.com' } }),
    };
    expect((await DELETE(ctx as any)).status).toBe(500);
  });
});
