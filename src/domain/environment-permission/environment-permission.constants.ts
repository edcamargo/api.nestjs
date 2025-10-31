export const ENVIRONMENT_PERMISSION_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PROFILE_MIN_LENGTH: 2,
  PROFILE_MAX_LENGTH: 100,
  PURPOSE_MIN_LENGTH: 10,
  PURPOSE_MAX_LENGTH: 500,
} as const;

export const ENVIRONMENT_PERMISSION_ERRORS = {
  NOT_FOUND: "Environment permission not found",
  ALREADY_EXISTS: "Environment permission with this name already exists",
  INVALID_NAME: "Invalid environment permission name",
  CANNOT_DELETE_IN_USE:
    "Cannot delete environment permission that is currently assigned",
  NOT_DELETED: "Environment permission is not deleted",
  INVALID_ACTIONS: "Invalid permitted actions",
} as const;
