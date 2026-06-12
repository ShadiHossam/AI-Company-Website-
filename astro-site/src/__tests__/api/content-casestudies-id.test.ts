import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, PATCH, DELETE } from '../../pages/api/admin/content/case-studies/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('GET /api/admin/content/case-studies/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'cs1' } };
    expect((await GET(ctx as any)).status).toBe(401);
  });

  it('returns 404 when not found', async () => {
    makeSupabase({ data: null, error: { message: 'Not found' } });
    const ctx = { locals: makeLocals(), params: { id: 'missing' } };
    expect((await GET(ctx as any)).status).toBe(404);
  });

  it('returns the case study on success', async () => {
    const study = { id: 'cs1', title: 'AI Project', slug: 'ai-project' };
    makeSupabase({ data: study, error: null });
    const ctx = { locals: makeLocals(), params: { id: 'cs1' } };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(study);
  });
});

describe('PATCH /api/admin/content/case-studies/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'cs1' }, request: makeRequest({ title: 'X' }, 'PATCH') };
    expect((await PATCH(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'cs1' },
      request: makeRequest({ title: 'X' }, 'PATCH', 'https://evil.com'),
    };
    expect((await PATCH(ctx as any)).status).toBe(403);
  });

  it('updates case study, writes activity log, and returns 200', async () => {
    const updated = { id: 'cs1', title: 'Updated', slug: 'updated' };
    let call = 0;
    const insertMock = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        call++;
        if (table === 'case_studies') return makeChain({ data: updated, error: null });
        return { insert: insertMock };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'cs1' },
      request: makeRequest({ title: 'Updated' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'case_study.updated' })
    );
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('constraint') });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'cs1' },
      request: makeRequest({ title: 'X' }, 'PATCH'),
    };
    expect((await PATCH(ctx as any)).status).toBe(500);
  });
});

describe('DELETE /api/admin/content/case-studies/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'cs1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    expect((await DELETE(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'cs1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://evil.com' } }),
    };
    expect((await DELETE(ctx as any)).status).toBe(403);
  });

  it('deletes case study, writes activity log, and returns 200', async () => {
    const insertMock = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'case_studies') return makeChain({ error: null });
        return { insert: insertMock };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'cs1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'case_study.deleted' })
    );
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('FK violation') });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'cs1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    expect((await DELETE(ctx as any)).status).toBe(500);
  });
});
