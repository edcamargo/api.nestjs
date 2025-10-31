import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('login and GET /api/users should return 200 when authenticated', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'rambo@rambo.com', password: 'secret123' })
      .expect(200);

    // Support multiple possible response shapes (wrapped by interceptor or direct)
    const token = loginRes.body?.data?.accessToken || loginRes.body?.accessToken || loginRes.body?.data?.token;
    // If token is not present, fail with helpful message showing the body
    if (!token) {
      // eslint-disable-next-line no-console
      console.error('Login response body:', JSON.stringify(loginRes.body, null, 2));
    }
    expect(token).toBeTruthy();

    const usersRes = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // response should have { data: User[], meta: { total, page, perPage, totalPages } }
    const body = usersRes.body;
    const data = body?.data || [];
    const meta = body?.meta || {};

    expect(Array.isArray(data)).toBe(true);
    expect(typeof meta.total).toBe('number');
    expect(typeof meta.page).toBe('number');
    expect(typeof meta.perPage).toBe('number');
    expect(typeof meta.totalPages).toBe('number');
  });
});
