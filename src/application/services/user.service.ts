import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import type { IUserRepository } from "../../domain/interfaces/user.repository";
import { USER_REPOSITORY } from "../../domain/user/user.constants";
import { User, UserRole } from "../../domain/user/user.entity";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findByEmail(dto.email, true);
    if (existing && !existing.deletedAt) {
      throw new ConflictException("Email already in use");
    }

    if (existing && existing.deletedAt) {
      throw new ConflictException(
        "Email was previously used by a deleted account. Please contact support.",
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const now = new Date();
    const user = new User(
      uuidv4(),
      dto.name,
      dto.email,
      hashed,
      dto.role ?? UserRole.USER,
      now,
      now,
      null,
    );
    return this.repo.create(user);
  }

  async findAll(includeDeleted = false): Promise<User[]> {
    return this.repo.findAll(includeDeleted);
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const byEmail = await this.repo.findByEmail(dto.email, true);
      if (byEmail && byEmail.id !== id)
        throw new ConflictException("Email already in use");
    }

    user.name = dto.name ?? user.name;
    user.email = dto.email ?? user.email;
    user.role = dto.role ?? user.role;
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    user.updatedAt = new Date();
    return this.repo.update(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException("User not found");
    await this.repo.softDelete(id);
  }

  async hardDelete(id: string): Promise<void> {
    const user = await this.repo.findById(id, true);
    if (!user) throw new NotFoundException("User not found");
    await this.repo.delete(id);
  }

  async restore(id: string): Promise<User> {
    const user = await this.repo.findById(id, true);
    if (!user) throw new NotFoundException("User not found");
    if (!user.deletedAt) throw new ConflictException("User is not deleted");
    return this.repo.restore(id);
  }
}
