/**
 * Generates favicon PNG variants from the SVG.
 * Run: /usr/local/Cellar/node@20/20.20.2/bin/node scripts/generate-favicon.cjs
 */

const sharp = require('../node_modules/sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../public');
const svgPath = path.join(OUT, 'favicon.svg');
const svg = fs.readFileSync(svgPath);

async function run() {
  // 192×192 for Android Chrome
  await sharp(svg).resize(192, 192).png().toFile(path.join(OUT, 'favicon-192.png'));
  console.log('✓ favicon-192.png');

  // 512×512 for PWA splash
  await sharp(svg).resize(512, 512).png().toFile(path.join(OUT, 'favicon-512.png'));
  console.log('✓ favicon-512.png');

  // 180×180 apple-touch-icon
  await sharp(svg).resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // 32×32 for favicon.png (used as fallback alongside svg)
  await sharp(svg).resize(32, 32).png().toFile(path.join(OUT, 'favicon-32.png'));
  console.log('✓ favicon-32.png');

  console.log('\nAll favicon variants generated.');
}

run().catch(err => { console.error(err); process.exit(1); });
