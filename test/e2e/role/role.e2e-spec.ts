import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../setup-app.helper';

describe('Role (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdRoleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    // Login to get auth token (admin user)
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'rambo@rambo.com', password: 'secret123' });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /roles', () => {
    it('should create a new role when authenticated as admin', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Role ${timestamp}`,
          description: 'Test role description',
          accessAreas: ['USERS', 'SETTINGS'],
          active: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', `Test Role ${timestamp}`);
      expect(response.body.data).toHaveProperty('description', 'Test role description');
      expect(response.body.data).toHaveProperty('accessAreas');
      expect(response.body.data).toHaveProperty('active', true);

      createdRoleId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .send({
          name: 'Unauthorized Role',
          description: 'Test',
          accessAreas: [],
          active: true,
        })
        .expect(401);
    });

    it('should return 400 with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing name',
        })
        .expect(400);
    });
  });

  describe('GET /roles', () => {
    it('should return all roles when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/roles')
        .expect(401);
    });

    it('should support includeDeleted parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/roles?includeDeleted=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /roles/active', () => {
    it('should return only active roles when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/roles/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All returned roles should be active
      response.body.data.forEach((role: any) => {
        expect(role.active).toBe(true);
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/roles/active')
        .expect(401);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return a role by id when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdRoleId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('description');
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/roles/${createdRoleId}`)
        .expect(401);
    });

    it('should return 404 when role does not exist', async () => {
      await request(app.getHttpServer())
        .get('/roles/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /roles/:id', () => {
    it('should update a role when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .put(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated description',
          active: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('description', 'Updated description');
      expect(response.body.data).toHaveProperty('active', false);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/roles/${createdRoleId}`)
        .send({
          description: 'Updated',
        })
        .expect(401);
    });

    it('should return 404 when role does not exist', async () => {
      await request(app.getHttpServer())
        .put('/roles/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated description with enough characters',
        })
        .expect(404);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should soft delete a role when authenticated as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/roles/${createdRoleId}`)
        .expect(401);
    });
  });

  describe('POST /roles/:id/restore', () => {
    it('should restore a soft deleted role when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post(`/roles/${createdRoleId}/restore`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdRoleId);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/roles/${createdRoleId}/restore`)
        .expect(401);
    });
  });

  describe('DELETE /roles/:id/hard', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/roles/${createdRoleId}/hard`)
        .expect(401);
    });

    it('should permanently delete a role when authenticated as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/roles/${createdRoleId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify role is permanently deleted
      await request(app.getHttpServer())
        .get(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
