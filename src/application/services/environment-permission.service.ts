import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { IEnvironmentPermissionRepository } from '../../domain/interfaces/environment-permission.repository';
import { ENVIRONMENT_PERMISSION_REPOSITORY } from '../../domain/interfaces/environment-permission.repository';
import type { IRoleAssignmentRepository } from '../../domain/interfaces/role-assignment.repository';
import { ROLE_ASSIGNMENT_REPOSITORY } from '../../domain/interfaces/role-assignment.repository';
import { EnvironmentPermission } from '../../domain/environment-permission/environment-permission.entity';
import { ENVIRONMENT_PERMISSION_ERRORS } from '../../domain/environment-permission';
import { CreateEnvironmentPermissionDto } from '../dtos/create-environment-permission.dto';
import { UpdateEnvironmentPermissionDto } from '../dtos/update-environment-permission.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EnvironmentPermissionService {
  constructor(
    @Inject(ENVIRONMENT_PERMISSION_REPOSITORY)
    private readonly environmentPermissionRepository: IEnvironmentPermissionRepository,
    @Inject(ROLE_ASSIGNMENT_REPOSITORY)
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
  ) {}

  async create(createDto: CreateEnvironmentPermissionDto): Promise<EnvironmentPermission> {
    // Check if permission with same name already exists
    const existing = await this.environmentPermissionRepository.findByName(createDto.name);
    if (existing) {
      throw new ConflictException(ENVIRONMENT_PERMISSION_ERRORS.ALREADY_EXISTS);
    }

    const permission = new EnvironmentPermission(
      uuidv4(),
      createDto.name,
      createDto.permittedActions,
      createDto.profile,
      createDto.purpose,
      new Date(),
      new Date(),
    );

    return this.environmentPermissionRepository.create(permission);
  }

  async findAll(includeDeleted = false): Promise<EnvironmentPermission[]> {
    return this.environmentPermissionRepository.findAll(includeDeleted);
  }

  async findById(id: string, includeDeleted = false): Promise<EnvironmentPermission> {
    const permission = await this.environmentPermissionRepository.findById(id, includeDeleted);
    if (!permission) {
      throw new NotFoundException(ENVIRONMENT_PERMISSION_ERRORS.NOT_FOUND);
    }
    return permission;
  }

  async findByProfile(profile: string, includeDeleted = false): Promise<EnvironmentPermission[]> {
    return this.environmentPermissionRepository.findByProfile(profile, includeDeleted);
  }

  async update(id: string, updateDto: UpdateEnvironmentPermissionDto): Promise<EnvironmentPermission> {
    // Check if permission exists
    await this.findById(id);

    // If updating name, check for duplicates
    if (updateDto.name) {
      const existing = await this.environmentPermissionRepository.findByName(updateDto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(ENVIRONMENT_PERMISSION_ERRORS.ALREADY_EXISTS);
      }
    }

    return this.environmentPermissionRepository.update(id, updateDto);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    
    // Check if environment permission is being used in any active assignments
    await this.validateEnvironmentPermissionNotInUse(id);
    
    await this.environmentPermissionRepository.softDelete(id);
  }

  async restore(id: string): Promise<EnvironmentPermission> {
    const permission = await this.environmentPermissionRepository.findById(id, true);
    if (!permission) {
      throw new NotFoundException(ENVIRONMENT_PERMISSION_ERRORS.NOT_FOUND);
    }

    if (!permission.deletedAt) {
      throw new ConflictException(ENVIRONMENT_PERMISSION_ERRORS.NOT_DELETED);
    }

    await this.environmentPermissionRepository.restore(id);
    return this.findById(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findById(id, true);
    
    // Check if environment permission is being used in ANY assignments (even deleted ones)
    await this.validateEnvironmentPermissionNotInUse(id, true);
    
    await this.environmentPermissionRepository.hardDelete(id);
  }

  /**
   * Validates that an environment permission is not being used in any role assignments
   * @param envPermId - The environment permission ID to check
   * @param includeDeleted - Whether to check deleted assignments as well
   * @throws ConflictException if environment permission is being used
   */
  private async validateEnvironmentPermissionNotInUse(envPermId: string, includeDeleted = false): Promise<void> {
    const allAssignments = await this.roleAssignmentRepository.findAll(includeDeleted);
    
    const assignmentsUsingEnvPerm = allAssignments.filter(assignment => 
      assignment.accessEnvironments.includes(envPermId)
    );

    if (assignmentsUsingEnvPerm.length > 0) {
      throw new ConflictException(
        `Cannot delete environment permission: it is currently being used in ${assignmentsUsingEnvPerm.length} role assignment(s)`
      );
    }
  }
}
