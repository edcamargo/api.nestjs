import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IEnvironmentPermissionRepository } from "../../domain/interfaces/environment-permission.repository";
import {
  EnvironmentPermission,
  PermittedAction,
} from "../../domain/environment-permission/environment-permission.entity";

@Injectable()
export class EnvironmentPermissionRepository
  implements IEnvironmentPermissionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    permission: EnvironmentPermission,
  ): Promise<EnvironmentPermission> {
    const created = await this.prisma.environmentPermission.create({
      data: {
        id: permission.id,
        name: permission.name,
        permittedActions: JSON.stringify(permission.permittedActions),
        profile: permission.profile,
        purpose: permission.purpose,
      },
    });

    return this.toDomain(created);
  }

  async findAll(includeDeleted = false): Promise<EnvironmentPermission[]> {
    const permissions = await this.prisma.environmentPermission.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
    });

    return permissions.map((permission) => this.toDomain(permission));
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<EnvironmentPermission | null> {
    const permission = await this.prisma.environmentPermission.findUnique({
      where: { id },
    });

    if (!permission || (!includeDeleted && permission.deletedAt)) {
      return null;
    }

    return this.toDomain(permission);
  }

  async findByName(
    name: string,
    includeDeleted = false,
  ): Promise<EnvironmentPermission | null> {
    const permission = await this.prisma.environmentPermission.findUnique({
      where: { name },
    });

    if (!permission || (!includeDeleted && permission.deletedAt)) {
      return null;
    }

    return this.toDomain(permission);
  }

  async findByProfile(
    profile: string,
    includeDeleted = false,
  ): Promise<EnvironmentPermission[]> {
    const permissions = await this.prisma.environmentPermission.findMany({
      where: {
        profile,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });

    return permissions.map((permission) => this.toDomain(permission));
  }

  async update(
    id: string,
    permissionData: Partial<EnvironmentPermission>,
  ): Promise<EnvironmentPermission> {
    const data: any = { ...permissionData };

    if (permissionData.permittedActions) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.permittedActions = JSON.stringify(permissionData.permittedActions);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.createdAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.updatedAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.deletedAt;

    // Prisma returns any
    const updated = await this.prisma.environmentPermission.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });

    return this.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.environmentPermission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.environmentPermission.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.environmentPermission.delete({
      where: { id },
    });
  }

  // Prisma returns any type for raw queries, so we need to disable some rules

  private toDomain(prismaPermission: any): EnvironmentPermission {
    return new EnvironmentPermission(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      JSON.parse(prismaPermission.permittedActions) as PermittedAction[],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.profile,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.purpose,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaPermission.deletedAt,
    );
  }
}
