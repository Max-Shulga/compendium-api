import { HttpStatus } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, request as playwrightRequest, test } from '@playwright/test';
import type { Client } from 'pg';

import { createDbClient } from './helpers/db';

test.describe('Auth (e2e)', () => {
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

  test.describe('POST /auth/sign-up', () => {
    test('201 on successful registration', async () => {
      const res = await api.post('/auth/sign-up', {
        data: { email: 'auth-test@example.com', password: 'password123' }
      });
      expect(res.status()).toBe(HttpStatus.CREATED);
    });

    test('409 on duplicate email', async () => {
      const res = await api.post('/auth/sign-up', {
        data: { email: 'auth-test@example.com', password: 'password123' }
      });
      expect(res.status()).toBe(HttpStatus.CONFLICT);
    });

    test('400 on invalid email', async () => {
      const res = await api.post('/auth/sign-up', {
        data: { email: 'not-an-email', password: 'password123' }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });

    test('400 on password too short', async () => {
      const res = await api.post('/auth/sign-up', {
        data: { email: 'new@example.com', password: 'short' }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  test.describe('POST /auth/sign-in', () => {
    test('200 returns accessToken and refreshToken', async () => {
      const res = await api.post('/auth/sign-in', {
        data: { email: 'auth-test@example.com', password: 'password123' }
      });
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });

    test('401 on wrong password', async () => {
      const res = await api.post('/auth/sign-in', {
        data: { email: 'auth-test@example.com', password: 'wrongpassword1' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('401 on unknown email', async () => {
      const res = await api.post('/auth/sign-in', {
        data: { email: 'nobody@example.com', password: 'password123' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('400 on missing password', async () => {
      const res = await api.post('/auth/sign-in', {
        data: { email: 'auth-test@example.com' }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  test.describe('POST /auth/refresh-tokens', () => {
    let refreshToken: string;

    test.beforeAll(async () => {
      const res = await api.post('/auth/sign-in', {
        data: { email: 'auth-test@example.com', password: 'password123' }
      });
      const body = await res.json();
      refreshToken = body.refreshToken as string;
    });

    test('200 returns new tokens', async () => {
      const res = await api.post('/auth/refresh-tokens', {
        data: { refreshToken }
      });
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });

    test('401 on already used refresh token', async () => {
      const res = await api.post('/auth/refresh-tokens', {
        data: { refreshToken }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('401 on invalid token', async () => {
      const res = await api.post('/auth/refresh-tokens', {
        data: { refreshToken: 'invalid.token.value' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
