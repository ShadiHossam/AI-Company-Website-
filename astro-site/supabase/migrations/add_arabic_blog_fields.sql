-- Arabic translation fields for blog posts
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS ar_title TEXT,
  ADD COLUMN IF NOT EXISTS ar_description TEXT,
  ADD COLUMN IF NOT EXISTS ar_body_markdown TEXT,
  ADD COLUMN IF NOT EXISTS ar_meta_title TEXT,
  ADD COLUMN IF NOT EXISTS ar_meta_description TEXT;
