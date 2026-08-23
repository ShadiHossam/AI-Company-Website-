import { describe, it, expect } from 'vitest';
import { isPageLive, getRelatedLinks } from '../../lib/internalLinks';
import type { IndustryServiceRelation } from '../../data/pageRelations';

describe('isPageLive', () => {
  it('returns true for a path not in the pending list', () => {
    expect(isPageLive('/industries/retail')).toBe(true);
  });

  it('returns false for a path in the pending list', () => {
    expect(isPageLive('/industries/pharmacies')).toBe(false);
  });

  it('normalizes a trailing slash before comparing', () => {
    expect(isPageLive('/industries/pharmacies/')).toBe(false);
  });

  it('treats the root path "/" as live without stripping it to empty', () => {
    expect(isPageLive('/')).toBe(true);
  });
});

const testRelations: IndustryServiceRelation[] = [
  {
    industry: { path: '/industries/retail', label: 'Retail' },
    services: [{ path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' }],
  },
];

describe('getRelatedLinks', () => {
  it('returns the related services for an industry page (forward lookup)', () => {
    const result = getRelatedLinks('/industries/retail', testRelations);
    expect(result).toEqual({
      heading: 'Related Services',
      links: [{ path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' }],
    });
  });

  it('returns the related industries for a service page (reverse lookup)', () => {
    const result = getRelatedLinks('/services/ai-agents/customer-support', testRelations);
    expect(result).toEqual({
      heading: 'Related Industries',
      links: [{ path: '/industries/retail', label: 'Retail' }],
    });
  });

  it('returns null for a page with no relation either direction', () => {
    expect(getRelatedLinks('/about', testRelations)).toBeNull();
  });

  it('normalizes a trailing slash before matching', () => {
    const result = getRelatedLinks('/industries/retail/', testRelations);
    expect(result?.heading).toBe('Related Services');
  });
});
