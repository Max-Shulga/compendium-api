import { HttpStatus } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, request as playwrightRequest, test } from '@playwright/test';
import type { Client } from 'pg';

import { createDbClient } from './helpers/db';

const TWO_ITEMS = 2;

test.describe('Categories (e2e)', () => {
  let api: APIRequestContext;
  let db: Client;
  let regularToken: string;
  let emperorToken: string;
  let topicId: number;
  let cardId: number;
  let categoryId: number;

  test.beforeAll(async () => {
    api = await playwrightRequest.newContext();
    db = createDbClient();
    await db.connect();

    await api.post('/auth/sign-up', {
      data: {
        email: 'categories-regular@example.com',
        password: 'regularpass123'
      }
    });

    const regularRes = await api.post('/auth/sign-in', {
      data: {
        email: 'categories-regular@example.com',
        password: 'regularpass123'
      }
    });
    regularToken = (await regularRes.json()).accessToken as string;

    await api.post('/auth/sign-up', {
      data: {
        email: 'categories-emperor@example.com',
        password: 'emperorpass123'
      }
    });

    await db.query(
      // eslint-disable-next-line quotes
      "UPDATE users SET role = 'emperor' WHERE email = 'categories-emperor@example.com'"
    );

    const emperorRes = await api.post('/auth/sign-in', {
      data: {
        email: 'categories-emperor@example.com',
        password: 'emperorpass123'
      }
    });
    emperorToken = (await emperorRes.json()).accessToken as string;

    const cardRes = await api.post('/cards', {
      headers: { Authorization: `Bearer ${emperorToken}` },
      data: { title: 'Category Test Card', text: 'Content' }
    });
    cardId = (await cardRes.json()).id as number;

    const topicRes = await api.post('/topics', {
      headers: { Authorization: `Bearer ${emperorToken}` },
      data: { name: 'Category Test Topic' }
    });
    topicId = (await topicRes.json()).id as number;
  });

  test.afterAll(async () => {
    await db.query('DELETE FROM category_item');
    await db.query('DELETE FROM category');
    await db.query('DELETE FROM topic_card');
    await db.query('DELETE FROM topic');
    await db.query('DELETE FROM card');
    await db.query('DELETE FROM users');
    await db.end();
    await api.dispose();
  });

  test.describe('POST /categories', () => {
    test('401 without token', async () => {
      const res = await api.post('/categories', {
        data: { name: 'No Auth Category' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.post('/categories', {
        headers: { Authorization: `Bearer ${regularToken}` },
        data: { name: 'Regular Category' }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('400 on missing name', async () => {
      const res = await api.post('/categories', {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: {}
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });

    test('400 when referencing a non-existent topic', async () => {
      const res = await api.post('/categories', {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: {
          name: 'Bad Reference Category',
          items: [{ itemType: 'topic', itemId: 999999 }]
        }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });

    test('201 for emperor, nesting a topic and a card', async () => {
      const res = await api.post('/categories', {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: {
          name: 'Root Category',
          items: [
            { itemType: 'topic', itemId: topicId },
            { itemType: 'card', itemId: cardId }
          ]
        }
      });
      expect(res.status()).toBe(HttpStatus.CREATED);

      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body.categoryItems).toHaveLength(TWO_ITEMS);
      categoryId = body.id as number;
    });
  });

  test.describe('GET /categories', () => {
    test('200 without a token (public)', async () => {
      const res = await api.get('/categories');
      expect(res.status()).toBe(HttpStatus.OK);
      expect(Array.isArray(await res.json())).toBe(true);
    });
  });

  test.describe('GET /categories/:id', () => {
    test('200 without a token, enriching items with the referenced entity', async () => {
      const res = await api.get(`/categories/${categoryId}`);
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.id).toBe(categoryId);

      const topicItem = body.categoryItems.find(
        (item: { itemType: string }) => item.itemType === 'topic'
      );
      const cardItem = body.categoryItems.find(
        (item: { itemType: string }) => item.itemType === 'card'
      );

      expect(topicItem.topic.id).toBe(topicId);
      expect(cardItem.card.id).toBe(cardId);
    });

    test('404 for a non-existent category', async () => {
      const res = await api.get('/categories/999999');
      expect(res.status()).toBe(HttpStatus.NOT_FOUND);
    });
  });

  test.describe('PATCH /categories/:id', () => {
    test('401 without token', async () => {
      const res = await api.patch(`/categories/${categoryId}`, {
        data: { name: 'Updated' }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.patch(`/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${regularToken}` },
        data: { name: 'Hacked' }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('200 renames category for emperor', async () => {
      const res = await api.patch(`/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { name: 'Renamed Category' }
      });
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.name).toBe('Renamed Category');
    });
  });

  test.describe('PATCH /categories/:id/items', () => {
    test('401 without token', async () => {
      const res = await api.patch(`/categories/${categoryId}/items`, {
        data: { items: [] }
      });
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.patch(`/categories/${categoryId}/items`, {
        headers: { Authorization: `Bearer ${regularToken}` },
        data: { items: [] }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('400 when referencing a non-existent card', async () => {
      const res = await api.patch(`/categories/${categoryId}/items`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { items: [{ itemType: 'card', itemId: 999999 }] }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });

    test('400 when a category references itself', async () => {
      const res = await api.patch(`/categories/${categoryId}/items`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { items: [{ itemType: 'category', itemId: categoryId }] }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });

    test('200 replaces items and reorders them', async () => {
      const patchRes = await api.patch(`/categories/${categoryId}/items`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: {
          items: [
            { itemType: 'card', itemId: cardId },
            { itemType: 'topic', itemId: topicId }
          ]
        }
      });
      expect(patchRes.status()).toBe(HttpStatus.OK);

      const res = await api.get(`/categories/${categoryId}`);
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.categoryItems).toHaveLength(TWO_ITEMS);
      expect(body.categoryItems[0].itemType).toBe('card');
      expect(body.categoryItems[1].itemType).toBe('topic');
    });
  });

  test.describe('nested categories and cycle protection', () => {
    let childCategoryId: number;

    test('nests a child category inside the parent', async () => {
      const childRes = await api.post('/categories', {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { name: 'Child Category' }
      });
      expect(childRes.status()).toBe(HttpStatus.CREATED);
      childCategoryId = (await childRes.json()).id as number;

      const patchRes = await api.patch(`/categories/${categoryId}/items`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { items: [{ itemType: 'category', itemId: childCategoryId }] }
      });
      expect(patchRes.status()).toBe(HttpStatus.OK);

      const res = await api.get(`/categories/${categoryId}`);
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.categoryItems[0].category.id).toBe(childCategoryId);
    });

    test('400 rejects a cycle when the child tries to contain its parent', async () => {
      const res = await api.patch(`/categories/${childCategoryId}/items`, {
        headers: { Authorization: `Bearer ${emperorToken}` },
        data: { items: [{ itemType: 'category', itemId: categoryId }] }
      });
      expect(res.status()).toBe(HttpStatus.BAD_REQUEST);
    });

    test('removes the dangling reference from the parent after the child is deleted', async () => {
      const deleteRes = await api.delete(`/categories/${childCategoryId}`, {
        headers: { Authorization: `Bearer ${emperorToken}` }
      });
      expect(deleteRes.status()).toBe(HttpStatus.OK);

      const res = await api.get(`/categories/${categoryId}`);
      expect(res.status()).toBe(HttpStatus.OK);

      const body = await res.json();
      expect(body.categoryItems).toHaveLength(0);
    });
  });

  test.describe('DELETE /categories/:id', () => {
    test('401 without token', async () => {
      const res = await api.delete(`/categories/${categoryId}`);
      expect(res.status()).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('403 for regular user', async () => {
      const res = await api.delete(`/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${regularToken}` }
      });
      expect(res.status()).toBe(HttpStatus.FORBIDDEN);
    });

    test('200 deletes category for emperor', async () => {
      const res = await api.delete(`/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${emperorToken}` }
      });
      expect(res.status()).toBe(HttpStatus.OK);
    });

    test('404 after deletion', async () => {
      const res = await api.get(`/categories/${categoryId}`);
      expect(res.status()).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
