import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../domain/user/user.entity";

export class CreateUserDto {
  @ApiProperty({ example: "Alice", description: "Full name of the user" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "alice@example.com",
    description: "Unique email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "secret123",
    description: "Password (min 6 chars)",
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: UserRole.USER,
    description: "User role",
    enum: UserRole,
    default: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsIn([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR], {
    message: "Role must be one of: ADMIN, USER, MODERATOR",
  })
  role?: UserRole;
}
