import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, PATCH } from '../../pages/api/admin/config/index';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('GET /api/admin/config', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      request: new Request('https://aegisai.ae/api/admin/config'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns all site_config rows', async () => {
    const rows = [{ key: 'site.name', value: 'Aegis AI', section: 'branding' }];
    makeSupabase({ data: rows, error: null });

    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/config'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(rows);
  });

  it('filters by section when ?section= is provided', async () => {
    const { chain } = makeSupabase({ data: [], error: null });

    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/config?section=branding'),
    };
    await GET(ctx as any);
    expect(chain['eq']).toHaveBeenCalledWith('section', 'branding');
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: { message: 'fail' } });
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/config'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/config', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      request: makeRequest({ updates: [{ key: 'k', value: 'v' }] }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ updates: [{ key: 'k', value: 'v' }] }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'bad',
      }),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when updates is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ something: 'else' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('updates array required');
  });

  it('returns 400 when updates is not an array', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ updates: { key: 'k', value: 'v' } }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('upserts config entries and returns 200', async () => {
    const { chain } = makeSupabase({ error: null });

    const updates = [{ key: 'site.name', value: 'New Name' }];
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ updates }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(chain['upsert']).toHaveBeenCalledWith([{ key: 'site.name', value: 'New Name' }]);
  });

  it('returns 500 on upsert error', async () => {
    makeSupabase({ error: { message: 'constraint' } });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ updates: [{ key: 'k', value: 'v' }] }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(500);
  });
});
