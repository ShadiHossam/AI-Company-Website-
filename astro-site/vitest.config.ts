import { defineConfig } from 'vitest/config';

export default defineConfig({
  // 'production' mode makes import.meta.env.DEV = false so CSRF guards are exercised
  mode: 'production',
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/pages/api/admin/**', 'src/middleware.ts'],
    },
  },
  define: {
    'import.meta.env.SITE_URL': JSON.stringify('https://lenooai.com'),
    'import.meta.env.SUPABASE_URL': JSON.stringify('https://test.supabase.co'),
    'import.meta.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify('test-service-role-key'),
    'import.meta.env.SUPABASE_JWT_SECRET': JSON.stringify('super-secret-jwt-key-for-testing-purposes-only'),
    'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify('https://test.supabase.co'),
    'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
  },
});
