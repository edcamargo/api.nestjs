import { Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../domain/user/user.entity";

export class UserResponseDto {
  @ApiProperty({ example: "f2b5a7d0-..." })
  id: string;

  @ApiProperty({ example: "Alice" })
  name: string;

  @ApiProperty({ example: "alice@example.com" })
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ type: "string", format: "date-time" })
  createdAt: Date;

  @ApiProperty({ type: "string", format: "date-time" })
  updatedAt: Date;
}
