/**
 * Language twins: two separately written posts that cover the same topic, one
 * in English and one in Arabic, each under its own slug.
 *
 * Posts on this site are not translations. Most rows are English-only or
 * Arabic-only, and an English post and an Arabic post on the same subject
 * usually have different slugs (`ai-lead-qualification-for-law-firms` and
 * `lead-qualification-law-firms`). The shared-slug pairing (an English row with
 * `ar_title` filled) cannot express that, so those posts carried no hreflang
 * and no language switcher. `blog_posts.twin_slug` links them explicitly.
 *
 * A twin is only used when it is safe to advertise:
 * - both rows are live and indexable (callers pass live rows only; noindex
 *   rows are dropped here), since hreflang to a hidden or noindex URL makes
 *   Google discard the cluster;
 * - the rows are in different languages and each is single-language (a row
 *   that already has both versions pairs with itself);
 * - the link is reciprocal, so one bad edit cannot point two posts at the same
 *   twin.
 */

import { postPath } from './postPaths';

export interface TwinRow {
  slug: string;
  lang?: string | null;
  title?: string | null;
  ar_title?: string | null;
  twin_slug?: string | null;
  noindex?: boolean | null;
}

type Lang = 'en' | 'ar';

/**
 * The single language a row is published in, or null when the row carries both
 * versions under one slug (and so needs no twin).
 */
function singleLanguage(row: TwinRow, isArabicOnly: (row: TwinRow) => boolean): Lang | null {
  if (isArabicOnly(row)) return 'ar';
  return row.ar_title ? null : 'en';
}

/**
 * Maps each twinned post's own URL to its twin's URL, in both directions:
 * `/blog/<en-slug>` → `/ar/blog/<ar-slug>` and `/ar/blog/<ar-slug>` →
 * `/blog/<en-slug>` (section posts use their section path).
 *
 * The same map answers both questions the site asks: "what is this page's
 * other-language version" (look up the page's own path) and "where should a
 * cross-language link in an article body go" (look up the link's path).
 */
export function buildTwinMap(
  rows: TwinRow[],
  isArabicOnly: (row: TwinRow) => boolean,
): Map<string, string> {
  const bySlug = new Map<string, TwinRow>();
  for (const row of rows) if (row.slug) bySlug.set(row.slug, row);

  const twins = new Map<string, string>();
  for (const row of rows) {
    if (!row.slug || !row.twin_slug || row.noindex) continue;
    const twin = bySlug.get(row.twin_slug);
    if (!twin || twin.noindex || twin.twin_slug !== row.slug) continue;

    const lang = singleLanguage(row, isArabicOnly);
    const twinLang = singleLanguage(twin, isArabicOnly);
    if (!lang || !twinLang || lang === twinLang) continue;

    twins.set(postPath(row.slug, lang), postPath(twin.slug, twinLang));
  }
  return twins;
}
