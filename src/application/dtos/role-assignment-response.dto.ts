import { ApiProperty } from '@nestjs/swagger';
import { RoleAssignmentState } from '../../domain/role-assignment/role-assignment.entity';

export class RoleAssignmentResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'USER0' })
  userId: string;

  @ApiProperty({ example: ['ROLE0'], type: [String] })
  roles: string[];

  @ApiProperty({ example: ['ENVPERM0'], type: [String] })
  accessEnvironments: string[];

  @ApiProperty({ example: '2025-09-10T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-09-10T00:00:00.000Z', nullable: true })
  endDate: Date | null;

  @ApiProperty({ enum: RoleAssignmentState, example: RoleAssignmentState.ACTIVE })
  state: RoleAssignmentState;

  @ApiProperty({ example: 'Granted for project X' })
  notes: string;

  @ApiProperty({ example: 'USER4' })
  grantedBy: string;

  @ApiProperty({ example: '2025-10-28T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-28T12:34:56.789Z' })
  updatedAt: Date;
}
