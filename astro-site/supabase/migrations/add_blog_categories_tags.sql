-- Blog categories and tags system
-- Run in Supabase SQL Editor

-- ── BLOG CATEGORIES ──────────────────────────────────────────────────────────
CREATE TABLE blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed default categories from existing blog_posts.category values
INSERT INTO blog_categories (name, slug, sort_order) VALUES
  ('AI Automation',    'ai-automation',    1),
  ('AI Training',      'ai-training',      2),
  ('Case Studies',     'case-studies',     3),
  ('Industry Insights','industry-insights', 4),
  ('Product Updates',  'product-updates',  5)
ON CONFLICT (slug) DO NOTHING;

-- ── BLOG TAGS ─────────────────────────────────────────────────────────────────
CREATE TABLE blog_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── BLOG POST TAGS (junction) ──────────────────────────────────────────────────
CREATE TABLE blog_post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES blog_tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
