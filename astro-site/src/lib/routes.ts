import { GENERATED_ROUTES } from '../data/routes.generated';

/**
 * The site's static route table.
 *
 * This exists so that the sitemap and the page <head> can never disagree about
 * which pages have a translated twin. They used to derive that answer
 * independently: the sitemap globbed `src/pages`, while each page's hreflang
 * came from an `arPath` prop typed by hand at the call site. 76 English pages
 * had a published Arabic twin and simply never passed the prop, so the sitemap
 * advertised a three-way alternate cluster for URLs whose HTML advertised a
 * two-way one, and Google was handed two different answers about the same 152
 * URLs. Both sides now read this module.
 *
 * The list is generated into src/data/routes.generated.ts by
 * scripts/generate-routes.mjs, which `npm run build` runs first. It is a plain
 * array on purpose: an `import.meta.glob` here would put every page module into
 * the module graph of the layout that imports this, and Astro would then inline
 * all 250 pages' scoped styles into every rendered document — 65KB a page
 * became 390KB when it was tried. routes.test.ts fails if the generated file
 * has drifted from the filesystem.
 */
export const ROUTES: readonly string[] = GENERATED_ROUTES;

const ROUTE_SET = new Set(ROUTES);

export const isArabicRoute = (route: string): boolean =>
  route === '/ar' || route.startsWith('/ar/');

/** '/services' -> '/ar/services'; '/' -> '/ar' */
export const arTwinOf = (route: string): string =>
  route === '/' ? '/ar' : `/ar${route}`;

/** '/ar/services' -> '/services'; '/ar' -> '/' */
export const enTwinOf = (route: string): string =>
  route === '/ar' ? '/' : route.slice(3);

export const routeExists = (route: string): boolean => ROUTE_SET.has(route);

/**
 * The Arabic twin of an English route, or null when none is published.
 *
 * Returns null for a route that is already Arabic: a page is not its own twin,
 * and an Arabic page asking this question wants {@link enTwinFor} instead.
 */
export function arTwinFor(route: string): string | null {
  if (isArabicRoute(route)) return null;
  const twin = arTwinOf(route);
  return ROUTE_SET.has(twin) ? twin : null;
}

/** The English twin of an Arabic route, or null when none is published. */
export function enTwinFor(route: string): string | null {
  if (!isArabicRoute(route)) return null;
  const twin = enTwinOf(route);
  return ROUTE_SET.has(twin) ? twin : null;
}
