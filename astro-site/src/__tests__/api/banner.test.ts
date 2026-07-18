import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, PATCH } from '../../pages/api/admin/banner/index';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('GET /api/admin/banner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {} };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns banner rows', async () => {
    const rows = [{ id: 'b1', message: 'Sale on now!', active: true }];
    makeSupabase({ data: rows, error: null });

    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(rows);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: { message: 'fail' } });
    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/banner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ message: 'Hello' }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ message: 'Hello' }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://lenooai.com/api/admin/banner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', origin: 'https://lenooai.com' },
        body: 'not-json',
      }),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when message is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ active: true }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('message required');
  });

  it('upserts banner and returns 200 with data', async () => {
    const record = { id: 'b1', message: 'Big sale!', active: true };
    makeSupabase({ data: record, error: null });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ id: 'b1', message: 'Big sale!', active: true }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(record);
  });

  it('applies default colors when not provided', async () => {
    const { chain } = makeSupabase({ data: { id: 'b1', message: 'Sale' }, error: null });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ message: 'Sale' }, 'PATCH'),
    };
    await PATCH(ctx as any);
    expect(chain['upsert']).toHaveBeenCalledWith(
      expect.objectContaining({ bg_color: '#00e3fd', text_color: '#0a0f1a' })
    );
  });

  it('returns 500 on upsert error', async () => {
    makeSupabase({ data: null, error: { message: 'fail' } });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ message: 'Oops' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(500);
  });
});
