/* Visitor & lead dashboard, shared by shadihossam.com (/t/dash.php) and
 * lenooai.com (/admin/analytics). Ported from New Golden Office's admin
 * Analytics page (admin/lib/analytics-store.js + views/analytics.ejs): the
 * server only loads and de-duplicates the raw visits and leads for a date
 * range; the totals, tables, charts, journey drawer and CSV export are built
 * here. Keep both copies of this file identical.
 *
 * Mount: <div id="an-root"></div> plus a JSON config in #an-config:
 *   { dataUrl, visitUrl, tz, tzLabel, filePrefix, buttons: { name: label } }
 * dataUrl  + &from=YYYY-MM-DD&to=YYYY-MM-DD  -> { from, to, today, bad, visits, leads }
 * visitUrl + &vid=...&from=...&to=...         -> one visit's full journey
 */
(function () {
  'use strict';
  var root = document.getElementById('an-root');
  var cfgEl = document.getElementById('an-config');
  if (!root || !cfgEl) return;
  var C = JSON.parse(cfgEl.textContent);
  var TZ = C.tz || 'Asia/Dubai';
  var MAX_DAYS = 180;

  // ---------- labels ----------
  var SRC = { google_organic: 'Google search', google_ads: 'Google Ads', direct: 'Direct', facebook: 'Facebook',
    instagram: 'Instagram', bing_organic: 'Bing', yandex_organic: 'Yandex', duckduckgo_organic: 'DuckDuckGo',
    yahoo_organic: 'Yahoo', 'social:whatsapp': 'WhatsApp link', 'social:twitter': 'X / Twitter',
    'social:linkedin': 'LinkedIn', 'social:youtube': 'YouTube', 'social:tiktok': 'TikTok',
    'ai:chatgpt': 'ChatGPT', 'ai:perplexity': 'Perplexity', 'ai:assistant': 'AI assistant' };
  var CH = { whatsapp: 'WhatsApp', call: 'Call', email: 'Email', booking: 'Booking', form: 'Form' };
  var BTN = C.buttons || {};
  function srcName(s) { return SRC[s] || String(s || '').replace(/^referral:/, 'Site: ').replace(/^campaign:/, 'Campaign: ').replace(/^paid:/, 'Paid: '); }
  function btnName(b) { return BTN[b] || b || ''; }
  function chName(c) { return CH[c] || c || ''; }

  // ---------- dates ----------
  var dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  var partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23', weekday: 'short' });
  var showFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  var WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  function localDate(iso) { try { return dateFmt.format(new Date(iso)); } catch (e) { return ''; } }
  function hourDay(iso) {
    var parts = partsFmt.formatToParts(new Date(iso)), hour = 0, wd = -1;
    parts.forEach(function (p) {
      if (p.type === 'hour') hour = Number(p.value) % 24;
      if (p.type === 'weekday') wd = WEEKDAYS.indexOf(p.value);
    });
    return { hour: hour, wd: wd };
  }
  function addDays(d, n) { var x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
  function daysBetween(a, b) { var out = []; for (var d = a; d <= b; d = addDays(d, 1)) out.push(d); return out; }
  function today() { return localDate(new Date().toISOString()); }
  function t(iso) { try { return showFmt.format(new Date(iso)); } catch (e) { return iso || ''; } }
  function secs(s) { s = Math.round(s || 0); return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's'; }
  function pct(x) { return (x * 100).toFixed(1) + '%'; }

  // ---------- range from the URL: ?range=today|7d|30d|90d|custom&from=&to= ----------
  function parseRange() {
    var q = new URLSearchParams(location.search), tdy = today(), DATE = /^\d{4}-\d{2}-\d{2}$/;
    var range = ['today', '7d', '30d', '90d', 'custom'].indexOf(q.get('range')) > -1 ? q.get('range') : '7d';
    var from, to = tdy, f = q.get('from') || '', tt = q.get('to') || '';
    if (range === 'custom' && DATE.test(f) && DATE.test(tt)) {
      from = f <= tt ? f : tt; to = f <= tt ? tt : f;
      if (to > tdy) to = tdy;
      if (from > to) from = to;
      if (from < addDays(to, -(MAX_DAYS - 1))) from = addDays(to, -(MAX_DAYS - 1));
    } else {
      if (range === 'custom') range = '7d';
      from = addDays(tdy, -(({ today: 1, '7d': 7, '30d': 30, '90d': 90 })[range] - 1));
    }
    return { range: range, from: from, to: to };
  }

  // ---------- aggregation (same rules as NGO's analytics-store.js) ----------
  function srcLabel(src) { return (src && src.type) || 'direct'; }
  function landing(v) { return (v.src && v.src.landing) || (v.pages[0] && v.pages[0].p) || '/'; }
  function activeSecs(v) { return (v.pages || []).reduce(function (n, p) { return n + (p.act || 0); }, 0); }
  function inc(map, key, field, by) {
    if (!map.has(key)) map.set(key, { key: key, visits: 0, leads: 0, views: 0, act: 0, convVisits: 0 });
    map.get(key)[field] += by == null ? 1 : by;
    return map.get(key);
  }
  function top(map, n, f) {
    return Array.from(map.values()).map(function (r) { r.conv = r.visits ? r.convVisits / r.visits : 0; return r; })
      .sort(function (a, b) { return (b[f] - a[f]) || (b.visits - a.visits); }).slice(0, n);
  }
  // Collapses repeat clicks on the same button within 10 s into one row (count).
  function collapseLeads(leads) {
    var out = [];
    leads.slice().sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); }).forEach(function (l) {
      var last = out[out.length - 1];
      if (last && last.vid === l.vid && last.ch === l.ch && last.p === l.p && last.btn === l.btn &&
          Date.parse(l.at) - Date.parse(last.lastAt) < 10000) {
        last.count++; last.lastAt = l.at;
        if (l.form) last.form = l.form;
        if (l.msg) last.msg = l.msg;
        return;
      }
      out.push(Object.assign({}, l, { count: 1, lastAt: l.at }));
    });
    return out.reverse();
  }

  function aggregate(data, from, to) {
    var visits = data.visits, leads = data.leads;
    var leadsByVid = new Map();
    leads.forEach(function (l) { if (!leadsByVid.has(l.vid)) leadsByVid.set(l.vid, []); leadsByVid.get(l.vid).push(l); });
    var uids = new Set(), newVisitors = 0, convVisits = 0, pagesTotal = 0, actTotal = 0;
    var bySource = new Map(), byLanding = new Map(), byPlace = new Map(), byDevice = new Map(), byLang = new Map();
    var byLeadPage = new Map(), byButton = new Map(), exitPages = new Map(), topPages = new Map(), byCampaign = new Map();
    var daily = new Map(daysBetween(from, to).map(function (d) { return [d, { date: d, visits: 0, leads: 0 }]; }));
    var heat = []; for (var i = 0; i < 7; i++) { heat.push([]); for (var h = 0; h < 24; h++) heat[i].push(0); }
    function addConv(map, key, converted) { var r = inc(map, key, 'visits'); if (converted) r.convVisits++; return r; }

    visits.forEach(function (v) {
      var vl = leadsByVid.get(v.vid) || [], converted = vl.length > 0;
      uids.add(v.uid);
      if ((v.n || 1) === 1) newVisitors++;
      if (converted) convVisits++;
      pagesTotal += v.pages.length;
      actTotal += activeSecs(v);
      var d = localDate(v.st);
      if (daily.has(d)) daily.get(d).visits++;
      addConv(bySource, srcLabel(v.src), converted).leads += vl.length;
      addConv(byLanding, landing(v), converted).leads += vl.length;
      addConv(byPlace, v.city || v.cc || '—', converted).leads += vl.length;
      addConv(byDevice, (v.dev && v.dev.type) || '—', converted).leads += vl.length;
      addConv(byLang, v.lg || '—', converted).leads += vl.length;
      var camp = v.src && v.src.utm && v.src.utm.campaign;
      if (camp) addConv(byCampaign, camp, converted).leads += vl.length;
      if (!converted && v.pages.length && !v.stub) addConv(exitPages, v.pages[v.pages.length - 1].p, false);
      if (!v.stub) v.pages.forEach(function (p) {
        var r = inc(topPages, p.p, 'views');
        r.act += p.act || 0;
        if (!r.title && p.t) r.title = p.t;
      });
    });

    var byCh = { whatsapp: 0, call: 0, email: 0, booking: 0, form: 0 };
    leads.forEach(function (l) {
      byCh[l.ch] = (byCh[l.ch] || 0) + 1;
      var d = localDate(l.at);
      if (daily.has(d)) daily.get(d).leads++;
      var r = inc(byLeadPage, l.p, 'leads');
      if (!r.title && l.t) r.title = l.t;
      inc(byButton, l.btn || '—', 'leads');
      var hd = hourDay(l.at);
      if (hd.wd >= 0) heat[hd.wd][hd.hour]++;
    });

    var visitsById = new Map(visits.map(function (v) { return [v.vid, v]; }));
    var leadRows = collapseLeads(leads).map(function (l) {
      var v = visitsById.get(l.vid) || { pages: [], stub: true };
      return {
        at: l.at, ch: l.ch, btn: l.btn, p: l.p, t: l.t, msg: l.msg, form: l.form, count: l.count,
        vid: l.vid, uid: l.uid, n: v.n || l.n || 1, src: srcLabel(v.src || l.src), utm: (v.src || l.src || {}).utm || {},
        landing: v.pages.length ? landing(v) : ((l.src && l.src.landing) || ''), pages: v.pages.length, act: activeSecs(v),
        stub: !!v.stub, city: v.city || l.city || '', cc: v.cc || l.cc || '', dev: v.dev || l.dev || {}, lg: v.lg || l.lg || '',
      };
    });
    var visitRows = visits.map(function (v) {
      return {
        st: v.st, vid: v.vid, uid: v.uid, n: v.n || 1, src: srcLabel(v.src), utm: (v.src && v.src.utm) || {},
        landing: landing(v), exit: v.pages.length ? v.pages[v.pages.length - 1].p : '', pages: v.pages.length,
        act: activeSecs(v), leads: (leadsByVid.get(v.vid) || []).length, city: v.city || '', cc: v.cc || '',
        dev: v.dev || {}, lg: v.lg || '', stub: !!v.stub,
      };
    });
    var n = visits.length;
    return {
      kpis: {
        visits: n, visitors: uids.size, newVisitors: newVisitors, returning: n - newVisitors,
        leads: leads.length, wa: byCh.whatsapp || 0, calls: (byCh.call || 0) + (byCh.email || 0),
        booked: (byCh.booking || 0) + (byCh.form || 0), bookings: byCh.booking || 0, forms: byCh.form || 0,
        convVisits: convVisits, convRate: n ? convVisits / n : 0,
        avgPages: n ? pagesTotal / n : 0, avgAct: n ? actTotal / n : 0,
      },
      daily: Array.from(daily.values()),
      bySource: top(bySource, 15, 'leads'), byCampaign: top(byCampaign, 15, 'leads'),
      byLanding: top(byLanding, 15, 'visits'), byPlace: top(byPlace, 15, 'visits'),
      byDevice: top(byDevice, 5, 'visits'), byLang: top(byLang, 6, 'visits'),
      byLeadPage: Array.from(byLeadPage.values()).sort(function (a, b) { return b.leads - a.leads; }).slice(0, 15),
      byButton: Array.from(byButton.values()).sort(function (a, b) { return b.leads - a.leads; }),
      exitPages: top(exitPages, 15, 'visits'),
      topPages: Array.from(topPages.values()).map(function (r) { r.avgAct = r.views ? r.act / r.views : 0; return r; })
        .sort(function (a, b) { return b.views - a.views; }).slice(0, 20),
      heat: heat, leads: leadRows, visits: visitRows,
    };
  }

  // ---------- DOM ----------
  // Text always goes through textContent, never innerHTML: titles, messages
  // and form values come from site visitors.
  function h(tag, attrs, kids) {
    var el = document.createElement(tag), k;
    for (k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'cls') el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null && c !== false) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function place(v) { return [v.city || v.cc || '', (v.dev && v.dev.type) || '', (v.dev && v.dev.os) || ''].filter(Boolean).join(' · '); }
  function pill(ch) { return h('span', { cls: 'an-pill ch-' + ch, text: chName(ch) }); }
  function formLine(f) { return f ? [f.name, f.company, f.email, f.phone, f.service].filter(Boolean).join(' · ') : ''; }

  var CSS = [
    '.an-wrap{--an-visits:#2f6fd6;--an-leads:#1a9e55;--a-surface:var(--surface,#fff);--a-surface-2:var(--surface-2,#f8fafc);--a-surface-3:var(--surface-3,#eef1f5);--a-border:var(--border,#e2e8f0);--a-border-light:var(--border-light,#edf0f4);--a-text:var(--text,#0f172a);--a-text-2:var(--text-2,#475569);--a-text-3:var(--text-3,#94a3b8);--a-hover:var(--hover,#f2f6fb);color:var(--a-text);font-size:13px}',
    '.an-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:18px}',
    '.an-ranges{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '.an-ranges a,.an-ranges button{font:inherit;font-size:12.5px;padding:6px 12px;border-radius:999px;border:1px solid var(--a-border);background:var(--a-surface);color:var(--a-text-2);text-decoration:none;cursor:pointer}',
    '.an-ranges a.on,.an-ranges button.on{background:var(--a-text);color:var(--a-surface);border-color:var(--a-text)}',
    '.an-ranges input[type=date]{font:inherit;font-size:12.5px;padding:5px 8px;border:1px solid var(--a-border);border-radius:8px;background:var(--a-surface);color:var(--a-text)}',
    '.an-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:18px}',
    '.an-kpi,.an-card{background:var(--a-surface);border:1px solid var(--a-border-light);border-radius:12px;padding:14px 16px;min-width:0}',
    '.an-kpi .lbl{font-size:11.5px;color:var(--a-text-3);text-transform:uppercase;letter-spacing:.4px}',
    '.an-kpi .val{font-size:26px;font-weight:650;margin:4px 0 2px;font-variant-numeric:tabular-nums}',
    '.an-kpi .sub{font-size:12px;color:var(--a-text-2)}',
    '.an-delta{font-size:11.5px;color:var(--a-text-3)}.an-delta.up{color:#1a7f45}.an-delta.down{color:#b42318}',
    '.an-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}',
    '.an-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}',
    '@media (max-width:1100px){.an-grid3{grid-template-columns:1fr 1fr}}@media (max-width:760px){.an-grid2,.an-grid3{grid-template-columns:1fr}}',
    '.an-card h3{font-size:13px;font-weight:650;margin:0 0 4px}.an-card .hint{font-size:11.5px;color:var(--a-text-3);margin:0 0 10px}',
    '.an-bars{display:flex;align-items:flex-end;gap:2px;height:140px;border-bottom:1px solid var(--a-border)}',
    '.an-bars .b{flex:1;min-width:2px;border-radius:4px 4px 0 0}.an-bars .b:hover{opacity:.75}',
    '.an-axis{display:flex;justify-content:space-between;font-size:10.5px;color:var(--a-text-3);margin-top:4px}',
    '.an-list{width:100%;border-collapse:collapse;font-size:12.5px}',
    '.an-list td,.an-list th{padding:5px 4px;border-bottom:1px solid var(--a-border-light);vertical-align:middle}',
    '.an-list th{font-size:10.5px;color:var(--a-text-3);text-transform:uppercase;letter-spacing:.4px;font-weight:550;text-align:start}',
    '.an-list .num{text-align:end;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.an-list .name{max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.an-meter{height:6px;border-radius:3px;background:var(--a-surface-3);overflow:hidden;min-width:50px}.an-meter>i{display:block;height:100%;border-radius:3px;background:var(--an-leads)}',
    '.an-tbl-wrap{overflow-x:auto}.an-tbl{width:100%;border-collapse:collapse;font-size:12.5px}',
    '.an-tbl th{font-size:10.5px;color:var(--a-text-3);text-transform:uppercase;letter-spacing:.4px;font-weight:550;text-align:start;padding:8px;background:var(--a-surface-2);border-bottom:2px solid var(--a-border);white-space:nowrap}',
    '.an-tbl td{padding:8px;border-bottom:1px solid var(--a-border-light);vertical-align:top}',
    '.an-tbl tbody tr[data-vid]{cursor:pointer}.an-tbl tbody tr[data-vid]:hover{background:var(--a-hover)}',
    '.an-wrap .muted{color:var(--a-text-3);font-size:11.5px}',
    '.an-pill{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:var(--a-surface-3);color:var(--a-text-2);white-space:nowrap}',
    '.an-pill.ch-whatsapp{background:#e3f6eb;color:#13703d}.an-pill.ch-call,.an-pill.ch-email{background:#fdf3d8;color:#7a5a07}.an-pill.ch-booking{background:#e4ecfb;color:#1d4fae}.an-pill.ch-form{background:#efe7fb;color:#5b2ca0}',
    '.an-heat{border-collapse:separate;border-spacing:2px;font-size:10px;color:var(--a-text-3)}.an-heat td{width:18px;height:16px;border-radius:3px}.an-heat th{font-weight:500;padding:0 4px 0 0;text-align:end}',
    '.an-filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}',
    '.an-filters select,.an-filters input{font:inherit;font-size:12.5px;padding:6px 8px;border:1px solid var(--a-border);border-radius:8px;background:var(--a-surface);color:var(--a-text)}',
    '.an-pager{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:10px;font-size:12px;color:var(--a-text-2)}',
    '.an-pager button{font:inherit;font-size:12px;padding:4px 10px;border-radius:8px;border:1px solid var(--a-border);background:var(--a-surface);cursor:pointer}',
    '.an-tip{position:fixed;z-index:3000;pointer-events:none;background:#111318;color:#fff;font-size:12px;padding:6px 9px;border-radius:6px;white-space:nowrap;display:none}',
    '.an-drawer-bg{position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:2000;display:none}',
    '.an-drawer{position:fixed;top:0;right:0;bottom:0;width:min(560px,100vw);background:var(--a-surface);z-index:2001;box-shadow:-8px 0 32px rgba(0,0,0,.15);overflow-y:auto;padding:20px 22px;transform:translateX(100%);transition:transform .2s ease}',
    '.an-drawer.open{transform:none}.an-drawer h2{font-size:16px;margin:0 0 4px}',
    '.an-drawer .close{position:absolute;top:12px;right:14px;border:0;background:none;font-size:22px;cursor:pointer;color:var(--a-text-2)}',
    '.an-kv{display:grid;grid-template-columns:120px 1fr;gap:4px 10px;font-size:12.5px;margin:12px 0 16px}.an-kv dt{color:var(--a-text-3)}.an-kv dd{margin:0;word-break:break-word}',
    '.an-tl{list-style:none;margin:0;padding:0;border-left:2px solid var(--a-border)}',
    '.an-tl li{position:relative;padding:0 0 14px 16px;font-size:12.5px}',
    '.an-tl li::before{content:"";position:absolute;left:-6px;top:4px;width:10px;height:10px;border-radius:50%;background:var(--a-surface);border:2px solid var(--an-visits)}',
    '.an-tl li.lead::before{background:var(--an-leads);border-color:var(--an-leads)}',
    '.an-tl .t{font-weight:600}.an-tl .meta{color:var(--a-text-3);font-size:11.5px}.an-tl .ev{color:var(--a-text-2);font-size:11.5px;margin-top:2px}',
    '.an-msg{white-space:pre-wrap;background:var(--a-surface-2);border-radius:8px;padding:8px 10px;margin-top:4px;font-size:12px}',
    '.an-empty{text-align:center;padding:28px 10px;color:var(--a-text-3);font-size:13px}',
    '.an-wrap [dir=auto]{unicode-bidi:plaintext}'
  ].join('\n');

  function delta(cur, before, isRate) {
    if (!before) return null;
    var d = isRate ? (cur - before) * 100 : ((cur - before) / before) * 100;
    if (!isFinite(d) || Math.abs(d) < 0.05) return h('span', { cls: 'an-delta', text: 'no change' });
    var up = d > 0;
    return h('span', { cls: 'an-delta ' + (up ? 'up' : 'down'), text: (up ? '▲ ' : '▼ ') + Math.abs(d).toFixed(1) + (isRate ? ' pts' : '%') });
  }
  function kpi(label, val, subKids) { return h('div', { cls: 'an-kpi' }, [h('div', { cls: 'lbl', text: label }), h('div', { cls: 'val', text: String(val) }), h('div', { cls: 'sub' }, subKids)]); }
  function card(title, hint, kids, style) { return h('div', { cls: 'an-card', style: style }, [h('h3', { text: title }), hint ? h('p', { cls: 'hint', text: hint }) : null].concat(kids)); }
  function list(head, rows, cells, empty) {
    var tb = h('tbody');
    rows.forEach(function (r) { tb.appendChild(h('tr', {}, cells(r))); });
    if (!rows.length) tb.appendChild(h('tr', {}, [h('td', { colspan: 4, cls: 'an-empty', text: empty || 'No data' })]));
    return h('table', { cls: 'an-list' }, [head ? h('thead', {}, [h('tr', {}, head.map(function (x) { return h('th', { cls: x.num ? 'num' : null, text: x.t || x }); }))]) : null, tb]);
  }
  function maxOf(rows, f) { return Math.max.apply(null, [1].concat(rows.map(function (x) { return x[f] || 0; }))); }
  function meterRow(name, n, mx, title, dir) {
    return [h('td', { cls: 'name', dir: dir || 'auto', title: title || name, text: name }),
      h('td', { style: 'width:34%' }, [h('div', { cls: 'an-meter' }, [h('i', { style: 'width:' + (n / mx) * 100 + '%' })])]),
      h('td', { cls: 'num', text: String(n) })];
  }

  // ---------- CSV (built in the browser) ----------
  function csvCell(v) {
    var s = v == null ? '' : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // would run as a formula in Excel
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function download(name, rows) {
    var blob = new Blob(['﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function exportCsv(type, agg, r) {
    var rows;
    if (type === 'leads') {
      rows = [['time_utc', 'channel', 'button', 'page', 'page_title', 'source', 'campaign', 'landing', 'pages_viewed',
        'active_seconds', 'visit_number', 'language', 'city', 'country', 'device', 'name', 'company', 'email', 'phone', 'message', 'clicks']];
      agg.leads.forEach(function (l) {
        var f = l.form || {};
        rows.push([l.at, l.ch, l.btn, l.p, l.t, l.src, l.utm.campaign || '', l.landing, l.pages, l.act, l.n, l.lg, l.city, l.cc,
          l.dev.type || '', f.name || '', f.company || '', f.email || '', f.phone || '', l.msg || '', l.count]);
      });
    } else {
      rows = [['start_utc', 'source', 'campaign', 'landing', 'exit', 'pages', 'active_seconds', 'leads', 'visit_number',
        'language', 'city', 'country', 'device', 'os', 'browser']];
      agg.visits.forEach(function (v) {
        rows.push([v.st, v.src, v.utm.campaign || '', v.landing, v.exit, v.pages, v.act, v.leads, v.n, v.lg, v.city, v.cc,
          v.dev.type || '', v.dev.os || '', v.dev.br || '']);
      });
    }
    download((C.filePrefix || 'site') + '-' + type + '-' + r.from + '-to-' + r.to + '.csv', rows);
  }

  // ---------- data ----------
  function getJSON(url) {
    return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } }).then(function (res) {
      if (res.status === 401) { location.reload(); throw new Error('signed out'); }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }
  function sep(u) { return u.indexOf('?') > -1 ? '&' : '?'; }
  function rangeUrl(base, from, to) { return base + sep(base) + 'from=' + from + '&to=' + to; }

  var R = parseRange();
  var span = Math.round((Date.parse(R.to) - Date.parse(R.from)) / 86400000) + 1;
  var prevTo = addDays(R.from, -1), prevFrom = addDays(prevTo, -(span - 1));

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  root.appendChild(h('div', { cls: 'an-wrap' }, [h('p', { cls: 'an-empty', text: 'Loading…' })]));

  Promise.all([getJSON(rangeUrl(C.dataUrl, R.from, R.to)), getJSON(rangeUrl(C.dataUrl, prevFrom, prevTo))])
    .then(function (res) {
      var cur = res[0];
      R.from = cur.from; R.to = cur.to;
      render(aggregate(cur, cur.from, cur.to), aggregate(res[1], res[1].from, res[1].to).kpis, cur.bad || 0);
    })
    .catch(function (e) {
      root.textContent = '';
      root.appendChild(h('div', { cls: 'an-wrap' }, [h('p', { cls: 'an-empty', text: 'Could not load the data (' + e.message + ').' })]));
    });

  function render(agg, prev, bad) {
    var k = agg.kpis, wrap = h('div', { cls: 'an-wrap' });
    root.textContent = '';
    root.appendChild(wrap);

    // toolbar
    var base = location.pathname;
    var form = h('form', { cls: 'an-ranges', method: 'get', action: base });
    [['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days']].forEach(function (x) {
      form.appendChild(h('a', { href: base + '?range=' + x[0], cls: R.range === x[0] ? 'on' : '', text: x[1] }));
    });
    form.appendChild(h('input', { type: 'hidden', name: 'range', value: 'custom' }));
    form.appendChild(h('input', { type: 'date', name: 'from', value: R.from, 'aria-label': 'From' }));
    form.appendChild(h('input', { type: 'date', name: 'to', value: R.to, 'aria-label': 'To' }));
    form.appendChild(h('button', { type: 'submit', cls: R.range === 'custom' ? 'on' : '', text: 'Apply' }));
    var exp = h('div', { cls: 'an-ranges' });
    ['leads', 'visits'].forEach(function (type) {
      var b = h('button', { type: 'button', text: 'Export ' + type + ' (CSV)' });
      b.addEventListener('click', function () { exportCsv(type, agg, R); });
      exp.appendChild(b);
    });
    wrap.appendChild(h('div', { cls: 'an-toolbar' }, [form, exp]));

    // KPIs
    var mix = [k.wa + ' WhatsApp', k.bookings + ' bookings', k.forms + ' forms', k.calls + ' calls / emails'];
    wrap.appendChild(h('div', { cls: 'an-kpis' }, [
      kpi('Visits', k.visits, [delta(k.visits, prev.visits)]),
      kpi('Visitors', k.visitors, [k.newVisitors + ' first visits · ' + k.returning + ' returning']),
      kpi('Leads', k.leads, [delta(k.leads, prev.leads), h('div', { text: mix.join(' · ') })]),
      kpi('WhatsApp', k.wa, [delta(k.wa, prev.wa)]),
      kpi('Bookings & forms', k.booked, [delta(k.booked, prev.booked)]),
      kpi('Conversion', pct(k.convRate), ['visits with a lead ', delta(k.convRate, prev.convRate, true)]),
      kpi('Engagement', k.avgPages.toFixed(1), ['pages per visit · ' + secs(k.avgAct) + ' active'])
    ]));
    if (!k.visits) wrap.appendChild(h('div', { cls: 'an-card an-empty', style: 'margin-bottom:18px', text: 'No visits in this period yet. Data appears here once the tracker is live on the site.' }));

    // daily bars
    var g2 = h('div', { cls: 'an-grid2' });
    [['visits', 'Visits per day', 'var(--an-visits)'], ['leads', 'Leads per day', 'var(--an-leads)']].forEach(function (c) {
      var mx = maxOf(agg.daily, c[0]), any = agg.daily.some(function (d) { return d[c[0]]; });
      var bars = h('div', { cls: 'an-bars' });
      agg.daily.forEach(function (d) {
        bars.appendChild(h('div', { cls: 'b', style: 'height:' + (d[c[0]] ? Math.max(2, (d[c[0]] / mx) * 100) : 0) + '%;background:' + c[2], 'data-tip': d.date + ': ' + d[c[0]] + ' ' + c[0] }));
      });
      g2.appendChild(card(c[1], 'Peak ' + (any ? mx : 0) + ' on one day', [bars,
        h('div', { cls: 'an-axis' }, [h('span', { text: agg.daily[0] ? agg.daily[0].date : '' }), h('span', { text: agg.daily.length > 1 ? agg.daily[agg.daily.length - 1].date : '' })])]));
    });
    wrap.appendChild(g2);

    // leads table
    var leadsTbl = h('table', { cls: 'an-tbl' }, [h('thead', {}, [h('tr', {}, ['Time', 'Type', 'Sent from page', 'Came from', 'First page', 'Pages', 'Time on site', 'Location / device', 'Contact details'].map(function (x) { return h('th', { text: x }); }))]), h('tbody')]);
    var leadsPager = h('div', { cls: 'an-pager' });
    wrap.appendChild(card('Leads: who contacted you, and how they got there', 'Newest first. Click a row to see the whole visit, page by page. Times are ' + (C.tzLabel || TZ) + '.',
      [h('div', { cls: 'an-tbl-wrap' }, [leadsTbl]), leadsPager], 'margin-bottom:18px'));
    paged(leadsTbl, leadsPager, agg.leads, function (l) {
      return h('tr', { 'data-vid': l.vid }, [
        h('td', { text: t(l.at) }),
        h('td', {}, [pill(l.ch), l.count > 1 ? h('span', { cls: 'muted', text: ' ×' + l.count }) : null, h('div', { cls: 'muted', text: btnName(l.btn) })]),
        h('td', { dir: 'auto' }, [l.t || l.p, h('div', { cls: 'muted', dir: 'ltr', text: l.p })]),
        h('td', {}, [srcName(l.src), l.utm && l.utm.campaign ? h('div', { cls: 'muted', text: l.utm.campaign }) : null]),
        h('td', { dir: 'ltr', text: l.landing }),
        h('td', { text: String(l.pages) }),
        h('td', { text: l.stub ? '—' : secs(l.act) }),
        h('td', { text: [place(l), l.lg].filter(Boolean).join(' · ') + (l.n > 1 ? ' · visit #' + l.n : ' · new') }),
        h('td', { dir: 'auto', text: formLine(l.form) })
      ]);
    }).draw();

    // breakdowns
    var g3 = h('div', { cls: 'an-grid3' });
    var vh = [{ t: 'Visits', num: 1 }, { t: 'Leads', num: 1 }, { t: 'Conv.', num: 1 }];
    function convCells(name, dir) {
      return function (x) {
        return [h('td', { cls: 'name', dir: dir, title: x.key, text: name ? name(x.key) : x.key }), h('td', { cls: 'num', text: String(x.visits) }),
          h('td', { cls: 'num', text: String(x.leads) }), h('td', { cls: 'num', text: pct(x.conv) })];
      };
    }
    g3.appendChild(card('Where visitors come from', 'Visits, leads and conversion per source', [list(['Source'].concat(vh), agg.bySource, convCells(srcName))]));
    var mxL = maxOf(agg.byLeadPage, 'leads');
    g3.appendChild(card('Pages people contacted you from', 'The page the lead was sent from', [list(null, agg.byLeadPage, function (x) { return meterRow(x.title || x.key, x.leads, mxL, x.key); }, 'No leads yet')]));
    var mxB = maxOf(agg.byButton, 'leads');
    g3.appendChild(card('Which button or form they used', 'Where on the page the lead happened', [list(null, agg.byButton, function (x) { return meterRow(btnName(x.key), x.leads, mxB); }, 'No leads yet')]));
    g3.appendChild(card('First page of the visit (landing pages)', 'Visits and how many turned into a lead', [list(['Page'].concat(vh), agg.byLanding, convCells(null, 'ltr'))]));
    g3.appendChild(card('Most viewed pages', 'Views and average active time per view', [list(['Page', { t: 'Views', num: 1 }, { t: 'Avg time', num: 1 }], agg.topPages, function (x) {
      return [h('td', { cls: 'name', dir: 'auto', title: x.key, text: x.title || x.key }), h('td', { cls: 'num', text: String(x.views) }), h('td', { cls: 'num', text: secs(x.avgAct) })];
    })]));
    g3.appendChild(card('Where visitors left without contacting', 'Last page of visits with no lead', [list(['Page', { t: 'Exits', num: 1 }], agg.exitPages, function (x) {
      return [h('td', { cls: 'name', dir: 'ltr', title: x.key, text: x.key }), h('td', { cls: 'num', text: String(x.visits) })];
    })]));
    g3.appendChild(card('Countries / cities', 'City needs Cloudflare\'s visitor location headers; otherwise the country code shows', [list(['Place'].concat(vh), agg.byPlace, convCells())]));
    g3.appendChild(card('Devices and languages', 'Visits, leads and conversion per device type and page language', [list(['Device'].concat(vh), agg.byDevice, convCells()), list(['Language'].concat(vh), agg.byLang, convCells())]));
    var hmx = Math.max.apply(null, [1].concat([].concat.apply([], agg.heat)));
    var heat = h('table', { cls: 'an-heat' });
    agg.heat.forEach(function (row, i) {
      var tr = h('tr', {}, [h('th', { text: WEEKDAYS[i] })]);
      row.forEach(function (n, hr) {
        tr.appendChild(h('td', { style: 'background:' + (n ? 'rgba(26,158,85,' + (0.18 + 0.82 * n / hmx).toFixed(2) + ')' : 'var(--a-surface-3)'),
          'data-tip': WEEKDAYS[i] + ' ' + String(hr).padStart(2, '0') + ':00 · ' + n + ' lead' + (n === 1 ? '' : 's') }));
      });
      heat.appendChild(tr);
    });
    var axis = h('tr', {}, [h('th')]);
    for (var hr = 0; hr < 24; hr++) axis.appendChild(h('th', { style: 'text-align:center;font-weight:400', text: hr % 6 === 0 ? String(hr) : '' }));
    heat.appendChild(axis);
    g3.appendChild(card('When leads come in', 'Leads by weekday and hour (' + (C.tzLabel || TZ) + '). Darker = more.', [h('div', { cls: 'an-tbl-wrap' }, [heat])]));
    wrap.appendChild(g3);

    if (agg.byCampaign.length) wrap.appendChild(card('Campaigns (utm_campaign)', null, [list(['Campaign'].concat(vh), agg.byCampaign, convCells())], 'margin-bottom:18px'));

    // visits explorer
    var fSrc = h('select', { 'aria-label': 'Source' }, [h('option', { value: '', text: 'All sources' })]);
    var seen = {};
    agg.visits.forEach(function (v) { if (!seen[v.src]) { seen[v.src] = 1; fSrc.appendChild(h('option', { value: v.src, text: srcName(v.src) })); } });
    var fConv = h('select', { 'aria-label': 'Converted' }, [h('option', { value: '', text: 'All visits' }), h('option', { value: '1', text: 'With a lead' }), h('option', { value: '0', text: 'Without a lead' })]);
    var fDev = h('select', { 'aria-label': 'Device' }, [h('option', { value: '', text: 'All devices' }), h('option', { text: 'mobile' }), h('option', { text: 'desktop' }), h('option', { text: 'tablet' })]);
    var fQ = h('input', { type: 'search', placeholder: 'Filter by page, city or language', 'aria-label': 'Filter by page, city or language' });
    var visitsTbl = h('table', { cls: 'an-tbl' }, [h('thead', {}, [h('tr', {}, ['Start', 'Came from', 'First page', 'Last page', 'Pages', 'Time on site', 'Leads', 'Visit #', 'Location / device'].map(function (x) { return h('th', { text: x }); }))]), h('tbody')]);
    var visitsPager = h('div', { cls: 'an-pager' });
    wrap.appendChild(card('All visits', 'Every visit in the period, including people who did not contact you. Click a row for the full journey.',
      [h('div', { cls: 'an-filters' }, [fSrc, fConv, fDev, fQ]), h('div', { cls: 'an-tbl-wrap' }, [visitsTbl]), visitsPager], 'margin-bottom:18px'));
    var vt = paged(visitsTbl, visitsPager, agg.visits, function (v) {
      return h('tr', { 'data-vid': v.vid }, [
        h('td', { text: t(v.st) }), h('td', { text: srcName(v.src) }), h('td', { dir: 'ltr', text: v.landing }), h('td', { dir: 'ltr', text: v.exit }),
        h('td', { text: String(v.pages) }), h('td', { text: v.stub ? '—' : secs(v.act) }),
        h('td', {}, [v.leads ? h('span', { cls: 'an-pill ch-whatsapp', text: String(v.leads) }) : '']),
        h('td', { text: v.n > 1 ? '#' + v.n : 'new' }), h('td', { text: [place(v), v.lg].filter(Boolean).join(' · ') })
      ]);
    });
    function applyFilters() {
      var s = fSrc.value, c = fConv.value, d = fDev.value, q = fQ.value.trim().toLowerCase();
      vt.set(agg.visits.filter(function (v) {
        if (s && v.src !== s) return false;
        if (c === '1' && !v.leads) return false;
        if (c === '0' && v.leads) return false;
        if (d && (!v.dev || v.dev.type !== d)) return false;
        if (q && (v.landing + ' ' + v.exit + ' ' + v.city + ' ' + v.cc + ' ' + v.lg).toLowerCase().indexOf(q) === -1) return false;
        return true;
      }));
    }
    [fSrc, fConv, fDev].forEach(function (el) { el.addEventListener('change', applyFilters); });
    fQ.addEventListener('input', applyFilters);
    vt.draw();
    if (bad) wrap.appendChild(h('p', { cls: 'muted', text: 'Skipped ' + bad + ' unreadable line(s) in the data files.' }));

    setupTipAndDrawer();
  }

  function paged(table, pager, rows, renderRow) {
    var tbody = table.querySelector('tbody'), page = 0, size = 50;
    function draw() {
      tbody.textContent = '';
      if (!rows.length) tbody.appendChild(h('tr', {}, [h('td', { colspan: 9, cls: 'an-empty', text: 'Nothing here for this period.' })]));
      rows.slice(page * size, page * size + size).forEach(function (r) { tbody.appendChild(renderRow(r)); });
      pager.textContent = '';
      var pages = Math.ceil(rows.length / size);
      if (pages > 1) {
        var prev = h('button', { type: 'button', text: '‹ Prev' }), next = h('button', { type: 'button', text: 'Next ›' });
        prev.disabled = page === 0; next.disabled = page >= pages - 1;
        prev.addEventListener('click', function () { page--; draw(); });
        next.addEventListener('click', function () { page++; draw(); });
        pager.appendChild(h('span', { text: rows.length + ' rows · page ' + (page + 1) + ' of ' + pages }));
        pager.appendChild(prev); pager.appendChild(next);
      }
    }
    return { set: function (r) { rows = r; page = 0; draw(); }, draw: draw };
  }

  var EV = { nav: 'Clicked link', out: 'Left to', btn: 'Clicked', form_start: 'Started form', wa: 'Clicked WhatsApp', call: 'Clicked call',
    email: 'Clicked email', book: 'Booked a call', book_open: 'Opened booking calendar', form: 'Sent form', modal: 'Opened booking form', popup: 'Popup' };

  function setupTipAndDrawer() {
    var tip = h('div', { cls: 'an-tip' }), bg = h('div', { cls: 'an-drawer-bg' }), body = h('div');
    var closeBtn = h('button', { cls: 'close', type: 'button', 'aria-label': 'Close', text: '×' });
    var drawer = h('aside', { cls: 'an-drawer', 'aria-label': 'Visit details' }, [closeBtn, body]);
    var wrap = root.querySelector('.an-wrap');
    [tip, bg, drawer].forEach(function (el) { wrap.appendChild(el); });

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest && e.target.closest('[data-tip]');
      if (!el) { tip.style.display = 'none'; return; }
      tip.textContent = el.getAttribute('data-tip');
      tip.style.display = 'block';
    });
    document.addEventListener('mousemove', function (e) {
      if (tip.style.display === 'block') { tip.style.left = (e.clientX + 12) + 'px'; tip.style.top = (e.clientY - 30) + 'px'; }
    });

    function close() { drawer.classList.remove('open'); bg.style.display = 'none'; }
    closeBtn.addEventListener('click', close);
    bg.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    function kv(pairs) {
      var dl = h('dl', { cls: 'an-kv' });
      pairs.forEach(function (p) { if (p[1]) { dl.appendChild(h('dt', { text: p[0] })); dl.appendChild(h('dd', { dir: 'auto', text: p[1] })); } });
      return dl;
    }
    function srcLine(s) {
      if (!s) return '';
      var bits = [srcName(s.type)];
      if (s.ref) bits.push('from ' + s.ref);
      if (s.utm && s.utm.campaign) bits.push('campaign ' + s.utm.campaign);
      if (s.utm && s.utm.term) bits.push('keyword ' + s.utm.term);
      if (s.click) bits.push(s.click);
      return bits.join(' · ');
    }
    function isLeadEv(e) { return ['wa', 'call', 'email', 'book', 'form'].indexOf(e.e) > -1; }

    function openVisit(vid) {
      body.textContent = '';
      body.appendChild(h('p', { cls: 'muted', text: 'Loading…' }));
      drawer.classList.add('open'); bg.style.display = 'block';
      var u = C.visitUrl + sep(C.visitUrl) + 'vid=' + encodeURIComponent(vid) + '&from=' + R.from + '&to=' + R.to;
      getJSON(u).then(function (j) {
        body.textContent = '';
        body.appendChild(h('h2', { text: (j.leads.length ? 'Lead visit' : 'Visit') + ' · ' + t(j.st) }));
        body.appendChild(h('div', { cls: 'muted', text: j.n > 1 ? 'Visit #' + j.n + ' by this visitor' : 'First visit by this visitor' }));
        var dev = j.dev || {};
        body.appendChild(kv([
          ['Came from', srcLine(j.src)],
          ['First ever source', j.n > 1 ? srcLine(j.first) : ''],
          ['First seen', j.fs ? t(j.fs) : ''],
          ['Location', [j.city, j.reg, j.cc].filter(Boolean).join(', ')],
          ['Device', [dev.type, dev.os, dev.br, dev.sw ? dev.sw + '×' + dev.sh : '', dev.net].filter(Boolean).join(' · ')],
          ['Language', [j.lg ? 'page: ' + j.lg : '', dev.lang ? 'browser: ' + dev.lang : '', dev.tz].filter(Boolean).join(' · ')],
          ['Visit length', j.dur ? secs(j.dur) : '']
        ]));
        if (j.stub) body.appendChild(h('p', { cls: 'muted', text: 'Only the lead was received for this visit (the visitor closed the tab before the visit summary was sent), so page times are missing.' }));
        j.leads.forEach(function (l) {
          body.appendChild(h('div', { cls: 'an-card', style: 'margin-bottom:12px;border-color:#bfe6cf' }, [
            h('div', {}, [pill(l.ch), ' ' + t(l.at) + ' · ' + btnName(l.btn)]),
            l.form ? h('div', { dir: 'auto', style: 'margin-top:6px', text: formLine(l.form) }) : null,
            l.msg ? h('div', { cls: 'an-msg', dir: 'auto', text: l.msg }) : null
          ]));
        });
        body.appendChild(h('h3', { text: 'Pages in order', style: 'font-size:13px;margin:16px 0 10px' }));
        var ol = h('ol', { cls: 'an-tl' });
        (j.pages || []).forEach(function (p) {
          var li = h('li', { cls: (p.ev || []).some(isLeadEv) ? 'lead' : '' }, [
            h('div', { cls: 't', dir: 'auto', text: p.t || p.p }),
            h('div', { cls: 'meta', dir: 'ltr', text: p.p + (p.at ? ' · ' + t(p.at) : '') + (p.act != null ? ' · ' + secs(p.act) + ' active' : '') + (p.scr ? ' · scrolled ' + p.scr + '%' : '') + (p.rl ? ' · reloaded' : '') })
          ]);
          (p.ev || []).forEach(function (e) {
            var detail = isLeadEv(e) ? btnName(e.s) : e.e === 'book_open' ? btnName(e.s) : [e.l, e.h].filter(Boolean).join(' → ');
            if (e.e === 'popup') detail = [e.l, e.s].filter(Boolean).join(' · ');
            li.appendChild(h('div', { cls: 'ev', dir: 'auto', text: '+' + secs(e.o) + '  ' + (EV[e.e] || e.e) + (detail ? ': ' + detail : '') }));
          });
          ol.appendChild(li);
        });
        body.appendChild(ol);
        if (j.others && j.others.length) {
          body.appendChild(h('h3', { text: 'Other visits by this visitor (this period)', style: 'font-size:13px;margin:16px 0 8px' }));
          j.others.forEach(function (o) {
            var a = h('a', { href: '#', text: t(o.st) + ' · ' + srcName(o.src) + ' · ' + o.pages + ' pages' + (o.leads ? ' · ' + o.leads + ' lead(s)' : '') });
            a.addEventListener('click', function (e) { e.preventDefault(); openVisit(o.vid); });
            body.appendChild(h('div', { style: 'font-size:12.5px;margin-bottom:4px' }, [a]));
          });
        }
      }).catch(function () { body.textContent = ''; body.appendChild(h('p', { text: 'Could not load this visit.' })); });
    }
    root.addEventListener('click', function (e) {
      var tr = e.target.closest && e.target.closest('tr[data-vid]');
      if (tr) openVisit(tr.getAttribute('data-vid'));
    });
  }
})();
