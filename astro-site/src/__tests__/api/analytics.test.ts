import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { POST } from '../../pages/api/t';
import { GET as getData } from '../../pages/api/admin/analytics/data';
import { GET as getVisit } from '../../pages/api/admin/analytics/visit';
import { loadRange, journey, cleanup, _resetCleanup, localDate } from '../../lib/analytics-store';
import { makeLocals } from '../helpers';

let dir: string;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1';

function beacon(body: unknown, headers: Record<string, string> = {}) {
  const request = new Request('https://lenooai.com/api/t', {
    method: 'POST',
    headers: { origin: 'https://lenooai.com', 'user-agent': UA, 'x-forwarded-for': '1.2.3.4', ...headers },
    body: JSON.stringify(body),
  });
  return POST({ request, clientAddress: '1.2.3.4' } as never);
}
function lines(): Record<string, any>[] {
  return fs.readdirSync(dir).filter(f => f.endsWith('.ndjson'))
    .flatMap(f => fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)));
}
function writeDay(date: string, rows: object[]) {
  fs.appendFileSync(path.join(dir, date + '.ndjson'), rows.map(r => JSON.stringify(r)).join('\n') + '\n');
}

const now = new Date().toISOString();
const visit = (vid: string, pages: number, extra: object = {}) => ({
  k: 'visit', uid: 'u_aaaaaaaaaaaaaaaa', vid, n: 1, st: now, ts: now, src: { type: 'google_organic', landing: '/' },
  pages: Array.from({ length: pages }, (_, i) => ({ id: 'p' + i, p: '/p' + i, t: 'Page ' + i, at: now, act: 10, scr: 50, ev: [{ e: 'nav', o: 1 }] })),
  ...extra,
});

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lenoo-analytics-'));
  process.env.ANALYTICS_DIR = dir;
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
  delete process.env.ANALYTICS_DIR;
});

describe('POST /api/t (collector)', () => {
  it('stores a valid visit with server fields and no raw IP', async () => {
    const res = await beacon(visit('s_bbbbbbbbbbbbbbbb', 1), { 'cf-ipcountry': 'AE' });
    expect(res.status).toBe(204);
    const [row] = lines();
    expect(row.vid).toBe('s_bbbbbbbbbbbbbbbb');
    expect(row.cc).toBe('AE');
    expect(row.ip).toMatch(/^[0-9a-f]{12}$/);
    expect(JSON.stringify(row)).not.toContain('1.2.3.4');
  });

  it('drops beacons from other sites, bots and malformed ids', async () => {
    await beacon(visit('s_bbbbbbbbbbbbbbbb', 1), { origin: 'https://evil.example' });
    await beacon(visit('s_bbbbbbbbbbbbbbbb', 1), { 'user-agent': 'Googlebot/2.1' });
    await beacon({ ...visit('s_bbbbbbbbbbbbbbbb', 1), uid: 'nope' });
    await beacon({ k: 'other', uid: 'u_aaaaaaaaaaaaaaaa', vid: 's_bbbbbbbbbbbbbbbb' });
    expect(fs.readdirSync(dir).filter(f => f.endsWith('.ndjson'))).toHaveLength(0);
  });
});

describe('analytics store', () => {
  it('keeps the fullest snapshot of a visit and drops opted-out visitors', async () => {
    const today = now.slice(0, 10);
    writeDay(today, [
      visit('s_cccccccccccccccc', 1),
      visit('s_cccccccccccccccc', 3),
      visit('s_cccccccccccccccc', 2),
      { k: 'lead', uid: 'u_aaaaaaaaaaaaaaaa', vid: 's_cccccccccccccccc', at: now, ch: 'whatsapp', btn: 'popup', p: '/p2' },
      visit('s_dddddddddddddddd', 1, { uid: 'u_zzzzzzzzzzzzzzzz' }),
      { k: 'optout', uid: 'u_zzzzzzzzzzzzzzzz' },
    ]);
    const d = localDate(now);
    const r = await loadRange(d, d);
    expect(r.visits.map(v => v.vid)).toEqual(['s_cccccccccccccccc']);
    expect(r.visits[0].pages).toHaveLength(3);
    expect(r.leads).toHaveLength(1);
    const j = journey(r, 's_cccccccccccccccc')!;
    expect(j.leads[0].btn).toBe('popup');
    expect(j.pages[0].ev).toHaveLength(1);
  });

  it('turns a lead without a visit into a stub visit', async () => {
    writeDay(now.slice(0, 10), [{ k: 'lead', uid: 'u_aaaaaaaaaaaaaaaa', vid: 's_eeeeeeeeeeeeeeee', at: now, ch: 'form', p: '/contact', path: ['/', '/contact'] }]);
    const d = localDate(now);
    const r = await loadRange(d, d);
    expect(r.visits[0].stub).toBe(true);
    expect(r.visits[0].pages.map((p: { p: string }) => p.p)).toEqual(['/', '/contact']);
  });

  it('deletes files older than 180 days', () => {
    fs.writeFileSync(path.join(dir, '2000-01-01.ndjson'), '{}\n');
    _resetCleanup();
    expect(cleanup()).toBe(1);
    expect(fs.existsSync(path.join(dir, '2000-01-01.ndjson'))).toBe(false);
  });
});

describe('admin analytics API', () => {
  it('returns slim visits without page events, and the full journey on request', async () => {
    writeDay(now.slice(0, 10), [visit('s_ffffffffffffffff', 2)]);
    const d = localDate(now);
    const url = new URL(`https://lenooai.com/api/admin/analytics/data?from=${d}&to=${d}`);
    const res = await getData({ url, locals: makeLocals() } as never);
    const body = await res.json();
    expect(body.visits).toHaveLength(1);
    expect(body.visits[0].pages[0]).toEqual({ p: '/p0', t: 'Page 0', act: 10 });

    const vurl = new URL(`https://lenooai.com/api/admin/analytics/visit?vid=s_ffffffffffffffff&from=${d}&to=${d}`);
    const v = await (await getVisit({ url: vurl, locals: makeLocals() } as never)).json();
    expect(v.pages[0].ev).toHaveLength(1);
  });

  it('rejects unauthenticated requests and bad ids', async () => {
    const url = new URL('https://lenooai.com/api/admin/analytics/data');
    expect((await getData({ url, locals: {} } as never)).status).toBe(401);
    const vurl = new URL('https://lenooai.com/api/admin/analytics/visit?vid=../../etc');
    expect((await getVisit({ url: vurl, locals: makeLocals() } as never)).status).toBe(400);
  });
});
