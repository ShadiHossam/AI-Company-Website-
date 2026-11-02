"""Shared loader for the Abu Dhabi batch: the 91 rows in .check/slug-plan.json with parsed articles."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SKIP_H2 = re.compile(r'key takeaways|faq|frequently|questions|sources|references|next step|conclusion|bottom line|'
                     r'أبرز النقاط|النقاط الرئيسية|الخلاصة|الأسئلة|أسئلة|المصادر|مراجع|الخطوة', re.I)

def parse(rel):
    raw = open(os.path.join(ROOT, rel), encoding='utf-8').read()
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
    body = re.sub(r'^\s*# [^\n]*\n+', '', m.group(2), count=1)
    return json.loads(m.group(1)), body.rstrip() + '\n'

def sections(body):
    """H2 headings usable for an inline image, spread pick: roughly 1/3 and 2/3 through."""
    hs = [h.strip() for h in re.findall(r'^## (.+)$', body, re.M) if not SKIP_H2.search(h)]
    return hs[len(hs) // 3], hs[2 * len(hs) // 3]

def articles():
    out = []
    for p in json.load(open(os.path.join(ROOT, '.check', 'slug-plan.json'))):
        a = {'id': p['id'], 'short': p['slug'], 'slug': f"abu-dhabi/{p['slug']}"}
        for lang, rel in p['files'].items():
            a[lang] = dict(zip(('fm', 'body'), parse(rel)))
            assert a[lang]['fm']['meta']['slug'] == a['slug'], rel
        out.append(a)
    return out
