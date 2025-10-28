import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../domain/user/user.entity";

export class UpdateUserDto {
  @ApiProperty({ example: "Alice", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "alice@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: "newSecret123", required: false, minLength: 6 })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: UserRole.MODERATOR,
    description: "User role",
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsIn([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR], {
    message: "Role must be one of: ADMIN, USER, MODERATOR",
  })
  role?: UserRole;
}
