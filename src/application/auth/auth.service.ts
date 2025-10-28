import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type { IUserRepository } from "../../domain/interfaces/user.repository";
import { USER_REPOSITORY } from "../../domain/user/user.constants";
import { User } from "../../domain/user/user.entity";
import type { IJwtPayload } from "../../domain/auth";
import { LoginDto } from "./login.dto";
import { AuthResponseDto } from "./auth-response.dto";
import { toResponse } from "../mappers/user.mapper";

/**
 * AuthService handles authentication operations
 * Follows Clean Architecture by using repository abstractions
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticates user and returns JWT token
   * @param loginDto - User credentials
   * @returns AuthResponseDto with access token and user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: toResponse(user),
    };
  }

  /**
   * Validates user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns User entity if valid
   * @throws UnauthorizedException if credentials are invalid or user is deleted
   */
  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email, false);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  /**
   * Validates JWT payload and returns user
   * Used by JWT strategy
   * @param payload - JWT payload
   * @returns User entity
   * @throws UnauthorizedException if user not found or deleted
   */
  async validateUser(payload: IJwtPayload): Promise<User> {
    const user = await this.userRepository.findById(payload.sub, false);

    if (!user) {
      throw new UnauthorizedException("User not found or has been deleted");
    }

    return user;
  }
}
