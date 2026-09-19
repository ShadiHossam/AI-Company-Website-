# Internal linking and external citations

Brings every published article in `blog_posts` to at least five external
citations and five internal links, and keeps it there. Run it again after any
pipeline regeneration: the pass is idempotent, so a second run over its own
output changes nothing.

## What it does, in order

1. **Strips links to articles that were never written.** 162 slugs were linked
   342 times and none of them exist in `blog_posts`. The renderer was already
   rewriting them to `<span data-pending-page>`, so the anchor text stayed and
   the link equity was thrown away. The prose is kept, the dead href is dropped.
2. **Repoints citations whose page is gone.** Only URLs that genuinely 404.
   A domain that merely blocks bots is left alone: `mckinsey.com` returns 000
   for its own root, and SOURCE-POLICY allows a source a browser can reach.
3. **Links named entities the copy already contains.** Where an article says
   "PDPL", "TDRA", "ADGM" or "Do Not Call Registry", that phrase becomes the
   anchor. The source genuinely covers the claim, and because the anchor is
   whatever wording the article already used, anchor text varies by itself.
4. **Adds a source-backed sentence** for whatever is still short, drawn from the
   cluster's pool in `config.mjs`. Each sentence is written from its source, so
   the citation supports it. Sentences are spread across sections, never
   dropped into Key Takeaways or the FAQ.
5. **Tops up internal links** to five: cluster hub, two cluster siblings with
   orphans weighted first, the cluster's commercial page, then `/blog/uae-pdpl`
   as the cross-cluster bridge. Targets are checked against published slugs and
   against the real Astro routes in `routes.txt`, per language.

## Files

| | |
|---|---|
| `sources.mjs` | 34 sources, each with an English and Arabic URL and a sentence written from it. Every URL verified live 2026-09-09. |
| `config.mjs` | entity matchers per language, and per-cluster hub, commercial page and source pool |
| `engine.mjs` | the transforms, and the protected ranges they must not edit inside |
| `driver.mjs` | plans every body and writes `updates.json` + `report.json`. Reads nothing but the backup, writes nothing to the database. |
| `validate.mjs` | checks structure, that no prose was lost, that every target resolves, and that both targets are met |
| `apply.mjs` | the only script that writes to Supabase |

## Running it

```bash
node backup.mjs      # snapshot every published row first
node driver.mjs      # plan the changes, writes updates.json
node validate.mjs    # must print "all checks passed"
node apply.mjs       # writes to Supabase
node audit2.mjs      # confirm against the live database
```

`routes.txt` is the list of real Astro pages, used to reject an internal link
to a page that does not exist. Regenerate it when routes change:

```bash
cd ../../astro-site
find src/pages -name "*.astro" ! -name "[[]*" \
  | sed 's|^src/pages||; s|/index\.astro$||; s|\.astro$||; s|^$|/|' \
  | sort -u > ../scripts/link-citations/routes.txt
```

## Two things to know

`blog_posts` has no `lang` column. A row is English when its `title` is not
Arabic script, and Arabic when it has an `ar_title`; 198 rows are Arabic-only
and their English columns hold an unused Arabic copy, which this pass does not
touch. See `astro-site/src/lib/post-lang.ts`.

The `t_blog` trigger overwrites `updated_at` on every UPDATE, and
`post-sitemap.xml` uses it as `lastmod`. A full run therefore restamps every
article with the run date.
