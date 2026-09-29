// Rebuilds the self-hosted Material Symbols subset.
//
// The full variable font from Google is ~310KB; a static subset holding only
// the icons this site uses is ~22KB. Run this after adding a new icon name
// (the icon-font test fails until you do):
//
//   node scripts/build-icon-font.mjs
//
// Writes src/assets/fonts/material-symbols-subset.woff2 and the matching
// icon list, src/assets/fonts/material-symbols-icons.json.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/assets/fonts');

export function collectIconNames(dir = join(root, 'src')) {
  const names = new Set();
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      if (entry === '__tests__' || entry === '_archived-pages') continue;
      const p = join(d, entry);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!/\.(astro|ts|js)$/.test(entry)) continue;
      const src = readFileSync(p, 'utf8');
      // Literal icons: <span class="material-symbols-outlined" ...>name</span>
      for (const m of src.matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g)) names.add(m[1]);
      // Icons from data arrays rendered as {x.icon}
      for (const m of src.matchAll(/\bicon\s*:\s*['"]([a-z0-9_]+)['"]/g)) names.add(m[1]);
    }
  };
  walk(dir);
  return [...names].sort();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const names = collectIconNames();
  const cssUrl =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0' +
    `&icon_names=${names.join(',')}&display=block`;
  // A modern desktop UA makes Google serve woff2.
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': ua } })).text();
  const fontUrl = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error(`No font URL in Google response:\n${css.slice(0, 500)}`);
  const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
  writeFileSync(join(outDir, 'material-symbols-subset.woff2'), font);
  writeFileSync(join(outDir, 'material-symbols-icons.json'), JSON.stringify(names, null, 2) + '\n');
  console.log(`${names.length} icons, ${font.length} bytes`);
}
