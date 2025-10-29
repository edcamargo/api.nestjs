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

    const result = super.canActivate(context);
    const LOG_AUTH = process.env.LOG_AUTH === "true";

    // If super.canActivate returns a promise, attach logging when resolved
    if (result && typeof (result as Promise<boolean>).then === "function") {
      return (result as Promise<boolean>).then((res) => {
        // attempt to log user if available
        try {
          if (LOG_AUTH) {
            const req = context.switchToHttp().getRequest();
            // eslint-disable-next-line no-console
            console.log("[JwtAuthGuard] canActivate result:", res, "user:", req.user);
          }
        } catch (e) {
          // ignore logging errors
        }
        return res;
      });
    }

    try {
      if (LOG_AUTH) {
        const req = context.switchToHttp().getRequest();
        // eslint-disable-next-line no-console
        console.log("[JwtAuthGuard] canActivate result:", result, "user:", req.user);
      }
    } catch (e) {
      // ignore logging errors
    }

    return result;
  }

  // Override handleRequest to log the passport result for easier debugging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const LOG_AUTH = process.env.LOG_AUTH === "true";

    if (LOG_AUTH) {
      // eslint-disable-next-line no-console
      console.log("[JwtAuthGuard] handleRequest -> err:", err, "user:", user, "info:", info);
    }

    // If passport returned an error, bubble it up
    if (err) {
      throw err;
    }

    // If there's no authenticated user, throw a 401 with the passport info message
    if (!user) {
      // info may be an Error from passport-jwt with message like 'No auth token'
      throw new UnauthorizedException(info?.message || "Unauthorized");
    }

    return user;
  }
}
