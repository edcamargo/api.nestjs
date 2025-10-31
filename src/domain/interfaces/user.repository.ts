import { User } from "../user/user.entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(
    includeDeleted?: boolean,
    page?: number,
    perPage?: number,
  ): Promise<User[]>;
  count(includeDeleted?: boolean): Promise<number>;
  findById(id: string, includeDeleted?: boolean): Promise<User | null>;
  findByEmail(email: string, includeDeleted?: boolean): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<User>;
}
