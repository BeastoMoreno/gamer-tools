import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/auth',
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:3100', channel: 'msedge', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'node scripts/auth-fixture.mjs',
      url: 'http://127.0.0.1:54329/health',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100',
      timeout: 120000,
      reuseExistingServer: false,
      env: {
        IAMGAMER_TEST_OUTPUT: '.next/auth-test',
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54329',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_test_fixture',
        NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: 'true',
        NEXT_PUBLIC_AUTH_FACEBOOK_ENABLED: 'true',
        NEXT_PUBLIC_AUTH_APPLE_ENABLED: 'true',
      },
    },
  ],
});
