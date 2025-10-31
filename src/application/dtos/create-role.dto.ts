import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ROLE_VALIDATION } from "../../domain/role";

export class CreateRoleDto {
  @ApiProperty({ example: "Revisor", description: "Role name" })
  @IsNotEmpty()
  @IsString()
  @MinLength(ROLE_VALIDATION.NAME_MIN_LENGTH)
  @MaxLength(ROLE_VALIDATION.NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({
    example: "Responsible for reviewing content",
    description: "Role description",
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(ROLE_VALIDATION.DESCRIPTION_MIN_LENGTH)
  @MaxLength(ROLE_VALIDATION.DESCRIPTION_MAX_LENGTH)
  description: string;

  @ApiProperty({
    example: ["Areas", "Content", "Users"],
    type: [String],
    description: "Access areas",
  })
  @IsArray()
  @IsString({ each: true })
  accessAreas: string[];

  @ApiProperty({
    example: true,
    required: false,
    description: "Is role active",
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
