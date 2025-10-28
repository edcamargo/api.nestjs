export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public createdAt: Date,
    public updatedAt: Date,
    // deletedAt is optional for soft delete
    public deletedAt?: Date | null,
  ) { }
}
