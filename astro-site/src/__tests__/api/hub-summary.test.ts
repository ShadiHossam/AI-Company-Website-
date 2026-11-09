import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));
import { getSupabaseAdmin } from '../../lib/supabase';
import { GET } from '../../pages/api/hub/summary';
import { todayLocal } from '../../lib/analytics-store';

const KEY = 'k'.repeat(40);
let dir: string;

function savedLeads(rows: object[], error: { message: string } | null = null) {
  const q: any = {};
  for (const m of ['from', 'select', 'gte', 'lte', 'order']) q[m] = () => q;
  q.limit = () => Promise.resolve({ data: rows, error });
  (getSupabaseAdmin as any).mockReturnValue(q);
}
function call(headers: Record<string, string> = {}, qs = '') {
  const url = new URL('https://lenooai.com/api/hub/summary' + qs);
  return GET({ request: new Request(url, { headers }), url, clientAddress: '9.9.9.' + Math.floor(Math.random() * 250) } as never);
}

const at = new Date(Date.now() - 60_000).toISOString();
const visit = { k: 'visit', v: 1, uid: 'u_aaaaaaaa11', vid: 's_aaaaaaaa11', n: 1, st: at, src: { type: 'google_organic', landing: '/contact', utm: {} },
  dev: { type: 'mobile' }, pages: [{ id: 'a', p: '/contact', t: 'Contact', at, act: 30, scr: 50, ev: [{ e: 'form' }] }], leads: 1, ip: 'x', ua: 'y' };
const formLead = { k: 'lead', v: 1, uid: 'u_aaaaaaaa11', vid: 's_aaaaaaaa11', n: 1, at, ch: 'form', btn: 'contact_form', p: '/contact', t: 'Contact',
  form: { name: 'Mona', email: 'MONA@x.ae' }, src: { type: 'google_organic', landing: '/contact', utm: {} }, ip: 'x' };
const waLead = { ...formLead, ch: 'whatsapp', btn: 'float', form: null, at: new Date(Date.now() - 120_000).toISOString() };

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lenoo-hub-'));
  process.env.ANALYTICS_DIR = dir;
  process.env.HUB_API_KEY = KEY;
  const day = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(dir, day + '.ndjson'), [visit, formLead, waLead].map(o => JSON.stringify(o)).join('\n') + '\n');
});
afterEach(() => {
  delete process.env.ANALYTICS_DIR;
  delete process.env.HUB_API_KEY;
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('GET /api/hub/summary', () => {
  it('is off (404) without a long enough HUB_API_KEY', async () => {
    process.env.HUB_API_KEY = 'short';
    expect((await call({ authorization: 'Bearer short' })).status).toBe(404);
  });

  it('accepts the key the hub wrote to .hub-key (SHA-256), with no env var', async () => {
    delete process.env.HUB_API_KEY;
    const fileKey = 'f'.repeat(64);
    fs.writeFileSync(path.join(dir, '.hub-key'), require('node:crypto').createHash('sha256').update(fileKey).digest('hex') + '\n');
    savedLeads([]);
    expect((await call({ authorization: 'Bearer ' + fileKey })).status).toBe(200);
    expect((await call({ authorization: 'Bearer ' + KEY })).status).toBe(401);
  });

  it('rejects a missing or wrong key', async () => {
    expect((await call()).status).toBe(401);
    expect((await call({ authorization: 'Bearer ' + 'x'.repeat(40) })).status).toBe(401);
  });

  it('returns visits, tracked leads and saved leads, without counting a form twice', async () => {
    savedLeads([
      { id: 'aaa-111', created_at: at, full_name: 'Mona', company_name: 'Acme', work_email: 'mona@x.ae', whatsapp: '+971500000000',
        source: 'modal', page_source: '/contact', status: 'new' },
      { id: 'bbb-222', created_at: at, full_name: 'Omar', work_email: 'omar@y.ae', whatsapp: '+971511111111',
        page_source: '/pricing', utm_source: 'linkedin', status: 'contacted' },
    ]);
    const today = todayLocal();
    const res = await call({ 'x-hub-key': KEY }, `?from=${today}&to=${today}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    const d = await res.json();
    expect(d.v).toBe(1);
    expect(d.visits).toHaveLength(1);
    expect(d.visits[0].pages[0]).toEqual({ p: '/contact', t: 'Contact', act: 30 });
    expect(d.leads.map((l: any) => l.ch).sort()).toEqual(['form', 'form', 'whatsapp']);

    const mona = d.leads.find((l: any) => l.form && l.form.name === 'Mona');
    expect(mona.rec).toBe(true);
    expect(mona.vid).toBe('s_aaaaaaaa11');            // took over the tracked form lead
    expect(mona.src.type).toBe('google_organic');
    expect(mona.form).toEqual({ name: 'Mona', phone: '+971500000000', email: 'mona@x.ae', company: 'Acme' });
    expect(mona.ip).toBeUndefined();

    const omar = d.leads.find((l: any) => l.form && l.form.name === 'Omar');
    expect(omar.vid).toBe('s_recbbb222');
    expect(omar.src.type).toBe('campaign:linkedin');
    expect(omar.status).toBe('contacted');
    expect(d.errors).toEqual([]);
  });

  it('still answers when Supabase fails', async () => {
    savedLeads([], { message: 'down' });
    const d = await (await call({ authorization: 'Bearer ' + KEY })).json();
    expect(d.leads.map((l: any) => l.ch).sort()).toEqual(['form', 'whatsapp']);
    expect(d.errors[0]).toContain('down');
  });
});
