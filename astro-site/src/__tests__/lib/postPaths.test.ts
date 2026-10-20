import { describe, it, expect } from 'vitest';
import { postPath, postSection } from '../../lib/postPaths';
import { pruneUnpublishedLinks, buildLiveBlogPaths, localiseBlogLinks } from '../../lib/deadLinks';

const live = (paths: string[]) => (p: string) => paths.includes(p);

describe('postPath', () => {
  it('keeps ordinary posts under /blog', () => {
    expect(postPath('how-rag-works')).toBe('/blog/how-rag-works');
    expect(postPath('how-rag-works', 'ar')).toBe('/ar/blog/how-rag-works');
  });

  it('puts section posts at the site root under their section', () => {
    expect(postPath('abu-dhabi/chatbot-hotel')).toBe('/abu-dhabi/chatbot-hotel');
    expect(postPath('abu-dhabi/chatbot-hotel', 'ar')).toBe('/ar/abu-dhabi/chatbot-hotel');
  });

  it('does not treat a plain slug that merely starts with the section name as a section post', () => {
    expect(postSection('abu-dhabi')).toBeNull();
    expect(postSection('abu-dhabi-guide')).toBeNull();
    expect(postPath('abu-dhabi')).toBe('/blog/abu-dhabi');
  });
});

describe('section posts in body links', () => {
  const rows = [
    { slug: 'abu-dhabi/chatbot-hotel', title: 'Hotel chatbots', ar_title: 'روبوت فنادق' },
    { slug: 'abu-dhabi/unified-inbox', title: 'صندوق موحد', ar_title: 'صندوق موحد' },
  ];
  const isArabicOnly = (r: { title?: string | null }) => /[؀-ۿ]/.test(r.title ?? '');

  it('marks section URLs live in each language they exist in', () => {
    const paths = buildLiveBlogPaths(rows, isArabicOnly);
    expect(paths.has('/abu-dhabi/chatbot-hotel')).toBe(true);
    expect(paths.has('/ar/abu-dhabi/chatbot-hotel')).toBe(true);
    expect(paths.has('/abu-dhabi/unified-inbox')).toBe(false);
    expect(paths.has('/ar/abu-dhabi/unified-inbox')).toBe(true);
  });

  it('prunes a link to an unpublished section post', () => {
    expect(pruneUnpublishedLinks('<a href="/abu-dhabi/queued">x</a>', live([])))
      .toBe('<span data-pending-page="true">x</span>');
    expect(pruneUnpublishedLinks('<a href="/ar/abu-dhabi/queued">x</a>', live([])))
      .toBe('<span data-pending-page="true">x</span>');
  });

  it('leaves the section hub link alone', () => {
    const html = '<a href="/abu-dhabi">All Abu Dhabi guides</a>';
    expect(pruneUnpublishedLinks(html, live([]))).toBe(html);
  });

  it('localises a section link to the reader\'s language when that version is live', () => {
    expect(localiseBlogLinks('<a href="/abu-dhabi/chatbot-hotel">x</a>', 'ar', live(['/ar/abu-dhabi/chatbot-hotel'])))
      .toBe('<a href="/ar/abu-dhabi/chatbot-hotel">x</a>');
    expect(localiseBlogLinks('<a href="/ar/abu-dhabi/chatbot-hotel">x</a>', 'en', live(['/abu-dhabi/chatbot-hotel'])))
      .toBe('<a href="/abu-dhabi/chatbot-hotel">x</a>');
  });
});
