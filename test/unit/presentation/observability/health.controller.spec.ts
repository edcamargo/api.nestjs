import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "../../../../src/presentation/observability/health.controller";
import { PrismaService } from "../../../../src/infrastructure/database/prisma.service";

describe("HealthController (unit)", () => {
  let controller: HealthController;
  let mockPrismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    mockPrismaService = {
      $queryRaw: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("healthCheck", () => {
    it("should return health status", async () => {
      const result = await controller.healthCheck();

      expect(result).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("uptime");
      expect(result).toHaveProperty("environment");
      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should return current timestamp in ISO format", async () => {
      const result = await controller.healthCheck();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should return environment from NODE_ENV", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const result = await controller.healthCheck();

      expect(result.environment).toBe("production");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("readinessCheck", () => {
    it("should return ready status when database is connected", async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ "1": 1 }]);

      const result = await controller.readinessCheck();

      expect(result.status).toBe("ready");
      expect(result).toHaveProperty("timestamp");
      expect(result.checks.database).toBe("ok");
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it("should return not_ready status when database connection fails", async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const result = await controller.readinessCheck();

      expect(result.status).toBe("not_ready");
      expect(result).toHaveProperty("timestamp");
      expect(result.checks.database).toBe("error");
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it("should return timestamp in ISO format", async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ "1": 1 }]);

      const result = await controller.readinessCheck();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe("metrics", () => {
    it("should return application metrics", async () => {
      const result = await controller.metrics();

      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("uptime");
      expect(result).toHaveProperty("memory");
      expect(result).toHaveProperty("process");
    });

    it("should return memory metrics in MB format", async () => {
      const result = await controller.metrics();

      expect(result.memory).toHaveProperty("rss");
      expect(result.memory).toHaveProperty("heapTotal");
      expect(result.memory).toHaveProperty("heapUsed");
      expect(result.memory).toHaveProperty("external");

      expect(result.memory.rss).toMatch(/^\d+\.\d{2} MB$/);
      expect(result.memory.heapTotal).toMatch(/^\d+\.\d{2} MB$/);
      expect(result.memory.heapUsed).toMatch(/^\d+\.\d{2} MB$/);
      expect(result.memory.external).toMatch(/^\d+\.\d{2} MB$/);
    });

    it("should return process information", async () => {
      const result = await controller.metrics();

      expect(result.process).toHaveProperty("pid");
      expect(result.process).toHaveProperty("nodeVersion");
      expect(result.process).toHaveProperty("platform");
      expect(typeof result.process.pid).toBe("number");
      expect(result.process.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
    });

    it("should return valid uptime", async () => {
      const result = await controller.metrics();

      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should return timestamp in ISO format", async () => {
      const result = await controller.metrics();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });
});
