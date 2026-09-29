import { describe, it, expect } from 'vitest';
// @ts-expect-error plain .mjs build script, no type declarations
import { collectIconNames } from '../../../scripts/build-icon-font.mjs';
import subset from '../../assets/fonts/material-symbols-icons.json';

describe('Material Symbols subset', () => {
  it('contains every icon the site uses', () => {
    // An icon missing from the subset renders as a clipped letter. Fix by running
    // `node scripts/build-icon-font.mjs` and committing the regenerated files.
    const missing = (collectIconNames() as string[]).filter((n) => !subset.includes(n));
    expect(missing).toEqual([]);
  });
});
