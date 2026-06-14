-- Blog Post Versions — run this in Supabase Dashboard → SQL Editor
-- Creates version snapshots captured on every explicit "Save Changes" / Publish / Archive

CREATE TABLE IF NOT EXISTS blog_post_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  version_num      INT NOT NULL,
  saved_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  body_markdown    TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT '',
  og_image         TEXT,
  status           TEXT NOT NULL DEFAULT 'draft',
  pub_date         DATE,
  author_name      TEXT,
  meta_title       TEXT,
  meta_description TEXT
);

ALTER TABLE blog_post_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_blog_ver"
  ON blog_post_versions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
