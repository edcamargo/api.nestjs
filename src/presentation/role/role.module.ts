import { Module } from "@nestjs/common";
import { RoleController } from "./role.controller";
import { RoleService } from "../../application/services/role.service";
import { RoleRepository } from "../../infrastructure/repositories/role.repository";
import { ROLE_REPOSITORY } from "../../domain/interfaces/role.repository";
import { RoleAssignmentRepository } from "../../infrastructure/repositories/role-assignment.repository";
import { ROLE_ASSIGNMENT_REPOSITORY } from "../../domain/interfaces/role-assignment.repository";
import { DatabaseModule } from "../../infrastructure/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: ROLE_ASSIGNMENT_REPOSITORY,
      useClass: RoleAssignmentRepository,
    },
  ],
  exports: [RoleService],
})
export class RoleModule {}
