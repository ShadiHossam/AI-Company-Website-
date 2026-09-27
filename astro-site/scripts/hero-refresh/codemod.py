#!/usr/bin/env python3
"""Move inline `.hero-section` heroes (and the image banner under them) into
<PageHero>. Re-runnable: pages already using PageHero are skipped.

usage: python3 scripts/hero-refresh/codemod.py [--dry] [--skip-file LIST] [page.astro ...]
Image overrides come from scripts/hero-refresh/images.json:
  { "industries/dental-clinics": {"src": ..., "alt": ..., "position": ...},
    "ar/industries/dental-clinics": {"alt": "..."}, ... }
An AR page inherits src/position from its EN twin and only needs its own alt.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
PAGES = os.path.join(ROOT, 'src', 'pages')
COMPONENT = os.path.join(ROOT, 'src', 'components', 'PageHero.astro')
IMAGES = json.load(open(os.path.join(HERE, 'images.json'))) if os.path.exists(os.path.join(HERE, 'images.json')) else {}
ALWAYS_SKIP = {'index', 'ar/index'}  # homepage has its own hero


def hero_span(s):
    m = re.search(r'<(header|section)\b([^>]*)class="(hero-section[^"]*)"([^>]*)>', s)
    if not m:
        return None
    tag = m.group(1)
    close = '</%s>' % tag
    # find matching close tag (heroes never nest header/section of same tag)
    depth, i = 0, m.start()
    for t in re.finditer(r'<%s\b|</%s>' % (tag, tag), s[m.start():]):
        depth += 1 if not t.group(0).startswith('</') else -1
        if depth == 0:
            end = m.start() + t.start()
            return dict(start=m.start(), open_end=m.end(), end=end, close_end=end + len(close),
                        tag=tag, classes=m.group(3).split())
    return None


def balanced_div(s, i):
    depth = 0
    for t in re.finditer(r'<div\b|</div>', s[i:]):
        depth += 1 if t.group(0) == '<div' else -1
        if depth == 0:
            return i + t.end()
    return None


def banner_after(s, pos):
    m = re.match(r'(\s*(?:<!--(?:(?!-->).)*-->\s*)*)<div\b', s[pos:], re.S)
    if not m:
        return None
    st = pos + len(m.group(1))
    en = balanced_div(s, st)
    blk = s[st:en]
    if '<img' not in blk:
        return None
    return st, en, blk


def attr(tag, name):
    m = re.search(r'\b%s=(\{`[^`]*`\}|\{[^}]*\}|"[^"]*")' % name, tag)
    return m.group(1) if m else None


def strip_container(inner):
    t = inner.strip()
    m = re.match(r'<div\s+class="container"[^>]*>', t)
    if not m:
        return inner
    en = balanced_div(t, 0)
    if en != len(t):
        return inner
    return t[m.end():-len('</div>')]


def stats_from_banner(blk):
    m = re.search(r'<StatStrip\b.*?/>', blk, re.S)
    if m:
        st, en = m.start(), m.end()
    else:
        m = re.search(r'<div\s+class="[^"]+"', blk)
        if not m:
            return None
        st, en = m.start(), balanced_div(blk, m.start())
    # keep the first line's indentation so dedent() sees a consistent block
    ls = blk.rfind('\n', 0, st) + 1
    lead = blk[ls:st] if not blk[ls:st].strip() else ''
    return lead + blk[st:en]


def dedent(text):
    lines = text.strip('\n').split('\n')
    ind = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
    return '\n'.join(l[ind:] if l.strip() else '' for l in lines)


def indent(text, n):
    pad = ' ' * n
    return '\n'.join(pad + l if l.strip() else '' for l in text.split('\n'))


def js_str(v):
    return json.dumps(v, ensure_ascii=False)


def add_import(s, path):
    rel = os.path.relpath(COMPONENT, os.path.dirname(path))
    if not rel.startswith('.'):
        rel = './' + rel
    line = "import PageHero from '%s';" % rel
    fm = re.match(r'---\n(.*?)\n---', s, re.S)
    if not fm:
        return "---\n%s\n---\n" % line + s
    body = fm.group(1)
    imports = list(re.finditer(r'^import .*?;?$', body, re.M))
    if imports:
        at = fm.start(1) + imports[-1].end()
        return s[:at] + '\n' + line + s[at:]
    at = fm.start(1)
    return s[:at] + line + '\n' + s[at:]


def key_for(path):
    return os.path.relpath(path, PAGES)[:-len('.astro')]


def image_for(key, banner_img):
    img = {}
    if banner_img:
        img.update(banner_img)
    en_key = key[3:] if key.startswith('ar/') else key
    if en_key in IMAGES:
        o = IMAGES[en_key]
        img['src'] = o['src']
        img.pop('position', None)
        if o.get('position'):
            img['position'] = o['position']
        if not key.startswith('ar/'):
            img['alt'] = o['alt']
    if key.startswith('ar/') and key in IMAGES:
        img['alt'] = IMAGES[key]['alt']
    if img.get('src') == 'NONE':
        return None
    return img or None


def transform(path, dry=False):
    s = open(path).read()
    if '<PageHero' in s:
        return 'already'
    h = hero_span(s)
    if not h:
        return 'no-hero'
    key = key_for(path)
    if key.startswith('ar/') and key[3:] in IMAGES and key not in IMAGES:
        return 'need-ar-alt'
    inner = s[h['open_end']:h['end']]
    content = dedent(strip_container(inner))

    b = banner_after(s, h['close_end'])
    banner_img, stats, cut_end = None, None, h['close_end']
    if b:
        st, en, blk = b
        im = re.search(r'<img\b[^>]*>', blk).group(0)
        src = attr(im, 'src')
        alt = attr(im, 'alt')
        if src and src.startswith('"') and alt and alt.startswith('"'):
            banner_img = {'src': src.strip('"'), 'alt': alt.strip('"')}
            pos = re.search(r'object-position:\s*([^;"]+)', im)
            if pos and pos.group(1).strip() not in ('center', 'center center'):
                banner_img['position'] = pos.group(1).strip()
            stats = stats_from_banner(blk)
            cut_end = en
        else:
            b = None

    img = image_for(key, banner_img)
    extra = [c for c in h['classes'] if c != 'hero-section']
    props = []
    if img:
        pi = '{ src: %s, alt: %s' % (js_str(img['src']), js_str(img['alt']))
        if img.get('position'):
            pi += ', position: %s' % js_str(img['position'])
        props.append('image={%s }}' % pi)
    if h['tag'] != 'header':
        props.append('as="section"')
    if extra:
        props.append('class="%s"' % ' '.join(extra))
    open_tag = '<PageHero%s>' % ((' ' + ' '.join(props)) if props else '')
    parts = [open_tag, indent(content, 2)]
    if stats:
        parts.append(indent('<div slot="stats">\n%s\n</div>' % indent(dedent(stats), 2), 2))
    parts.append('</PageHero>')
    new = '\n'.join(parts)

    out = s[:h['start']] + new + s[cut_end:]
    out = add_import(out, path)
    if not dry:
        open(path, 'w').write(out)
    return 'split' if img else 'center'


def main():
    args = sys.argv[1:]
    dry = '--dry' in args
    skip = set(ALWAYS_SKIP)
    if '--skip-file' in args:
        i = args.index('--skip-file')
        for line in open(args[i + 1]):
            line = line.strip()
            if line.startswith('src/pages/') and line.endswith('.astro'):
                skip.add(line[len('src/pages/'):-len('.astro')])
        del args[i:i + 2]
    files = [a for a in args if a.endswith('.astro')]
    if not files:
        for d, _, fs in os.walk(PAGES):
            if os.sep + 'admin' in d:
                continue
            files += [os.path.join(d, f) for f in fs if f.endswith('.astro')]
    counts = {}
    for f in sorted(files):
        f = os.path.abspath(f)
        if key_for(f) in skip:
            r = 'skipped'
        else:
            r = transform(f, dry)
        counts[r] = counts.get(r, 0) + 1
        if r not in ('no-hero',):
            print('%-8s %s' % (r, key_for(f)))
    print(counts)


if __name__ == '__main__':
    main()
