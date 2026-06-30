import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeLocals, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { GET } from '../../pages/api/admin/media/index';
import { DELETE } from '../../pages/api/admin/media/[id]';
import { POST as UPLOAD } from '../../pages/api/admin/media/upload';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = {
    from: vi.fn().mockReturnValue(chain),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.test/media/file.jpg' } }),
      }),
    },
  };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return supabase;
}

// ============================================================
// GET /api/admin/media
// ============================================================

describe('GET /api/admin/media', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, url: new URL('https://aegisai.ae/api/admin/media') };
    const res = await GET(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns paginated media list', async () => {
    const files = [{ id: 'm1', filename: 'logo.png', public_url: 'https://cdn/logo.png' }];
    makeSupabase({ data: files, count: 1, error: null });

    const ctx = {
      locals: makeLocals(),
      url: new URL('https://aegisai.ae/api/admin/media?page=1'),
    };
    const res = await GET(ctx as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(files);
    expect(body.total).toBe(1);
    expect(body.pageSize).toBe(40);
  });

  it('returns 500 on DB error', async () => {
    makeSupabase({ data: null, error: { message: 'DB fail' }, count: null });
    const ctx = { locals: makeLocals(), url: new URL('https://aegisai.ae/api/admin/media') };
    const res = await GET(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('Internal server error');
  });
});

// ============================================================
// DELETE /api/admin/media/[id]
// ============================================================

describe('DELETE /api/admin/media/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = {
      locals: {},
      params: { id: 'm1' },
      request: new Request('https://aegisai.ae/api/admin/media/m1', {
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
      params: { id: 'm1' },
      request: new Request('https://aegisai.ae/api/admin/media/m1', {
        method: 'DELETE',
        headers: { origin: 'https://evil.com' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 404 when media not found', async () => {
    const supabase = makeSupabase({ data: null, error: { message: 'Not found' } });
    const ctx = {
      locals: makeLocals(),
      params: { id: 'missing' },
      request: new Request('https://aegisai.ae/api/admin/media/missing', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('Media not found');
  });

  it('deletes media from DB and storage', async () => {
    let call = 0;
    const removeStorageMock = vi.fn().mockResolvedValue({ error: null });
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: { storage_path: 'uploads/file.jpg' }, error: null });
        return makeChain({ data: null, error: null });
      }),
      storage: {
        from: vi.fn().mockReturnValue({ remove: removeStorageMock }),
      },
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'm1' },
      request: new Request('https://aegisai.ae/api/admin/media/m1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(removeStorageMock).toHaveBeenCalledWith(['uploads/file.jpg']);
  });

  it('returns 500 when DB delete fails', async () => {
    let call = 0;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeChain({ data: { storage_path: 'uploads/file.jpg' }, error: null });
        return makeChain({ data: null, error: { message: 'FK constraint' } });
      }),
      storage: { from: vi.fn().mockReturnValue({ remove: vi.fn().mockResolvedValue({ error: null }) }) },
    });

    const ctx = {
      locals: makeLocals(),
      params: { id: 'm1' },
      request: new Request('https://aegisai.ae/api/admin/media/m1', {
        method: 'DELETE',
        headers: { origin: 'https://aegisai.ae' },
      }),
    };
    const res = await DELETE(ctx as any);
    expect(res.status).toBe(500);
  });
});

// ============================================================
// POST /api/admin/media/upload
// ============================================================

function makeUploadRequest(
  fileContent: Uint8Array | string = new Uint8Array([137, 80]),
  filename = 'photo.jpg',
  mimeType = 'image/jpeg',
  altText = '',
  origin = 'https://aegisai.ae',
) {
  const fd = new FormData();
  fd.append('file', new File([fileContent], filename, { type: mimeType }));
  if (altText) fd.append('alt_text', altText);
  return new Request('https://aegisai.ae/api/admin/media/upload', {
    method: 'POST',
    headers: { origin },
    body: fd,
  });
}

describe('POST /api/admin/media/upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const ctx = { locals: {}, request: makeUploadRequest() };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 on CSRF failure', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeUploadRequest(new Uint8Array([1]), 'x.jpg', 'image/jpeg', '', 'https://evil.com'),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 when no file provided', async () => {
    const fd = new FormData();
    const ctx = {
      locals: makeLocals(),
      request: new Request('https://aegisai.ae/api/admin/media/upload', {
        method: 'POST',
        headers: { origin: 'https://aegisai.ae' },
        body: fd,
      }),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('No file provided');
  });

  it('returns 400 for non-image file', async () => {
    const ctx = {
      locals: makeLocals(),
      request: makeUploadRequest('pdf content', 'doc.pdf', 'application/pdf'),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Only image files are allowed');
  });

  it('returns 400 when file exceeds 10MB', async () => {
    const big = new Uint8Array(11 * 1024 * 1024);
    const ctx = {
      locals: makeLocals(),
      request: makeUploadRequest(big, 'huge.jpg', 'image/jpeg'),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('File exceeds 10 MB limit');
  });

  it('returns 201 on successful upload', async () => {
    const created = { id: 'new-id', filename: 'photo.jpg', public_url: 'https://cdn/photo.jpg' };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(makeChain({ data: created, error: null })),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/photo.jpg' } }),
          remove: vi.fn().mockResolvedValue({ error: null }),
        }),
      },
    });

    const ctx = {
      locals: makeLocals(),
      request: makeUploadRequest(new Uint8Array([137, 80, 78]), 'photo.jpg', 'image/jpeg', 'A photo'),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('new-id');
    expect(body.public_url).toBe('https://cdn/photo.jpg');
  });

  it('returns 500 and removes file when DB insert fails', async () => {
    const removeMock = vi.fn().mockResolvedValue({ error: null });
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(makeChain({ data: null, error: { message: 'unique violation' } })),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/photo.jpg' } }),
          remove: removeMock,
        }),
      },
    });

    const ctx = {
      locals: makeLocals(),
      request: makeUploadRequest(new Uint8Array([137, 80]), 'photo.jpg', 'image/jpeg'),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/DB insert failed/);
    expect(removeMock).toHaveBeenCalledOnce();
  });

  it('returns 500 when storage upload fails', async () => {
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(makeChain({ data: null, error: null })),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: { message: 'bucket not found' } }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
          remove: vi.fn().mockResolvedValue({ error: null }),
        }),
      },
    });

    const ctx = {
      locals: makeLocals(),
      request: makeUploadRequest(new Uint8Array([1]), 'photo.jpg', 'image/jpeg'),
    };
    const res = await UPLOAD(ctx as any);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/Upload failed/);
  });
});
