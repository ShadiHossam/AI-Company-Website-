#!/usr/bin/env python3
"""Build blog_posts rows for the 91 Abu Dhabi articles: 13 a day, 2026-11-03 to 2026-11-09.

Rows are status='published' with a future pub_date, so each goes live by itself at
midnight Dubai (astro-site/src/lib/scheduledPosts.ts). EN + AR pairs share one row.
Reads picks.json from fetch.py. Writes rows.json. The source articles are not modified.
"""
import datetime, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, HERE, articles, parse, sections

PUBLIC = 'https://kdqyerzpvvhykagqymbb.supabase.co/storage/v1/object/public/blog-images'
START = datetime.date(2026, 11, 3)
PER_DAY = 13
# Section pillars go first so the hubs open with the general articles.
FIRST = ['ai-chatbot', 'ai-solutions', 'arabic-chatbot', 'whatsapp-automation', 'chatbot-company']
EN_CATEGORY = 'Emirates, Cities & Free Zones'
AR_CATEGORY = 'الأسواق الخليجية'

REPLACE = [
    ('Leave it in the comments — we answer them. Or [book', '[Book'),
    ('اتركه في التعليقات وسنرد عليك، أو [احجز', '[احجز'),  # the blog has no comments
    (', and if your setup has a wrinkle we did not cover here, leave it in the comments and we will answer.', '.'),
    ("Tell us in the comments what your dealership's chat volume looks like, or [book", '[Book'),
    (' And if your intake looks different to what is described here, say so in the comments.', ''),
    ("If your enquiries pile up somewhere specific, say so in the comments and we'll tell you whether a bot belongs there.", ''),
    ('Leave it in the comments, or [book', '[Book'),
    (' And if one channel breaks parity more often than the rest in your business, say which in the comments.', ''),
    (', and if you are already running QA on Arabic conversations, tell us in the comments which error category surprised you most.', '.'),
    (", then tell us in the comments which sector you're automating and where your Arabic is breaking.", '.'),
    ('Tell us in the comments which channel your enquiries actually arrive on, and if you want the structure mapped properly, [scope', 'If you want the structure mapped properly, [scope'),
    (' أو تكتب لنا سؤالك بالتعليقات.', '.'),
    ('اكتب لنا في التعليقات شنو الجهة اللي تبي تربط معاها، أو احجز', 'احجز'),
    ('اكتب لنا في التعليقات، أو [احجز', '[احجز'),
    ('، وإذا عندك سؤال عن حالة معرضك بالتحديد، اكتبه في التعليقات.', '.'),
    ('إذا عندك سؤال خاص بحالة عيادتك، اكتبه بالتعليقات، أو [رتّب', '[رتّب'),
    ('، ولو عندك تجربة سابقة مع روبوت في معرض، اكتبها لنا في التعليقات.', '.'),
    ('اكتبه في التعليقات، أو [احجز', '[احجز'),
    ('اكتب سؤالك في التعليقات، أو [احجز', '[احجز'),
    ('اكتب سؤالك بالتعليقات، ولو تبا', 'لو تبا'),
    ('اكتبه في التعليقات، أو احجز', 'احجز'),
    ('، وإذا عندك سؤال محدد يخص قطاعك، اكتبه بالتعليقات وناخذه وياك.', '.'),
    ('اكتبها بالتعليقات، أو احجز', 'احجز'),
    ('a comprehensive federal regime', 'a broad federal regime'),
    ('higher tiers unlocking more numbers', 'higher tiers adding more numbers'),
]

def h1(rel):
    raw = open(os.path.join(ROOT, rel), encoding='utf-8').read()
    return re.search(r'^# (.+)$', raw, re.M).group(1).strip()

# The blog has no comment section, so reader invitations to use one must go.
COMMENT = re.compile(r'in the comments?|بالتعليقات|في التعليقات|بالتعليق|في التعليق', re.I)
INVITE = re.compile(r'leave|tell us|welcome|drop|share|ask|post|write|let us|اكتب|اترك|شاركنا|شارك|خبرنا|قولنا|علّق|علق', re.I)
LINK_CLAUSE = re.compile(r'(?:,|،)?\s*(?:and |or |و|أو |ولو |وإذا |وإن )[^,،.]*(?:' + COMMENT.pattern + r')[^.]*', re.I)
review = []

def drop_comment_invites(body):
    out = []
    for line in body.split('\n'):
        if not COMMENT.search(line) or line.startswith('|'):
            out.append(line); continue
        keep = []
        for sent in re.split(r'(?<=[.!?؟])\s+', line):
            if not COMMENT.search(sent):
                keep.append(sent)
            elif not INVITE.search(sent):
                keep.append(sent); review.append(sent)
            elif '](' not in sent:
                pass
            else:
                short = LINK_CLAUSE.sub('', sent).rstrip()
                if COMMENT.search(short) or '](' not in short:
                    keep.append(sent); review.append(sent)
                else:
                    keep.append(short if short[-1] in '.!؟)' else short + '.')
        if ' '.join(keep).strip() or not line.strip():
            out.append(' '.join(keep))
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out))

def clean(body):
    for a, b in REPLACE:
        body = body.replace(a, b)
    body = drop_comment_invites(body)
    body = re.sub(r'\]\((/[^)\s#?]+?)/\)', r'](\1)', body)
    return re.sub(r'\]\(https://lenooai\.com(/[^)\s#?]*?)/\)', r'](https://lenooai.com\1)', body)

def url(short, slot):
    return f'{PUBLIC}/abu-dhabi/{short}/{short}-{slot}.webp'

def attr(s):
    return s.replace('"', "'").replace('[', '').replace(']', '').replace('\n', ' ').strip()

def insert_image(body, heading, block):
    m = re.search(r'^## ' + re.escape(heading) + r'[ \t]*$', body, re.M)
    rest = body[m.end():]
    nxt = re.search(r'^#{1,2} ', rest, re.M)
    section = rest[:nxt.start()] if nxt else rest
    for pm in re.finditer(r'(?:^|\n\n)([^\n].*?)(?=\n\n|\Z)', section, re.S):
        para = pm.group(1).strip()
        if para and not re.match(r'^([-*+|>#<]|\d+\.|!\[)', para):
            pos = m.end() + pm.end()
            return body[:pos] + '\n\n' + block + body[pos:]
    return body[:m.end()] + '\n\n' + block + '\n' + body[m.end():]

def photo_alt(pick, fallback):
    """The provider's description for Pexels. Pixabay only has tags, so use the article context."""
    text = (pick.get('text') or '').strip().rstrip('.')
    return attr(text) if pick['src'] == 'pexels' and len(text) > 15 else attr(fallback)

def with_images(lang, body, short, picks):
    body = clean(body)
    for slot, heading in zip(('inline-1', 'inline-2'), sections(body)):
        alt = heading if lang == 'ar' else photo_alt(picks[slot], heading)
        body = insert_image(body, heading, f'![{attr(alt)}]({url(short, slot)} "{attr(heading)}")')
    return body

def main():
    picks = json.load(open(os.path.join(HERE, 'picks.json')))
    plan = {p['slug']: p for p in json.load(open(os.path.join(ROOT, '.check', 'slug-plan.json')))}
    items = articles()
    items.sort(key=lambda a: FIRST.index(a['short']) if a['short'] in FIRST else len(FIRST))
    rows = []
    for i, a in enumerate(items):
        short, pk = a['short'], picks[a['short']]
        assert len(pk) == 3, short
        day = START + datetime.timedelta(days=i // PER_DAY)
        en, ar = a.get('en'), a.get('ar')
        main_lang = 'en' if en else 'ar'
        src = en or ar
        fm = src['fm']
        title = h1(plan[short]['files'][main_lang])
        r = {
            'slug': a['slug'],
            'title': title,
            'description': fm['meta']['meta_description'],
            'body_markdown': with_images(main_lang, src['body'], short, pk),
            'category': EN_CATEGORY if en else AR_CATEGORY,
            'og_image': url(short, 'feature'),
            'og_image_alt': attr(title) if not en else photo_alt(pk['feature'], title),
            'og_image_title': attr(title),
            'status': 'published',
            'pub_date': day.isoformat(),
            'author_name': 'Shadi Hossam',
            'meta_title': fm['meta']['meta_title'],
            'meta_description': fm['meta']['meta_description'],
            'focus_keyword': fm['primary_keyword'],
            'lang': main_lang,
            'noindex': False,
        }
        if ar:
            r.update({
                'ar_title': h1(plan[short]['files']['ar']),
                'ar_description': ar['fm']['meta']['meta_description'],
                'ar_body_markdown': with_images('ar', ar['body'], short, pk),
                'ar_meta_title': ar['fm']['meta']['meta_title'],
                'ar_meta_description': ar['fm']['meta']['meta_description'],
            })
        rows.append(r)
    for r in rows:
        for k in ('body_markdown', 'ar_body_markdown'):
            assert '—' not in r.get(k, ''), (r['slug'], k)
            if k in r:
                assert r[k].count('.webp') == 2, (r['slug'], k)
    json.dump(rows, open(os.path.join(HERE, 'rows.json'), 'w'), ensure_ascii=False)
    days = {}
    for r in rows: days[r['pub_date']] = days.get(r['pub_date'], 0) + 1
    print(len(rows), days)
    print('REVIEW', len(review))
    for t in review: print(' -', t[:260])

main()
