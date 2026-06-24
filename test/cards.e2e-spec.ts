import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { createApp } from './helpers/app';

describe('Cards (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let regularToken: string;
  let emperorToken: string;
  let createdCardId: number;

  beforeAll(async () => {
    ({ app, dataSource } = await createApp());

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email: 'cards-regular@example.com', password: 'regularpass123' });

    const regularRes = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'cards-regular@example.com', password: 'regularpass123' });
    regularToken = regularRes.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email: 'cards-emperor@example.com', password: 'emperorpass123' });

    await dataSource.query(
      // eslint-disable-next-line quotes
      "UPDATE users SET role = 'emperor' WHERE email = 'cards-emperor@example.com'"
    );

    const emperorRes = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'cards-emperor@example.com', password: 'emperorpass123' });
    emperorToken = emperorRes.body.accessToken as string;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM card');
    await dataSource.query('DELETE FROM users');
    await app.close();
  });

  describe('POST /cards', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .post('/cards')
        .send({ title: 'No Auth Card', text: 'Content' })
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Regular Card', text: 'Content' })
        .expect(HttpStatus.FORBIDDEN));

    it('201 for emperor', async () => {
      const res = await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ title: 'Emperor Card', text: 'Test content' })
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Emperor Card');
      createdCardId = res.body.id as number;
    });

    it('400 on missing required fields', () =>
      request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ title: 'No Text Card' })
        .expect(HttpStatus.BAD_REQUEST));
  });

  describe('GET /cards', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .get('/cards')
        .expect(HttpStatus.UNAUTHORIZED));

    it('200 returns array', async () => {
      const res = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /cards/:id', () => {
    it('200 returns card', async () => {
      const res = await request(app.getHttpServer())
        .get(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdCardId);
      expect(res.body.title).toBe('Emperor Card');
    });

    it('404 for non-existent card', () =>
      request(app.getHttpServer())
        .get('/cards/999999')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.NOT_FOUND));
  });

  describe('PATCH /cards/:id', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .patch(`/cards/${createdCardId}`)
        .send({ title: 'Updated' })
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .patch(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Hacked' })
        .expect(HttpStatus.FORBIDDEN));

    it('200 updates card for emperor', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .send({ title: 'Updated Card' })
        .expect(HttpStatus.OK);

      expect(res.body.title).toBe('Updated Card');
    });
  });

  describe('DELETE /cards/:id', () => {
    it('401 without token', () =>
      request(app.getHttpServer())
        .delete(`/cards/${createdCardId}`)
        .expect(HttpStatus.UNAUTHORIZED));

    it('403 for regular user', () =>
      request(app.getHttpServer())
        .delete(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.FORBIDDEN));

    it('200 deletes card for emperor', () =>
      request(app.getHttpServer())
        .delete(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${emperorToken}`)
        .expect(HttpStatus.OK));

    it('404 after deletion', () =>
      request(app.getHttpServer())
        .get(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.NOT_FOUND));
  });
});
