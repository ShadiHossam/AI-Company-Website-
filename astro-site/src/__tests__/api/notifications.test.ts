import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, PATCH } from '../../pages/api/admin/notifications/index';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('GET /api/admin/notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      request: new Request('https://aegisai.ae/api/admin/notifications'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns paginated notifications', async () => {
    const notifs = [{ id: 'n1', message: 'New lead', read: false }];
    makeSupabase({ data: notifs, count: 1, error: null });

    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/notifications?page=1'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(notifs);
    expect(body.count).toBe(1);
    expect(body.pageSize).toBe(20);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: { message: 'fail' }, count: null });
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/notifications'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/notifications (mark read)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ ids: ['n1'] }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ids: ['n1'] }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'bad',
      }),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when neither ids nor all provided', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({}, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('ids array or all:true required');
  });

  it('marks specific notifications read by ids', async () => {
    const { chain } = makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ids: ['n1', 'n2'] }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(chain['in']).toHaveBeenCalledWith('id', ['n1', 'n2']);
  });

  it('marks all unread notifications read when all:true', async () => {
    const { chain } = makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ all: true }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect(chain['eq']).toHaveBeenCalledWith('read', false);
  });

  it('returns 500 when DB update fails', async () => {
    makeSupabase({ error: { message: 'update failed' } });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ all: true }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(500);
  });
});
