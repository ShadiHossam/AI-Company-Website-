#!/usr/bin/env python3
"""Find candidate language twins: an English-only and an Arabic-only post on the
same topic under different slugs.

Input: a JSON export of blog_posts rows, e.g. the Management API result of
  select slug, lang, title, ar_title, pub_date from blog_posts
  where deleted_at is null and status = 'published';
Output: twins-candidates.tsv (score, en slug, ar slug, en title, ar title) for a
human to review. Keep the real matches in twins.tsv (en_slug<TAB>ar_slug), then
generate the UPDATE with --sql.

Usage:
  python3 -I find-twins.py rows.json                # writes twins-candidates.tsv
  python3 -I find-twins.py rows.json --sql twins.tsv # prints the UPDATE statement
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STOP = {'for', 'the', 'in', 'uae', 'a', 'of', 'and', 'to', 'ai', 'dubai', 'how', 'vs', 'with', 'your', 'abu', 'dhabi'}
# Slug words that mean the same thing in the two naming styles.
SYNONYMS = {'appointment': 'booking', 'automation': '', 'companies': '', 'firms': 'firms'}


def tokens(slug: str) -> frozenset:
    out = set()
    for t in re.split(r'[-/]', slug):
        t = SYNONYMS.get(t, t)
        if t and t not in STOP:
            out.add(t)
    return frozenset(out)


def single_lang(row):
    if row.get('lang') == 'ar':
        return 'ar'
    return None if row.get('ar_title') else 'en'


def candidates(rows):
    en = [r for r in rows if single_lang(r) == 'en']
    ar = [r for r in rows if single_lang(r) == 'ar']
    out = []
    for a in ar:
        ta = tokens(a['slug'])
        best = None
        for e in en:
            # Section posts only pair inside their section.
            if a['slug'].split('/')[0] != e['slug'].split('/')[0] and ('/' in a['slug'] or '/' in e['slug']):
                continue
            te = tokens(e['slug'])
            if not ta or not te:
                continue
            j = len(ta & te) / len(ta | te)
            if j >= 0.6 and (best is None or j > best[0]):
                best = (j, e)
        if best:
            out.append((best[0], best[1], a))
    # One EN post can only twin one AR post: keep the best score per EN slug.
    seen = {}
    for j, e, a in sorted(out, key=lambda x: -x[0]):
        seen.setdefault(e['slug'], (j, e, a))
    return sorted(seen.values(), key=lambda x: -x[0])


def to_sql(pairs_file: Path) -> str:
    pairs = []
    for line in pairs_file.read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        en_slug, ar_slug = line.split('\t')[:2]
        pairs.append((en_slug.strip(), ar_slug.strip()))
    q = lambda s: "'" + s.replace("'", "''") + "'"
    values = ',\n  '.join(f'({q(a)}, {q(b)})' for e, a2 in pairs for a, b in ((e, a2), (a2, e)))
    return (
        'update blog_posts p set twin_slug = v.twin\n'
        f'from (values\n  {values}\n) as v(slug, twin)\n'
        'where p.slug = v.slug and p.deleted_at is null;'
    )


def main():
    if '--sql' in sys.argv:
        print(to_sql(Path(sys.argv[sys.argv.index('--sql') + 1])))
        return
    rows = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    with open(HERE / 'twins-candidates.tsv', 'w', encoding='utf-8') as f:
        f.write('score\ten_slug\tar_slug\ten_title\tar_title\n')
        for j, e, a in candidates(rows):
            f.write(f"{j:.2f}\t{e['slug']}\t{a['slug']}\t{e['title']}\t{a.get('ar_title') or a['title']}\n")
    print('wrote', HERE / 'twins-candidates.tsv')


if __name__ == '__main__':
    main()
