import sanitizeHtml from 'sanitize-html';

// Applied at every render boundary that outputs admin-authored rich text via
// set:html (blog body, legal pages) — catches both new writes and any HTML
// already sitting in the database from before this sanitizer existed.
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'code', 'pre',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'span', 'div', 'hr',
    ],
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
      // width/height are allowed so body images can declare their intrinsic
      // size and stop causing layout shift; stripping them was forcing every
      // in-article image to reserve no space until it loaded.
      img: ['src', 'alt', 'title', 'loading', 'width', 'height', 'decoding'],
      '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
}
