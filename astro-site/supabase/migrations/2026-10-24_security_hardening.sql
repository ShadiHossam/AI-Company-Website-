-- Security hardening, 2026-10-24.
--
-- The app reads and writes every table through the service role (which bypasses
-- RLS). The anon key is only used for auth sign-in and CV uploads, and no code
-- queries tables as a signed-in user. So:
--   1. Turn RLS on for the five tables created without it. Until now anon could
--      INSERT/UPDATE/DELETE them with the public key shipped to every browser.
--   2. Drop every "authenticated USING (true)" policy. Any signed-in Supabase
--      user (any admin role, or anyone if sign-ups were on) could otherwise read
--      every lead and application and rewrite config, bypassing the app's
--      per-section role checks by calling the REST API directly.
--   3. Drop anon read of site_config (it exposed admin notify contacts, the role
--      map and maintenance IPs). /api/config/public serves the public keys.
-- The remaining anon SELECT policies only expose published content and are kept.

BEGIN;

-- 1. RLS on, no policies: only the service role can touch these.
ALTER TABLE blog_authors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets        ENABLE ROW LEVEL SECURITY;

-- 2. Signed-in users get nothing directly.
DROP POLICY IF EXISTS "admin_actlog"       ON activity_log;
DROP POLICY IF EXISTS "admin_banner"       ON announcement_banner;
DROP POLICY IF EXISTS "admin_blog_ver"     ON blog_post_versions;
DROP POLICY IF EXISTS "admin_blog"         ON blog_posts;
DROP POLICY IF EXISTS "admin_cases"        ON case_studies;
DROP POLICY IF EXISTS "admin_logos"        ON client_logos;
DROP POLICY IF EXISTS "admin_faq"          ON faq_items;
DROP POLICY IF EXISTS "admin_apps"         ON job_applications;
DROP POLICY IF EXISTS "admin_jobs"         ON jobs;
DROP POLICY IF EXISTS "admin_leads"        ON leads;
DROP POLICY IF EXISTS "admin_legal"        ON legal_pages;
DROP POLICY IF EXISTS "admin_media"        ON media;
DROP POLICY IF EXISTS "admin_notif"        ON notifications;
DROP POLICY IF EXISTS "admin_page_content" ON page_content;
DROP POLICY IF EXISTS "admin_seo"          ON page_seo;
DROP POLICY IF EXISTS "admin_products"     ON products;
DROP POLICY IF EXISTS "admin_redir"        ON redirects;
DROP POLICY IF EXISTS "admin_config"       ON site_config;
DROP POLICY IF EXISTS "admin_team"         ON team_members;
DROP POLICY IF EXISTS "admin_testi"        ON testimonials;

-- 3. Config is server-only.
DROP POLICY IF EXISTS "public_config" ON site_config;

-- Pin the trigger function's search_path.
ALTER FUNCTION update_updated_at() SET search_path = '';

-- 4. Storage. Neither bucket existed, so careers CV uploads and the admin media
--    uploader (src/pages/api/admin/media/upload.ts) both failed.
--    cvs: PRIVATE. Uploads only via signed URLs from /api/cv-upload; admins read
--    via /api/admin/applications/[id]/cv. No storage policies are added, so
--    anon/authenticated can neither list, read nor write it directly.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', false, 5242880, ARRAY[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])
ON CONFLICT (id) DO UPDATE SET public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

--    media: public read (images on the site), written only by the service role.
--    SVG is excluded (it can carry script).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 10485760, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'
])
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Verify (expect: every table rls = true, and only anon SELECT / service_role
-- policies left):
--   select relname, relrowsecurity from pg_class c join pg_namespace n
--     on n.oid = c.relnamespace where nspname = 'public' and relkind = 'r';
--   select tablename, policyname, roles, cmd from pg_policies where schemaname = 'public';
