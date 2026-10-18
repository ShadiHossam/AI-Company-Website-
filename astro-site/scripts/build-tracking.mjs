// Minifies the tracker source in src/tracking/ into
// public/js/, which is what BaseLayout and ArBaseLayout load. Run after editing it:
//   node scripts/build-tracking.mjs
// Commit both the source and the generated file. target=es5 makes esbuild
// fail on any syntax old browsers can't run, so a passing build doubles as the
// ES5 check. Same setup as New Golden Office's tracker.
import { buildSync } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const BUDGET = 7 * 1024; // gzipped
let total = 0;

for (const name of ['ln-track.js']) {
  const outfile = join(root, 'public/js', name);
  buildSync({
    entryPoints: [join(root, 'src/tracking', name)],
    outfile,
    minify: true,
    target: 'es5',
    charset: 'utf8',
    legalComments: 'none',
    logLevel: 'error',
  });
  const gz = gzipSync(readFileSync(outfile)).length;
  total += gz;
  console.log(`${name}: ${gz} B gzipped`);
}

console.log(`total: ${total} B gzipped (budget ${BUDGET} B)`);
if (total > BUDGET) {
  console.error('Over the size budget.');
  process.exit(1);
}
