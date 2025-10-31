import { Module } from '@nestjs/common';
import { RoleAssignmentController } from './role-assignment.controller';
import { RoleAssignmentService } from '../../application/services/role-assignment.service';
import { RoleAssignmentRepository } from '../../infrastructure/repositories/role-assignment.repository';
import { ROLE_ASSIGNMENT_REPOSITORY } from '../../domain/interfaces/role-assignment.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/interfaces/user.repository';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role.repository';
import { EnvironmentPermissionRepository } from '../../infrastructure/repositories/environment-permission.repository';
import { ENVIRONMENT_PERMISSION_REPOSITORY } from '../../domain/interfaces/environment-permission.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RoleAssignmentController],
  providers: [
    RoleAssignmentService,
    {
      provide: ROLE_ASSIGNMENT_REPOSITORY,
      useClass: RoleAssignmentRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: ENVIRONMENT_PERMISSION_REPOSITORY,
      useClass: EnvironmentPermissionRepository,
    },
  ],
  exports: [RoleAssignmentService],
})
export class RoleAssignmentModule { }
