import { RoleAssignment } from "../../domain/role-assignment/role-assignment.entity";
import { RoleAssignmentResponseDto } from "../dtos/role-assignment-response.dto";

export class RoleAssignmentMapper {
  static toResponse(assignment: RoleAssignment): RoleAssignmentResponseDto {
    return {
      id: assignment.id,
      userId: assignment.userId,
      roles: assignment.roles,
      accessEnvironments: assignment.accessEnvironments,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      state: assignment.state,
      notes: assignment.notes,
      grantedBy: assignment.grantedBy,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };
  }

  static toResponseArray(
    assignments: RoleAssignment[],
  ): RoleAssignmentResponseDto[] {
    return assignments.map((assignment) => this.toResponse(assignment));
  }
}
