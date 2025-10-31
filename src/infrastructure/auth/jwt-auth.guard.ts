import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Request } from "express";

/**
 * JWT Authentication Guard
 * Protects routes by validating JWT tokens
 * Can be bypassed using @Public() decorator
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Support token from header, query params, or cookies
    try {
      const req = context.switchToHttp().getRequest<Request>();
      const headers = req.headers;

      // Read from authorization header or x-access-token header
      let header = headers.authorization || headers['x-access-token'];
      if (Array.isArray(header)) header = header[0];

      // Also support tokens via query params or cookies
      const q = req.query as Record<string, string | string[] | undefined>;
      const qToken = q.authorization || q.access_token || q.token;
      const c = (req as any).cookies as Record<string, string> | undefined;
      const cToken = c?.authToken || c?.token || c?.access_token;

      // Prefer header, otherwise query, otherwise cookie
      const rawToken = header || qToken || cToken;

      if (rawToken && typeof rawToken === 'string') {
        const trimmed = rawToken.trim().replace(/^Bearer\s+/i, '');
        (req.headers as any).authorization = `Bearer ${trimmed}`;
      }
    } catch {
      // Ignore extraction errors and let passport handle missing token
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: Error | null, user: TUser | false, info?: any): TUser {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException((info as any)?.message || "Unauthorized");
    }

    return user as TUser;
  }
}
