import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, PATCH } from '../../pages/api/admin/seo/index';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('GET /api/admin/seo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {} };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns all page_seo rows', async () => {
    const rows = [
      { page_slug: '/about', meta_title: 'About Us' },
      { page_slug: '/services', meta_title: 'Services' },
    ];
    makeSupabase({ data: rows, error: null });

    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(rows);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: { message: 'DB fail' } });
    const ctx = { locals: makeLocals() };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/seo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ page_slug: '/about' }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ page_slug: '/about' }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'bad-json',
      }),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when page_slug is missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ meta_title: 'No slug' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('page_slug required');
  });

  it('upserts SEO data and returns 200', async () => {
    const { chain } = makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({
        page_slug: '/about',
        meta_title: 'About Aegis AI',
        meta_description: 'We build AI.',
        noindex: false,
      }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(chain['upsert']).toHaveBeenCalledWith(expect.objectContaining({ page_slug: '/about' }));
  });

  it('returns 500 on upsert error', async () => {
    makeSupabase({ error: { message: 'upsert failed' } });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ page_slug: '/about' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(500);
  });
});
