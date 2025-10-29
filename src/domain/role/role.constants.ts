export const ROLE_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

export const ROLE_ERRORS = {
  NOT_FOUND: 'Role not found',
  ALREADY_EXISTS: 'Role with this name already exists',
  INVALID_NAME: 'Invalid role name',
  CANNOT_DELETE_IN_USE: 'Cannot delete role that is currently assigned to users',
  NOT_DELETED: 'Role is not deleted',
} as const;
