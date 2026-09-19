/**
 * Staged release of the Arabic marketing and pricing pages, one page a day.
 *
 * The pages ship in a single deploy but stay unpublished until their day: the
 * page itself answers 404, and the route table (hreflang, sitemap) and the
 * Arabic navigation all treat it as absent. Everything reads the date at
 * request time, so each page goes live at midnight Dubai time on its day with
 * no further deploy.
 *
 * RELEASE_START is the Dubai calendar day the first page goes live, as
 * 'YYYY-MM-DD'. While it is null nothing in RELEASE_ORDER is published, which
 * keeps an early deploy from releasing the whole batch at once.
 */
export const RELEASE_START: string | null = null;

/** Publication order: the page at index n goes live n days after RELEASE_START. */
export const RELEASE_ORDER: readonly string[] = [
  '/ar/pricing/ai-automation-cost',
  '/ar/industries/marketing/seo',
  '/ar/industries/marketing/social-media',
  '/ar/industries/marketing/image-generation',
  '/ar/industries/marketing/video-generation',
  '/ar/industries/marketing/voice-generation',
  '/ar/industries/marketing/email-marketing',
  '/ar/industries/marketing/content-writing',
  '/ar/industries/marketing/analytics-attribution',
  '/ar/industries/marketing/influencer-marketing',
  '/ar/industries/marketing/paid-ads',
];

/** Dubai is UTC+4 all year, with no daylight saving. */
const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The instant a scheduled route goes live: midnight Dubai time on its day.
 * Null for a route that is not scheduled, or when no start date is set.
 */
export function releaseAt(route: string, start: string | null = RELEASE_START): Date | null {
  const index = RELEASE_ORDER.indexOf(route);
  if (index < 0 || start === null) return null;
  const [y, m, d] = start.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) - DUBAI_OFFSET_MS + index * DAY_MS);
}

/**
 * Whether a route is published at `now`. Routes outside the schedule are
 * always published; scheduled ones only from their release instant onward.
 */
export function isReleased(
  route: string,
  now: Date = new Date(),
  start: string | null = RELEASE_START,
): boolean {
  if (!RELEASE_ORDER.includes(route)) return true;
  const at = releaseAt(route, start);
  return at !== null && now.getTime() >= at.getTime();
}
