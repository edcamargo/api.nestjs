export class Role {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public accessAreas: string[],
    public active: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date | null,
  ) {}

  isActive(): boolean {
    return this.active && !this.deletedAt;
  }

  hasAccessToArea(area: string): boolean {
    return this.accessAreas.includes(area);
  }

  hasAnyAccessArea(areas: string[]): boolean {
    return areas.some(area => this.accessAreas.includes(area));
  }
}
