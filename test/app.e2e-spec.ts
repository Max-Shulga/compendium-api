import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { createApp } from './helpers/app';

describe('App (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createApp());
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM users');
    await app.close();
  });

  it('app initializes successfully', () => {
    expect(app).toBeDefined();
  });
});
