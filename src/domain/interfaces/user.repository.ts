import { User } from '../user/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(includeDeleted?: boolean): Promise<User[]>;
  findById(id: string, includeDeleted?: boolean): Promise<User | null>;
  findByEmail(email: string, includeDeleted?: boolean): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<User>;
}

