import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { User } from '../../domain/user/user.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>) { }

  private toDomain(entity: UserEntity): User {
    return new User(entity.id, entity.name, entity.email, entity.password, entity.createdAt, entity.updatedAt);
  }

  async create(user: User): Promise<User> {
    const entity = this.repo.create({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(user: User): Promise<User> {
    await this.repo.update(user.id, {
      name: user.name,
      email: user.email,
      password: user.password,
      updatedAt: user.updatedAt,
    });
    const updated = await this.repo.findOne({ where: { id: user.id } });
    return updated ? this.toDomain(updated) : user;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
