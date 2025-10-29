import { Injectable, ExecutionContext } from "@nestjs/common";
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

    // If super.canActivate returns a promise, attach logging when resolved
    if (result && typeof (result as Promise<boolean>).then === "function") {
      return (result as Promise<boolean>).then((res) => {
        // attempt to log user if available
        try {
          const req = context.switchToHttp().getRequest();
          // eslint-disable-next-line no-console
          console.log("[JwtAuthGuard] canActivate result:", res, "user:", req.user);
        } catch (e) {
          // ignore logging errors
        }
        return res;
      });
    }

    try {
      const req = context.switchToHttp().getRequest();
      // eslint-disable-next-line no-console
      console.log("[JwtAuthGuard] canActivate result:", result, "user:", req.user);
    } catch (e) {
      // ignore logging errors
    }

    return result;
  }

  // Override handleRequest to log the passport result for easier debugging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log("[JwtAuthGuard] handleRequest -> err:", err, "user:", user, "info:", info);
    return super.handleRequest(err, user, info, context);
  }
}
