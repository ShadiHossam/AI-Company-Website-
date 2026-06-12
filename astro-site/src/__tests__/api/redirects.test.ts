import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, POST } from '../../pages/api/admin/redirects/index';
import { PATCH, DELETE } from '../../pages/api/admin/redirects/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

// ============================================================
// GET /api/admin/redirects
// ============================================================

describe('GET /api/admin/redirects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {} };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns all redirects ordered by created_at desc', async () => {
    const rows = [{ id: 'r1', from_path: '/old', to_path: '/new', active: true }];
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

// ============================================================
// POST /api/admin/redirects
// ============================================================

describe('POST /api/admin/redirects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ from_path: '/a', to_path: '/b' }) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ from_path: '/a', to_path: '/b' }, 'POST', 'https://evil.com'),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'bad',
      }),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when from_path is missing', async () => {
    const ctx = { locals: makeLocals(), request: makeRequest({ to_path: '/new' }) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('from_path and to_path required');
  });

  it('returns 400 when to_path is missing', async () => {
    const ctx = { locals: makeLocals(), request: makeRequest({ from_path: '/old' }) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when from_path does not start with /', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ from_path: 'no-slash', to_path: '/new' }),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('from_path must start with /');
  });

  it('creates redirect with default status_code 301', async () => {
    const created = { id: 'r1', from_path: '/old', to_path: '/new', status_code: 301, active: true };
    const { chain } = makeSupabase({ data: created, error: null });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ from_path: '/old', to_path: '/new' }),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(201);
    expect((await res.json()).data).toEqual(created);
    expect(chain['insert']).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 301, active: true })
    );
  });

  it('creates redirect with custom status_code', async () => {
    const created = { id: 'r2', from_path: '/old', to_path: '/new', status_code: 302 };
    const { chain } = makeSupabase({ data: created, error: null });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ from_path: '/old', to_path: '/new', status_code: 302 }),
    };
    await POST(ctx as any);
    expect(chain['insert']).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 302 })
    );
  });
});

// ============================================================
// PATCH /api/admin/redirects/[id]
// ============================================================

describe('PATCH /api/admin/redirects/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'r1' }, request: makeRequest({ active: false }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: makeRequest({ active: false }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 when no updates provided', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: makeRequest({}, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('No updates provided');
  });

  it('updates redirect and returns 200', async () => {
    const updated = { id: 'r1', active: false };
    makeSupabase({ data: updated, error: null });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: makeRequest({ active: false }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(updated);
  });

  it('only sends provided fields in update', async () => {
    const { chain } = makeSupabase({ data: {}, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: makeRequest({ to_path: '/newer' }, 'PATCH'),
    };
    await PATCH(ctx as any);
    expect(chain['update']).toHaveBeenCalledWith({ to_path: '/newer' });
  });
});

// ============================================================
// DELETE /api/admin/redirects/[id]
// ============================================================

describe('DELETE /api/admin/redirects/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'r1' },
      request: new Request('https://aegisai.ae/api/admin/redirects/r1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: new Request('https://aegisai.ae/api/admin/redirects/r1', {
        method: 'DELETE',
        headers: { origin: 'https://evil.com' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(403);
  });

  it('deletes redirect and returns 200', async () => {
    makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: new Request('https://aegisai.ae/api/admin/redirects/r1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ error: { message: 'FK violation' } });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'r1' },
      request: new Request('https://aegisai.ae/api/admin/redirects/r1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(500);
  });
});
