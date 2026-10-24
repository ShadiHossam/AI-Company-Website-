import { describe, it, expect } from 'vitest';
import { todayInDubai, isScheduled, updatedAfterPublish, lastModified } from '../../lib/scheduledPosts';

describe('todayInDubai', () => {
  it('rolls over at midnight Dubai time (UTC+4), not UTC', () => {
    expect(todayInDubai(new Date('2026-10-24T19:59:00Z'))).toBe('2026-10-24');
    expect(todayInDubai(new Date('2026-10-24T20:00:00Z'))).toBe('2026-10-25');
  });
});

describe('isScheduled', () => {
  const now = new Date('2026-10-24T10:00:00Z');
  it('is true only for dates after today in Dubai', () => {
    expect(isScheduled('2026-10-25', now)).toBe(true);
    expect(isScheduled('2026-10-24', now)).toBe(false);
    expect(isScheduled('2026-09-27', now)).toBe(false);
    expect(isScheduled(null, now)).toBe(false);
  });
});

describe('updatedAfterPublish / lastModified', () => {
  it('ignores an updated_at stamped before the publish date (queued rows)', () => {
    expect(updatedAfterPublish('2026-10-24T12:00:00Z', '2026-11-30')).toBeUndefined();
    expect(lastModified('2026-10-24T12:00:00Z', '2026-11-30')?.toISOString()).toBe('2026-11-30T00:00:00.000Z');
  });
  it('keeps an edit made after publishing', () => {
    expect(updatedAfterPublish('2026-10-20T21:03:25Z', '2026-09-07')?.toISOString()).toBe('2026-10-20T21:03:25.000Z');
    expect(lastModified('2026-10-20T21:03:25Z', '2026-09-07')?.toISOString()).toBe('2026-10-20T21:03:25.000Z');
  });
  it('falls back to whichever date exists', () => {
    expect(lastModified(null, '2026-09-07')?.toISOString()).toBe('2026-09-07T00:00:00.000Z');
    expect(lastModified('2026-10-20T00:00:00Z', null)?.toISOString()).toBe('2026-10-20T00:00:00.000Z');
    expect(lastModified(null, null)).toBeUndefined();
  });
});
