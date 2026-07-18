import { vi } from 'vitest';

// Set import.meta.env to production-like values before any module is imported.
// Vitest keeps import.meta.env as a live runtime object, so mutating it here
// affects all subsequent module code (CSRF guards, cookie secure flag, etc.).
Object.assign(import.meta.env, {
  DEV: false,
  PROD: true,
  MODE: 'production',
  SITE_URL: 'https://lenooai.com',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  SUPABASE_JWT_SECRET: 'super-secret-jwt-key-for-testing-purposes-only',
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
});

// Mock @supabase/supabase-js so module-level createClient calls don't fail
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
      admin: { inviteUserByEmail: vi.fn() },
    },
  })),
}));
