export const ROLE_ASSIGNMENT_VALIDATION = {
  NOTES_MAX_LENGTH: 1000,
} as const;

export const ROLE_ASSIGNMENT_ERRORS = {
  NOT_FOUND: "Role assignment not found",
  INVALID_USER: "Invalid user ID",
  INVALID_ROLE: "Invalid role ID",
  INVALID_ENVIRONMENT: "Invalid environment permission ID",
  INVALID_DATE_RANGE: "End date must be after start date",
  NOT_DELETED: "Role assignment is not deleted",
  ALREADY_ACTIVE: "Role assignment is already active",
  USER_NOT_FOUND: "User not found",
  GRANTOR_NOT_FOUND: "Grantor user not found",
} as const;
