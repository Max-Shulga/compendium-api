import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { createApp } from './helpers/app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createApp());
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM users');
    await app.close();
  });

  describe('POST /auth/sign-up', () => {
    it('201 on successful registration', () =>
      request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({ email: 'auth-test@example.com', password: 'password123' })
        .expect(HttpStatus.CREATED));

    it('409 on duplicate email', () =>
      request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({ email: 'auth-test@example.com', password: 'password123' })
        .expect(HttpStatus.CONFLICT));

    it('400 on invalid email', () =>
      request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(HttpStatus.BAD_REQUEST));

    it('400 on password too short', () =>
      request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({ email: 'new@example.com', password: 'short' })
        .expect(HttpStatus.BAD_REQUEST));
  });

  describe('POST /auth/sign-in', () => {
    it('200 returns accessToken and refreshToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'auth-test@example.com', password: 'password123' })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('401 on wrong password', () =>
      request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'auth-test@example.com', password: 'wrongpassword1' })
        .expect(HttpStatus.UNAUTHORIZED));

    it('401 on unknown email', () =>
      request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(HttpStatus.UNAUTHORIZED));

    it('400 on missing password', () =>
      request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'auth-test@example.com' })
        .expect(HttpStatus.BAD_REQUEST));
  });

  describe('POST /auth/refresh-tokens', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'auth-test@example.com', password: 'password123' });
      refreshToken = res.body.refreshToken as string;
    });

    it('200 returns new tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('401 on already used refresh token', () =>
      request(app.getHttpServer())
        .post('/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(HttpStatus.UNAUTHORIZED));

    it('401 on invalid token', () =>
      request(app.getHttpServer())
        .post('/auth/refresh-tokens')
        .send({ refreshToken: 'invalid.token.value' })
        .expect(HttpStatus.UNAUTHORIZED));
  });
});
