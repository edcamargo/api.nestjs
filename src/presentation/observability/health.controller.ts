import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@ApiTags("Observability")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  @Public()
  @ApiOperation({ summary: "Health check endpoint" })
  healthCheck(): {
    status: string;
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    environment: string;
  } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  @Get("live")
  @Public()
  @ApiOperation({ summary: "Liveness probe" })
  liveness(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  @Public()
  @ApiOperation({ summary: "Readiness probe" })
  async readiness(): Promise<{
    status: string;
    timestamp: string;
    checks: { database: string };
  }> {
    let databaseStatus = "ok";

    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = "error";
    }

    return {
      status: databaseStatus === "ok" ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseStatus,
      },
    };
  }

  @Get("readiness")
  @Public()
  @ApiOperation({ summary: "Readiness check with database verification" })
  async readinessCheck(): Promise<{
    status: string;
    timestamp: string;
    checks: { database: string };
  }> {
    return this.readiness();
  }

  @Get("version")
  @Public()
  @ApiOperation({ summary: "API version" })
  version(): { version: string; node: string } {
    return {
      version: process.env.npm_package_version || "1.0.0",
      node: process.version,
    };
  }

  @Get("metrics")
  @Public()
  @ApiOperation({ summary: "Basic metrics" })
  metrics(): {
    timestamp: string;
    uptime: number;
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
    };
    process: {
      pid: number;
      nodeVersion: string;
      platform: NodeJS.Platform;
    };
  } {
    const memoryUsage = process.memoryUsage();
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  }
}
