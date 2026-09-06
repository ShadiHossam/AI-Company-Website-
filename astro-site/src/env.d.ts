/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly SUPABASE_JWT_SECRET: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly RESEND_API_KEY: string;
  readonly SITE_URL: string;
  readonly MAINTENANCE_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      role: import('./lib/jwt').AppRole;
    } | undefined;
  }
}

// Third-party analytics/chat snippets (GA4, Meta Pixel, LinkedIn Insight Tag,
// Hotjar, Intercom, Crisp, Tawk.to, TikTok) are pasted verbatim from each
// vendor's own install docs into inline <script> blocks in BaseLayout.astro /
// ArBaseLayout.astro, plus a cookie-consent gate and the Chart.js UMD global
// used on the admin dashboard. None of them ship types, and none of this code
// should be rewritten to satisfy the type checker — these fields exist so the
// vendor snippets typecheck as written.
// This file has no top-level import/export, so it is already a global
// ambient script as far as TypeScript is concerned (same as the App
// namespace above) — merging straight into `interface Window` here reaches
// every .astro script block and .ts file in the project. A `declare global {}`
// wrapper is for *modules* augmenting the global scope from inside a module
// boundary; nesting one in a file that is already global scope is a no-op,
// which is why that version of this block did not fix a single error.
interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { q?: unknown[]; callMethod?: (...args: unknown[]) => void };
  _fbq?: unknown;
  lintrk?: ((...args: unknown[]) => void) & { q?: unknown[] };
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
  hj?: (...args: unknown[]) => void;
  _hjSettings?: { hjid: number; hjsv: number };
  Intercom?: ((...args: unknown[]) => void) & { q?: unknown[]; c?: (...args: unknown[]) => void };
  intercomSettings?: Record<string, unknown>;
  $crisp?: unknown[];
  CRISP_WEBSITE_ID?: string;
  Tawk_API?: Record<string, unknown>;
  TiktokAnalyticsObject?: string;
  attachEvent?: (event: string, handler: () => void) => void;
  hasCookieConsent?: (category: 'analytics' | 'marketing') => boolean;
  getCookiePrefs?: () => { analytics: boolean; marketing: boolean };
  openCookieSettings?: () => void;
  Chart?: typeof import('chart.js/auto').default;
}
