import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "../dtos/user-response.dto";

/**
 * DTO for authentication response
 * Returned after successful login
 */
export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "Authenticated user data",
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
