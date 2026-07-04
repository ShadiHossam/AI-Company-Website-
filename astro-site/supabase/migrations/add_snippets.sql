-- Reusable HTML/JS snippet library (tracking pixels, embeds, CTA blocks)
-- Run in Supabase SQL Editor

CREATE TABLE snippets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  category   TEXT,
  code       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
