import { Module } from '@nestjs/common';
import { EnvironmentPermissionController } from './environment-permission.controller';
import { EnvironmentPermissionService } from '../../application/services/environment-permission.service';
import { EnvironmentPermissionRepository } from '../../infrastructure/repositories/environment-permission.repository';
import { ENVIRONMENT_PERMISSION_REPOSITORY } from '../../domain/interfaces/environment-permission.repository';
import { RoleAssignmentRepository } from '../../infrastructure/repositories/role-assignment.repository';
import { ROLE_ASSIGNMENT_REPOSITORY } from '../../domain/interfaces/role-assignment.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EnvironmentPermissionController],
  providers: [
    EnvironmentPermissionService,
    {
      provide: ENVIRONMENT_PERMISSION_REPOSITORY,
      useClass: EnvironmentPermissionRepository,
    },
    {
      provide: ROLE_ASSIGNMENT_REPOSITORY,
      useClass: RoleAssignmentRepository,
    },
  ],
  exports: [EnvironmentPermissionService],
})
export class EnvironmentPermissionModule { }
