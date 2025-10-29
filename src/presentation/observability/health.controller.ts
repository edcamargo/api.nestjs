import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Public } from '../auth';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check - liveness probe' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check - database connection' })
  async readinessCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Get('metrics')
  @ApiOperation({ summary: 'Application metrics' })
  async metrics() {
    const memoryUsage = process.memoryUsage();
    return {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
