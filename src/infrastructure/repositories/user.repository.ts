import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../../domain/interfaces/user.repository";
import { User, UserRole } from "../../domain/user/user.entity";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(entity: any): User {
    // adapta objeto do Prisma para a entidade de domínio
    return new User(
      entity.id,
      entity.name,
      entity.email,
      entity.password,
      entity.role as UserRole,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt ?? null,
    );
  }

  async create(user: User): Promise<User> {
    const saved = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
    return this.toDomain(saved);
  }

  async findAll(
    includeDeleted = false,
    page = 1,
    perPage = 10,
  ): Promise<User[]> {
    const skip = Math.max(0, page - 1) * Math.max(1, perPage);
    const entities = await this.prisma.user.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async count(includeDeleted = false): Promise<number> {
    return this.prisma.user.count({
      where: includeDeleted ? {} : { deletedAt: null },
    });
  }

  async findById(id: string, includeDeleted = false): Promise<User | null> {
    const entity = await this.prisma.user.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(
    email: string,
    includeDeleted = false,
  ): Promise<User | null> {
    const entity = await this.prisma.user.findFirst({
      where: {
        email,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async update(user: User): Promise<User> {
    const data: any = {
      name: user.name,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    };

    if (user.password) {
      data.password = user.password;
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<User> {
    const restored = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return this.toDomain(restored);
  }
}
