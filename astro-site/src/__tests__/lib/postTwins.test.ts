import { describe, it, expect } from 'vitest';
import { buildTwinMap } from '../../lib/postTwins';
import { isArabicOnlyPost } from '../../lib/post-lang';

const en = (slug: string, twin_slug?: string, extra = {}) => ({ slug, lang: 'en', title: 'English', twin_slug, ...extra });
const ar = (slug: string, twin_slug?: string, extra = {}) => ({ slug, lang: 'ar', title: 'عربي', ar_title: 'عربي', twin_slug, ...extra });

describe('buildTwinMap', () => {
  it('maps a reciprocal EN/AR pair both ways', () => {
    const map = buildTwinMap([en('ai-lead-qualification-for-law-firms', 'lead-qualification-law-firms'), ar('lead-qualification-law-firms', 'ai-lead-qualification-for-law-firms')], isArabicOnlyPost);
    expect(map.get('/blog/ai-lead-qualification-for-law-firms')).toBe('/ar/blog/lead-qualification-law-firms');
    expect(map.get('/ar/blog/lead-qualification-law-firms')).toBe('/blog/ai-lead-qualification-for-law-firms');
    expect(map.size).toBe(2);
  });

  it('uses section paths for section posts', () => {
    const map = buildTwinMap([en('abu-dhabi/arabic-chatbot', 'abu-dhabi/ai-chatbot'), ar('abu-dhabi/ai-chatbot', 'abu-dhabi/arabic-chatbot')], isArabicOnlyPost);
    expect(map.get('/abu-dhabi/arabic-chatbot')).toBe('/ar/abu-dhabi/ai-chatbot');
    expect(map.get('/ar/abu-dhabi/ai-chatbot')).toBe('/abu-dhabi/arabic-chatbot');
  });

  it('ignores a one-way link', () => {
    expect(buildTwinMap([en('a', 'b'), ar('b')], isArabicOnlyPost).size).toBe(0);
  });

  it('ignores a twin that is not live (not in the rows)', () => {
    expect(buildTwinMap([en('a', 'b')], isArabicOnlyPost).size).toBe(0);
  });

  it('ignores two posts in the same language', () => {
    expect(buildTwinMap([en('a', 'b'), en('b', 'a')], isArabicOnlyPost).size).toBe(0);
  });

  it('ignores a row that already has both languages', () => {
    const paired = { slug: 'a', lang: 'en', title: 'English', ar_title: 'عربي', twin_slug: 'b' };
    expect(buildTwinMap([paired, ar('b', 'a')], isArabicOnlyPost).size).toBe(0);
  });

  it('ignores a pair where either side is noindex', () => {
    expect(buildTwinMap([en('a', 'b', { noindex: true }), ar('b', 'a')], isArabicOnlyPost).size).toBe(0);
    expect(buildTwinMap([en('a', 'b'), ar('b', 'a', { noindex: true })], isArabicOnlyPost).size).toBe(0);
  });
});
