import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../../infrastructure/auth/public.decorator";

@ApiTags("Observability")
@Controller("health")
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: "Health check endpoint" })
  healthCheck() {
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
  liveness() {
    return { status: "ok" };
  }

  @Get("ready")
  @Public()
  @ApiOperation({ summary: "Readiness probe" })
  readiness() {
    try {
      // Add checks here (database, external services, etc.)
      return { status: "ok", ready: true };
    } catch {
      return { status: "error", ready: false };
    }
  }

  @Get("version")
  @Public()
  @ApiOperation({ summary: "API version" })
  version() {
    return {
      version: process.env.npm_package_version || "1.0.0",
      node: process.version,
    };
  }

  @Get("metrics")
  @Public()
  @ApiOperation({ summary: "Basic metrics" })
  metrics() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };
  }
}
