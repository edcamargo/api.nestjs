import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { setupApp } from "../setup-app.helper";

describe("Health (E2E)", () => {
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

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app.getHttpServer())
        .get("/health")
        .expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("environment");
      expect(typeof response.body.uptime).toBe("number");
    });
  });

  describe("GET /health/ready", () => {
    it("should return readiness status with database check", async () => {
      const response = await request(app.getHttpServer())
        .get("/health/ready")
        .expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("checks");
      expect(response.body.checks).toHaveProperty("database");
      expect(["ready", "not_ready"]).toContain(response.body.status);
    });
  });

  describe("GET /health/metrics", () => {
    it("should return application metrics", async () => {
      const response = await request(app.getHttpServer())
        .get("/health/metrics")
        .expect(200);

      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("memory");
      expect(response.body).toHaveProperty("process");

      expect(response.body.memory).toHaveProperty("rss");
      expect(response.body.memory).toHaveProperty("heapTotal");
      expect(response.body.memory).toHaveProperty("heapUsed");

      expect(response.body.process).toHaveProperty("pid");
      expect(response.body.process).toHaveProperty("nodeVersion");
      expect(response.body.process).toHaveProperty("platform");
    });
  });
});
