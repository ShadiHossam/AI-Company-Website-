import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, POST } from '../../pages/api/admin/content/products/index';
import { PATCH, DELETE } from '../../pages/api/admin/content/products/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

const VALID_PRODUCT = { slug: 'ai-engine', name: 'AI Engine', description: 'An AI engine.' };

describe('GET /api/admin/content/products', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {} };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns all products', async () => {
    const items = [{ id: 'p1', slug: 'ai-engine', name: 'AI Engine', published: true }];
    makeSupabase({ data: items, error: null });
    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(items);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('fail') });
    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/admin/content/products', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest(VALID_PRODUCT) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest(VALID_PRODUCT, 'POST', 'https://evil.com'),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 when slug, name, or description is missing', async () => {
    const ctx = { locals: makeLocals(), request: makeRequest({ name: 'Missing Slug' }) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('slug, name, and description are required');
  });

  it('creates product and returns 201', async () => {
    const created = { id: 'p1', ...VALID_PRODUCT, published: false };
    makeSupabase({ data: created, error: null });
    const ctx = { locals: makeLocals(), request: makeRequest(VALID_PRODUCT) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });
});

describe('PATCH /api/admin/content/products/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'p1' }, request: makeRequest({ name: 'New' }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({ name: 'New' }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('updates product and returns 200', async () => {
    const updated = { id: 'p1', name: 'Updated', published: true };
    makeSupabase({ data: updated, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({ name: 'Updated', published: true }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  it('converts comma-separated feature_tags string to array', async () => {
    const { chain } = makeSupabase({ data: { id: 'p1' }, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({ feature_tags: 'AI, ML, NLP' }, 'PATCH'),
    };
    await PATCH(ctx as any);
    expect(chain['update']).toHaveBeenCalledWith(
      expect.objectContaining({ feature_tags: ['AI', 'ML', 'NLP'] })
    );
  });

  it('converts newline-separated features string to array', async () => {
    const { chain } = makeSupabase({ data: { id: 'p1' }, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({ features: 'Fast\nReliable\nScalable' }, 'PATCH'),
    };
    await PATCH(ctx as any);
    expect(chain['update']).toHaveBeenCalledWith(
      expect.objectContaining({ features: ['Fast', 'Reliable', 'Scalable'] })
    );
  });
});

describe('DELETE /api/admin/content/products/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(401);
  });

  it('deletes product and returns 200', async () => {
    makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
