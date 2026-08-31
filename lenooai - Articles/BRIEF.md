# Lenoo AI — article programme

## The company brief lives in one place

**`../pipeline/lenoo/COMPANY.md`** — who Lenoo AI is, their services, audience,
voice rules, UAE market context, verified statistics, and the marketing claims that
must never be cited as facts.

That file is not documentation *about* the pipeline; it is an *input to* it. The
runner reads it and hands it to the writer as `known_facts` on every batch, and
refuses to start if it is missing or under 500 characters. Edit it to change what
the writer knows. Do not copy its contents anywhere else — a second copy drifts, and
then nobody knows which one the articles were actually written from.

## How to run

```bash
cd ~/Desktop/shadi-fast-articles/pipeline/lenoo
P="/Users/alwaysimproving/Documents/Claude & VS/Saas Project/.venv/bin/python"

$P run_lenoo.py --dry-run --limit 2      # show the plan, start nothing
$P run_lenoo.py --target 10              # stop once 10 articles are on disk
caffeinate -dimsu $P run_lenoo.py        # the whole English blog plan, 892 rows
```

Requires the Saas Project app on `localhost:4000` and Postgres on 5432.

```bash
cd "/Users/alwaysimproving/Documents/Claude & VS/Saas Project"
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 4000 --reload
```

## Source plan

`../lenooai-content-plan.csv` — 1,228 rows.

| Cut | Count |
|---|---|
| English blog rows marked WRITE | 892 |
| Arabic rows | 227 |
| `/services` and `/industries` pages | 113 |
| Already live, do not rewrite | 56 |
| Exists partly, differentiate or merge | 17 |

The runner takes only `page_type = BLOG`, `action = WRITE`, `lang = en`, in plan
order. Landing pages and Arabic need their own briefs and their own run.

## Output

`lenooai/en/<url-tail>.md` — markdown with YAML frontmatter.

Files are named from the plan's **target URL**, not the keyword, so the tree mirrors
the site's routes. Frontmatter carries the plan's architecture — `cluster`, `level`,
`intent`, `batch`, `plan_order` — so the internal-linking pass can read it later.

`.hand-written-backup/` holds the first article as originally hand-written, kept for
comparison against its pipeline-generated replacement. Not part of the deliverable.

## Separation from the Shadi programme

The two share one pipeline and one Postgres `outputs` table, and nothing else.

| | Shadi | Lenoo |
|---|---|---|
| Plan | `seo-1500-keywords-and-ideas.csv` | `lenooai-content-plan.csv` |
| Runner | `pipeline/run_all.py` | `pipeline/lenoo/run_lenoo.py` |
| Save | `pipeline/save_fast_v2.py` | `pipeline/lenoo/save_lenoo.py` |
| Bundles | `pipeline/raw-bundles/` | `pipeline/lenoo/raw-bundles/` |
| Output | `articles/`, `batch 2`, `batch 3` | `lenooai/en/` |
| Filenames | from keyword | from plan target URL |
| Word ceiling | 1,850 | 3,200 |

**Five keywords appear in both plans** — `why ai projects fail`, `self host n8n uae`,
`n8n error handling`, `ai readiness assessment`, `build vs buy ai`. Without a guard,
a Lenoo article on one of those would be filed into the Shadi corpus by the next
`save_fast_v2.py --fetch`, stamped `locale: en-AE` under the wrong brand — the same
failure that imported 40 outsourcing articles on 2026-08-12.

The guard is an id watermark. `pipeline/lenoo/db-watermark.json` records
`outputs.id = 339`, the highest row that existed before Lenoo work began. A row is
refused only when it is **both** newer than the watermark **and** commissioned by the
Lenoo plan, so no legitimate Shadi row can ever be caught by it. Both scripts honour
it, in opposite directions.

## Internal links

The plan assigns every row a `link_up`, up to three `link_across`, and a
`link_down` list — passed to the writer verbatim in the item notes. Most targets are
not built yet; that is intentional, they resolve as the site fills in. Live-today
targets are listed in `LINK-STATUS.md`.
