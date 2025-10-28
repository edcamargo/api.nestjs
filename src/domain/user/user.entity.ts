export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  MODERATOR = "MODERATOR",
}

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: UserRole,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date | null,
  ) {}
}
