import { Role } from '../role/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
  create(role: Role): Promise<Role>;
  findAll(includeDeleted?: boolean): Promise<Role[]>;
  findById(id: string, includeDeleted?: boolean): Promise<Role | null>;
  findByName(name: string, includeDeleted?: boolean): Promise<Role | null>;
  findActive(): Promise<Role[]>;
  update(id: string, role: Partial<Role>): Promise<Role>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
