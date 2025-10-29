import { IsString, IsNotEmpty, IsArray, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermittedAction } from '../../domain/environment-permission/environment-permission.entity';
import { ENVIRONMENT_PERMISSION_VALIDATION } from '../../domain/environment-permission';

export class CreateEnvironmentPermissionDto {
  @ApiProperty({ example: '@DEV-Environment', description: 'Environment name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(ENVIRONMENT_PERMISSION_VALIDATION.NAME_MIN_LENGTH)
  @MaxLength(ENVIRONMENT_PERMISSION_VALIDATION.NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({ 
    example: ['READ', 'WRITE', 'DELETE'], 
    enum: PermittedAction,
    isArray: true,
    description: 'Permitted actions' 
  })
  @IsArray()
  @IsEnum(PermittedAction, { each: true })
  permittedActions: PermittedAction[];

  @ApiProperty({ example: 'Developer', description: 'Profile type' })
  @IsNotEmpty()
  @IsString()
  @MinLength(ENVIRONMENT_PERMISSION_VALIDATION.PROFILE_MIN_LENGTH)
  @MaxLength(ENVIRONMENT_PERMISSION_VALIDATION.PROFILE_MAX_LENGTH)
  profile: string;

  @ApiProperty({ example: 'Development environment access', description: 'Permission purpose' })
  @IsNotEmpty()
  @IsString()
  @MinLength(ENVIRONMENT_PERMISSION_VALIDATION.PURPOSE_MIN_LENGTH)
  @MaxLength(ENVIRONMENT_PERMISSION_VALIDATION.PURPOSE_MAX_LENGTH)
  purpose: string;
}
