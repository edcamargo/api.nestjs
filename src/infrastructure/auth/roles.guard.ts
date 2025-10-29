import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../domain/user/user.entity";
import type { IAuthenticatedUser } from "../../domain/auth";

/**
 * Roles Guard
 * Authorizes users based on their roles
 * Use with @Roles() decorator
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Respect @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      "roles",
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: IAuthenticatedUser = request.user;

    const LOG_AUTH = process.env.LOG_AUTH === "true";

    // Debug logging to help diagnose ordering issues between JwtAuthGuard and RolesGuard
    if (LOG_AUTH) {
      // eslint-disable-next-line no-console
      console.log("[RolesGuard] requiredRoles:", requiredRoles, "request.user:", user);
    }

    // If user is not set, respond with 401 (not authenticated)
    if (!user) {
      if (LOG_AUTH) {
        // eslint-disable-next-line no-console
        console.log("[RolesGuard] request.user is undefined. JwtAuthGuard may not have run or failed.");
      }
      throw new UnauthorizedException("Authentication required");
    }

    // Check if user has required role
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        "You do not have permission to access this resource",
      );
    }

    return true;
  }
}
