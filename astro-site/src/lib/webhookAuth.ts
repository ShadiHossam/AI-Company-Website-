import { createHmac, timingSafeEqual } from 'node:crypto';

// Auth for the /api/deploy/* webhooks (called by .github/scripts/trigger-publish.sh).
// A static bearer token is valid forever once seen, so requests are signed instead:
//   X-Timestamp: unix seconds
//   X-Signature: hex HMAC-SHA256(secret, `${timestamp}.${METHOD}.${path}.${body}`)
// Requests older than 5 minutes are rejected, and a signature is accepted once.
const MAX_SKEW_S = 300;
const seen = new Map<string, number>(); // signature -> expiry (ms)

export function signWebhook(secret: string, timestamp: string, method: string, path: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${method}.${path}.${body}`).digest('hex');
}

export function verifyWebhook(request: Request, body: string, secret: string | undefined, now = Date.now()): boolean {
  if (!secret) return false;
  const ts = request.headers.get('x-timestamp') ?? '';
  const sig = request.headers.get('x-signature') ?? '';
  if (!/^\d{10}$/.test(ts) || !/^[0-9a-f]{64}$/.test(sig)) return false;
  if (Math.abs(now / 1000 - Number(ts)) > MAX_SKEW_S) return false;

  const expected = signWebhook(secret, ts, request.method, new URL(request.url).pathname, body);
  if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;

  for (const [s, exp] of seen) if (exp < now) seen.delete(s);
  if (seen.has(sig)) return false;
  seen.set(sig, now + MAX_SKEW_S * 2 * 1000);
  return true;
}
