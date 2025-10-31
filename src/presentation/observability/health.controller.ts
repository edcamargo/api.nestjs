import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator";

@ApiTags("Observability")
@Controller("health")
export class HealthController {
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
  readiness(): { status: string; ready: boolean } {
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
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    platform: NodeJS.Platform;
    nodeVersion: string;
  } {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };
  }
}
