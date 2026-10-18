// First-party analytics storage, shared by the collector (/api/t) and the admin
// Analytics page (/api/admin/analytics/*). Ported from New Golden Office's
// admin/lib/analytics-store.js. Nothing here runs for site visitors except
// appendLine(): the reading side only runs when someone opens the Analytics page.
//
// Storage: <dataDir()>/YYYY-MM-DD.ndjson (UTC day), one JSON object per line:
//   { k:'visit', uid, vid, n, fs, st, src, first, dev, lg, pages:[{id,p,t,at,act,scr,ev,rl}], leads, dur, end, ...server }
//   { k:'lead',  uid, vid, n, at, ch:'whatsapp'|'call'|'email'|'booking'|'form', btn, p, t, msg, form, path, src, first, dev, lg, ...server }
//   { k:'optout', uid, ...server }
// Server fields added by the collector: ts, ip (salted hash), ua, cc, city, reg.
// A visit is sent again whenever the visitor comes back to the tab, so the
// same vid can appear several times; the snapshot with the most pages wins.
//
// Past days are cached once in <dir>/cache/YYYY-MM-DD.json (invalidated when
// the ndjson size changes). Files older than RETENTION_DAYS are deleted.
// Plain files instead of Supabase: two tiny writes per visit, no row limits,
// and the data never leaves the server. Needs a writable disk, which the
// o2switch Node app has (a Vercel deploy would drop the writes).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';

export const RETENTION_DAYS = 180;
const TZ_OFFSET_MS = 4 * 3600 * 1000; // Asia/Dubai, UTC+4 all year (no DST)

type Obj = Record<string, any>;
interface Day { visits: Record<string, Obj>; leads: Obj[]; optouts: string[]; bad: number; srcSize?: number }

// Production: ~/lenoo-analytics (outside the app folder, so deploys never touch
// it). ANALYTICS_DIR overrides it.
export function dataDir(): string {
  return process.env.ANALYTICS_DIR || path.join(os.homedir(), 'lenoo-analytics');
}

let saltCache = '';
function salt(dir: string): string {
  if (saltCache) return saltCache;
  const f = path.join(dir, '.salt');
  try { saltCache = fs.readFileSync(f, 'utf8').trim(); } catch { /* first run */ }
  if (!saltCache) {
    saltCache = crypto.randomBytes(16).toString('hex');
    try { fs.writeFileSync(f, saltCache, { mode: 0o600 }); } catch { /* read-only disk */ }
  }
  return saltCache;
}

export function hashIp(ip: string): string {
  const dir = dataDir();
  try { fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); } catch { /* exists or read-only */ }
  return crypto.createHash('sha256').update(salt(dir) + ip).digest('hex').slice(0, 12);
}

export async function appendLine(line: string): Promise<void> {
  const dir = dataDir();
  await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.promises.appendFile(path.join(dir, new Date().toISOString().slice(0, 10) + '.ndjson'), line + '\n');
}

// ---------- dates (Dubai) ----------
export function localDate(iso: string): string {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t + TZ_OFFSET_MS).toISOString().slice(0, 10) : '';
}
export function todayLocal(): string { return localDate(new Date().toISOString()); }
export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---------- parsing ----------
function act(v: Obj): number { return (v.pages || []).reduce((n: number, p: Obj) => n + (p.act || 0), 0); }
// Is visit snapshot b better than a?
function better(a: Obj, b: Obj): boolean {
  const pa = (a.pages || []).length, pb = (b.pages || []).length;
  if (pb !== pa) return pb > pa;
  const la = act(a), lb = act(b);
  if (lb !== la) return lb > la;
  return String(b.ts || '') >= String(a.ts || '');
}

async function parseNdjson(file: string): Promise<Day> {
  const day: Day = { visits: {}, leads: [], optouts: [], bad: 0 };
  if (!fs.existsSync(file)) return day;
  const rl = readline.createInterface({ input: fs.createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let o: Obj;
    try { o = JSON.parse(line); } catch { day.bad++; continue; }
    if (!o || typeof o !== 'object') { day.bad++; continue; }
    if (o.k === 'visit' && o.vid && Array.isArray(o.pages)) {
      const prev = day.visits[o.vid];
      if (!prev || better(prev, o)) day.visits[o.vid] = o;
    } else if (o.k === 'lead' && o.vid) {
      day.leads.push(o);
    } else if (o.k === 'optout' && o.uid) {
      day.optouts.push(o.uid);
    } else {
      day.bad++;
    }
  }
  return day;
}

async function loadDay(date: string, isToday: boolean): Promise<Day> {
  const dir = dataDir();
  const file = path.join(dir, date + '.ndjson');
  let size: number;
  try { size = fs.statSync(file).size; } catch { return { visits: {}, leads: [], optouts: [], bad: 0 }; }
  const cacheFile = path.join(dir, 'cache', date + '.json');
  if (!isToday) {
    try {
      const c = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (c.srcSize === size) return c;
    } catch { /* no cache yet */ }
  }
  const day = await parseNdjson(file);
  if (!isToday) {
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      fs.writeFileSync(cacheFile + '.tmp', JSON.stringify({ srcSize: size, ...day }));
      fs.renameSync(cacheFile + '.tmp', cacheFile);
    } catch { /* cache is optional */ }
  }
  return day;
}

// Opt-outs apply to every day, including days before the visitor refused.
// Kept in cache/optouts.json together with the ndjson sizes already scanned.
async function loadOptouts(): Promise<Set<string>> {
  const dir = dataDir();
  const cacheFile = path.join(dir, 'cache', 'optouts.json');
  let cache: { uids: string[]; scanned: Record<string, number> } = { uids: [], scanned: {} };
  try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch { /* first run */ }
  let files: string[] = [];
  try { files = fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.ndjson$/.test(f)); } catch { return new Set(); }
  const uids = new Set(cache.uids);
  let changed = false;
  for (const f of files) {
    let size: number;
    try { size = fs.statSync(path.join(dir, f)).size; } catch { continue; }
    if (cache.scanned[f] === size) continue;
    const rl = readline.createInterface({ input: fs.createReadStream(path.join(dir, f), { encoding: 'utf8' }), crlfDelay: Infinity });
    for await (const line of rl) {
      if (line.indexOf('"optout"') === -1) continue;
      try { const o = JSON.parse(line); if (o.k === 'optout' && o.uid) uids.add(o.uid); } catch { /* skip */ }
    }
    cache.scanned[f] = size;
    changed = true;
  }
  if (changed) {
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      cache.uids = [...uids];
      fs.writeFileSync(cacheFile + '.tmp', JSON.stringify(cache));
      fs.renameSync(cacheFile + '.tmp', cacheFile);
    } catch { /* cache is optional */ }
  }
  return uids;
}

// ---------- normalising ----------
function visitStart(v: Obj): string {
  return v.st || (v.pages && v.pages[0] && v.pages[0].at) || v.ts;
}
function stubFromLead(l: Obj): Obj {
  return {
    k: 'visit', stub: true, uid: l.uid, vid: l.vid, n: l.n, st: l.at, ts: l.ts, src: l.src, first: l.first, dev: l.dev, lg: l.lg,
    pages: (l.path || [l.p]).map((p: string) => ({ p, t: p === l.p ? l.t : '', act: 0, scr: 0, ev: [] })),
    leads: 0, dur: 0, cc: l.cc, city: l.city, reg: l.reg,
  };
}

export interface Range { visits: Obj[]; leads: Obj[]; bad: number }

// Every visit and lead whose start falls between from and to (Dubai dates,
// inclusive). Files are UTC days, so one extra day each side is read.
export async function loadRange(from: string, to: string): Promise<Range> {
  const today = new Date().toISOString().slice(0, 10);
  const visits = new Map<string, Obj>();
  const leads: Obj[] = [];
  let bad = 0;
  for (let d = addDays(from, -1); d <= addDays(to, 1); d = addDays(d, 1)) {
    if (d > today) break;
    const day = await loadDay(d, d === today);
    bad += day.bad || 0;
    for (const v of Object.values(day.visits)) {
      const prev = visits.get(v.vid);
      if (!prev || better(prev, v)) visits.set(v.vid, v);
    }
    leads.push(...day.leads);
  }
  const optouts = await loadOptouts();

  // A lead whose visit never arrived still gets a (stub) visit.
  for (const l of leads) if (!visits.has(l.vid)) visits.set(l.vid, stubFromLead(l));

  const outVisits: Obj[] = [];
  for (const v of visits.values()) {
    if (optouts.has(v.uid)) continue;
    const c = localDate(visitStart(v));
    if (!c || c < from || c > to) continue;
    outVisits.push(v);
  }
  const keep = new Set(outVisits.map(v => v.vid));
  const outLeads = leads.filter(l => keep.has(l.vid) && !optouts.has(l.uid));
  outLeads.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  outVisits.sort((a, b) => String(visitStart(b)).localeCompare(String(visitStart(a))));
  return { visits: outVisits, leads: outLeads, bad };
}

// What the dashboard list views need: page events and the lead's path list
// stay on the server until a journey is opened.
export function slimVisit(v: Obj): Obj {
  return {
    vid: v.vid, uid: v.uid, n: v.n || 1, st: visitStart(v), src: v.src || null, dev: v.dev || null, lg: v.lg || '',
    cc: v.cc || '', city: v.city || '', stub: !!v.stub,
    pages: (v.pages || []).map((p: Obj) => ({ p: p.p, t: p.t || '', act: p.act || 0 })),
  };
}
export function slimLead(l: Obj): Obj {
  const { path: _p, first: _f, ua: _u, ip: _i, k: _k, v: _v, ...rest } = l;
  return rest;
}

// Full journey of one visit, plus that visitor's other visits in the range.
export function journey(range: Range, vid: string): Obj | null {
  const v = range.visits.find(x => x.vid === vid);
  if (!v) return null;
  const leads = range.leads.filter(l => l.vid === vid).sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const others = range.visits.filter(x => x.uid === v.uid && x.vid !== vid).map(x => ({
    vid: x.vid, st: visitStart(x), src: (x.src && x.src.type) || 'direct', pages: x.pages.length,
    leads: range.leads.filter(l => l.vid === x.vid).length,
  }));
  return {
    vid: v.vid, uid: v.uid, n: v.n || 1, st: visitStart(v), fs: v.fs, src: v.src, first: v.first, dev: v.dev, lg: v.lg,
    city: v.city, reg: v.reg, cc: v.cc, dur: v.dur, end: v.end, stub: !!v.stub, pages: v.pages,
    leads: leads.map(l => ({ at: l.at, ch: l.ch, btn: l.btn, p: l.p, t: l.t, msg: l.msg, form: l.form })),
    others,
  };
}

// Clamps a ?from=&to= pair (Dubai dates) to today and the retention window.
export function parseRange(fromQ: string | null, toQ: string | null): { from: string; to: string; today: string } {
  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  const today = todayLocal();
  let from = fromQ && DATE.test(fromQ) ? fromQ : addDays(today, -6);
  let to = toQ && DATE.test(toQ) ? toQ : today;
  if (from > to) [from, to] = [to, from];
  if (to > today) to = today;
  if (from > to) from = to;
  const min = addDays(to, -(RETENTION_DAYS - 1));
  if (from < min) from = min;
  return { from, to, today };
}

// ---------- retention ----------
let lastCleanup = 0;
export function cleanup(now = new Date()): number {
  if (Date.now() - lastCleanup < 24 * 3600 * 1000) return 0;
  lastCleanup = Date.now();
  const dir = dataDir();
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 3600 * 1000).toISOString().slice(0, 10);
  let removed = 0;
  for (const sub of ['', 'cache']) {
    let files: string[] = [];
    try { files = fs.readdirSync(path.join(dir, sub)); } catch { continue; }
    for (const f of files) {
      const m = /^(\d{4}-\d{2}-\d{2})\.(ndjson|json)$/.exec(f);
      if (m && m[1] < cutoff) {
        try { fs.unlinkSync(path.join(dir, sub, f)); removed++; } catch { /* already gone */ }
      }
    }
  }
  return removed;
}
export function _resetCleanup() { lastCleanup = 0; }
