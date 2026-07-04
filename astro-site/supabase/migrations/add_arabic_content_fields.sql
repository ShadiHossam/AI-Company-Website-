-- Adds Arabic fields across every content type that previously had none, so the
-- admin dashboard can manage true bilingual content instead of the Arabic site
-- carrying hand-written static copy that never reflects CMS edits.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ar_name text,
  ADD COLUMN IF NOT EXISTS ar_tagline text,
  ADD COLUMN IF NOT EXISTS ar_description text,
  ADD COLUMN IF NOT EXISTS ar_feature_tags jsonb,
  ADD COLUMN IF NOT EXISTS ar_features jsonb;

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS ar_quote text,
  ADD COLUMN IF NOT EXISTS ar_client_title text;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS ar_name text,
  ADD COLUMN IF NOT EXISTS ar_title text,
  ADD COLUMN IF NOT EXISTS ar_bio text;

ALTER TABLE case_studies
  ADD COLUMN IF NOT EXISTS ar_title text,
  ADD COLUMN IF NOT EXISTS ar_industry text,
  ADD COLUMN IF NOT EXISTS ar_delivery_time text,
  ADD COLUMN IF NOT EXISTS ar_challenge text,
  ADD COLUMN IF NOT EXISTS ar_solution text,
  ADD COLUMN IF NOT EXISTS ar_timeline_items jsonb,
  ADD COLUMN IF NOT EXISTS ar_results jsonb;

ALTER TABLE client_logos
  ADD COLUMN IF NOT EXISTS ar_industry text;

ALTER TABLE legal_pages
  ADD COLUMN IF NOT EXISTS ar_title text,
  ADD COLUMN IF NOT EXISTS ar_sections jsonb;

ALTER TABLE announcement_banner
  ADD COLUMN IF NOT EXISTS ar_message text,
  ADD COLUMN IF NOT EXISTS ar_cta_text text,
  ADD COLUMN IF NOT EXISTS ar_cta_url text;

ALTER TABLE page_seo
  ADD COLUMN IF NOT EXISTS ar_meta_title text,
  ADD COLUMN IF NOT EXISTS ar_meta_description text;
