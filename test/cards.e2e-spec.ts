import { HttpStatus } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, request as playwrightRequest, test } from '@playwright/test';
import type { Client } from 'pg';

import { createDbClient } from './helpers/db';

test.describe('Cards (e2e)', () => {
  let api: APIRequestContext;
  let db: Client;
  let regularToken: string;
  let emperorToken: string;
  let createdCardId: number;

  test.beforeAll(async () => {
    api = await playwrightRequest.newContext();
    db = createDbClient();
    await db.connect();

    await api.post('/auth/sign-up', {
      data: { email: 'cards-regular@example.com', password: 'regularpass123' }
    });

    const regularRes = await api.post('/auth/sign-in', {
      data: { email: 'cards-regular@example.com', password: 'regularpass123' }
    });
    regularToken = (await regularRes.json()).accessToken as string;

    await api.post('/auth/sign-up', {
      data: { email: 'cards-emperor@example.com', password: 'emperorpass123' }
    });

    await db.query(
      // eslint-disable-next-line quotes
      "UPDATE users SET role = 'emperor' WHERE email = 'cards-emperor@example.com'"
    );

    const emperorRes = await api.post('/auth/sign-in', {
      data: { email: 'cards-emperor@example.com', password: 'emperorpass123' }
    });
    emperorToken = (await emperorRes.json()).accessToken as string;
  });

  test.afterAll(async () => {
    await db.query('DELETE FROM card');
    await db.query('DELETE FROM users');
    await db.end();
    await api.dispose();
  });

  test.describe('POST /cards', () => {
    test('401 without token', async () => {
      const res = await api.post('/cards', {
        data: { title: 'No Auth Card', text: 'Content' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.post('/cards', {
        headers: { Authorization: `Bearer ${regularToken}` },
        data: { title: 'Regular Card', text: 'Content' }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('201 for emperor', async () => {
      const res = await api.post('/cards', {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { title: 'Emperor Card', text: 'Test content' }
      });
      expect(res.status()).toBe(HttpStatus.CREATED);

      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body.title).toBe('Emperor Card');
      createdCardId = body.id as number;
    });

    test('400 on missing required fields', async () => {
      const res = await api.post('/cards', {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { title: 'No Text Card' }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  test.describe('GET /cards', () => {
    test('200 without token (public)', async () => {
      const res = await api.get('/cards');
      expect(res.status()).toBe(HttpStatus.OK);
      expect(Array.isArray(await res.json())).toBe(true);
    });

    test('200 returns array', async () => {
      const res = await api.get('/cards', {
        headers: { Authorization: `Bearer ${regularToken}` }
      });
      expect(res.status()).toBe(HttpStatus.OK);
      expect(Array.isArray(await res.json())).toBe(true);
    });
  });

  test.describe('GET /cards/:id', () => {
    test('200 returns card', async () => {
      const res = await api.get(`/cards/${createdCardId}`, {
        headers: { Authorization: `Bearer ${regularToken}` }
      });
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.id).toBe(createdCardId);
      expect(body.title).toBe('Emperor Card');
    });

    test('404 for non-existent card', async () => {
      const res = await api.get('/cards/999999', {
        headers: { Authorization: `Bearer ${regularToken}` }
      });
      expect(res.status()).toBe(HttpStatus.NOT_FOUND);
    });
  });

  test.describe('PATCH /cards/:id', () => {
    test('401 without token', async () => {
      const res = await api.patch(`/cards/${createdCardId}`, {
        data: { title: 'Updated' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.patch(`/cards/${createdCardId}`, {
        headers: { Authorization: `Bearer ${regularToken}` },
        data: { title: 'Hacked' }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('200 updates card for emperor', async () => {
      const res = await api.patch(`/cards/${createdCardId}`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { title: 'Updated Card' }
      });
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.title).toBe('Updated Card');
    });
  });

  test.describe('DELETE /cards/:id', () => {
    test('401 without token', async () => {
      const res = await api.delete(`/cards/${createdCardId}`);
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.delete(`/cards/${createdCardId}`, {
        headers: { Authorization: `Bearer ${regularToken}` }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('200 deletes card for emperor', async () => {
      const res = await api.delete(`/cards/${createdCardId}`, {
        headers: { Authorization: `Bearer ${emperorToken}` }
      });
      expect(res.status()).toBe(HttpStatus.OK);
    });

    test('404 after deletion', async () => {
      const res = await api.get(`/cards/${createdCardId}`, {
        headers: { Authorization: `Bearer ${regularToken}` }
      });
      expect(res.status()).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
