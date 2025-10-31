import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/public.decorator';

/**
 * Temporary debug endpoint to inspect incoming request headers, query and cookies.
 * Enabled only when ENABLE_DEBUG_ENDPOINT=true to avoid accidental exposure.
 */
@Controller('internal')
export class DebugController {
  @Public()
  @Get('debug-headers')
  debugHeaders(@Req() req: Request) {
    if (process.env.ENABLE_DEBUG_ENDPOINT !== 'true') {
      throw new ForbiddenException('Debug endpoint is disabled');
    }

    return {
      headers: req.headers,
      // Express normalized getter
      authorization_get: typeof req.get === 'function' ? req.get('authorization') : undefined,
      query: req.query,
      cookies: (req as any).cookies ?? null,
      rawHeaders: (req as any).rawHeaders ?? null,
    };
  }
}
