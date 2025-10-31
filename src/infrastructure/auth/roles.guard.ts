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
import { Request } from "express";

/**
 * Roles Guard
 * Authorizes users based on their roles
 * Use with @Roles() decorator
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

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

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: IAuthenticatedUser }>();
    const user: IAuthenticatedUser | undefined = request.user;

    // If user is not set, authentication is required
    if (!user) {
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
