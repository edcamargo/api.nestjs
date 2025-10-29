import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "../../application/auth";
import { JwtStrategy } from "../../infrastructure/auth";
import { USER_REPOSITORY } from "../../domain/user/user.constants";
import { UserRepository } from "../../infrastructure/repositories/user.repository";

/**
 * AuthModule encapsulates authentication functionality
 * Configures JWT, Passport, and provides authentication services
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
      signOptions: {
        expiresIn: "24h",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule { }
