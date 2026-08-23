export const DEFAULT_LANG = 'en';
export const DEFAULT_COUNTRY = 'ae';

// Root-level infra/static paths that must never get a language/country prefix.
const UNPREFIXED_PATHS = new Set<string>([
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/page-sitemap.xml',
  '/post-sitemap.xml',
  '/main-sitemap.xsl',
  '/site.webmanifest',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon-32.png',
  '/cookie-consent.js',
  '/maintenance',
]);

const UNPREFIXED_PREFIXES = ['/admin', '/api', '/_astro', '/assets', '/_image', '/favicon', '/storage'];

function isUnprefixedPath(pathname: string): boolean {
  if (UNPREFIXED_PATHS.has(pathname)) return true;
  return UNPREFIXED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isNewStylePath(pathname: string): boolean {
  return (
    pathname === `/${DEFAULT_LANG}/${DEFAULT_COUNTRY}` ||
    pathname.startsWith(`/${DEFAULT_LANG}/${DEFAULT_COUNTRY}/`) ||
    pathname === `/ar/${DEFAULT_COUNTRY}` ||
    pathname.startsWith(`/ar/${DEFAULT_COUNTRY}/`)
  );
}

/**
 * Maps a pre-migration path ('/', '/about', '/blog/foo', '/ar', '/ar/about')
 * to its new /{lang}/{country} equivalent. Returns null when the path should
 * not be redirected: already new-style, or an excluded infra/admin/api path.
 */
export function legacyPathToNew(pathname: string): string | null {
  if (isUnprefixedPath(pathname) || isNewStylePath(pathname)) return null;
  if (pathname === '/en') return `/en/${DEFAULT_COUNTRY}`;
  if (pathname === '/ar') return `/ar/${DEFAULT_COUNTRY}`;
  if (pathname.startsWith('/ar/')) return `/ar/${DEFAULT_COUNTRY}${pathname.slice(3)}`;
  if (pathname === '/') return `/${DEFAULT_LANG}/${DEFAULT_COUNTRY}`;
  return `/${DEFAULT_LANG}/${DEFAULT_COUNTRY}${pathname}`;
}
