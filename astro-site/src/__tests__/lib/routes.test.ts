import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectRoutes, render } from '../../../scripts/generate-routes.mjs';
import {
  ROUTES,
  isArabicRoute,
  arTwinOf,
  enTwinOf,
  routeExists,
  arTwinFor,
  enTwinFor,
} from '../../lib/routes';

describe('routes.generated.ts', () => {
  it('is current with src/pages', () => {
    const onDisk = readFileSync(
      join(process.cwd(), 'src/data/routes.generated.ts'),
      'utf8',
    );
    expect(onDisk).toBe(render(collectRoutes()));
  });

  it('excludes admin, api, dynamic and non-indexable routes', () => {
    expect(ROUTES.some(r => r.startsWith('/admin'))).toBe(false);
    expect(ROUTES.some(r => r.startsWith('/api'))).toBe(false);
    expect(ROUTES.some(r => r.includes('['))).toBe(false);
    expect(ROUTES).not.toContain('/404');
    expect(ROUTES).not.toContain('/maintenance');
  });

  it('includes the homepage and both language roots', () => {
    expect(ROUTES).toContain('/');
    expect(ROUTES).toContain('/ar');
  });
});

describe('twin lookup', () => {
  it('classifies Arabic routes', () => {
    expect(isArabicRoute('/ar')).toBe(true);
    expect(isArabicRoute('/ar/services')).toBe(true);
    expect(isArabicRoute('/arabic-ai')).toBe(false);
    expect(isArabicRoute('/services')).toBe(false);
  });

  it('maps between the two trees, including the roots', () => {
    expect(arTwinOf('/')).toBe('/ar');
    expect(arTwinOf('/services')).toBe('/ar/services');
    expect(enTwinOf('/ar')).toBe('/');
    expect(enTwinOf('/ar/services')).toBe('/services');
  });

  it('finds the Arabic twin of a paired English page', () => {
    expect(arTwinFor('/industries/accounting-firms')).toBe('/ar/industries/accounting-firms');
    expect(arTwinFor('/')).toBe('/ar');
  });

  it('returns null for an English page with no Arabic twin', () => {
    expect(routeExists('/industries/marketing/seo')).toBe(true);
    expect(routeExists('/ar/industries/marketing/seo')).toBe(false);
    expect(arTwinFor('/industries/marketing/seo')).toBeNull();
  });

  it('returns null rather than treating a page as its own twin', () => {
    expect(arTwinFor('/ar/services')).toBeNull();
    expect(enTwinFor('/services')).toBeNull();
  });

  it('finds the English twin of an Arabic page', () => {
    expect(enTwinFor('/ar/services')).toBe('/services');
    expect(enTwinFor('/ar')).toBe('/');
  });

  it('every Arabic route has an English twin, which the sitemap relies on', () => {
    const orphaned = ROUTES.filter(r => isArabicRoute(r) && enTwinFor(r) === null);
    expect(orphaned).toEqual([]);
  });
});
