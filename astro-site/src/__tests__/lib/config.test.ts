import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../helpers';

vi.mock('../../lib/supabase', () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from '../../lib/supabase';
import { getSiteConfig, getSiteConfigSection, updateSiteConfig, __resetSiteConfigCacheForTest } from '../../lib/config';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('getSiteConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetSiteConfigCacheForTest();
  });

  it('returns a key-value map from rows', async () => {
    makeSupabase({
      data: [
        { key: 'site.name', value: 'Lenoo AI' },
        { key: 'site.tagline', value: 'AI Company' },
      ],
      error: null,
    });

    const config = await getSiteConfig();
    expect(config).toEqual({ 'site.name': 'Lenoo AI', 'site.tagline': 'AI Company' });
  });

  it('returns empty object on supabase error', async () => {
    makeSupabase({ data: null, error: { message: 'DB error' } });
    const config = await getSiteConfig();
    expect(config).toEqual({});
  });

  it('returns empty object when data is null', async () => {
    makeSupabase({ data: null, error: null });
    const config = await getSiteConfig();
    expect(config).toEqual({});
  });

  it('serves repeat reads from the cache', async () => {
    const { supabase } = makeSupabase({ data: [{ key: 'a', value: '1' }], error: null });
    await getSiteConfig();
    await getSiteConfig();
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('keeps serving the last good config when a later read fails', async () => {
    vi.useFakeTimers();
    try {
      makeSupabase({ data: [{ key: 'a', value: '1' }], error: null });
      await getSiteConfig();
      vi.advanceTimersByTime(61_000);
      makeSupabase({ data: null, error: { message: 'DB error' } });
      expect(await getSiteConfig()).toEqual({ a: '1' });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('getSiteConfigSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries by section and returns key-value map', async () => {
    const { chain } = makeSupabase({
      data: [{ key: 'banner_text', value: 'Hello!' }],
      error: null,
    });

    const config = await getSiteConfigSection('banner');
    expect(config).toEqual({ banner_text: 'Hello!' });
    expect(chain['eq']).toHaveBeenCalledWith('section', 'banner');
  });

  it('returns empty object on error', async () => {
    makeSupabase({ data: null, error: { message: 'fail' } });
    const config = await getSiteConfigSection('banner');
    expect(config).toEqual({});
  });
});

describe('updateSiteConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls upsert with the provided updates', async () => {
    const { chain } = makeSupabase({ data: null, error: null });

    const updates = [
      { key: 'site.name', value: 'New Name' },
      { key: 'site.tagline', value: 'New Tagline' },
    ];
    await updateSiteConfig(updates);

    expect(chain['upsert']).toHaveBeenCalledWith(updates, { onConflict: 'key' });
  });

  it('throws when the upsert fails', async () => {
    makeSupabase({ data: null, error: { message: 'denied' } });
    await expect(updateSiteConfig([{ key: 'a', value: 'b' }])).rejects.toThrow('denied');
  });
});
