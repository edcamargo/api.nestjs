import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { IRoleRepository } from '../../domain/interfaces/role.repository';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role.repository';
import type { IRoleAssignmentRepository } from '../../domain/interfaces/role-assignment.repository';
import { ROLE_ASSIGNMENT_REPOSITORY } from '../../domain/interfaces/role-assignment.repository';
import { Role } from '../../domain/role/role.entity';
import { ROLE_ERRORS } from '../../domain/role';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(ROLE_ASSIGNMENT_REPOSITORY)
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with same name already exists
    const existing = await this.roleRepository.findByName(createRoleDto.name);
    if (existing) {
      throw new ConflictException(ROLE_ERRORS.ALREADY_EXISTS);
    }

    const role = new Role(
      uuidv4(),
      createRoleDto.name,
      createRoleDto.description,
      createRoleDto.accessAreas,
      createRoleDto.active ?? true,
      new Date(),
      new Date(),
    );

    return this.roleRepository.create(role);
  }

  async findAll(includeDeleted = false): Promise<Role[]> {
    return this.roleRepository.findAll(includeDeleted);
  }

  async findById(id: string, includeDeleted = false): Promise<Role> {
    const role = await this.roleRepository.findById(id, includeDeleted);
    if (!role) {
      throw new NotFoundException(ROLE_ERRORS.NOT_FOUND);
    }
    return role;
  }

  async findActive(): Promise<Role[]> {
    return this.roleRepository.findActive();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // Check if role exists
    await this.findById(id);

    // If updating name, check for duplicates
    if (updateRoleDto.name) {
      const existing = await this.roleRepository.findByName(updateRoleDto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(ROLE_ERRORS.ALREADY_EXISTS);
      }
    }

    return this.roleRepository.update(id, updateRoleDto);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    
    // Check if role is being used in any active assignments
    await this.validateRoleNotInUse(id);
    
    await this.roleRepository.softDelete(id);
  }

  async restore(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id, true);
    if (!role) {
      throw new NotFoundException(ROLE_ERRORS.NOT_FOUND);
    }

    if (!role.deletedAt) {
      throw new ConflictException(ROLE_ERRORS.NOT_DELETED);
    }

    await this.roleRepository.restore(id);
    return this.findById(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findById(id, true);
    
    // Check if role is being used in ANY assignments (even deleted ones)
    await this.validateRoleNotInUse(id, true);
    
    await this.roleRepository.hardDelete(id);
  }

  /**
   * Validates that a role is not being used in any role assignments
   * @param roleId - The role ID to check
   * @param includeDeleted - Whether to check deleted assignments as well
   * @throws ConflictException if role is being used
   */
  private async validateRoleNotInUse(roleId: string, includeDeleted = false): Promise<void> {
    const allAssignments = await this.roleAssignmentRepository.findAll(includeDeleted);
    
    const assignmentsUsingRole = allAssignments.filter(assignment => 
      assignment.roles.includes(roleId)
    );

    if (assignmentsUsingRole.length > 0) {
      throw new ConflictException(
        `Cannot delete role: it is currently being used in ${assignmentsUsingRole.length} role assignment(s)`
      );
    }
  }
}
