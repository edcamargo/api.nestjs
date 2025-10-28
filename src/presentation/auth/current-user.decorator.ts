import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { IAuthenticatedUser } from "../../domain/auth";

/**
 * CurrentUser decorator
 * Extracts authenticated user from request
 *
 * @example
 * @Get('profile')
 * async getProfile(@CurrentUser() user: IAuthenticatedUser) {
 *   return user;
 * }
 *
 * @example
 * @Get('my-data')
 * async getMyData(@CurrentUser('userId') userId: string) {
 *   return this.service.findById(userId);
 * }
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof IAuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): IAuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user: IAuthenticatedUser = request.user;

    return data ? user?.[data] : user;
  },
);
