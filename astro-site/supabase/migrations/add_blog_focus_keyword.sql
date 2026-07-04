-- The blog admin UI/API (new.astro, [id].astro, duplicate.ts) have referenced
-- focus_keyword since the SEO panel was added, but the column was never
-- created — every blog post create/update was failing with a PostgREST
-- schema-cache error ("Could not find the 'focus_keyword' column").
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS focus_keyword text;
