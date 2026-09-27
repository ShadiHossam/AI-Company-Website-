import { describe, it, expect } from 'vitest';
import { RELEASE_ORDER, releaseAt, isReleased, holdingPath, unreleasedResponse } from '../../lib/arRollout';
import { ROUTES } from '../../lib/routes';

const START = '2026-10-01';
const PRICING = '/ar/pricing/ai-automation-cost';
const SEO = '/ar/industries/marketing/seo';
const LAST = '/ar/industries/marketing/paid-ads';

describe('Arabic rollout schedule', () => {
  it('schedules all 11 pages, pricing first, and every one exists on disk', () => {
    expect(RELEASE_ORDER).toHaveLength(11);
    expect(RELEASE_ORDER[0]).toBe(PRICING);
    expect(new Set(RELEASE_ORDER).size).toBe(11);
    // A typo here would leave a page unpublished forever, so check the paths.
    expect(RELEASE_ORDER.filter((r) => !ROUTES.includes(r))).toEqual([]);
  });

  it('releases each page at midnight Dubai time, one day apart', () => {
    expect(releaseAt(PRICING, START)?.toISOString()).toBe('2026-09-30T20:00:00.000Z');
    expect(releaseAt(SEO, START)?.toISOString()).toBe('2026-10-01T20:00:00.000Z');
    expect(releaseAt(LAST, START)?.toISOString()).toBe('2026-10-10T20:00:00.000Z');
  });

  it('keeps a page unpublished until its release instant', () => {
    expect(isReleased(PRICING, new Date('2026-09-30T19:59:59Z'), START)).toBe(false);
    expect(isReleased(PRICING, new Date('2026-09-30T20:00:00Z'), START)).toBe(true);
    expect(isReleased(SEO, new Date('2026-10-01T12:00:00Z'), START)).toBe(false);
    expect(isReleased(SEO, new Date('2026-10-02T00:00:00Z'), START)).toBe(true);
  });

  it('publishes nothing in the schedule while no start date is set', () => {
    const later = new Date('2030-01-01T00:00:00Z');
    expect(RELEASE_ORDER.every((r) => !isReleased(r, later, null))).toBe(true);
    expect(releaseAt(PRICING, null)).toBeNull();
  });

  it('leaves routes outside the schedule untouched', () => {
    expect(isReleased('/ar/industries/marketing', new Date(0), null)).toBe(true);
    expect(isReleased('/industries/marketing/seo', new Date(0), null)).toBe(true);
    expect(releaseAt('/ar/services', START)).toBeNull();
  });
});

describe('unreleased pages', () => {
  it('send marketing pages to the hub and the pricing page to services', () => {
    expect(holdingPath('/ar/industries/marketing/seo')).toBe('/ar/industries/marketing');
    expect(holdingPath('/ar/pricing/ai-automation-cost')).toBe('/ar/services');
  });

  it('answer with an uncacheable temporary redirect, not a 404', () => {
    const res = unreleasedResponse('/ar/industries/marketing/paid-ads');
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/ar/industries/marketing');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});
