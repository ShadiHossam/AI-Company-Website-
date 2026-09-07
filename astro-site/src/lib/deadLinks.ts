/**
 * Neutralises links to blog posts that are not published yet.
 *
 * Article bodies are authored ahead of the publishing queue and cross-link each
 * other freely, so at any moment a large share of those links point at posts
 * that do not exist. 161 such URLs were live at once, linked 229 times from 93
 * articles. Every one of them resolved by redirecting to /blog, which Google
 * reads as a soft 404: the crawler spends budget on dead ends and the link
 * equity flowing into them is thrown away.
 *
 * The rest of the site avoids this with `SafeLink`, which renders a <span> for
 * anything in PENDING_PAGES. Article bodies are stored as markdown and injected
 * as raw HTML, so they never pass through a component and need the same
 * treatment applied to the rendered string instead.
 *
 * Only blog links are touched, and only ones the caller says are not live.
 * Everything else in the body is left exactly as authored.
 */

/** `/blog/foo`, `/ar/blog/foo`, with optional trailing slash, query or hash. */
const BLOG_HREF = /^\/(?:ar\/)?blog\/[^/?#]+\/?(?:[?#].*)?$/;

/** Anchors do not nest, so matching to the first closing tag is safe. */
const ANCHOR = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

const HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

/** Strips the query and hash, and any trailing slash, from a blog href. */
function toPath(href: string): string {
  const path = href.split(/[?#]/)[0];
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Rewrites <a> tags pointing at unpublished posts into <span> tags, keeping the
 * link text and dropping only the href. The marker attribute matches the one
 * SafeLink emits, so both paths style identically and are equally greppable.
 *
 * @param html      Rendered, already-sanitised article body.
 * @param isLive    Answers whether a blog path is published and directly servable.
 */
export function pruneUnpublishedLinks(
  html: string,
  isLive: (path: string) => boolean,
): string {
  if (!html) return html;

  return html.replace(ANCHOR, (whole, attrs: string, inner: string) => {
    const m = HREF.exec(attrs);
    if (!m) return whole;

    const href = m[1] ?? m[2] ?? '';
    if (!BLOG_HREF.test(href)) return whole;
    if (isLive(toPath(href))) return whole;

    // Keep any class the author set so the span inherits the body's link
    // styling, but drop href, rel and target, which mean nothing on a span.
    const classMatch = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
    const cls = classMatch ? ` class="${classMatch[1] ?? classMatch[2]}"` : '';
    return `<span data-pending-page="true"${cls}>${inner}</span>`;
  });
}

/**
 * Builds the `isLive` predicate from the published rows.
 *
 * The two languages have different liveness rules, because the two routes do.
 * `/blog/<slug>` 301s to the Arabic side when the row is Arabic-only, and
 * `/ar/blog/<slug>` 302s to the English side when the row has no `ar_title`.
 * Neither redirect is a page, so neither counts as live here.
 */
export function buildLiveBlogPaths(
  rows: Array<{ slug: string; title?: string | null; ar_title?: string | null }>,
  isArabicOnly: (row: { title?: string | null }) => boolean,
): Set<string> {
  const live = new Set<string>();
  for (const row of rows) {
    if (!row.slug) continue;
    if (!isArabicOnly(row)) live.add(`/blog/${row.slug}`);
    if (row.ar_title) live.add(`/ar/blog/${row.slug}`);
  }
  return live;
}

/**
 * Points a body link at the reader's own language when that version exists.
 *
 * Article bodies are authored per language but cross-link by slug, so 31 Arabic
 * articles carried links to /blog/<slug> with Arabic anchor text. A reader on
 * the Arabic site clicking one landed on English, and the link told Google that
 * the Arabic section points into the English one.
 *
 * A link is only moved when the same-language version is actually live. Where
 * an article exists in one language only, the cross-language link is left
 * alone: it is the sole version, and a link to it beats no link at all.
 *
 * @param html    Rendered, already-sanitised article body.
 * @param lang    Which side of the site is rendering.
 * @param isLive  Answers whether a blog path is published and directly servable.
 */
export function localiseBlogLinks(
  html: string,
  lang: 'en' | 'ar',
  isLive: (path: string) => boolean,
): string {
  if (!html) return html;

  const from = lang === 'ar' ? /^\/blog\/([^/?#]+)\/?$/ : /^\/ar\/blog\/([^/?#]+)\/?$/;
  const to = (slug: string) => (lang === 'ar' ? `/ar/blog/${slug}` : `/blog/${slug}`);

  return html.replace(ANCHOR, (whole, attrs: string) => {
    const m = HREF.exec(attrs);
    if (!m) return whole;

    const href = m[1] ?? m[2] ?? '';
    const hit = from.exec(href.split(/[?#]/)[0]);
    if (!hit) return whole;

    const target = to(hit[1]);
    if (!isLive(target)) return whole;

    return whole.replace(HREF, `href="${target}"`);
  });
}
