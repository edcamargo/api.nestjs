import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { setupApp } from "../setup-app.helper";

describe("Auth (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "rambo@rambo.com",
          password: "secret123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("email", "rambo@rambo.com");
      expect(response.body.user).toHaveProperty("name");
    });

    it("should return 401 with invalid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "rambo@rambo.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("statusCode", 401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 401 when user does not exist", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "anypassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("statusCode", 401);
    });

    it("should return 400 with missing email", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          password: "secret123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 with missing password", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "rambo@rambo.com",
        })
        .expect(400);

      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 with invalid email format", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "invalid-email",
          password: "secret123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message");
    });
  });
});
