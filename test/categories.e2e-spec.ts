import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { createApp } from './helpers/app';

const TWO_ITEMS = 2;

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let regularToken: string;
  let emperorToken: string;
  let topicId: number;
  let cardId: number;
  let categoryId: number;

  beforeAll(async () => {
    ({ app, dataSource } = await createApp());

    await request(app.getHttpServer()).post('/auth/sign-up').send({
      email: 'categories-regular@example.com',
      password: 'regularpass123'
    });

    const regularRes = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'categories-regular@example.com',
        password: 'regularpass123'
      });
    regularToken = regularRes.body.accessToken as string;

    await request(app.getHttpServer()).post('/auth/sign-up').send({
      email: 'categories-emperor@example.com',
      password: 'emperorpass123'
    });

    await dataSource.query(
      // eslint-disable-next-line quotes
      "UPDATE users SET role = 'emperor' WHERE email = 'categories-emperor@example.com'"
    );

    const emperorRes = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'categories-emperor@example.com',
        password: 'emperorpass123'
      });
    emperorToken = emperorRes.body.accessToken as string;

    const cardRes = await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${emperorToken}`)
      .send({ title: 'Category Test Card', text: 'Content' });
    cardId = cardRes.body.id as number;

    const topicRes = await request(app.getHttpServer())
      .post('/topics')
      .set('Authorization', `Bearer ${emperorToken}`)
      .send({ name: 'Category Test Topic' });
    topicId = topicRes.body.id as number;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM category_item');
    await dataSource.query('DELETE FROM category');
    await dataSource.query('DELETE FROM topic_card');
    await dataSource.query('DELETE FROM topic');
    await dataSource.query('DELETE FROM card');
    await dataSource.query('DELETE FROM users');
    await app.close();
  });

  describe('POST /categories', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'No Auth Category' })
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Regular Category' })
        .expect(HttpStatus.FORBIDDEN));

    it('400 on missing name', () =>
      request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST));

    it('400 when referencing a non-existent topic', () =>
      request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({
          name: 'Bad Reference Category',
          items: [{ itemType: 'topic', itemId: 999999 }]
        })
        .expect(HttpStatus.BAD_REQUEST));

    it('201 for emperor, nesting a topic and a card', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({
          name: 'Root Category',
          items: [
            { itemType: 'topic', itemId: topicId },
            { itemType: 'card', itemId: cardId }
          ]
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.categoryItems).toHaveLength(TWO_ITEMS);
      categoryId = res.body.id as number;
    });
  });

  describe('GET /categories', () => {
    it('200 without a token (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /categories/:id', () => {
    it('200 without a token, enriching items with the referenced entity', async () => {
      const res = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(categoryId);

      const topicItem = res.body.categoryItems.find(
        (item: { itemType: string }) => item.itemType === 'topic'
      );
      const cardItem = res.body.categoryItems.find(
        (item: { itemType: string }) => item.itemType === 'card'
      );

      expect(topicItem.topic.id).toBe(topicId);
      expect(cardItem.card.id).toBe(cardId);
    });

    it('404 for a non-existent category', () =>
      request(app.getHttpServer())
        .get('/categories/999999')
        .expect(HttpStatus.NOT_FOUND));
  });

  describe('PATCH /categories/:id', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .send({ name: 'Updated' })
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Hacked' })
        .expect(HttpStatus.FORBIDDEN));

    it('200 renames category for emperor', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ name: 'Renamed Category' })
        .expect(HttpStatus.OK);

      expect(res.body.name).toBe('Renamed Category');
    });
  });

  describe('PATCH /categories/:id/items', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .patch(`/categories/${categoryId}/items`)
        .send({ items: [] })
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .patch(`/categories/${categoryId}/items`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ items: [] })
        .expect(HttpStatus.FORBIDDEN));

    it('400 when referencing a non-existent card', () =>
      request(app.getHttpServer())
        .patch(`/categories/${categoryId}/items`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ items: [{ itemType: 'card', itemId: 999999 }] })
        .expect(HttpStatus.BAD_REQUEST));

    it('400 when a category references itself', () =>
      request(app.getHttpServer())
        .patch(`/categories/${categoryId}/items`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ items: [{ itemType: 'category', itemId: categoryId }] })
        .expect(HttpStatus.BAD_REQUEST));

    it('200 replaces items and reorders them', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${categoryId}/items`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({
          items: [
            { itemType: 'card', itemId: cardId },
            { itemType: 'topic', itemId: topicId }
          ]
        })
        .expect(HttpStatus.OK);

      const res = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(HttpStatus.OK);

      expect(res.body.categoryItems).toHaveLength(TWO_ITEMS);
      expect(res.body.categoryItems[0].itemType).toBe('card');
      expect(res.body.categoryItems[1].itemType).toBe('topic');
    });
  });

  describe('nested categories and cycle protection', () => {
    let childCategoryId: number;

    it('nests a child category inside the parent', async () => {
      const childRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ name: 'Child Category' })
        .expect(HttpStatus.CREATED);
      childCategoryId = childRes.body.id as number;

      await request(app.getHttpServer())
        .patch(`/categories/${categoryId}/items`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ items: [{ itemType: 'category', itemId: childCategoryId }] })
        .expect(HttpStatus.OK);

      const res = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(HttpStatus.OK);

      expect(res.body.categoryItems[0].category.id).toBe(childCategoryId);
    });

    it('400 rejects a cycle when the child tries to contain its parent', () =>
      request(app.getHttpServer())
        .patch(`/categories/${childCategoryId}/items`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ items: [{ itemType: 'category', itemId: categoryId }] })
        .expect(HttpStatus.BAD_REQUEST));

    it('removes the dangling reference from the parent after the child is deleted', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${childCategoryId}`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .expect(HttpStatus.OK);

      const res = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(HttpStatus.OK);

      expect(res.body.categoryItems).toHaveLength(0);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.FORBIDDEN));

    it('200 deletes category for emperor', () =>
      request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .expect(HttpStatus.OK));

    it('404 after deletion', () =>
      request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(HttpStatus.NOT_FOUND));
  });
});
