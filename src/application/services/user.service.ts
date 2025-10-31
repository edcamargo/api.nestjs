import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

  async findAll(
    includeDeleted?: string | boolean,
    page?: number,
    perPage?: number,
  ): Promise<{ data: User[]; meta: { total: number; page: number; perPage: number; totalPages: number } }> {
    // normalize includeDeleted: accept boolean or common truthy string values
    let include = false;
    if (typeof includeDeleted === 'boolean') include = includeDeleted;
    else if (typeof includeDeleted === 'string') {
      const v = includeDeleted.toLowerCase();
      include = v === 'true' || v === '1' || v === 'yes';
    }

    // environment-configurable defaults/limits
    const DEFAULT_PER_PAGE = Number(process.env.DEFAULT_PER_PAGE) || 10;
    const MAX_PER_PAGE = Number(process.env.MAX_PER_PAGE) || 100;

    // normalize pagination
    let pageNum = 1;
    if (typeof page === 'number' && Number.isFinite(page)) pageNum = Math.floor(page);
    if (pageNum < 1) throw new BadRequestException('page must be >= 1');

    let perPageNum = typeof perPage === 'number' && Number.isFinite(perPage) ? Math.floor(perPage) : DEFAULT_PER_PAGE;
    if (perPageNum < 1) throw new BadRequestException('perPage must be >= 1');
    if (perPageNum > MAX_PER_PAGE)
      throw new BadRequestException(`perPage must be <= ${MAX_PER_PAGE}`);

    const [data, total] = await Promise.all([
      this.repo.findAll(include, pageNum, perPageNum),
      this.repo.count(include),
    ]);

    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / perPageNum));

    return {
      data,
      meta: { total, page: pageNum, perPage: perPageNum, totalPages },
    };
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
