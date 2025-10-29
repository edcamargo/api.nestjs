import { ApiProperty } from '@nestjs/swagger';
import { PermittedAction } from '../../domain/environment-permission/environment-permission.entity';

export class EnvironmentPermissionResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: '@DEV-Environment' })
  name: string;

  @ApiProperty({ example: ['READ', 'WRITE'], enum: PermittedAction, isArray: true })
  permittedActions: PermittedAction[];

  @ApiProperty({ example: 'Developer' })
  profile: string;

  @ApiProperty({ example: 'Development environment access' })
  purpose: string;

  @ApiProperty({ example: '2025-10-28T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-28T12:34:56.789Z' })
  updatedAt: Date;
}
