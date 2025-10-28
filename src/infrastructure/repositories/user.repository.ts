import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { User } from '../../domain/user/user.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) { }

  private toDomain(entity: any): User {
    // adapta objeto do Prisma para a entidade de domínio
    return new User(entity.id, entity.name, entity.email, entity.password, entity.createdAt, entity.updatedAt);
  }

  async create(user: User): Promise<User> {
    const saved = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return this.toDomain(saved);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.prisma.user.findMany();
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        updatedAt: user.updatedAt,
      },
    });
    return updated ? this.toDomain(updated) : user;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
