-- Blog authors: reusable author profiles (name, bio, avatar) for blog posts
-- Run in Supabase SQL Editor

CREATE TABLE blog_authors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  bio         TEXT,
  email       TEXT,
  avatar_url  TEXT,
  website     TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed the default author already referenced by existing blog_posts.author_name
INSERT INTO blog_authors (name, slug) VALUES ('Lenoo AI', 'lenoo-ai')
ON CONFLICT (slug) DO NOTHING;
