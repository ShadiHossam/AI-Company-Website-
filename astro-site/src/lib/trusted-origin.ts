// The public site is served from more than one hostname (the Vercel apex domain,
// its www alias, and the o2switch mirror), but a same-origin CSRF check needs an
// exact string match — comparing against a single SITE_URL value silently rejects
// legitimate visitors on every domain except whichever one SITE_URL is set to.
const TRUSTED_ORIGINS = new Set([
  'https://aegisai.ae',
  'https://www.aegisai.ae',
  'https://aicompany.usine.site',
]);

export function isTrustedOrigin(request: Request): boolean {
  if (import.meta.env.DEV) return true;
  const origin = request.headers.get('origin') ?? '';
  if (TRUSTED_ORIGINS.has(origin)) return true;
  const siteUrl = import.meta.env.SITE_URL;
  return !!siteUrl && origin === siteUrl;
}
