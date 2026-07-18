import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET } from '../../pages/api/admin/activity/index';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('GET /api/admin/activity', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      request: new Request('https://lenooai.com/api/admin/activity'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not super_admin', async () => {
    const ctx = {
      locals: makeLocals({ role: 'editor' }),
      request: new Request('https://lenooai.com/api/admin/activity'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('Forbidden');
  });

  it('returns paginated activity log', async () => {
    const logs = [
      { id: 'a1', action: 'blog.published', created_at: '2025-06-01' },
      { id: 'a2', action: 'lead.status_changed', created_at: '2025-05-31' },
    ];
    makeSupabase({ data: logs, count: 2, error: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: new Request('https://lenooai.com/api/admin/activity?page=1'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(logs);
    expect(body.count).toBe(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(20);
  });

  it('filters by action when ?action= provided', async () => {
    const { chain } = makeSupabase({ data: [], count: 0, error: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: new Request('https://lenooai.com/api/admin/activity?action=blog.published'),
    };
    await GET(ctx as any);
    expect(chain['eq']).toHaveBeenCalledWith('action', 'blog.published');
  });

  it('does not apply action filter when not provided', async () => {
    const { chain } = makeSupabase({ data: [], count: 0, error: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: new Request('https://lenooai.com/api/admin/activity'),
    };
    await GET(ctx as any);
    expect(chain['eq']).not.toHaveBeenCalled();
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: { message: 'timeout' }, count: null });

    const ctx = {
      locals: makeLocals({ role: 'super_admin' }),
      request: new Request('https://lenooai.com/api/admin/activity'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('Internal server error');
  });
});
