import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

/**
 * DTO for user login
 * Used to validate login request data
 */
export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({
    description: "User password",
    example: "Password123!",
    minLength: 6,
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}
