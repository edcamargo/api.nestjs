import { EnvironmentPermission } from "../environment-permission/environment-permission.entity";

export const ENVIRONMENT_PERMISSION_REPOSITORY = Symbol(
  "ENVIRONMENT_PERMISSION_REPOSITORY",
);

export interface IEnvironmentPermissionRepository {
  create(permission: EnvironmentPermission): Promise<EnvironmentPermission>;
  findAll(includeDeleted?: boolean): Promise<EnvironmentPermission[]>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<EnvironmentPermission | null>;
  findByName(
    name: string,
    includeDeleted?: boolean,
  ): Promise<EnvironmentPermission | null>;
  findByProfile(
    profile: string,
    includeDeleted?: boolean,
  ): Promise<EnvironmentPermission[]>;
  update(
    id: string,
    permission: Partial<EnvironmentPermission>,
  ): Promise<EnvironmentPermission>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
