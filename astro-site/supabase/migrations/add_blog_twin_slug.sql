-- Links two independently written articles on the same topic as language
-- versions of each other. EN and AR posts are authored separately with their
-- own slugs, so the shared-slug pairing (lang='en' + ar_title) only covers a
-- few rows. On an English-only row, twin_slug is the slug of its Arabic-only
-- twin, and the reverse on that row. The site only uses reciprocal, live,
-- indexable pairs (src/lib/postTwins.ts).
alter table blog_posts add column if not exists twin_slug text;
