import { UserRole } from "../user/user.entity";

/**
 * JWT Payload interface
 * Represents the data structure stored in the JWT token
 */
export interface IJwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * Authenticated User interface
 * Represents the user data available in request after authentication
 */
export interface IAuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
