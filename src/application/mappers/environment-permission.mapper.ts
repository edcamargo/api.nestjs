import { EnvironmentPermission } from '../../domain/environment-permission/environment-permission.entity';
import { EnvironmentPermissionResponseDto } from '../dtos/environment-permission-response.dto';

export class EnvironmentPermissionMapper {
  static toResponse(permission: EnvironmentPermission): EnvironmentPermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      permittedActions: permission.permittedActions,
      profile: permission.profile,
      purpose: permission.purpose,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }

  static toResponseArray(permissions: EnvironmentPermission[]): EnvironmentPermissionResponseDto[] {
    return permissions.map(permission => this.toResponse(permission));
  }
}
