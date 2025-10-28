import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../domain/interfaces/user.repository';
import { USER_REPOSITORY } from '../../domain/user/user.constants';
import { User } from '../../domain/user/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) { }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const now = new Date();
    const user = new User(uuidv4(), dto.name, dto.email, hashed, now, now);
    return this.repo.create(user);
  }

  async findAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const byEmail = await this.repo.findByEmail(dto.email);
      if (byEmail) throw new ConflictException('Email already in use');
    }

    user.name = dto.name ?? user.name;
    user.email = dto.email ?? user.email;
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    user.updatedAt = new Date();
    return this.repo.update(user);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Ensure user exists
    await this.repo.delete(id);
  }

}
