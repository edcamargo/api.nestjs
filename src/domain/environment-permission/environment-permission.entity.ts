export enum PermittedAction {
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
  EXECUTE = "EXECUTE",
}

export class EnvironmentPermission {
  constructor(
    public id: string,
    public name: string,
    public permittedActions: PermittedAction[],
    public profile: string,
    public purpose: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date | null,
  ) {}

  canPerformAction(action: PermittedAction): boolean {
    return this.permittedActions.includes(action);
  }

  hasAllActions(actions: PermittedAction[]): boolean {
    return actions.every((action) => this.permittedActions.includes(action));
  }

  hasAnyAction(actions: PermittedAction[]): boolean {
    return actions.some((action) => this.permittedActions.includes(action));
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }
}
