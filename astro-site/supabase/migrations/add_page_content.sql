-- Page Content — run this in Supabase Dashboard -> SQL Editor
-- Backs the admin "Content > Pages" hero/section text editor (src/lib/page-content.ts).
-- The table was referenced by admin/content/pages code since that feature shipped but
-- was never created, so every load/save in that editor 500'd and edits never persisted.

CREATE TABLE IF NOT EXISTS page_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug   TEXT NOT NULL,
  section_key TEXT NOT NULL,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_slug, section_key)
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_page_content"
  ON page_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
