-- ============================================================
-- Lenoo AI Admin Dashboard — Full Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- ── updated_at trigger (create once, reuse everywhere) ───────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── LEADS ────────────────────────────────────────────────────
CREATE TABLE leads (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Step 1: About You
  full_name          TEXT NOT NULL,
  company_name       TEXT NOT NULL,
  work_email         TEXT NOT NULL,
  whatsapp           TEXT NOT NULL,
  job_title          TEXT,
  -- Step 2: Your Business
  industry           TEXT,
  company_size       TEXT,
  main_challenge     TEXT,
  budget_range       TEXT,
  ai_experience      TEXT,
  -- Step 3: Schedule
  meeting_format     TEXT,
  preferred_date     DATE,
  preferred_time     TEXT,
  notes              TEXT,
  -- Source tracking
  source             TEXT DEFAULT 'contact_form',
  page_source        TEXT,
  utm_source         TEXT,
  utm_medium         TEXT,
  utm_campaign       TEXT,
  ip_address         TEXT,
  -- Flags
  duplicate_email    BOOLEAN DEFAULT false,
  auto_reply_sent    BOOLEAN DEFAULT false,
  -- CRM
  status             TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new','contacted','qualified','proposal_sent','closed_won','closed_lost')),
  assigned_to        TEXT,
  internal_notes     TEXT,
  next_action        TEXT,
  next_action_date   DATE,
  estimated_value_aed INT,
  tags               TEXT[]
);
CREATE TRIGGER t_leads BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── REDIRECTS ────────────────────────────────────────────────
CREATE TABLE redirects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path    TEXT NOT NULL UNIQUE,
  to_path      TEXT NOT NULL,
  status_code  INT DEFAULT 301,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── CASE STUDIES ─────────────────────────────────────────────
CREATE TABLE case_studies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  industry       TEXT NOT NULL,
  title          TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  delivery_time  TEXT,
  challenge      TEXT,
  solution       TEXT,
  timeline_items  JSONB DEFAULT '[]',
  results         JSONB DEFAULT '[]',
  media_sections  JSONB DEFAULT '[]',
  featured        BOOLEAN DEFAULT false,
  published       BOOLEAN DEFAULT false,
  sort_order      INT DEFAULT 0
);
CREATE TRIGGER t_cases BEFORE UPDATE ON case_studies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TEAM MEMBERS ─────────────────────────────────────────────
CREATE TABLE team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  title      TEXT NOT NULL,
  bio        TEXT,
  image_url  TEXT,
  sort_order INT DEFAULT 0,
  active     BOOLEAN DEFAULT true
);

-- ── TESTIMONIALS ─────────────────────────────────────────────
CREATE TABLE testimonials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name       TEXT NOT NULL,
  client_title      TEXT,
  client_company    TEXT,
  client_image_url  TEXT,
  quote             TEXT NOT NULL,
  industry          TEXT,
  published         BOOLEAN DEFAULT false,
  featured          BOOLEAN DEFAULT false,
  sort_order        INT DEFAULT 0
);

-- ── CLIENT LOGOS ─────────────────────────────────────────────
CREATE TABLE client_logos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name      TEXT NOT NULL,
  logo_url          TEXT NOT NULL,
  website_url       TEXT,
  industry          TEXT,
  show_on_homepage  BOOLEAN DEFAULT false,
  active            BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0
);

-- ── FAQ ITEMS ────────────────────────────────────────────────
-- section values: getting_started | guarantee | technical |
--   custom_ai | strategy | training |
--   real_estate | retail | hospitality | logistics
CREATE TABLE faq_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  section     TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  published   BOOLEAN DEFAULT true
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  tagline       TEXT,
  description   TEXT NOT NULL,
  status_badge  TEXT DEFAULT 'Available Now',
  feature_tags  JSONB DEFAULT '[]',
  features      JSONB DEFAULT '[]',
  sort_order    INT DEFAULT 0,
  published     BOOLEAN DEFAULT true
);

-- ── BLOG POSTS ───────────────────────────────────────────────
CREATE TABLE blog_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL,
  body_markdown    TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL,
  og_image         TEXT DEFAULT '/assets/og-blog.jpg',
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','published','archived')),
  pub_date         DATE,
  author_name      TEXT DEFAULT 'Lenoo AI',
  meta_title       TEXT,
  meta_description TEXT,
  focus_keyword    TEXT,
  ar_title         TEXT,
  ar_description   TEXT,
  ar_body_markdown TEXT,
  ar_meta_title    TEXT,
  ar_meta_description TEXT
);
CREATE TRIGGER t_blog BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── BLOG POST VERSIONS ───────────────────────────────────────
CREATE TABLE blog_post_versions (
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

-- ── SITE CONFIG ──────────────────────────────────────────────
CREATE TABLE site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'string'
             CHECK (type IN ('string','json','boolean','number')),
  label      TEXT,
  section    TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER t_config BEFORE UPDATE ON site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ANNOUNCEMENT BANNER ──────────────────────────────────────
CREATE TABLE announcement_banner (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  cta_text    TEXT,
  cta_url     TEXT,
  bg_color    TEXT DEFAULT '#00e3fd',
  text_color  TEXT DEFAULT '#0a0f1a',
  active      BOOLEAN DEFAULT false,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ
);

-- ── MEDIA LIBRARY ────────────────────────────────────────────
CREATE TABLE media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_at  TIMESTAMPTZ DEFAULT now(),
  filename     TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url   TEXT NOT NULL,
  file_size    INT,
  width        INT,
  height       INT,
  alt_text     TEXT,
  tags         TEXT[]
);

-- ── PAGE SEO OVERRIDES ───────────────────────────────────────
CREATE TABLE page_seo (
  page_slug        TEXT PRIMARY KEY,
  meta_title       TEXT,
  meta_description TEXT,
  og_image_url     TEXT,
  noindex          BOOLEAN DEFAULT false,
  updated_at       TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER t_seo BEFORE UPDATE ON page_seo FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── LEGAL PAGES ──────────────────────────────────────────────
CREATE TABLE legal_pages (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  last_updated DATE NOT NULL,
  sections     JSONB NOT NULL DEFAULT '[]',
  updated_at   TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER t_legal BEFORE UPDATE ON legal_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  related_id  UUID
);

-- ── ACTIVITY LOG ─────────────────────────────────────────────
CREATE TABLE activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ DEFAULT now(),
  admin_email  TEXT NOT NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    TEXT,
  before_value JSONB,
  after_value  JSONB
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_logos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_banner ENABLE ROW LEVEL SECURITY;
ALTER TABLE media               ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo            ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log        ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins): full access to everything
CREATE POLICY "admin_leads"    ON leads               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_redir"    ON redirects           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_cases"    ON case_studies        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_team"     ON team_members        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_testi"    ON testimonials        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_logos"    ON client_logos        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_faq"      ON faq_items           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_products" ON products            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_blog"     ON blog_posts          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_blog_ver" ON blog_post_versions  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_config"   ON site_config         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_banner"   ON announcement_banner FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_media"    ON media               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_seo"      ON page_seo            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_legal"    ON legal_pages         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_notif"    ON notifications       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_actlog"   ON activity_log        FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role: INSERT leads (bypasses RLS for public form submissions)
CREATE POLICY "service_insert_leads" ON leads FOR INSERT TO service_role WITH CHECK (true);

-- Anonymous (public): read published/active content
CREATE POLICY "public_blog"     ON blog_posts    FOR SELECT TO anon USING (status = 'published' AND pub_date <= CURRENT_DATE);
CREATE POLICY "public_cases"    ON case_studies  FOR SELECT TO anon USING (published = true);
CREATE POLICY "public_faq"      ON faq_items     FOR SELECT TO anon USING (published = true);
CREATE POLICY "public_team"     ON team_members  FOR SELECT TO anon USING (active = true);
CREATE POLICY "public_config"   ON site_config   FOR SELECT TO anon USING (true);
CREATE POLICY "public_products" ON products      FOR SELECT TO anon USING (published = true);
CREATE POLICY "public_banner"   ON announcement_banner FOR SELECT TO anon USING (true);
CREATE POLICY "public_media"    ON media         FOR SELECT TO anon USING (true);
CREATE POLICY "public_legal"    ON legal_pages   FOR SELECT TO anon USING (true);
CREATE POLICY "public_testi"    ON testimonials  FOR SELECT TO anon USING (published = true);
CREATE POLICY "public_logos"    ON client_logos  FOR SELECT TO anon USING (active = true);

-- ============================================================
-- SEED: site_config
-- ============================================================

INSERT INTO site_config (key, value, type, label, section) VALUES
  -- Company
  ('company.name',      'Lenoo AI',                                   'string', 'Company Name',        'company'),
  ('company.phone',     '+971 4 321 8888',                            'string', 'Phone',               'company'),
  ('company.email',     'hello@lenooai.com',                           'string', 'Email',               'company'),
  ('company.whatsapp',  '971501234567',                               'string', 'WhatsApp Number',     'company'),
  ('company.linkedin',  'lenoo-ai-dubai',                             'string', 'LinkedIn Slug',       'company'),
  ('company.address',   'Dubai, UAE',                                 'string', 'Office Address',      'company'),
  ('company.hours',     'Sun – Thu · 9:00 am – 6:00 pm GST',         'string', 'Business Hours',      'company'),

  -- Homepage
  ('homepage.hero_eyebrow',   'The only Dubai AI partner with a 100% refund guarantee', 'string', 'Hero Eyebrow', 'homepage'),
  ('homepage.hero_h1',        'Custom AI Systems + Team Training, in One Package.',     'string', 'Hero H1',      'homepage'),
  ('homepage.hero_subheading','We build AI that fits your workflows and train your people to use it — for Dubai SMEs in real estate, retail, hospitality, and logistics.', 'string', 'Hero Subheading', 'homepage'),
  ('homepage.cta_text',       'Book Free Strategy Call',                                'string', 'CTA Button',   'homepage'),
  ('homepage.stats_bar',      '[{"value":"100%","label":"Refund Guarantee"},{"value":"AR/EN","label":"Bilingual"},{"value":"90-Day","label":"Support Included"}]', 'json', 'Stats Bar', 'homepage'),
  ('homepage.trust_strip',    '["Zero Cost If You''re Not Happy","Dubai-Based Team","Arabic & English Support","90-Day Post-Launch Support"]', 'json', 'Trust Strip', 'homepage'),
  ('homepage.technology_partners', '["OpenAI","Microsoft Azure","Make.com","n8n","WhatsApp Business API"]', 'json', 'Technology Partners', 'homepage'),
  ('homepage.aggregate_metrics',   '[{"value":"3.2h","label":"Avg. admin time saved per day"},{"value":"4.1×","label":"Average ROI within 12 months"},{"value":"9 wks","label":"Average implementation time"},{"value":"100%","label":"Clients who would recommend us"}]', 'json', 'Aggregate Metrics', 'homepage'),

  -- Pricing
  ('pricing.headline',    'Every Project is Scoped Specifically for You.',       'string', 'Headline',    'pricing'),
  ('pricing.subheading',  'We don''t believe in one-size-fits-all pricing. Your business, workflow complexity, and goals are unique — so your quote will be too.', 'string', 'Subheading', 'pricing'),
  ('pricing.cta_text',    'Book Free Discovery Call',                            'string', 'CTA Text',    'pricing'),
  ('pricing.factors',     '[{"title":"Complexity of the workflow","description":"More complex automations = more build time = higher cost."},{"title":"Data readiness","description":"Clean, structured data = faster build. Messy data = data prep work first."},{"title":"Number of integrations","description":"Each system integration (CRM, POS, ERP, WhatsApp) adds scope."},{"title":"Team size and training scope","description":"More employees to train = more workshop time and materials."},{"title":"Timeline requirements","description":"Faster timelines sometimes require additional team capacity."}]', 'json', 'Pricing Factors', 'pricing'),

  -- About
  ('about.hero_h1',        'We Believe Every Business Deserves AI That Actually Works.',  'string', 'Hero H1',      'about'),
  ('about.hero_subheading','Not just enterprise giants. Not just tech companies. Every business in Dubai should be able to use AI to grow faster, waste less, and work smarter.', 'string', 'Hero Subheading', 'about'),
  ('about.mission_stats',  '[{"value":"94%","label":"of UAE businesses are SMEs — most AI companies ignore them"},{"value":"84%","label":"of UAE AI projects fail due to skill gaps, not technology"},{"value":"2031","label":"UAE National AI Strategy target — AI is a national priority"}]', 'json', 'Mission Stats', 'about'),
  ('about.story_headline', 'Built After Watching AI Projects Fail',              'string', 'Story Headline', 'about'),

  -- Services
  ('services.guarantee_headline', 'All Three Services Are Covered by Our 100% Guarantee', 'string', 'Guarantee Headline', 'services'),
  ('services.guarantee_body',     'If you''re not completely satisfied with what we deliver — you pay absolutely nothing. No conditions. No disputes. Just a full refund.', 'string', 'Guarantee Body', 'services'),

  -- Integrations: Scheduling & CRM
  ('integration.calendly_url',           '',  'string', 'Calendly URL',              'integrations'),
  ('integration.mailchimp_url',          '',  'string', 'Mailchimp Audience POST URL','integrations'),
  ('integration.hubspot_portal_id',      '',  'string', 'HubSpot Portal ID',         'integrations'),

  -- Integrations: Analytics
  ('integration.ga_measurement_id',      '',  'string', 'GA4 Measurement ID',        'integrations'),
  ('integration.gtm_container_id',       '',  'string', 'Google Tag Manager ID',     'integrations'),
  ('integration.clarity_project_id',     '',  'string', 'Microsoft Clarity ID',      'integrations'),
  ('integration.hotjar_site_id',         '',  'string', 'Hotjar Site ID',            'integrations'),

  -- Integrations: Advertising & Pixels
  ('integration.meta_pixel_id',          '',  'string', 'Meta Pixel ID',             'integrations'),
  ('integration.linkedin_insight_id',    '',  'string', 'LinkedIn Insight Tag ID',   'integrations'),
  ('integration.google_ads_id',          '',  'string', 'Google Ads Conversion ID',  'integrations'),
  ('integration.tiktok_pixel_id',        '',  'string', 'TikTok Pixel ID',           'integrations'),

  -- Integrations: Live Chat
  ('integration.intercom_app_id',        '',  'string', 'Intercom App ID',           'integrations'),
  ('integration.crisp_website_id',       '',  'string', 'Crisp Website ID',          'integrations'),
  ('integration.tawkto_property_id',     '',  'string', 'Tawk.to Property/Widget ID','integrations'),

  -- Integrations: Notifications
  ('integration.admin_notify_email',     '',  'string', 'Admin Notification Email',  'integrations'),
  ('integration.whatsapp_notify_number', '',  'string', 'WhatsApp Notify Number',    'integrations'),

  -- System
  ('system.maintenance_mode',       'false',                               'boolean', 'Maintenance Mode',       'system'),
  ('system.maintenance_message',    'We''ll be back shortly. Thank you for your patience.', 'string', 'Maintenance Message', 'system'),
  ('system.maintenance_allowed_ips','',                                    'string',  'Allowed IPs (comma-separated)', 'system'),
  ('system.cookie_consent_text',    'We use cookies and similar technologies to improve your experience on our site. By continuing to browse, you agree to our use of cookies.', 'string', 'Cookie Consent Text', 'system')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ADMIN ROLES (custom RBAC)
-- ============================================================

CREATE TABLE admin_roles (
  name        TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  sections    TEXT[] NOT NULL DEFAULT '{}',
  is_builtin  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_roles_rw" ON admin_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Built-in roles (mirror current hardcoded middleware permissions)
INSERT INTO admin_roles (name, label, sections, is_builtin) VALUES
  ('editor', 'Editor', '{content,blog,media,seo,notifications,dashboard}', true),
  ('sales',  'Sales',  '{leads,notifications,dashboard}', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- CAREERS: JOBS & APPLICATIONS
-- ============================================================

CREATE TABLE jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  department   TEXT,
  location     TEXT NOT NULL DEFAULT 'Dubai, UAE',
  job_type     TEXT NOT NULL DEFAULT 'Full-time',
  description  TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]',
  nice_to_have JSONB NOT NULL DEFAULT '[]',
  benefits     JSONB NOT NULL DEFAULT '[]',
  salary_range TEXT,
  published    BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0
);
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_title     TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  linkedin_url  TEXT,
  portfolio_url TEXT,
  cv_url        TEXT NOT NULL,
  cover_letter  TEXT NOT NULL,
  how_heard     TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','reviewing','shortlisted','rejected','hired'))
);

ALTER TABLE jobs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_jobs" ON jobs             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_apps" ON job_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role: insert applications (public form)
CREATE POLICY "service_insert_jobs" ON jobs             FOR SELECT TO service_role USING (true);
CREATE POLICY "service_insert_apps" ON job_applications FOR INSERT TO service_role WITH CHECK (true);

-- Anonymous: read published jobs only
CREATE POLICY "public_jobs" ON jobs FOR SELECT TO anon USING (published = true);

-- ============================================================
-- SEED: case_studies (from existing hardcoded results page)
-- ============================================================

INSERT INTO case_studies (industry, title, slug, delivery_time, challenge, solution, timeline_items, results, featured, published, sort_order) VALUES
(
  'Real Estate',
  'How a Dubai Property Agency Reduced Lead Response Time from 4 Hours to 4 Minutes',
  'dubai-property-agency-lead-response',
  '6 weeks',
  'A 30-person agency was losing leads to slow response times. Agents were manually replying to WhatsApp inquiries hours after they arrived, by which time prospects had already moved to a competitor.',
  'We built a WhatsApp AI agent trained on the agency''s listings, pricing, and FAQs. It qualifies leads instantly, books viewings automatically, and routes hot leads to the right agent in under 2 minutes.',
  '[{"step":"Week 1–2","description":"Discovery and workflow audit"},{"step":"Week 3–4","description":"WhatsApp AI build and training"},{"step":"Week 5","description":"CRM integration and testing"},{"step":"Week 6","description":"Go-live and agent training"}]',
  '[{"value":"4 min","label":"Lead response time (was 4 hours)"},{"value":"+40%","label":"Viewing bookings in 90 days"},{"value":"3h/day","label":"Admin time saved per agent"}]',
  true, true, 1
),
(
  'Retail',
  'How a Dubai Retail Chain Cut Overstock by 28% With AI Demand Forecasting',
  'dubai-retail-demand-forecasting',
  '8 weeks',
  'A multi-branch UAE retail chain was carrying 30% excess inventory due to manual, intuition-based ordering. Stockouts and overstock were costing significant margin every quarter.',
  'We built an AI demand forecasting system connected to their POS data, predicting demand by SKU, location, and season. Auto-generated reorder suggestions reduced manual inventory work by 3 hours per day.',
  '[{"step":"Week 1–2","description":"POS data audit and cleaning"},{"step":"Week 3–5","description":"Forecasting model build and training"},{"step":"Week 6–7","description":"Dashboard integration"},{"step":"Week 8","description":"Staff training and handover"}]',
  '[{"value":"−28%","label":"Overstock reduction"},{"value":"−44%","label":"Stockout incidents"},{"value":"+12%","label":"Gross margin improvement"}]',
  true, true, 2
),
(
  'Hospitality',
  'How a Dubai Hotel Group Automated 74% of Guest Inquiries With AI',
  'dubai-hotel-guest-inquiry-automation',
  '5 weeks',
  'A Dubai hotel group was receiving 400+ guest WhatsApp messages per day. Staff were overwhelmed answering repetitive questions about check-in, amenities, and local recommendations.',
  'We deployed a bilingual AI concierge integrated with their PMS. It handles standard inquiries in Arabic and English, escalates complex requests to staff, and personalises responses based on guest booking data.',
  '[{"step":"Week 1","description":"PMS integration and data setup"},{"step":"Week 2–3","description":"AI concierge build and brand training"},{"step":"Week 4","description":"Staff testing and refinement"},{"step":"Week 5","description":"Guest-facing launch"}]',
  '[{"value":"74%","label":"Standard inquiries handled automatically"},{"value":"+0.4","label":"Guest satisfaction score improvement"},{"value":"6h/day","label":"Staff time freed for high-value service"}]',
  true, true, 3
);

-- ============================================================
-- SEED: team_members
-- ============================================================

INSERT INTO team_members (name, title, bio, image_url, sort_order, active) VALUES
(
  'Faris Al-Hashemi', 'Founder & CEO',
  'Faris spent 12 years watching AI projects fail across the GCC — not because the technology didn''t work, but because businesses weren''t set up to use it. He founded Lenoo AI to fix that.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=face',
  1, true
),
(
  'Dr. Elena Rostova', 'Head of Engineering',
  'Elena has a PhD in Machine Learning and leads our engineering team. She has shipped AI systems across retail, real estate, and logistics in the UAE and wider GCC.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=face',
  2, true
),
(
  'Tareq Al-Mansoori', 'Head of Training',
  'Tareq has trained over 1,500 professionals across the UAE. He designs our bilingual training programs and leads all in-person workshops in Dubai.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop&crop=face',
  3, true
);

-- ============================================================
-- SEED: products
-- ============================================================

INSERT INTO products (slug, name, tagline, description, status_badge, feature_tags, features, sort_order, published) VALUES
(
  'whatsapp-ai-agent',
  'WhatsApp AI Agent',
  'A 24/7 bilingual AI assistant for your WhatsApp Business account.',
  'A 24/7 bilingual AI assistant that qualifies leads, books appointments, and handles FAQs — directly in WhatsApp. Works in Arabic and English with zero manual effort.',
  'Available Now',
  '["Lead qualification","Appointment booking","FAQ automation","Arabic + English","CRM integration"]',
  '["Deployed in your WhatsApp Business account in under 2 weeks","Trained on your products, services, and pricing","Hands off to a human agent when a question needs one","Full analytics dashboard — conversations, conversion rates, drop-off points","Integrates with Salesforce, HubSpot, Zoho, and more"]',
  1, true
),
(
  'operations-dashboard',
  'Operations Dashboard',
  'Real-time AI analytics connected to your existing tools.',
  'Real-time AI analytics and workflow automation dashboards — connected to your existing tools. Turn raw data into clear decisions without needing a data team.',
  'Available Now',
  '["Real-time analytics","Workflow automation","Custom KPIs","Multi-source data","AI insights"]',
  '["Connects to 50+ tools including Excel, Google Sheets, ERPs, and POS systems","AI-generated daily summaries and anomaly alerts sent via WhatsApp or email","Role-based views for management, operations, and frontline teams","Automated approval workflows, task routing, and escalation rules","Mobile-first — works on any device, optimised for managers on the go"]',
  2, true
),
(
  'team-ai-trainer',
  'Team AI Trainer',
  'AI-powered bilingual training platform with measurable upskilling.',
  'An AI-powered training platform with bilingual content — measurable upskilling for every department. Track progress, certify employees, and prove ROI on training spend.',
  'Coming Soon',
  '["Bilingual content","Progress tracking","Certifications","Department-specific","ROI reporting"]',
  '["Courses built around your specific tools, processes, and team roles","Arabic and English UI with auto-translated content","AI tutor available 24/7 to answer questions in natural language","Certification program with verifiable credentials per department","Manager dashboard showing team adoption, quiz scores, and time-to-proficiency"]',
  3, true
);

-- ============================================================
-- SEED: legal_pages (current content from privacy.astro + terms.astro)
-- ============================================================

INSERT INTO legal_pages (slug, title, last_updated, sections) VALUES
(
  'privacy',
  'Privacy Policy',
  '2026-05-22',
  '[
    {"heading":"Overview","body":"Lenoo AI (\"we\", \"our\", \"us\") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights under UAE law."},
    {"heading":"Information We Collect","body":"We collect: **Identity Data** (name, job title), **Contact Data** (email, phone, WhatsApp), **Business Data** (company, industry, challenge, budget), **Technical Data** (IP address, browser type)."},
    {"heading":"How We Use Your Data","body":"We use your data to: respond to consultation requests, send relevant information about our services, improve our website, and comply with legal obligations."},
    {"heading":"Data Security","body":"We implement appropriate technical and organisational measures to protect your data against unauthorised access, alteration, disclosure, or destruction."},
    {"heading":"Data Sharing","body":"We do not sell your data. We may share data with trusted service providers (Microsoft Azure, OpenAI, Anthropic, Make.com, n8n) solely to deliver our services, under strict confidentiality agreements."},
    {"heading":"Your Rights Under UAE Law","body":"Under UAE Federal Decree-Law No. 45 of 2021 (PDPL), you have the right to access, correct, or delete your personal data. Contact us at hello@lenooai.com to exercise these rights."},
    {"heading":"Cookies and Tracking","body":"We use essential cookies and Google Analytics to improve your experience. You can control cookie preferences through your browser settings."},
    {"heading":"Contact","body":"For privacy-related questions, contact us at hello@lenooai.com or +971 4 321 8888."}
  ]'
),
(
  'terms',
  'Terms of Service',
  '2026-05-22',
  '[
    {"heading":"Agreement to Terms","body":"By accessing or using Lenoo AI services, you agree to be bound by these Terms of Service and all applicable laws and regulations."},
    {"heading":"Services","body":"Lenoo AI provides Custom AI Development, AI Training & Workshops, and AI Strategy Consulting services to businesses in the UAE and wider region."},
    {"heading":"100% Refund Guarantee","body":"Our satisfaction guarantee covers completed project deliverables. If you are not satisfied with the final delivery, you may request a full refund within 14 days of project completion. Refunds are processed within 5 business days via the original payment method. The guarantee applies to the core project scope, not third-party API fees or ongoing retainer services."},
    {"heading":"Third-Party API Fees","body":"Some AI deployments require third-party API subscriptions (OpenAI, Azure, WhatsApp Business API). These fees are separate from Lenoo AI project fees and are not covered by the refund guarantee."},
    {"heading":"Intellectual Property","body":"On full payment, clients own all custom deliverables. Lenoo AI retains rights to general methodologies, frameworks, and non-client-specific tooling."},
    {"heading":"Client Responsibilities","body":"Clients are responsible for providing accurate data, timely feedback, and necessary system access. Project timelines are contingent on client cooperation."},
    {"heading":"Limitation of Liability","body":"Lenoo AI liability is limited to the project fees paid. We are not liable for indirect, incidental, or consequential damages arising from use of our deliverables."},
    {"heading":"Governing Law","body":"These terms are governed by the laws of the UAE. Disputes shall be resolved in the courts of Dubai, UAE."},
    {"heading":"Contact","body":"For questions about these terms, contact hello@lenooai.com."}
  ]'
);

-- ============================================================
-- SEED: announcement_banner (inactive by default)
-- ============================================================

INSERT INTO announcement_banner (message, cta_text, cta_url, bg_color, text_color, active)
VALUES ('Now accepting Q4 2026 projects — limited spots available.', 'Book Your Call →', '/contact', '#00e3fd', '#0a0f1a', false);

-- ============================================================
-- STORAGE BUCKET (run separately or via Supabase dashboard)
-- ============================================================
-- Create a public storage bucket named 'media':
-- Supabase Dashboard → Storage → New bucket → Name: "media" → Public: ON
