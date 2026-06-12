import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET as TEAM_GET, POST as TEAM_POST } from '../../pages/api/admin/content/team/index';
import { GET as CS_GET, POST as CS_POST } from '../../pages/api/admin/content/case-studies/index';
import { GET as LEGAL_LIST } from '../../pages/api/admin/content/legal/index';
import { GET as LEGAL_GET, PATCH as LEGAL_PATCH } from '../../pages/api/admin/content/legal/[slug]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

// ============================================================
// Team Members
// ============================================================

describe('GET /api/admin/content/team', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {} };
    expect((await TEAM_GET(ctx as any)).status).toBe(401);
  });

  it('returns all team members', async () => {
    const members = [{ id: 't1', name: 'Alice', title: 'CEO' }];
    makeSupabase({ data: members, error: null });
    const ctx = { locals: makeLocals() };
    const res = await TEAM_GET(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(members);
  });

  it('returns 500 on error', async () => {
    makeSupabase({ data: null, error: new Error('fail') });
    const ctx = { locals: makeLocals() };
    expect((await TEAM_GET(ctx as any)).status).toBe(500);
  });
});

describe('POST /api/admin/content/team', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ name: 'Bob', title: 'CTO' }) };
    expect((await TEAM_POST(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ name: 'Bob', title: 'CTO' }, 'POST', 'https://evil.com'),
    };
    expect((await TEAM_POST(ctx as any)).status).toBe(403);
  });

  it('returns 400 when name or title missing', async () => {
    const ctx = { locals: makeLocals(), request: makeRequest({ name: 'Bob' }) };
    const res = await TEAM_POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('name and title are required');
  });

  it('creates team member and returns 201', async () => {
    const created = { id: 't1', name: 'Bob', title: 'CTO' };
    makeSupabase({ data: created, error: null });
    const ctx = { locals: makeLocals(), request: makeRequest({ name: 'Bob', title: 'CTO' }) };
    const res = await TEAM_POST(ctx as any);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });
});

// ============================================================
// Case Studies
// ============================================================

describe('GET /api/admin/content/case-studies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    expect((await CS_GET({ locals: {} } as any)).status).toBe(401);
  });

  it('returns all case studies', async () => {
    const studies = [{ id: 'cs1', title: 'AI Transformation', slug: 'ai-transform' }];
    makeSupabase({ data: studies, error: null });
    const ctx = { locals: makeLocals() };
    const res = await CS_GET(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(studies);
  });
});

describe('POST /api/admin/content/case-studies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest({ title: 'Test', slug: 'test' }) };
    expect((await CS_POST(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ title: 'T', slug: 's' }, 'POST', 'https://evil.com'),
    };
    expect((await CS_POST(ctx as any)).status).toBe(403);
  });

  it('returns 400 when title or slug missing', async () => {
    const ctx = { locals: makeLocals(), request: makeRequest({ title: 'No Slug' }) };
    const res = await CS_POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('title and slug are required');
  });

  it('creates case study and returns 201', async () => {
    const created = { id: 'cs1', title: 'Test', slug: 'test', published: false };
    makeSupabase({ data: created, error: null });
    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ title: 'Test', slug: 'test', industry: 'Retail' }),
    };
    const res = await CS_POST(ctx as any);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });
});

// ============================================================
// Legal Pages
// ============================================================

describe('GET /api/admin/content/legal (list)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    expect((await LEGAL_LIST({ locals: {} } as any)).status).toBe(401);
  });

  it('returns privacy and terms page stubs', async () => {
    const rows = [
      { slug: 'privacy', title: 'Privacy Policy', last_updated: '2025-01-01' },
      { slug: 'terms', title: 'Terms of Service', last_updated: '2025-01-01' },
    ];
    makeSupabase({ data: rows, error: null });
    const res = await LEGAL_LIST({ locals: makeLocals() } as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });
});

describe('GET /api/admin/content/legal/[slug]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { slug: 'privacy' } };
    expect((await LEGAL_GET(ctx as any)).status).toBe(401);
  });

  it('returns 400 for invalid slug', async () => {
    const ctx = { locals: makeLocals(), params: { slug: 'cookie-policy' } };
    const res = await LEGAL_GET(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid slug');
  });

  it('returns 404 when page not found', async () => {
    makeSupabase({ data: null, error: { message: 'Not found' } });
    const ctx = { locals: makeLocals(), params: { slug: 'privacy' } };
    const res = await LEGAL_GET(ctx as any);
    expect(res.status).toBe(404);
  });

  it('returns legal page for privacy slug', async () => {
    const page = { slug: 'privacy', title: 'Privacy Policy', sections: [] };
    makeSupabase({ data: page, error: null });
    const ctx = { locals: makeLocals(), params: { slug: 'privacy' } };
    const res = await LEGAL_GET(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(page);
  });

  it('returns legal page for terms slug', async () => {
    const page = { slug: 'terms', title: 'Terms of Service', sections: [] };
    makeSupabase({ data: page, error: null });
    const ctx = { locals: makeLocals(), params: { slug: 'terms' } };
    const res = await LEGAL_GET(ctx as any);
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/admin/content/legal/[slug]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { slug: 'privacy' },
      request: makeRequest({ sections: [] }, 'PATCH'),
    };
    expect((await LEGAL_PATCH(ctx as any)).status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { slug: 'privacy' },
      request: makeRequest({ sections: [] }, 'PATCH', 'https://evil.com'),
    };
    expect((await LEGAL_PATCH(ctx as any)).status).toBe(403);
  });

  it('returns 400 for invalid slug', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { slug: 'other' },
      request: makeRequest({ sections: [] }, 'PATCH'),
    };
    const res = await LEGAL_PATCH(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid slug');
  });

  it('updates legal page and returns 200', async () => {
    const updated = { slug: 'privacy', sections: [{ heading: 'Intro', content: 'We care.' }] };
    makeSupabase({ data: updated, error: null });
    const ctx = {
      locals: makeLocals(),
      params: { slug: 'privacy' },
      request: makeRequest({ sections: [{ heading: 'Intro', content: 'We care.' }] }, 'PATCH'),
    };
    const res = await LEGAL_PATCH(ctx as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: new Error('constraint') });
    const ctx = {
      locals: makeLocals(),
      params: { slug: 'terms' },
      request: makeRequest({ sections: [] }, 'PATCH'),
    };
    expect((await LEGAL_PATCH(ctx as any)).status).toBe(500);
  });
});
