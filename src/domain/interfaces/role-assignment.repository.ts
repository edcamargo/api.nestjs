import { RoleAssignment } from "../role-assignment/role-assignment.entity";

export const ROLE_ASSIGNMENT_REPOSITORY = Symbol("ROLE_ASSIGNMENT_REPOSITORY");

export interface IRoleAssignmentRepository {
  create(assignment: RoleAssignment): Promise<RoleAssignment>;
  findAll(includeDeleted?: boolean): Promise<RoleAssignment[]>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<RoleAssignment | null>;
  findByUserId(
    userId: string,
    includeDeleted?: boolean,
  ): Promise<RoleAssignment[]>;
  findActiveByUserId(userId: string): Promise<RoleAssignment[]>;
  findByGrantedBy(
    grantedBy: string,
    includeDeleted?: boolean,
  ): Promise<RoleAssignment[]>;
  update(
    id: string,
    assignment: Partial<RoleAssignment>,
  ): Promise<RoleAssignment>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
