import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { IAuthenticatedUser } from "../../domain/auth";
import type { Request } from "express";

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
  ): IAuthenticatedUser | string | undefined => {
    const httpContext = ctx.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = httpContext.getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: IAuthenticatedUser | undefined = request.user;

    return data && user ? user[data] : user;
  },
);
