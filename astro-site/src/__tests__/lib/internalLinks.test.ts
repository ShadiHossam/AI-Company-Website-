import { describe, it, expect } from 'vitest';
import { isPageLive } from '../../lib/internalLinks';

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
