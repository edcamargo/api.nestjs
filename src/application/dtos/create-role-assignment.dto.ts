import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleAssignmentState } from '../../domain/role-assignment/role-assignment.entity';
import { ROLE_ASSIGNMENT_VALIDATION } from '../../domain/role-assignment';

export class CreateRoleAssignmentDto {
  @ApiProperty({ example: 'USER0', description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: ['ROLE0', 'ROLE1'], type: [String], description: 'Role IDs' })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({ example: ['ENVPERM0'], type: [String], description: 'Environment permission IDs' })
  @IsArray()
  @IsString({ each: true })
  accessEnvironments: string[];

  @ApiProperty({ example: '2025-09-10', description: 'Start date (ISO 8601)' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-10', required: false, description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: RoleAssignmentState, example: RoleAssignmentState.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(RoleAssignmentState)
  state?: RoleAssignmentState;

  @ApiProperty({ example: 'Granted for project X', required: false, description: 'Assignment notes' })
  @IsOptional()
  @IsString()
  @MaxLength(ROLE_ASSIGNMENT_VALIDATION.NOTES_MAX_LENGTH)
  notes?: string;

  @ApiProperty({ example: 'USER4', description: 'User ID of who granted this assignment' })
  @IsNotEmpty()
  @IsString()
  grantedBy: string;
}
