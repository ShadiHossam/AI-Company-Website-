#!/usr/bin/env python3
"""Pick and download 3 images per Abu Dhabi article, reusing the September picker.

Resumable: picks.json is saved after each article. Never reuses a photo already picked for the September batch.
"""
import io, json, os, sys, urllib.request
from PIL import Image
IP = os.path.abspath('../../lenooai-articles-20260916/.imageprep')
sys.path.insert(0, IP); sys.path.insert(0, '.')
import fetch_images as F
from common import articles, HERE

PICKS = os.path.join(HERE, 'picks.json')
OUT = os.path.join(HERE, 'images')
SLOTS = ('feature', 'inline-1', 'inline-2')
queries = {l.split('|')[0]: l.strip().split('|')[1:] for l in open('queries.txt', encoding='utf-8') if '|' in l}
picks = json.load(open(PICKS)) if os.path.exists(PICKS) else {}
used = {v['id'] for p in picks.values() for v in p.values()}
for fn in ('picks.json', 'picks_b.json', 'picks_c.json'):
    used |= {v['id'] for p in json.load(open(os.path.join(IP, fn))).values() for v in p.values()}
used |= {v['id'] for v in json.load(open(os.path.join(IP, 'overrides.json'))).values() for v in v.values() if 'id' in v}

def save(short, slot, c):
    d = os.path.join(OUT, short); os.makedirs(d, exist_ok=True)
    fn = os.path.join(d, f'{short}-{slot}.webp')
    if os.path.exists(fn): return
    raw = urllib.request.urlopen(urllib.request.Request(c['dl'], headers=F.UA), timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    W = 1600 if slot == 'feature' else 1200
    if im.width > W: im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    im.save(fn, 'WEBP', quality=80, method=6)

for n, a in enumerate(articles()):
    s = a['short']
    assert s in queries, s
    res = picks.get(s, {})
    kt = F.toks(s.replace('-', ' '))
    for slot, q in zip(SLOTS, queries[s]):
        if slot in res: continue
        c, qq = F.pick(q, kt, used, next((v for k, v in F.INDUSTRY if k in s), None))
        if not c: print('NO PICK', s, slot, q, flush=True); continue
        try: save(s, slot, c)
        except Exception as e: print('DL FAIL', s, slot, e, flush=True); continue
        used.add(c['id']); res[slot] = {**c, 'query': qq, 'orig_query': q}
    picks[s] = res
    json.dump(picks, open(PICKS, 'w'), indent=0)
    print('done', n + 1, s, flush=True)
print('ALL DONE', flush=True)
