import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn(), supabaseConfigured: true }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET as LIST, POST } from '../../pages/api/admin/blog/index';
import { GET as GET_ID, PATCH, DELETE } from '../../pages/api/admin/blog/[id]';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

const VALID_POST_BODY = {
  title: 'Test Post',
  slug: 'test-post',
  description: 'A test description',
  body_html: '<h1>Hello</h1>',
  category: 'tech',
  status: 'draft',
};

// ============================================================
// GET /api/admin/blog (list)
// ============================================================

describe('GET /api/admin/blog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, url: new URL('https://aegisai.ae/api/admin/blog') };
    const res = await LIST(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns paginated blog posts', async () => {
    const posts = [{ id: 'p1', title: 'Hello', status: 'draft' }];
    makeSupabase({ data: posts, count: 1, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/blog?page=1'),
    };
    const res = await LIST(ctx as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(posts);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
  });

  it('returns 500 when supabase errors', async () => {
    makeSupabase({ data: null, error: { message: 'DB fail' }, count: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/blog'),
    };
    const res = await LIST(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('DB fail');
  });
});

// ============================================================
// POST /api/admin/blog
// ============================================================

describe('POST /api/admin/blog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeRequest(VALID_POST_BODY) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeRequest(VALID_POST_BODY, 'POST', 'https://evil.com'),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON body', async () => {
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'not-json',
      }),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it.each([
    [{ slug: 'x', description: 'y', body_html: '<p>z</p>', category: 'c' }, 'title missing'],
    [{ title: 'x', description: 'y', body_html: '<p>z</p>', category: 'c' }, 'slug missing'],
    [{ title: 'x', slug: 'x', body_html: '<p>z</p>', category: 'c' }, 'description missing'],
    [{ title: 'x', slug: 'x', description: 'y', category: 'c' }, 'body_html missing'],
    [{ title: 'x', slug: 'x', description: 'y', body_html: '<p>z</p>' }, 'category missing'],
  ])('returns 400 for incomplete body (%s)', async (body) => {
    const ctx = { locals: makeLocals(), request: makeRequest(body) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Missing required fields/);
  });

  it('creates a draft post without activity log', async () => {
    const created = { ...VALID_POST_BODY, id: 'new-id', status: 'draft' };
    let insertCalled = 0;
    let activityInserted = false;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'blog_posts') {
          insertCalled++;
          return makeChain({ data: created, error: null });
        }
        if (table === 'activity_log') {
          activityInserted = true;
          return makeChain({ data: null, error: null });
        }
        return makeChain({ data: null, error: null });
      }),
    });

    const ctx = { locals: makeLocals(), request: makeRequest(VALID_POST_BODY) };
    const res = await POST(ctx as any);
    expect(res.status).toBe(201);
    expect((await res.json()).data).toEqual(created);
    expect(insertCalled).toBe(1);
    expect(activityInserted).toBe(false);
  });

  it('creates a published post and writes activity log', async () => {
    const created = { ...VALID_POST_BODY, id: 'new-id', status: 'published' };
    let activityInserted = false;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'blog_posts') return makeChain({ data: created, error: null });
        if (table === 'activity_log') {
          activityInserted = true;
          return makeChain({ data: null, error: null });
        }
        return makeChain({ data: null, error: null });
      }),
    });

    const ctx = {
      locals: makeLocals(),
      request: makeRequest({ ...VALID_POST_BODY, status: 'published' }),
    };
    const res = await POST(ctx as any);
    expect(res.status).toBe(201);
    expect(activityInserted).toBe(true);
  });
});

// ============================================================
// GET /api/admin/blog/[id]
// ============================================================

describe('GET /api/admin/blog/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'p1' } };
    const res = await GET_ID(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 404 when post not found', async () => {
    makeSupabase({ data: null, error: { message: 'Not found' } });
    const ctx = { locals: makeLocals(), params: { id: 'missing' } };
    const res = await GET_ID(ctx as any);
    expect(res.status).toBe(404);
  });

  it('returns the post on success', async () => {
    const post = { id: 'p1', title: 'Hello', status: 'draft' };
    makeSupabase({ data: post, error: null });
    const ctx = { locals: makeLocals(), params: { id: 'p1' } };
    const res = await GET_ID(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual(post);
  });
});

// ============================================================
// PATCH /api/admin/blog/[id]
// ============================================================

describe('PATCH /api/admin/blog/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, params: { id: 'p1' }, request: makeRequest({}, 'PATCH') };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({}, 'PATCH', 'https://evil.com'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid JSON body', async () => {
    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae/api/admin/blog/p1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', origin: 'https://aegisai.ae' },
        body: 'not-json',
      }),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(400);
  });

  it('auto-sets pub_date on first publish', async () => {
    const existing = { status: 'draft', pub_date: null };
    const updated = { id: 'p1', status: 'published', pub_date: '2025-06-11', title: 'T' };

    let call = 0;
    const activityInsert = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'blog_posts') {
          call++;
          if (call === 1) return makeChain({ data: existing, error: null });
          return makeChain({ data: updated, error: null });
        }
        return { insert: activityInsert };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({ status: 'published' }, 'PATCH'),
    };
    const res = await PATCH(ctx as any);
    expect(res.status).toBe(200);
    // Verify activity log was written for publishing
    expect(activityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'blog.published' })
    );
  });

  it('writes blog.updated log for non-publish changes', async () => {
    const existing = { status: 'published', pub_date: '2025-01-01' };
    const updated = { id: 'p1', status: 'published', title: 'Updated' };

    let call = 0;
    const activityInsert = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'blog_posts') {
          call++;
          if (call === 1) return makeChain({ data: existing, error: null });
          return makeChain({ data: updated, error: null });
        }
        return { insert: activityInsert };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: makeRequest({ title: 'Updated' }, 'PATCH'),
    };
    await PATCH(ctx as any);
    expect(activityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'blog.updated' })
    );
  });
});

// ============================================================
// DELETE /api/admin/blog/[id]
// ============================================================

describe('DELETE /api/admin/blog/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae/api/admin/blog/p1', {
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
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae/api/admin/blog/p1', {
        method: 'DELETE',
        headers: { origin: 'https://evil.com' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(403);
  });

  it('deletes the post and writes activity log', async () => {
    const existing = { title: 'Post to delete' };
    let call = 0;
    const activityInsert = vi.fn().mockReturnValue(makeChain({ data: null, error: null }));
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'blog_posts') {
          call++;
          if (call === 1) return makeChain({ data: existing, error: null });
          return makeChain({ data: null, error: null });
        }
        return { insert: activityInsert };
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae/api/admin/blog/p1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(activityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'blog.deleted', details: { title: 'Post to delete' } })
    );
  });

  it('returns 500 when delete fails', async () => {
    let call = 0;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: { title: 'x' }, error: null });
        return makeChain({ data: null, error: { message: 'Delete failed' } });
      }),
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'p1' },
      request: new Request('https://aegisai.ae/api/admin/blog/p1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('Delete failed');
  });
});
