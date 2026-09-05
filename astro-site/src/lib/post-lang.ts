/**
 * Language classification for blog_posts rows.
 *
 * `blog_posts` has one set of English columns (title, description,
 * body_markdown) and one set of Arabic columns (ar_title, ar_description,
 * ar_body_markdown), with no column saying which language a post was actually
 * written in. 198 of the 398 published posts were authored by writing the same
 * Arabic article into both sets, so every one of them was served twice: once at
 * /blog/<slug> and once at /ar/blog/<slug>, with byte-identical Arabic bodies.
 * The /blog/ copy rendered inside the English layout, declaring
 * `<html lang="en-AE" dir="ltr">` plus `hreflang="en-ae"` and `x-default`
 * pointing at itself, which told Google that an Arabic article was this site's
 * English and default-language version.
 *
 * Until a `lang` column exists, the script of the English-column title is the
 * reliable signal: a post whose `title` is Arabic script has no English version,
 * and belongs only at /ar/blog/<slug>. Once `blog_posts.lang` is added, change
 * `isArabicOnlyPost` to read it and keep the script check as the fallback for
 * rows that predate the column.
 */

/** Arabic, Arabic Supplement, Arabic Extended-A, and Arabic Presentation Forms. */
const ARABIC_RANGES = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * True when a string is predominantly Arabic script. Compares against the
 * letters only, so a mostly-Arabic headline still counts as Arabic when it ends
 * in a Latin brand name such as "| Lenoo AI".
 */
export function isArabicText(value: string | null | undefined): boolean {
  if (!value) return false;

  let letters = 0;
  let arabic = 0;
  for (const char of value) {
    // Cheap "is this a letter" test that works for both scripts: skip digits,
    // spaces, and punctuation, which carry no language signal.
    if (!/\p{L}/u.test(char)) continue;
    letters++;
    if (ARABIC_RANGES.test(char)) arabic++;
  }

  return letters > 0 && arabic / letters > 0.5;
}

/**
 * True when a post exists only in Arabic and must not be served or listed on
 * the English side of the site.
 */
export function isArabicOnlyPost(post: {
  lang?: string | null;
  title?: string | null;
}): boolean {
  if (post.lang) return post.lang.toLowerCase().startsWith('ar');
  return isArabicText(post.title);
}
