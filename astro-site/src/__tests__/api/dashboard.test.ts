import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET } from '../../pages/api/admin/dashboard/stats';

describe('GET /api/admin/dashboard/stats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {} };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns expected shape with aggregated stats', async () => {
    // dashboard/stats fires 7 parallel Supabase queries; configure each call in order
    let callIndex = 0;
    const mockResults = [
      { count: 3, data: null, error: null },           // newToday
      { count: 5, data: null, error: null },           // qualifiedWeek
      { data: [                                         // pipeline
        { status: 'qualified', estimated_value_aed: 10000 },
        { status: 'qualified', estimated_value_aed: 5000 },
        { status: 'proposal', estimated_value_aed: 20000 },
      ], error: null },
      { count: 2, data: null, error: null },           // unreadNotifs
      { data: [{ id: 'l1', full_name: 'Alice', status: 'new' }], error: null },  // recentLeads
      { data: [], error: null },                       // hotLeads
      { data: [{ status: 'published' }, { status: 'draft' }, { status: 'published' }], error: null }, // blog
    ];

    const supabase = {
      from: vi.fn().mockImplementation(() => {
        const result = mockResults[callIndex % mockResults.length];
        callIndex++;
        return makeChain(result);
      }),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.newToday).toBe(3);
    expect(body.qualifiedWeek).toBe(5);
    expect(body.pipelineAED).toBe(35000);
    expect(body.unreadNotifs).toBe(2);
    expect(body.stageBreakdown).toEqual({
      qualified: { count: 2, aed: 15000 },
      proposal: { count: 1, aed: 20000 },
    });
    expect(body.recentLeads).toHaveLength(1);
    expect(body.hotLeads).toHaveLength(0);
    expect(body.blog).toEqual({ published: 2, drafts: 1 });
  });

  it('handles nullish data gracefully (all zeros)', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue(makeChain({ count: null, data: null, error: null })),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);

    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    const body = await res.json();

    expect(body.newToday).toBe(0);
    expect(body.qualifiedWeek).toBe(0);
    expect(body.pipelineAED).toBe(0);
    expect(body.unreadNotifs).toBe(0);
    expect(body.recentLeads).toEqual([]);
    expect(body.hotLeads).toEqual([]);
    expect(body.blog).toEqual({ published: 0, drafts: 0 });
  });
});
