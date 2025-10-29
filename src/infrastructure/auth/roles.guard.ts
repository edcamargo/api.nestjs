import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
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
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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

    // Debug logging to help diagnose ordering issues between JwtAuthGuard and RolesGuard
    // eslint-disable-next-line no-console
    console.log("[RolesGuard] requiredRoles:", requiredRoles, "request.user:", user);

    // If user is not set, deny early with Forbidden to surface the problem
    if (!user) {
      // eslint-disable-next-line no-console
      console.log("[RolesGuard] request.user is undefined. JwtAuthGuard may not have run or failed.");
      throw new ForbiddenException(
        "You do not have permission to access this resource",
      );
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
