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
    const LOG_AUTH = process.env.LOG_AUTH === "true";

    // Debug: log the incoming payload for easier troubleshooting of token contents
    if (LOG_AUTH) {
      // eslint-disable-next-line no-console
      console.log("[JwtStrategy] validate payload:", payload);
    }

    try {
      const user = await this.authService.validateUser(payload);

      if (!user) {
        if (LOG_AUTH) {
          // eslint-disable-next-line no-console
          console.log("[JwtStrategy] validate -> no user found for payload", payload);
        }
        return null as unknown as IAuthenticatedUser;
      }

      const result: IAuthenticatedUser = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      if (LOG_AUTH) {
        // eslint-disable-next-line no-console
        console.log("[JwtStrategy] validate -> authenticated user:", { id: user.id, email: user.email, role: user.role });
      }

      return result;
    } catch (err) {
      // Log verification/validation errors for diagnostics
      if (LOG_AUTH) {
        // eslint-disable-next-line no-console
        console.error("[JwtStrategy] validate error:", err instanceof Error ? err.message : err, err);
      }
      // Re-throw to let Nest/passport handle it and return a 401
      throw err;
    }
  }
}
