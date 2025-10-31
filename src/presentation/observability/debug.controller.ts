import { Controller, Get, Req } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator";
import type { Request } from "express";

@ApiTags("Debug")
@Controller("debug")
export class DebugController {
  @Get("headers")
  @Public()
  @ApiOperation({ summary: "Show request headers" })
  getHeaders(@Req() req: Request): {
    headers: Request["headers"];
    cookies: Record<string, string> | undefined;
    rawHeaders: string[];
  } {
    const cookies = req.cookies;
    const rawHeaders = req.rawHeaders;

    return {
      headers: req.headers,
      cookies,
      rawHeaders,
    };
  }

  @Get("env")
  @Public()
  @ApiOperation({ summary: "Show environment info (non-sensitive)" })
  getEnv(): {
    nodeEnv: string | undefined;
    platform: NodeJS.Platform;
    nodeVersion: string;
  } {
    return {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
    };
  }
}
