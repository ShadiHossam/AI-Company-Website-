import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, PATCH } from '../../pages/api/admin/leads/index';
import { GET as GET_ID, PATCH as PATCH_ID } from '../../pages/api/admin/leads/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

// ============================================================
// GET /api/admin/leads (list + CSV)
// ============================================================

describe('GET /api/admin/leads', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      url: new URL('https://aegisai.ae/api/admin/leads'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns paginated leads list', async () => {
    const leads = [{ id: 'l1', full_name: 'Alice', status: 'new' }];
    makeSupabase({ data: leads, count: 1, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?page=1'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.leads).toEqual(leads);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(50);
  });

  it('filters by status when provided', async () => {
    const { chain } = makeSupabase({ data: [], count: 0, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?status=qualified'),
    };
    await GET(ctx as any);
    expect(chain['eq']).toHaveBeenCalledWith('status', 'qualified');
  });

  it('filters by industry when provided', async () => {
    const { chain } = makeSupabase({ data: [], count: 0, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?industry=retail'),
    };
    await GET(ctx as any);
    expect(chain['eq']).toHaveBeenCalledWith('industry', 'retail');
  });

  it('applies date range filters', async () => {
    const { chain } = makeSupabase({ data: [], count: 0, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?date_from=2025-01-01&date_to=2025-06-30'),
    };
    await GET(ctx as any);
    expect(chain['gte']).toHaveBeenCalledWith('created_at', '2025-01-01');
    expect(chain['lte']).toHaveBeenCalledWith('created_at', '2025-06-30T23:59:59Z');
  });

  it('applies search filter via OR clause', async () => {
    const { chain } = makeSupabase({ data: [], count: 0, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?search=alice'),
    };
    await GET(ctx as any);
    expect(chain['or']).toHaveBeenCalledWith(
      'full_name.ilike.%alice%,company_name.ilike.%alice%,work_email.ilike.%alice%'
    );
  });

  it('returns CSV when format=csv', async () => {
    const leads = [
      { id: 'l1', full_name: 'Alice', company_name: 'Acme', work_email: 'alice@acme.com',
        created_at: '2025-01-01', status: 'new', tags: ['hot'], notes: 'some, notes' },
    ];
    makeSupabase({ data: leads, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?format=csv'),
    };
    const res = await GET(ctx as any);
    expect(res.headers.get('Content-Type')).toBe('text/csv');
    expect(res.headers.get('Content-Disposition')).toMatch(/attachment; filename="leads-/);
    const text = await res.text();
    expect(text).toContain('full_name');
    expect(text).toContain('Alice');
    // comma in notes should be quoted
    expect(text).toContain('"some, notes"');
  });

  it('quotes CSV values containing double-quotes', async () => {
    makeSupabase({ data: [{ id: 'x', full_name: 'A "B" C', notes: '', tags: null }], error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/leads?format=csv'),
    };
    const res = await GET(ctx as any);
    const text = await res.text();
    expect(text).toContain('"A ""B"" C"');
  });
});

// ============================================================
// PATCH /api/admin/leads (bulk status update)
// ============================================================

describe('PATCH /api/admin/leads (bulk)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ ids: ['l1'], status: 'qualified' }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure (wrong origin)', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ids: ['l1'], status: 'qualified' }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 when ids is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ status: 'qualified' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('ids and status required');
  });

  it('returns 400 when status is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ids: ['l1'] }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('returns 200 and updates status for valid request', async () => {
    makeSupabase({ error: null });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ids: ['l1', 'l2'], status: 'qualified' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('returns 500 when supabase update fails', async () => {
    makeSupabase({ error: { message: 'DB constraint' } });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ids: ['l1'], status: 'qualified' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('DB constraint');
  });
});

// ============================================================
// GET /api/admin/leads/[id]
// ============================================================

describe('GET /api/admin/leads/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'l1' } };
    const res = await GET_ID(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 404 when lead not found', async () => {
    let call = 0;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: null, error: { message: 'Not found' } });
        return makeChain({ data: [], error: null });
      }),
    });

    const ctx = { locals: makeLocals(), params: { id: 'missing' } };
    const res = await GET_ID(ctx as any);
    expect(res.status).toBe(404);
  });

  it('returns lead data and activity log', async () => {
    const lead = { id: 'l1', full_name: 'Alice' };
    const activity = [{ action: 'lead.status_changed', created_at: '2025-01-01' }];

    let call = 0;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: lead, error: null });
        return makeChain({ data: activity, error: null });
      }),
    });

    const ctx = { locals: makeLocals(), params: { id: 'l1' } };
    const res = await GET_ID(ctx as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lead).toEqual(lead);
    expect(body.activity).toEqual(activity);
  });
});

// ============================================================
// PATCH /api/admin/leads/[id]
// ============================================================

describe('PATCH /api/admin/leads/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'l1' },
      request: makeRequest({ status: 'qualified' }, 'PATCH'),
    };
    const res = await PATCH_ID(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'l1' },
      request: makeRequest({ status: 'qualified' }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH_ID(ctx as any);
    expect(res.status).toBe(403);
  });

  it('updates lead and writes activity log on status change', async () => {
    const before = { id: 'l1', status: 'new' };
    const updated = { id: 'l1', status: 'qualified' };

    let call = 0;
    const insertMock = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        // 1st: fetch before state, 2nd: update, 3rd: activity_log insert
        if (call === 1) return makeChain({ data: before, error: null });
        if (call === 2) return makeChain({ data: updated, error: null });
        return { insert: insertMock };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'l1' },
      request: makeRequest({ status: 'qualified' }, 'PATCH'),
    };
    const res = await PATCH_ID(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).lead).toEqual(updated);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'lead.status_changed' })
    );
  });

  it('writes notes_updated log when updating internal_notes', async () => {
    const before = { id: 'l1', status: 'new' };
    const updated = { id: 'l1', internal_notes: 'new note' };

    let call = 0;
    const insertMock = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: before, error: null });
        if (call === 2) return makeChain({ data: updated, error: null });
        return { insert: insertMock };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'l1' },
      request: makeRequest({ internal_notes: 'new note' }, 'PATCH'),
    };
    await PATCH_ID(ctx as any);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'lead.notes_updated' })
    );
  });

  it('returns 500 when update fails', async () => {
    let call = 0;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: { status: 'new' }, error: null });
        return makeChain({ data: null, error: { message: 'DB error' } });
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'l1' },
      request: makeRequest({ status: 'qualified' }, 'PATCH'),
    };
    const res = await PATCH_ID(ctx as any);
    expect(res.status).toBe(500);
  });
});
