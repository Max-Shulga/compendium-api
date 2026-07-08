import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ?? '3000';

export default defineConfig({
  testDir: './test',
  testMatch: '**/*.e2e-spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    command: 'npm run start',
    url: `http://localhost:${PORT}/cards`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe'
  }
});
