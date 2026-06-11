import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../helpers';

vi.mock('../../lib/supabase', () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from '../../lib/supabase';
import { getSiteConfig, getSiteConfigSection, updateSiteConfig } from '../../lib/config';

function makeSupabase(result: Record<string, unknown>) {
  const chain = makeChain(result);
  const supabase = { from: vi.fn().mockReturnValue(chain) };
  (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(supabase);
  return { supabase, chain };
}

describe('getSiteConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a key-value map from rows', async () => {
    makeSupabase({
      data: [
        { key: 'site.name', value: 'Aegis AI' },
        { key: 'site.tagline', value: 'AI Company' },
      ],
      error: null,
    });

    const config = await getSiteConfig();
    expect(config).toEqual({ 'site.name': 'Aegis AI', 'site.tagline': 'AI Company' });
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
});
