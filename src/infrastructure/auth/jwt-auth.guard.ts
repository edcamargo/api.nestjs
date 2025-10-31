import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

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
      const req = context.switchToHttp().getRequest();
      const headers = req.headers || {};
      
      // Read from authorization header or x-access-token header
      let header = headers.authorization || headers['x-access-token'];
      if (Array.isArray(header)) header = header[0];

      // Also support tokens via query params or cookies
      const q = req.query || {};
      const qToken = q.authorization || q.access_token || q.token;
      const c = req.cookies || {};
      const cToken = c.authToken || c.token || c.access_token;

      // Prefer header, otherwise query, otherwise cookie
      const rawToken = header || qToken || cToken;

      if (rawToken && typeof rawToken === 'string') {
        const trimmed = rawToken.trim().replace(/^Bearer\s+/i, '');
        req.headers = req.headers || {};
        req.headers.authorization = `Bearer ${trimmed}`;
      }
    } catch (e) {
      // Ignore extraction errors and let passport handle missing token
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException(info?.message || "Unauthorized");
    }

    return user;
  }
}
