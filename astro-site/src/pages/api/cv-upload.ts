import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';
import { isTrustedOrigin } from '../../lib/trusted-origin';
import { getClientIp, createRateLimiter } from '../../lib/request-safety';

export const prerender = false;

// CVs live in the private `cvs` bucket. The browser never gets a storage key:
// this route hands out a one-time signed upload URL for a server-chosen path,
// and /api/apply then accepts only a path of that shape. Admins open CVs through
// /api/admin/applications/[id]/cv, which redirects to a short-lived signed URL.
const ALLOWED: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const MAX_BYTES = 5 * 1024 * 1024;

const checkRateLimit = createRateLimiter(5, 10 * 60 * 1000);

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!isTrustedOrigin(request)) return json({ error: 'Forbidden' }, 403);

  let body: { ext?: unknown; size?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const ext = typeof body?.ext === 'string' ? body.ext.toLowerCase() : '';
  const size = typeof body?.size === 'number' ? body.size : 0;
  if (!ALLOWED[ext]) return json({ error: 'CV must be a PDF or Word file' }, 400);
  if (size <= 0 || size > MAX_BYTES) return json({ error: 'CV file must be under 5 MB' }, 400);

  if (!checkRateLimit(getClientIp(request, clientAddress))) return json({ error: 'Too many requests' }, 429);

  const path = `${crypto.randomUUID()}.${ext}`;
  const { data, error } = await getSupabaseAdmin().storage.from('cvs').createSignedUploadUrl(path);
  if (error || !data) {
    console.error('[cv-upload] signed URL failed:', error?.message);
    return json({ error: 'Upload unavailable' }, 502);
  }
  return json({ path, uploadUrl: data.signedUrl, contentType: ALLOWED[ext] }, 200);
};
