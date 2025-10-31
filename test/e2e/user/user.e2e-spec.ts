import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { setupApp } from "../setup-app.helper";

describe("User (E2E)", () => {
  let app: INestApplication;
  let authToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    // Login to get auth token
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "rambo@rambo.com", password: "secret123" });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/users", () => {
    it("should create a new user (public endpoint)", async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send({
          name: `Test User ${timestamp}`,
          email: `test${timestamp}@example.com`,
          password: "password123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty(
        "name",
        `Test User ${timestamp}`,
      );
      expect(response.body.data).toHaveProperty(
        "email",
        `test${timestamp}@example.com`,
      );
      expect(response.body.data).not.toHaveProperty("password");

      createdUserId = response.body.data.id;
    });

    it("should return 400 with missing required fields", async () => {
      await request(app.getHttpServer())
        .post("/api/users")
        .send({
          name: "Incomplete User",
          // missing email and password
        })
        .expect(400);
    });

    it("should return 400 with invalid email format", async () => {
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post("/api/users")
        .send({
          name: "Test User",
          email: `invalid-email${timestamp}`,
          password: "password123",
        })
        .expect(400);
    });

    it("should return 409 when email already exists", async () => {
      await request(app.getHttpServer())
        .post("/api/users")
        .send({
          name: "Duplicate User",
          email: "rambo@rambo.com",
          password: "password123",
        })
        .expect(409);
    });
  });

  describe("GET /api/users", () => {
    it("should return paginated users when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/users")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("meta");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("page");
      expect(response.body.meta).toHaveProperty("perPage");
      expect(response.body.meta).toHaveProperty("totalPages");
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer()).get("/api/users").expect(401);
    });

    it("should support pagination parameters", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/users?page=1&perPage=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.perPage).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should support includeDeleted parameter", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/users?includeDeleted=true")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by id when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", createdUserId);
      expect(response.body.data).toHaveProperty("name");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .expect(401);
    });

    it("should return 404 when user does not exist", async () => {
      await request(app.getHttpServer())
        .get("/api/users/nonexistent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update a user when authenticated as admin", async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
        })
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", "Updated Name");
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .put(`/api/users/${createdUserId}`)
        .send({
          name: "Updated Name",
        })
        .expect(401);
    });

    it("should return 404 when user does not exist", async () => {
      await request(app.getHttpServer())
        .put("/api/users/nonexistent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
        })
        .expect(404);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should soft delete a user when authenticated as admin", async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify user is soft deleted
      const response = await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}`)
        .expect(401);
    });
  });

  describe("POST /api/users/:id/restore", () => {
    it("should restore a soft deleted user when authenticated as admin", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/users/${createdUserId}/restore`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", createdUserId);
    });

    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .post(`/api/users/${createdUserId}/restore`)
        .expect(401);
    });
  });

  describe("DELETE /api/users/:id/hard", () => {
    it("should return 401 without authentication", async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}/hard`)
        .expect(401);
    });

    it("should permanently delete a user when authenticated as admin", async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}/hard`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify user is permanently deleted
      await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
