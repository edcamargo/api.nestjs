import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IRoleRepository } from '../../domain/interfaces/role.repository';
import { Role } from '../../domain/role/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(role: Role): Promise<Role> {
    const created = await this.prisma.role.create({
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        accessAreas: JSON.stringify(role.accessAreas),
        active: role.active,
      },
    });

    return this.toDomain(created);
  }

  async findAll(includeDeleted = false): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
    });

    return roles.map(role => this.toDomain(role));
  }

  async findById(id: string, includeDeleted = false): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role || (!includeDeleted && role.deletedAt)) {
      return null;
    }

    return this.toDomain(role);
  }

  async findByName(name: string, includeDeleted = false): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!role || (!includeDeleted && role.deletedAt)) {
      return null;
    }

    return this.toDomain(role);
  }

  async findActive(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        active: true,
        deletedAt: null,
      },
    });

    return roles.map(role => this.toDomain(role));
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role> {
    const data: any = { ...roleData };
    
    if (roleData.accessAreas) {
      data.accessAreas = JSON.stringify(roleData.accessAreas);
    }

    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.deletedAt;

    const updated = await this.prisma.role.update({
      where: { id },
      data,
    });

    return this.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }

  private toDomain(prismaRole: any): Role {
    return new Role(
      prismaRole.id,
      prismaRole.name,
      prismaRole.description,
      JSON.parse(prismaRole.accessAreas),
      prismaRole.active,
      prismaRole.createdAt,
      prismaRole.updatedAt,
      prismaRole.deletedAt,
    );
  }
}
