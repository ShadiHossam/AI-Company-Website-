#!/usr/bin/env node
// astro-site/scripts/fix-relative-imports.mjs
//
// Prepends `extraLevels` extra "../" segments to every relative import/export
// specifier (one that starts with "../") in every .astro/.ts/.tsx file under
// rootDir. Only "../..." specifiers are touched — same-directory "./..."
// imports are untouched, since they stay correct when a whole subtree moves
// together as one unit.
//
// Usage: node scripts/fix-relative-imports.mjs <rootDir> <extraLevels>
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const [, , rootDir, extraLevelsArg] = process.argv;
if (!rootDir || !extraLevelsArg) {
  console.error('Usage: node scripts/fix-relative-imports.mjs <rootDir> <extraLevels>');
  process.exit(1);
}
const extraLevels = parseInt(extraLevelsArg, 10);
const prefix = '../'.repeat(extraLevels);
const EXTS = new Set(['.astro', '.ts', '.tsx']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXTS.has(extname(entry))) files.push(full);
  }
  return files;
}

// Matches: from '../x', from "../x", import('../x'), import("../x")
const IMPORT_RE = /((?:from\s+|import\s*\(\s*)['"])(\.\.\/[^'"]*)(['"])/g;

let changedFiles = 0;
for (const file of walk(rootDir)) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(IMPORT_RE, (match, head, relPath, tail) => `${head}${prefix}${relPath}${tail}`);
  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    changedFiles++;
    console.log(`fixed imports: ${file}`);
  }
}
console.log(`Done. ${changedFiles} file(s) updated under ${rootDir} (+${extraLevels} levels).`);
