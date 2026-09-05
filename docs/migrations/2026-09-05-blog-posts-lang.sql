-- Makes a blog post's language explicit instead of inferred.
--
-- Background: blog_posts has English columns (title, body_markdown) and Arabic
-- columns (ar_title, ar_body_markdown) but nothing recording which language a
-- post was written in. 198 of 398 published posts had the same Arabic article
-- written into both sets, which published each one at two URLs.
--
-- The site already handles this correctly without the column:
-- src/lib/post-lang.ts classifies a post by the script of its English-column
-- title, and /blog/<slug> 301s to /ar/blog/<slug> for Arabic ones. This
-- migration only replaces that inference with a stored value. isArabicOnlyPost()
-- already prefers the column when it exists, so no code change is needed.

alter table blog_posts
  add column if not exists lang text not null default 'en';

-- Backfill: any post whose English-column title is Arabic script is Arabic-only.
-- Verified 2026-09-05 to match exactly 198 of the 398 published rows.
update blog_posts
   set lang = 'ar'
 where title ~ '[؀-ۿ]'
   and lang <> 'ar';

alter table blog_posts
  add constraint blog_posts_lang_check check (lang in ('en', 'ar'));

-- Confirm the split before and after:
--   select lang, count(*) from blog_posts
--    where status = 'published' and deleted_at is null group by lang;
-- Expected: ar = 198, en = 200
