import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain, makeRequest } from '../helpers';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock('../../lib/resend', () => ({ sendApplicationNotification: vi.fn() }));

import { getSupabaseAdmin } from '../../lib/supabase';
import { POST as applyPOST } from '../../pages/api/apply';
import { POST as cvUploadPOST } from '../../pages/api/cv-upload';

const CV_PATH = '3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f.pdf';
const valid = {
  job_id: 'j1', job_title: 'Engineer', full_name: 'Sam', email: 'sam@example.com',
  cv_url: CV_PATH, cover_letter: 'Hello',
};

// Each test uses its own IP so the per-IP rate limit never interferes.
let n = 0;
const req = (body: unknown) => {
  const r = makeRequest(body);
  r.headers.set('cf-connecting-ip', `10.0.0.${++n}`);
  return r;
};

describe('POST /api/apply', () => {
  let insert: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    const chain = makeChain({ data: { id: 'a1' }, error: null });
    insert = chain.insert as ReturnType<typeof vi.fn>;
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({ from: vi.fn().mockReturnValue(chain) });
  });

  it('accepts a valid application and stores the CV path', async () => {
    const res = await applyPOST({ request: req({ ...valid, linkedin_url: 'linkedin.com/in/sam' }) } as any);
    expect(res.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      cv_url: CV_PATH,
      linkedin_url: 'https://linkedin.com/in/sam',
    }));
  });

  it('rejects a CV that is a URL rather than an issued path', async () => {
    const res = await applyPOST({ request: req({ ...valid, cv_url: 'https://evil.example/cv.pdf' }) } as any);
    expect(res.status).toBe(400);
  });

  it('rejects script links, including tab-split schemes', async () => {
    for (const bad of ['javascript:alert(1)', 'data:text/html,x']) {
      const res = await applyPOST({ request: req({ ...valid, portfolio_url: bad }) } as any);
      expect(res.status).toBe(400);
    }
  });

  it('returns 400, not 500, for a null body or non-string fields', async () => {
    expect((await applyPOST({ request: req(null) } as any)).status).toBe(400);
    expect((await applyPOST({ request: req({ ...valid, full_name: 42 }) } as any)).status).toBe(400);
  });

  it('rejects an invalid email', async () => {
    const res = await applyPOST({ request: req({ ...valid, email: 'not-an-email' }) } as any);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/cv-upload', () => {
  let createSignedUploadUrl: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    createSignedUploadUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://x.supabase.co/sign' }, error: null });
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
      storage: { from: vi.fn().mockReturnValue({ createSignedUploadUrl }) },
    });
  });

  it('issues a signed upload for a server-chosen path', async () => {
    const res = await cvUploadPOST({ request: req({ ext: 'pdf', size: 1000 }) } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.path).toMatch(/^[0-9a-f-]{36}\.pdf$/);
    expect(body.contentType).toBe('application/pdf');
    expect(createSignedUploadUrl).toHaveBeenCalledWith(body.path);
  });

  it('rejects other file types and oversize files', async () => {
    expect((await cvUploadPOST({ request: req({ ext: 'html', size: 10 }) } as any)).status).toBe(400);
    expect((await cvUploadPOST({ request: req({ ext: 'pdf', size: 6 * 1024 * 1024 }) } as any)).status).toBe(400);
  });

  it('rejects other origins', async () => {
    const r = makeRequest({ ext: 'pdf', size: 10 }, 'POST', 'https://evil.example');
    expect((await cvUploadPOST({ request: r } as any)).status).toBe(403);
  });
});
