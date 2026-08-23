import { describe, it, expect } from 'vitest';
import { legacyPathToNew } from '../../lib/urls';

describe('legacyPathToNew', () => {
  it('maps the bare root to the default language/country home', () => {
    expect(legacyPathToNew('/')).toBe('/en/ae');
  });

  it('maps an English page path', () => {
    expect(legacyPathToNew('/about')).toBe('/en/ae/about');
  });

  it('maps a nested English page path', () => {
    expect(legacyPathToNew('/services/ai-agents/tools/gumloop')).toBe('/en/ae/services/ai-agents/tools/gumloop');
  });

  it('maps the bare /ar root to the Arabic home', () => {
    expect(legacyPathToNew('/ar')).toBe('/ar/ae');
  });

  it('maps an Arabic page path', () => {
    expect(legacyPathToNew('/ar/blog/foo')).toBe('/ar/ae/blog/foo');
  });

  it('maps a bare /en to the English home', () => {
    expect(legacyPathToNew('/en')).toBe('/en/ae');
  });

  it('returns null for an already-migrated English path', () => {
    expect(legacyPathToNew('/en/ae/about')).toBeNull();
  });

  it('returns null for an already-migrated Arabic path', () => {
    expect(legacyPathToNew('/ar/ae/blog/foo')).toBeNull();
  });

  it('returns null for admin paths', () => {
    expect(legacyPathToNew('/admin/blog')).toBeNull();
  });

  it('returns null for api paths', () => {
    expect(legacyPathToNew('/api/apply')).toBeNull();
  });

  it('returns null for robots.txt', () => {
    expect(legacyPathToNew('/robots.txt')).toBeNull();
  });

  it('returns null for the sitemap files', () => {
    expect(legacyPathToNew('/sitemap_index.xml')).toBeNull();
    expect(legacyPathToNew('/page-sitemap.xml')).toBeNull();
  });

  it('returns null for /maintenance', () => {
    expect(legacyPathToNew('/maintenance')).toBeNull();
  });

  it('returns null for static asset paths', () => {
    expect(legacyPathToNew('/assets/brand/logo-white.png')).toBeNull();
    expect(legacyPathToNew('/_astro/chunk.js')).toBeNull();
  });
});
