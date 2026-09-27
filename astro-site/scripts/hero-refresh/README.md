# Hero refresh codemod

Moves each page's inline `.hero-section` header, and the image banner under it,
into `src/components/PageHero.astro`.

- `images.json`: hero photo per page (Pexels, hotlinked). An `ar/...` entry only
  carries its Arabic alt; the photo comes from the EN twin.
- `skip-uncommitted.txt`: pages left alone on this branch because they had large
  uncommitted edits in the main checkout (mostly the AR rewrite) on 2026-09-27.

Once those edits are committed and merged, run the codemod on them:

```sh
python3 scripts/hero-refresh/codemod.py src/pages/ar/industries/*.astro   # or any list of pages
```

Pages that already use `<PageHero` are skipped, so it is safe to re-run.
Any AR page that picks up a photo from `images.json` needs an `ar/...` alt entry first,
otherwise it keeps its old alt text.
