-- Soft-delete support: recycle bin ("Trash") for the entity types editors delete most often.
-- Existing DELETE endpoints now set deleted_at instead of removing the row; a new
-- /admin/trash view lets editors restore or permanently purge them.
-- Run in Supabase SQL Editor

ALTER TABLE blog_posts    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE leads         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE jobs          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE case_studies  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE client_logos  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE team_members  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE testimonials  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE products      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at   ON blog_posts (deleted_at);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at        ON leads (deleted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_deleted_at         ON jobs (deleted_at);
CREATE INDEX IF NOT EXISTS idx_case_studies_deleted_at ON case_studies (deleted_at);
CREATE INDEX IF NOT EXISTS idx_client_logos_deleted_at ON client_logos (deleted_at);
CREATE INDEX IF NOT EXISTS idx_team_members_deleted_at ON team_members (deleted_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_deleted_at ON testimonials (deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at     ON products (deleted_at);
