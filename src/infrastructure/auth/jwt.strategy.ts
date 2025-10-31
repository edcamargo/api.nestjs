import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../../application/auth";
import type { IJwtPayload, IAuthenticatedUser } from "../../domain/auth";

/**
 * JWT Strategy for Passport authentication
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || "your-secret-key-change-in-production",
    });
  }

  /**
   * Validates JWT payload
   * Called automatically by Passport after token verification
   * @param payload - Decoded JWT payload
   * @returns Authenticated user object attached to request
   */
  async validate(payload: IJwtPayload): Promise<IAuthenticatedUser> {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      return null as unknown as IAuthenticatedUser;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
