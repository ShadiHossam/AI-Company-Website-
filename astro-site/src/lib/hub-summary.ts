// Data for the "All sites" hub in the New Golden Office admin, which pulls
// every website's visits and leads into one dashboard (GET /api/hub/summary).
//
// Format (v1), shared with the other sites' endpoints:
//   visits:  slimVisit() rows from lib/analytics-store
//   leads:   tracked leads (WhatsApp, call, email, booking, form) as slimLead()
//            rows, plus every form lead saved in Supabase (`rec: true`), which
//            carries the visitor's contact details and the CRM status.
// A saved lead takes over the tracked "form" lead for the same submit (same
// email, within 30 minutes), so it isn't counted twice and keeps the visit's
// source and journey.

import { slimVisit, slimLead } from './analytics-store';

type Obj = Record<string, any>;

export interface SavedLead {
  id: string | number;
  created_at: string;
  full_name?: string | null;
  company_name?: string | null;
  work_email?: string | null;
  whatsapp?: string | null;
  source?: string | null;
  page_source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  status?: string | null;
}

const MATCH_MS = 30 * 60 * 1000;
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

function savedSource(r: SavedLead): Obj {
  const utm: Obj = {};
  if (r.utm_source) utm.source = clip(r.utm_source, 80);
  if (r.utm_medium) utm.medium = clip(r.utm_medium, 80);
  if (r.utm_campaign) utm.campaign = clip(r.utm_campaign, 80);
  const med = (utm.medium || '').toLowerCase();
  const type = /^(cpc|ppc|paid)/.test(med) ? 'paid:' + clip(utm.source || '', 30)
    : utm.source ? 'campaign:' + clip(utm.source, 30) : 'direct';
  return { type, utm, landing: '' };
}

export function buildSummary(range: { visits: Obj[]; leads: Obj[] }, saved: SavedLead[], from: string, to: string): Obj {
  const leads = range.leads.map(slimLead);
  const used = new Set<Obj>();
  const out: Obj[] = [];

  for (const r of saved) {
    const at = Date.parse(r.created_at);
    if (!Number.isFinite(at)) continue;
    const email = clip(r.work_email, 200).toLowerCase();
    const match = email ? leads.find(l => !used.has(l) && l.ch === 'form' && l.form &&
      clip(l.form.email, 200).toLowerCase() === email && Math.abs(Date.parse(l.at) - at) < MATCH_MS) : undefined;
    if (match) used.add(match);
    const id = String(r.id).replace(/[^a-z0-9]/gi, '').slice(0, 20).toLowerCase() || 'x';
    const page = clip(r.page_source, 200);
    out.push({
      ...(match || {}),
      vid: match ? match.vid : 's_rec' + id,
      uid: match ? match.uid : 'u_rec' + id,
      n: match ? match.n : 1,
      at: new Date(at).toISOString(),
      ch: 'form',
      btn: clip(r.source, 30) || (match && match.btn) || 'form',
      p: match ? match.p : (page.startsWith('/') ? page : '/'),
      t: match ? match.t : '',
      src: match ? match.src : savedSource(r),
      form: {
        name: clip(r.full_name, 120), phone: clip(r.whatsapp, 60), email,
        company: clip(r.company_name, 120),
      },
      rec: true,
      status: clip(r.status, 30),
    });
  }
  for (const l of leads) if (!used.has(l)) out.push(l);
  out.sort((a, b) => String(b.at).localeCompare(String(a.at)));

  return { v: 1, site: 'lenoo', tz: 'Asia/Dubai', from, to, visits: range.visits.map(slimVisit), leads: out };
}
