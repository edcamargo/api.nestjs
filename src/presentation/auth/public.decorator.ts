import { SetMetadata } from "@nestjs/common";

/**
 * Public decorator
 * Marks a route as public (bypasses JWT authentication)
 *
 * @example
 * @Public()
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) { }
 */
export const Public = () => SetMetadata("isPublic", true);
