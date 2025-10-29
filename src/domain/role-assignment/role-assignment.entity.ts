export enum RoleAssignmentState {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  EXPIRED = 'Expired',
}

export class RoleAssignment {
  constructor(
    public id: string,
    public userId: string,
    public roles: string[], // Role IDs
    public accessEnvironments: string[], // EnvironmentPermission IDs
    public startDate: Date,
    public endDate: Date | null,
    public state: RoleAssignmentState,
    public notes: string,
    public grantedBy: string, // User ID
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date | null,
  ) {}

  isActive(): boolean {
    const now = new Date();
    const isWithinDateRange = this.startDate <= now && (!this.endDate || this.endDate >= now);
    return this.state === RoleAssignmentState.ACTIVE && isWithinDateRange && !this.deletedAt;
  }

  isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }

  hasRole(roleId: string): boolean {
    return this.roles.includes(roleId);
  }

  hasEnvironmentAccess(envPermissionId: string): boolean {
    return this.accessEnvironments.includes(envPermissionId);
  }

  hasAnyRole(roleIds: string[]): boolean {
    return roleIds.some(roleId => this.roles.includes(roleId));
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }
}
