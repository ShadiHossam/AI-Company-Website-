import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET, POST } from '../../pages/api/admin/content/faq/index';
import { PATCH, DELETE } from '../../pages/api/admin/content/faq/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

const VALID_FAQ = { question: 'What is AI?', answer: 'Artificial Intelligence.', section: 'general' };

describe('GET /api/admin/content/faq', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, url: new URL('https://aegisai.ae/api/admin/content/faq') };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns all FAQ items', async () => {
    const items = [{ id: 'f1', question: 'What?', answer: 'This.' }];
    makeSupabase({ data: items, error: null });
    const ctx = { locals: makeLocals(), url: new URL('https://aegisai.ae/api/admin/content/faq') };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(items);
  });

  it('filters by section when provided', async () => {
    const { chain } = makeSupabase({ data: [], error: null });
    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/content/faq?section=pricing'),
    };
    await GET(ctx as any);
    expect(chain['eq']).toHaveBeenCalledWith('section', 'pricing');
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('DB error') });
    const ctx = { locals: makeLocals(), url: new URL('https://aegisai.ae/api/admin/content/faq') };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/admin/content/faq', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest(VALID_FAQ) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest(VALID_FAQ, 'POST', 'https://evil.com'),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields missing', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ question: 'What?' }),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('question, answer, and section are required');
  });

  it('creates FAQ item and returns 201', async () => {
    const created = { id: 'f1', ...VALID_FAQ };
    makeSupabase({ data: created, error: null });
    const ctx = { locals: makeLocals(), request: makeRequest(VALID_FAQ) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });
});

describe('PATCH /api/admin/content/faq/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'f1' }, request: makeRequest({ question: 'New?' }, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'f1' },
      request: makeRequest({ question: 'New?' }, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('updates FAQ item and returns 200', async () => {
    const updated = { id: 'f1', question: 'Updated?', answer: 'Yes.' };
    makeSupabase({ data: updated, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'f1' },
      request: makeRequest({ question: 'Updated?' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('fail') });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'f1' },
      request: makeRequest({ question: 'X' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/admin/content/faq/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'f1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'f1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://evil.com' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(403);
  });

  it('deletes FAQ item and returns 200', async () => {
    makeSupabase({ error: null });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'f1' },
      request: new Request('https://aegisai.ae', { method: 'DELETE', headers: { origin: 'https://aegisai.ae' } }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
