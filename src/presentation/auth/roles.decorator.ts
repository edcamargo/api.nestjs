import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../domain/user/user.entity";

/**
 * Roles decorator
 * Specifies which roles are allowed to access a route
 * @param roles - Array of allowed roles
 *
 * @example
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * async deleteUser(@Param('id') id: string) { }
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 * @Get('reports')
 * async getReports() { }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles);
