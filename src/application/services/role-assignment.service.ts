import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import type { IRoleAssignmentRepository } from '../../domain/interfaces/role-assignment.repository';
import { ROLE_ASSIGNMENT_REPOSITORY } from '../../domain/interfaces/role-assignment.repository';
import type { IRoleRepository } from '../../domain/interfaces/role.repository';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role.repository';
import type { IEnvironmentPermissionRepository } from '../../domain/interfaces/environment-permission.repository';
import { ENVIRONMENT_PERMISSION_REPOSITORY } from '../../domain/interfaces/environment-permission.repository';
import { RoleAssignment, RoleAssignmentState } from '../../domain/role-assignment/role-assignment.entity';
import { ROLE_ASSIGNMENT_ERRORS } from '../../domain/role-assignment';
import { CreateRoleAssignmentDto } from '../dtos/create-role-assignment.dto';
import { UpdateRoleAssignmentDto } from '../dtos/update-role-assignment.dto';
import type { IUserRepository } from '../../domain/interfaces/user.repository';
import { USER_REPOSITORY } from '../../domain/interfaces/user.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleAssignmentService {
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY)
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(ENVIRONMENT_PERMISSION_REPOSITORY)
    private readonly environmentPermissionRepository: IEnvironmentPermissionRepository,
  ) { }

  async create(createDto: CreateRoleAssignmentDto): Promise<RoleAssignment> {
    // Validate user exists
    const user = await this.userRepository.findById(createDto.userId);
    if (!user) {
      throw new NotFoundException(ROLE_ASSIGNMENT_ERRORS.USER_NOT_FOUND);
    }

    // Validate grantor exists
    const grantor = await this.userRepository.findById(createDto.grantedBy);
    if (!grantor) {
      throw new NotFoundException(ROLE_ASSIGNMENT_ERRORS.GRANTOR_NOT_FOUND);
    }

    // Validate all role IDs exist
    await this.validateRoleIds(createDto.roles);

    // Validate all environment permission IDs exist
    await this.validateEnvironmentPermissionIds(createDto.accessEnvironments);

    // Validate date range
    const startDate = new Date(createDto.startDate);
    const endDate = createDto.endDate ? new Date(createDto.endDate) : null;

    if (endDate && endDate <= startDate) {
      throw new BadRequestException(ROLE_ASSIGNMENT_ERRORS.INVALID_DATE_RANGE);
    }

    const assignment = new RoleAssignment(
      uuidv4(),
      createDto.userId,
      createDto.roles,
      createDto.accessEnvironments,
      startDate,
      endDate,
      createDto.state ?? RoleAssignmentState.ACTIVE,
      createDto.notes ?? '',
      createDto.grantedBy,
      new Date(),
      new Date(),
    );

    return this.roleAssignmentRepository.create(assignment);
  }

  async findAll(includeDeleted = false): Promise<RoleAssignment[]> {
    return this.roleAssignmentRepository.findAll(includeDeleted);
  }

  async findById(id: string, includeDeleted = false): Promise<RoleAssignment> {
    const assignment = await this.roleAssignmentRepository.findById(id, includeDeleted);
    if (!assignment) {
      throw new NotFoundException(ROLE_ASSIGNMENT_ERRORS.NOT_FOUND);
    }
    return assignment;
  }

  async findByUserId(userId: string, includeDeleted = false): Promise<RoleAssignment[]> {
    return this.roleAssignmentRepository.findByUserId(userId, includeDeleted);
  }

  async findActiveByUserId(userId: string): Promise<RoleAssignment[]> {
    return this.roleAssignmentRepository.findActiveByUserId(userId);
  }

  async findByGrantedBy(grantedBy: string, includeDeleted = false): Promise<RoleAssignment[]> {
    return this.roleAssignmentRepository.findByGrantedBy(grantedBy, includeDeleted);
  }

  async update(id: string, updateDto: UpdateRoleAssignmentDto): Promise<RoleAssignment> {
    // Check if assignment exists
    const existingAssignment = await this.findById(id);

    // Validate role IDs if updating roles
    if (updateDto.roles) {
      await this.validateRoleIds(updateDto.roles);
    }

    // Validate environment permission IDs if updating accessEnvironments
    if (updateDto.accessEnvironments) {
      await this.validateEnvironmentPermissionIds(updateDto.accessEnvironments);
    }

    // Validate date range if updating dates
    const startDate = updateDto.startDate ? new Date(updateDto.startDate) : existingAssignment.startDate;
    const endDate = updateDto.endDate ? new Date(updateDto.endDate) : existingAssignment.endDate;

    if (endDate && endDate <= startDate) {
      throw new BadRequestException(ROLE_ASSIGNMENT_ERRORS.INVALID_DATE_RANGE);
    }

    // Convert string dates to Date objects
    const updateData: Partial<RoleAssignment> = {
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
    };

    return this.roleAssignmentRepository.update(id, updateData);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.roleAssignmentRepository.softDelete(id);
  }

  async restore(id: string): Promise<RoleAssignment> {
    const assignment = await this.roleAssignmentRepository.findById(id, true);
    if (!assignment) {
      throw new NotFoundException(ROLE_ASSIGNMENT_ERRORS.NOT_FOUND);
    }

    if (!assignment.deletedAt) {
      throw new ConflictException(ROLE_ASSIGNMENT_ERRORS.NOT_DELETED);
    }

    await this.roleAssignmentRepository.restore(id);
    return this.findById(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findById(id, true);
    await this.roleAssignmentRepository.hardDelete(id);
  }

  /**
   * Validates that all role IDs exist in the database
   * @throws NotFoundException if any role ID is not found
   */
  private async validateRoleIds(roleIds: string[]): Promise<void> {
    if (!roleIds || roleIds.length === 0) {
      return;
    }

    const invalidRoleIds: string[] = [];

    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        invalidRoleIds.push(roleId);
      }
    }

    if (invalidRoleIds.length > 0) {
      throw new NotFoundException(
        `The following role IDs were not found: ${invalidRoleIds.join(', ')}`
      );
    }
  }

  /**
   * Validates that all environment permission IDs exist in the database
   * @throws NotFoundException if any environment permission ID is not found
   */
  private async validateEnvironmentPermissionIds(envPermIds: string[]): Promise<void> {
    if (!envPermIds || envPermIds.length === 0) {
      return;
    }

    const invalidEnvPermIds: string[] = [];

    for (const envPermId of envPermIds) {
      const envPerm = await this.environmentPermissionRepository.findById(envPermId);
      if (!envPerm) {
        invalidEnvPermIds.push(envPermId);
      }
    }

    if (invalidEnvPermIds.length > 0) {
      throw new NotFoundException(
        `The following environment permission IDs were not found: ${invalidEnvPermIds.join(', ')}`
      );
    }
  }
}
