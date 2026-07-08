import type { APIRequestContext } from '@playwright/test';
import { expect, request as playwrightRequest, test } from '@playwright/test';
import type { Client } from 'pg';

import { createDbClient } from './helpers/db';

test.describe('App (e2e)', () => {
  let api: APIRequestContext;
  let db: Client;

  test.beforeAll(async () => {
    api = await playwrightRequest.newContext();
    db = createDbClient();
    await db.connect();
  });

  test.afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.end();
    await api.dispose();
  });

  test('app initializes successfully', async () => {
    const res = await api.get('/cards');
    expect(res.ok()).toBeTruthy();
  });
});
