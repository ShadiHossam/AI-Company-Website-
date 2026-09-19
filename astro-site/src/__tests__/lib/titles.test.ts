import { describe, it, expect } from 'vitest';
import { withBrand, TITLE_LIMIT } from '../../lib/titles';

describe('withBrand', () => {
  it('appends the suffix when the result fits the budget', () => {
    expect(withBrand('How RAG Works', ' | Lenoo AI Blog')).toBe('How RAG Works | Lenoo AI Blog');
  });

  it('drops the suffix rather than push the title past the budget', () => {
    const long = 'Complaint Handling Automation Restaurants UAE: Escalation Design';
    expect(long.length).toBeGreaterThan(TITLE_LIMIT - 16);
    expect(withBrand(long, ' | Lenoo AI Blog')).toBe(long);
  });

  it('keeps a title that lands exactly on the limit', () => {
    const t = 'x'.repeat(TITLE_LIMIT - ' | Lenoo AI Blog'.length);
    expect(withBrand(t, ' | Lenoo AI Blog')).toHaveLength(TITLE_LIMIT);
  });

  it('trims surrounding whitespace', () => {
    expect(withBrand('  How RAG Works  ', ' | Lenoo AI Blog')).toBe('How RAG Works | Lenoo AI Blog');
  });

  it('handles an empty or missing title without producing a bare suffix', () => {
    expect(withBrand('', ' | Lenoo AI Blog')).toBe(' | Lenoo AI Blog');
    // @ts-expect-error exercising the null guard callers can hit from the DB
    expect(withBrand(null, ' | Lenoo AI Blog')).toBe(' | Lenoo AI Blog');
  });

  it('works with the Arabic suffix', () => {
    expect(withBrand('كيف يعمل RAG', ' | مدونة Lenoo AI')).toBe('كيف يعمل RAG | مدونة Lenoo AI');
  });
});
