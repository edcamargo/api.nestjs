import { Role } from '../../domain/role/role.entity';
import { RoleResponseDto } from '../dtos/role-response.dto';

export class RoleMapper {
  static toResponse(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      accessAreas: role.accessAreas,
      active: role.active,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toResponseArray(roles: Role[]): RoleResponseDto[] {
    return roles.map(role => this.toResponse(role));
  }
}
