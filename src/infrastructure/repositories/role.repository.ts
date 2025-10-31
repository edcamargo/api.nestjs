import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IRoleRepository } from "../../domain/interfaces/role.repository";
import { Role } from "../../domain/role/role.entity";

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

    return roles.map((role) => this.toDomain(role));
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

    return roles.map((role) => this.toDomain(role));
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role> {
    const data: any = { ...roleData };

    if (roleData.accessAreas) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.accessAreas = JSON.stringify(roleData.accessAreas);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.createdAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.updatedAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  // Prisma returns any type for entities, so we need to disable some rules

  private toDomain(prismaRole: any): Role {
    return new Role(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      JSON.parse(prismaRole.accessAreas),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.active,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaRole.deletedAt,
    );
  }
}
