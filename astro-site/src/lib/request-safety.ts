// Shared request-hardening helpers for the public API routes and layouts.

// Client IP for rate limiting and the maintenance allow-list.
// - Behind Cloudflare (lenooai.com), cf-connecting-ip is set by the edge.
// - Otherwise (staging, or a direct hit on the origin), the o2switch front proxy
//   appends the real peer to X-Forwarded-For, so the LAST entry is trustworthy.
//   The first entry is whatever the client sent and can't be used: rotating it
//   used to bypass every rate limit.
export function getClientIp(request: Request, clientAddress?: string): string {
  const cf = request.headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;
  const xff = request.headers.get('x-forwarded-for');
  const last = xff?.split(',').map((s) => s.trim()).filter(Boolean).pop();
  if (last) return last;
  return clientAddress || 'unknown';
}

// Fixed-window per-key limiter. Expired entries are pruned on each call so the
// map can't grow without bound on a long-running Node process.
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function allow(key: string): boolean {
    const now = Date.now();
    if (hits.size > 1000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) return false;
    entry.count++;
    return true;
  };
}

// Returns the URL normalised if it parses as an absolute https: URL, else null.
// Parsing (rather than a scheme regex) matters: browsers strip tabs/newlines, so
// "java\tscript:..." got past the old /^(javascript|data):/ check.
export function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

// For applicant-typed links like "linkedin.com/in/x": adds https:// when no scheme
// is given, then accepts only http(s). Returns null for anything else.
export function normaliseWebUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const v = value.trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

// For rendering stored links in admin pages: anything that isn't http(s) becomes '#'.
export function safeHref(value: unknown): string {
  if (typeof value !== 'string') return '#';
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '#';
  } catch {
    return '#';
  }
}

// JSON for a <script type="application/ld+json"> body. Escaping "<" stops a
// "</script>" inside DB text from closing the tag early.
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
