#!/usr/bin/env node
// Submits lenooai.com URLs to IndexNow, which shares them with Bing, Yandex,
// Seznam, Naver and the other participating engines.
//
// Reads every URL from https://lenooai.com/sitemap.xml (and its child
// sitemaps) and POSTs the selected ones in one request. Only lenooai.com URLs
// are ever sent: the staging mirror must never be submitted anywhere.
//
// Usage:
//   node scripts/indexnow-submit.mjs --state=.indexnow-state.json  # new since last run + lastmod in 48h
//   node scripts/indexnow-submit.mjs --since-hours=6               # custom lastmod window
//   node scripts/indexnow-submit.mjs --all                         # every URL in the sitemap
//   node scripts/indexnow-submit.mjs --dry-run                     # list, don't submit or save state
//
// Why a state file: lastmod alone misses most new URLs. page-sitemap.xml gives
// any page missing from its LASTMOD table a fixed fallback date, and a post's
// lastmod is its updated_at, not the day it went live. So new URLs are found
// by comparing the sitemap against the URL list saved on the previous run.
//
// The key is public by design: IndexNow proves ownership by fetching
// https://lenooai.com/<key>.txt, served from astro-site/public/.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const HOST = 'lenooai.com';
const KEY = '9abb3522578d93b430099808de6dca62';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10_000;

const args = process.argv.slice(2);
const option = name => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const all = args.includes('--all');
const dryRun = args.includes('--dry-run');
const statePath = option('state') ?? null;
const sinceHours = Number(option('since-hours') ?? 48);
if (!Number.isFinite(sinceHours) || sinceHours <= 0) {
  console.error(`Invalid --since-hours value: ${option('since-hours')}`);
  process.exit(1);
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'lenooai-indexnow/1.0' } });
  if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
  return res.text();
}

// Returns [{ loc, lastmod }] for each <tag> block. Reading <loc> inside each
// block (rather than every <loc> in the file) skips the xhtml:link alternates.
function parseBlocks(xml, tag) {
  const blocks = xml.match(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'g')) ?? [];
  return blocks
    .map(block => ({
      loc: block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1],
      lastmod: block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1],
    }))
    .filter(entry => entry.loc);
}

async function collectEntries() {
  const index = await fetchText(SITEMAP);
  const children = parseBlocks(index, 'sitemap').map(s => s.loc);
  // Tolerate the sitemap being a plain urlset instead of an index.
  const sources = children.length > 0 ? children : [SITEMAP];

  const entries = [];
  for (const source of sources) {
    const xml = source === SITEMAP ? index : await fetchText(source);
    const urls = parseBlocks(xml, 'url');
    console.log(`${source}: ${urls.length} URLs`);
    entries.push(...urls);
  }
  return entries.filter(e => new URL(e.loc).hostname === HOST);
}

async function submit(urls) {
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const batch = urls.slice(i, i + MAX_URLS_PER_REQUEST);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch }),
    });
    const body = await res.text();
    // 200 = accepted, 202 = accepted while the key is still being verified.
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`IndexNow returned ${res.status}: ${body.slice(0, 500)}`);
    }
    console.log(`Submitted ${batch.length} URLs: HTTP ${res.status}`);
  }
}

async function main() {
  const key = await fetchText(KEY_LOCATION).then(t => t.trim(), err => err.message);
  if (key !== KEY) {
    const problem = `${KEY_LOCATION} does not serve the key (got "${key.slice(0, 60)}"). Deploy it before submitting.`;
    if (!dryRun) throw new Error(problem);
    console.warn(`Warning: ${problem}`);
  }

  const entries = await collectEntries();
  const previous = statePath && existsSync(statePath)
    ? new Set(JSON.parse(readFileSync(statePath, 'utf8')))
    : null;
  if (statePath && !previous) console.log(`No previous state at ${statePath}; selecting by lastmod only this run.`);

  const cutoff = Date.now() - sinceHours * 3_600_000;
  const added = new Set();
  const changed = new Set();
  for (const { loc, lastmod } of entries) {
    if (previous && !previous.has(loc)) added.add(loc);
    else if (lastmod && Date.parse(lastmod) >= cutoff) changed.add(loc);
  }

  const urls = all ? [...new Set(entries.map(e => e.loc))] : [...added, ...changed];
  console.log(all
    ? `${urls.length} URLs selected (all)`
    : `${urls.length} URLs selected (${added.size} new since last run, ${changed.size} with lastmod within ${sinceHours}h)`);

  if (dryRun) {
    urls.forEach(u => console.log(`  ${u}`));
    return;
  }

  if (urls.length > 0) await submit(urls);

  // Saved only after a successful submit, so a failed run retries the same URLs next time.
  if (statePath) {
    writeFileSync(statePath, JSON.stringify([...new Set(entries.map(e => e.loc))].sort(), null, 2));
    console.log(`Saved ${entries.length} URLs to ${statePath}`);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
