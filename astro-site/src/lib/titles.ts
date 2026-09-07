/**
 * Title budget for a search result. Google truncates at roughly 580 pixels,
 * which is near 60 characters for typical mixed-case Latin text.
 */
export const TITLE_LIMIT = 60;

/**
 * Appends a brand suffix only when the result still fits the SERP budget.
 *
 * The article layouts used to append " | Lenoo AI Blog" (and " | مدونة Lenoo AI"
 * on the Arabic side) unconditionally. The stored titles are well within budget
 * on their own, but the suffix pushed 106 of them past 70 characters, and the
 * suffix is the first thing Google cuts, so the brand rarely survived anyway.
 * Short titles keep the brand; long ones keep their own words instead.
 */
export function withBrand(title: string, suffix: string, limit = TITLE_LIMIT): string {
  const trimmed = (title ?? '').trim();
  const full = `${trimmed}${suffix}`;
  return full.length <= limit ? full : trimmed;
}
