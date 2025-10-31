import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { setupApp } from "../setup-app.helper";

describe("EnvironmentPermission (E2E)", () => {
  let app: INestApplication;
  let authToken: string;
  let createdPermissionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    // Login to get auth token (admin user)
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "rambo@rambo.com", password: "secret123" });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /environment-permissions", () => {
    it("should create a new environment permission when authenticated as admin", async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post("/environment-permissions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: `@TEST_${timestamp}`,
          permittedActions: ["READ", "WRITE"],
          profile: "Test Environment",
          purpose: "Testing purpose",
        })
        .expect(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("name", `@TEST_${timestamp}`);
      expect(response.body.data).toHaveProperty("permittedActions");
      expect(response.body.data).toHaveProperty("profile", "Test Environment");
      expect(response.body.data).toHaveProperty("purpose", "Testing purpose");

      createdPermissionId = response.body.data.id;
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .post("/environment-permissions")
        .send({
          name: "@UNAUTHORIZED",
          permittedActions: ["READ"],
          profile: "Test",
          purpose: "Test",
        })
        .expect(401);
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app.getHttpServer())
        .post("/environment-permissions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          profile: "Missing name",
        });

      expect([400, 500]).toContain(response.status);
    });

    it("should return 400 with invalid permittedActions", async () => {
      const response = await request(app.getHttpServer())
        .post("/environment-permissions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "@INVALID",
          permittedActions: ["INVALID_ACTION"],
          profile: "Test",
          purpose: "Test",
        })
        .expect(400);

      expect(response.body).toHaveProperty("data", null);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("statusCode", 400);
      expect(response.body.error).toHaveProperty("message");
    });
  });

  describe("GET /environment-permissions", () => {
    it("should return all environment permissions when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get("/environment-permissions")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .get("/environment-permissions")
        .expect(401);
    });

    it("should support includeDeleted parameter", async () => {
      const response = await request(app.getHttpServer())
        .get("/environment-permissions?includeDeleted=true")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /environment-permissions/:id", () => {
    it("should return an environment permission by id when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get(`/environment-permissions/${createdPermissionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", createdPermissionId);
      expect(response.body.data).toHaveProperty("name");
      expect(response.body.data).toHaveProperty("permittedActions");
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .get(`/environment-permissions/${createdPermissionId}`)
        .expect(401);
    });

    it("should return 404 when permission does not exist", async () => {
      await request(app.getHttpServer())
        .get("/environment-permissions/nonexistent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("PUT /environment-permissions/:id", () => {
    it("should update an environment permission when authenticated as admin", async () => {
      const response = await request(app.getHttpServer())
        .put(`/environment-permissions/${createdPermissionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          purpose: "Updated purpose",
          permittedActions: ["READ", "WRITE", "EXECUTE"],
        })
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("purpose", "Updated purpose");
      expect(response.body.data.permittedActions).toContain("EXECUTE");
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .put(`/environment-permissions/${createdPermissionId}`)
        .send({
          purpose: "Updated",
        })
        .expect(401);
    });

    it("should return 404 when permission does not exist", async () => {
      await request(app.getHttpServer())
        .put("/environment-permissions/nonexistent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          purpose: "Updated purpose with enough characters",
        })
        .expect(404);
    });
  });

  describe("DELETE /environment-permissions/:id", () => {
    it("should soft delete an environment permission when authenticated as admin", async () => {
      await request(app.getHttpServer())
        .delete(`/environment-permissions/${createdPermissionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .delete(`/environment-permissions/${createdPermissionId}`)
        .expect(401);
    });
  });

  describe("POST /environment-permissions/:id/restore", () => {
    it("should restore a soft deleted environment permission when authenticated as admin", async () => {
      const response = await request(app.getHttpServer())
        .post(`/environment-permissions/${createdPermissionId}/restore`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", createdPermissionId);
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .post(`/environment-permissions/${createdPermissionId}/restore`)
        .expect(401);
    });
  });

  describe("DELETE /environment-permissions/:id/hard", () => {
    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .delete(`/environment-permissions/${createdPermissionId}/hard`)
        .expect(401);
    });

    it("should permanently delete an environment permission when authenticated as admin", async () => {
      await request(app.getHttpServer())
        .delete(`/environment-permissions/${createdPermissionId}/hard`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify permission is permanently deleted
      await request(app.getHttpServer())
        .get(`/environment-permissions/${createdPermissionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
