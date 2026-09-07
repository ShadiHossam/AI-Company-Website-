import { describe, it, expect } from 'vitest';
import { pruneUnpublishedLinks, buildLiveBlogPaths, localiseBlogLinks } from '../../lib/deadLinks';

const live = (paths: string[]) => (p: string) => paths.includes(p);

describe('pruneUnpublishedLinks', () => {
  it('leaves a link to a published post alone', () => {
    const html = '<p>See <a href="/blog/how-rag-works">this</a>.</p>';
    expect(pruneUnpublishedLinks(html, live(['/blog/how-rag-works']))).toBe(html);
  });

  it('turns a link to an unpublished post into a span, keeping the text', () => {
    const html = '<p>See <a href="/blog/not-yet">this guide</a>.</p>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(
      '<p>See <span data-pending-page="true">this guide</span>.</p>',
    );
  });

  it('handles the Arabic blog prefix', () => {
    const html = '<a href="/ar/blog/queued">مقال</a>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(
      '<span data-pending-page="true">مقال</span>',
    );
  });

  it('normalises a trailing slash, query and hash before checking', () => {
    const published = live(['/blog/how-rag-works']);
    expect(pruneUnpublishedLinks('<a href="/blog/how-rag-works/">x</a>', published))
      .toContain('<a href');
    expect(pruneUnpublishedLinks('<a href="/blog/how-rag-works#intro">x</a>', published))
      .toContain('<a href');
    expect(pruneUnpublishedLinks('<a href="/blog/how-rag-works?utm=1">x</a>', published))
      .toContain('<a href');
  });

  it('never touches non-blog links, even when they are unknown', () => {
    const html =
      '<a href="/services/ai-agents">svc</a> <a href="https://u.ae">gov</a> <a href="/contact">c</a>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(html);
  });

  it('does not treat the blog index or a nested path as a post', () => {
    const html = '<a href="/blog">index</a> <a href="/blog/a/b">nested</a>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(html);
  });

  it('keeps an authored class so the span inherits body link styling', () => {
    const html = '<a class="inline-cta" href="/blog/queued" rel="noopener noreferrer">go</a>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(
      '<span data-pending-page="true" class="inline-cta">go</span>',
    );
  });

  it('preserves markup inside the link text', () => {
    const html = '<a href="/blog/queued">a <strong>bold</strong> title</a>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(
      '<span data-pending-page="true">a <strong>bold</strong> title</span>',
    );
  });

  it('prunes each link independently in one body', () => {
    const html = '<a href="/blog/here">A</a><a href="/blog/gone">B</a>';
    expect(pruneUnpublishedLinks(html, live(['/blog/here']))).toBe(
      '<a href="/blog/here">A</a><span data-pending-page="true">B</span>',
    );
  });

  it('returns empty input unchanged', () => {
    expect(pruneUnpublishedLinks('', live([]))).toBe('');
  });
});

describe('buildLiveBlogPaths', () => {
  const isArabicOnly = (row: { title?: string | null }) =>
    /[؀-ۿ]/.test(row.title ?? '');

  it('lists the English path for an English post', () => {
    const s = buildLiveBlogPaths([{ slug: 'a', title: 'How RAG works', ar_title: null }], isArabicOnly);
    expect([...s]).toEqual(['/blog/a']);
  });

  it('lists both paths for a post that exists in both languages', () => {
    const s = buildLiveBlogPaths([{ slug: 'a', title: 'How RAG works', ar_title: 'كيف' }], isArabicOnly);
    expect([...s].sort()).toEqual(['/ar/blog/a', '/blog/a']);
  });

  it('omits the English path for an Arabic-only post, since that URL only redirects', () => {
    const s = buildLiveBlogPaths([{ slug: 'a', title: 'كيف يعمل', ar_title: 'كيف يعمل' }], isArabicOnly);
    expect([...s]).toEqual(['/ar/blog/a']);
  });

  it('omits the Arabic path when the post has no Arabic title', () => {
    const s = buildLiveBlogPaths([{ slug: 'a', title: 'English only', ar_title: null }], isArabicOnly);
    expect(s.has('/ar/blog/a')).toBe(false);
  });

  it('skips rows with no slug', () => {
    const s = buildLiveBlogPaths([{ slug: '', title: 'x', ar_title: null }], isArabicOnly);
    expect(s.size).toBe(0);
  });
});

describe('localiseBlogLinks', () => {
  it('moves an English link to Arabic when the Arabic version is live', () => {
    const html = '<a href="/blog/how-rag-works" rel="noopener noreferrer">كيف</a>';
    expect(localiseBlogLinks(html, 'ar', live(['/ar/blog/how-rag-works']))).toBe(
      '<a href="/ar/blog/how-rag-works" rel="noopener noreferrer">كيف</a>',
    );
  });

  it('moves an Arabic link to English on the English side', () => {
    const html = '<a href="/ar/blog/how-rag-works">RAG</a>';
    expect(localiseBlogLinks(html, 'en', live(['/blog/how-rag-works']))).toBe(
      '<a href="/blog/how-rag-works">RAG</a>',
    );
  });

  it('leaves the link alone when only the other language exists', () => {
    const html = '<a href="/blog/getting-started-with-ai-dubai">دليل</a>';
    expect(localiseBlogLinks(html, 'ar', live([]))).toBe(html);
  });

  it('does not touch a link already in the right language', () => {
    const html = '<a href="/ar/blog/x">x</a>';
    expect(localiseBlogLinks(html, 'ar', live(['/ar/blog/x']))).toBe(html);
  });

  it('ignores non-blog links', () => {
    const html = '<a href="/services/ai-agents">svc</a>';
    expect(localiseBlogLinks(html, 'ar', live(['/ar/services/ai-agents']))).toBe(html);
  });

  it('composes with the pruner: localise, then check liveness', () => {
    const livePaths = ['/ar/blog/twin'];
    const html = '<a href="/blog/twin">a</a><a href="/blog/queued">b</a>';
    const out = pruneUnpublishedLinks(
      localiseBlogLinks(html, 'ar', live(livePaths)),
      live(livePaths),
    );
    expect(out).toBe(
      '<a href="/ar/blog/twin">a</a><span data-pending-page="true">b</span>',
    );
  });
});
