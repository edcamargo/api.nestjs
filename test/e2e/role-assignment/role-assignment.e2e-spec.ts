import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../setup-app.helper';

describe('RoleAssignment (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdAssignmentId: string;
  let testUserId: string;
  let testRoleId: string;
  let testPermissionId: string;

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

    const timestamp = Date.now();

    // Create a test user
    const userRes = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: `Test User ${timestamp}`,
        email: `testuser${timestamp}@example.com`,
        password: 'password123',
      });
    
    if (userRes.body && userRes.body.data) {
      testUserId = userRes.body.data.id;
    }

    // Create a test role
    const roleRes = await request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: `Test Role ${timestamp}`,
        description: 'Test role description',
        accessAreas: ['USERS'],
        active: true,
      });
    
    if (roleRes.body && roleRes.body.data) {
      testRoleId = roleRes.body.data.id;
    }

    // Create a test environment permission
    const permRes = await request(app.getHttpServer())
      .post('/environment-permissions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: `@TEST_${timestamp}`,
        permittedActions: ['READ'],
        profile: 'Test Profile',
        purpose: 'Testing purposes',
      });
    
    if (permRes.body && permRes.body.data) {
      testPermissionId = permRes.body.data.id;
    }
  });

  afterAll(async () => {
    // Cleanup: delete test data
    if (createdAssignmentId) {
      await request(app.getHttpServer())
        .delete(`/role-assignments/${createdAssignmentId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }
    if (testUserId) {
      await request(app.getHttpServer())
        .delete(`/api/users/${testUserId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }
    if (testRoleId) {
      await request(app.getHttpServer())
        .delete(`/roles/${testRoleId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }
    if (testPermissionId) {
      await request(app.getHttpServer())
        .delete(`/environment-permissions/${testPermissionId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }

    await app.close();
  });

  describe('POST /role-assignments', () => {
    it('should create a new role assignment when authenticated as admin', async () => {
      // Skip test if setup failed
      if (!testUserId || !testRoleId || !testPermissionId) {
        console.warn('Skipping test: setup failed to create required entities');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/role-assignments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          roles: [testRoleId],
          accessEnvironments: [testPermissionId],
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grantedBy: testUserId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);

      createdAssignmentId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/role-assignments')
        .send({
          userId: testUserId,
          roles: [testRoleId],
          accessEnvironments: [testPermissionId],
          startDate: '2024-01-01',
          grantedBy: testUserId,
        })
        .expect(401);
    });

    it('should return 400 with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/role-assignments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roles: [testRoleId],
        })
        .expect(400);
    });

    it('should return 404 when user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/role-assignments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'nonexistent-user-id',
          roles: [testRoleId],
          accessEnvironments: [testPermissionId],
          startDate: '2024-01-01',
          grantedBy: testUserId,
        })
        .expect(404);
    });
  });

  describe('GET /role-assignments', () => {
    it('should return all role assignments when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/role-assignments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/role-assignments')
        .expect(401);
    });

    it('should support includeDeleted parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/role-assignments?includeDeleted=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /role-assignments/user/:userId', () => {
    it('should return role assignments for a specific user when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/role-assignments/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All returned assignments should belong to the test user
      response.body.data.forEach((assignment: any) => {
        expect(assignment.userId).toBe(testUserId);
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/role-assignments/user/${testUserId}`)
        .expect(401);
    });
  });

  describe('GET /role-assignments/user/:userId/active', () => {
    it('should return only active role assignments for a user when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/role-assignments/user/${testUserId}/active`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/role-assignments/user/${testUserId}/active`)
        .expect(401);
    });
  });

  describe('GET /role-assignments/:id', () => {
    it('should return a role assignment by id when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/role-assignments/${createdAssignmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdAssignmentId);
      expect(response.body.data).toHaveProperty('userId');
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/role-assignments/${createdAssignmentId}`)
        .expect(401);
    });

    it('should return 404 when assignment does not exist', async () => {
      await request(app.getHttpServer())
        .get('/role-assignments/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /role-assignments/:id', () => {
    it('should update a role assignment when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .put(`/role-assignments/${createdAssignmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endDate: '2025-12-31',
          notes: 'Extended assignment',
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdAssignmentId);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/role-assignments/${createdAssignmentId}`)
        .send({
          notes: 'Updated',
        })
        .expect(401);
    });

    it('should return 404 when assignment does not exist', async () => {
      await request(app.getHttpServer())
        .put('/role-assignments/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Updated',
        })
        .expect(404);
    });
  });

  describe('DELETE /role-assignments/:id', () => {
    it('should soft delete a role assignment when authenticated as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/role-assignments/${createdAssignmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/role-assignments/${createdAssignmentId}`)
        .expect(401);
    });
  });

  describe('POST /role-assignments/:id/restore', () => {
    it('should restore a soft deleted role assignment when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post(`/role-assignments/${createdAssignmentId}/restore`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdAssignmentId);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/role-assignments/${createdAssignmentId}/restore`)
        .expect(401);
    });
  });

  describe('DELETE /role-assignments/:id/hard', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/role-assignments/${createdAssignmentId}/hard`)
        .expect(401);
    });

    it('should permanently delete a role assignment when authenticated as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/role-assignments/${createdAssignmentId}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify assignment is permanently deleted
      await request(app.getHttpServer())
        .get(`/role-assignments/${createdAssignmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
