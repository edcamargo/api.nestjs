import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IRoleAssignmentRepository } from "../../domain/interfaces/role-assignment.repository";
import {
  RoleAssignment,
  RoleAssignmentState,
} from "../../domain/role-assignment/role-assignment.entity";

@Injectable()
export class RoleAssignmentRepository implements IRoleAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(assignment: RoleAssignment): Promise<RoleAssignment> {
    const created = await this.prisma.roleAssignment.create({
      data: {
        id: assignment.id,
        userId: assignment.userId,
        roles: JSON.stringify(assignment.roles),
        accessEnvironments: JSON.stringify(assignment.accessEnvironments),
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        state: assignment.state,
        notes: assignment.notes,
        grantedBy: assignment.grantedBy,
      },
    });

    return this.toDomain(created);
  }

  async findAll(includeDeleted = false): Promise<RoleAssignment[]> {
    const assignments = await this.prisma.roleAssignment.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
    });

    return assignments.map((assignment) => this.toDomain(assignment));
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<RoleAssignment | null> {
    const assignment = await this.prisma.roleAssignment.findUnique({
      where: { id },
    });

    if (!assignment || (!includeDeleted && assignment.deletedAt)) {
      return null;
    }

    return this.toDomain(assignment);
  }

  async findByUserId(
    userId: string,
    includeDeleted = false,
  ): Promise<RoleAssignment[]> {
    const assignments = await this.prisma.roleAssignment.findMany({
      where: {
        userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });

    return assignments.map((assignment) => this.toDomain(assignment));
  }

  async findActiveByUserId(userId: string): Promise<RoleAssignment[]> {
    const now = new Date();
    const assignments = await this.prisma.roleAssignment.findMany({
      where: {
        userId,
        state: RoleAssignmentState.ACTIVE,
        deletedAt: null,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    });

    return assignments.map((assignment) => this.toDomain(assignment));
  }

  async findByGrantedBy(
    grantedBy: string,
    includeDeleted = false,
  ): Promise<RoleAssignment[]> {
    const assignments = await this.prisma.roleAssignment.findMany({
      where: {
        grantedBy,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });

    return assignments.map((assignment) => this.toDomain(assignment));
  }

  async update(
    id: string,
    assignmentData: Partial<RoleAssignment>,
  ): Promise<RoleAssignment> {
    const data: any = { ...assignmentData };

    if (assignmentData.roles) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.roles = JSON.stringify(assignmentData.roles);
    }

    if (assignmentData.accessEnvironments) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.accessEnvironments = JSON.stringify(
        assignmentData.accessEnvironments,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.createdAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.updatedAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete data.deletedAt;

    // Prisma returns any
    const updated = await this.prisma.roleAssignment.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });

    return this.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.roleAssignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.roleAssignment.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.roleAssignment.delete({
      where: { id },
    });
  }

  // Prisma returns any type for raw queries, so we need to disable some rules

  private toDomain(prismaAssignment: any): RoleAssignment {
    return new RoleAssignment(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      JSON.parse(prismaAssignment.roles),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      JSON.parse(prismaAssignment.accessEnvironments),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.startDate,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.endDate,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      prismaAssignment.state as RoleAssignmentState,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.notes,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.grantedBy,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      prismaAssignment.deletedAt,
    );
  }
}
