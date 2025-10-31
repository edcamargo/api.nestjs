import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "../../application/auth";
import { LoginDto, AuthResponseDto } from "../../application/auth";
import { Public } from "./public.decorator";

/**
 * AuthController handles authentication endpoints
 * Provides login functionality
 */
@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Login endpoint
   * Authenticates user and returns JWT token
   */
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<AuthResponseDto> {
    const auth = await this.authService.login(loginDto);

    // If configured, set cookie with access token to simplify Swagger/dev testing.
    // Controlled by SET_COOKIE_ON_LOGIN env var. To enable Swagger auto-send, set SET_COOKIE_ON_LOGIN=true and COOKIE_HTTPONLY=false
    try {
      if (process.env.SET_COOKIE_ON_LOGIN === "true" && res) {
        const authData = auth as {
          accessToken?: string;
          data?: { accessToken?: string };
        };
        const token =
          authData.accessToken ?? authData.data?.accessToken ?? null;
        if (token) {
          const cookieHttpOnly = process.env.COOKIE_HTTPONLY === "true";
          const maxAge =
            Number(process.env.COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000;
          res.cookie("access_token", token, {
            httpOnly: cookieHttpOnly,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge,
          });
        }
      }
    } catch (e) {
      // don't fail login if cookie setting fails

      console.warn(
        "Failed to set cookie on login:",
        e instanceof Error ? e.message : e,
      );
    }

    return auth;
  }
}
