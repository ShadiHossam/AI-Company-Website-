#!/usr/bin/env python3
"""Upload images/<short>/*.webp to the blog-images bucket at abu-dhabi/<short>/<file>.
Resumable via uploaded.log. No upsert, so nothing already in the bucket is overwritten."""
import os, re, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
S = os.path.dirname(os.path.abspath(__file__))
env = dict(re.findall(r'^(\w+)=(.*)$', open(os.path.join(S, '..', '..', 'astro-site', '.env.local')).read(), re.M))
URL = env['SUPABASE_URL'].strip().strip('"').rstrip('/'); KEY = env['SUPABASE_SERVICE_ROLE_KEY'].strip().strip('"')
LOG = os.path.join(S, 'uploaded.log')
done = set(open(LOG).read().split()) if os.path.exists(LOG) else set()
IM = os.path.join(S, 'images')
todo = sorted(f'{d}/{f}' for d in os.listdir(IM) for f in os.listdir(os.path.join(IM, d)) if f.endswith('.webp'))
todo = [p for p in todo if p not in done]
def up(p):
    data = open(os.path.join(IM, p), 'rb').read()
    req = urllib.request.Request(f'{URL}/storage/v1/object/blog-images/abu-dhabi/{p}', data=data, method='POST',
        headers={'Authorization': f'Bearer {KEY}', 'apikey': KEY, 'Content-Type': 'image/webp',
                 'Cache-Control': 'max-age=31536000', 'x-upsert': 'false'})
    err = ''
    for _ in range(3):
        try:
            urllib.request.urlopen(req, timeout=60); return p, 'ok'
        except urllib.error.HTTPError as e:
            err = f'{e.code} {e.read().decode()[:200]}'
        except Exception as e:
            err = str(e)
    return p, err
ok = fail = 0
with ThreadPoolExecutor(8) as ex, open(LOG, 'a') as log:
    for p, r in ex.map(up, todo):
        if r == 'ok': log.write(p + '\n'); log.flush(); ok += 1
        else: fail += 1; print('FAIL', p, r)
print(f'uploaded {ok}, failed {fail}, previously done {len(done)}')
