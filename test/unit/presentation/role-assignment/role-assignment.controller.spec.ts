import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { RoleAssignmentController } from "../../../../src/presentation/role-assignment/role-assignment.controller";
import { RoleAssignmentService } from "../../../../src/application/services/role-assignment.service";
import { CreateRoleAssignmentDto } from "../../../../src/application/dtos/create-role-assignment.dto";
import { UpdateRoleAssignmentDto } from "../../../../src/application/dtos/update-role-assignment.dto";

describe("RoleAssignmentController (unit)", () => {
  let controller: RoleAssignmentController;
  let mockService: jest.Mocked<RoleAssignmentService>;

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleAssignmentController],
      providers: [
        {
          provide: RoleAssignmentService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RoleAssignmentController>(RoleAssignmentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all role assignments without deleted ones by default", async () => {
      const mockAssignments = [
        {
          id: "1",
          userId: "user1",
          roleId: "role1",
          environmentPermissionId: "perm1",
          expiresAt: new Date("2024-12-31"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          userId: "user2",
          roleId: "role2",
          environmentPermissionId: "perm2",
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockAssignments as any);

      const result = await controller.findAll();

      expect(result.data).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledWith(false);
    });

    it("should include deleted role assignments when specified", async () => {
      const mockAssignments = [
        {
          id: "1",
          userId: "user1",
          roleId: "role1",
          environmentPermissionId: "perm1",
          expiresAt: new Date("2024-12-31"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          userId: "user2",
          roleId: "role2",
          environmentPermissionId: "perm2",
          expiresAt: null,
          deletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockAssignments as any);

      const result = await controller.findAll("true");

      expect(result.data).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe("findByUserId", () => {
    it("should return all role assignments for a specific user", async () => {
      const userId = "user1";
      const mockAssignments = [
        {
          id: "1",
          userId: userId,
          roleId: "role1",
          environmentPermissionId: "perm1",
          expiresAt: new Date("2024-12-31"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          userId: userId,
          roleId: "role2",
          environmentPermissionId: "perm2",
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findByUserId.mockResolvedValue(mockAssignments as any);

      const result = await controller.findByUserId(userId);

      expect(result.data).toHaveLength(2);
      expect(mockService.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe("findActiveByUserId", () => {
    it("should return only active role assignments for a specific user", async () => {
      const userId = "user1";
      const mockAssignments = [
        {
          id: "1",
          userId: userId,
          roleId: "role1",
          environmentPermissionId: "perm1",
          expiresAt: new Date("2025-12-31"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findActiveByUserId.mockResolvedValue(mockAssignments as any);

      const result = await controller.findActiveByUserId(userId);

      expect(result.data).toHaveLength(1);
      expect(mockService.findActiveByUserId).toHaveBeenCalledWith(userId);
    });

    it("should return empty array when user has no active assignments", async () => {
      const userId = "user1";

      mockService.findActiveByUserId.mockResolvedValue([]);

      const result = await controller.findActiveByUserId(userId);

      expect(result.data).toHaveLength(0);
      expect(mockService.findActiveByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe("findById", () => {
    it("should return a role assignment by id", async () => {
      const assignmentId = "1";
      const mockAssignment = {
        id: assignmentId,
        userId: "user1",
        roleId: "role1",
        environmentPermissionId: "perm1",
        expiresAt: new Date("2024-12-31"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.findById.mockResolvedValue(mockAssignment as any);

      const result = await controller.findById(assignmentId);

      expect(result.data.id).toBe(assignmentId);
      expect(mockService.findById).toHaveBeenCalledWith(assignmentId);
    });

    it("should throw NotFoundException when assignment does not exist", async () => {
      mockService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findById("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a new role assignment", async () => {
      const dto: CreateRoleAssignmentDto = {
        userId: "user1",
        roles: ["role1", "role2"],
        accessEnvironments: ["perm1"],
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        grantedBy: "admin1",
      };

      const mockAssignment = {
        id: "1",
        userId: dto.userId,
        roles: dto.roles,
        accessEnvironments: dto.accessEnvironments,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate!),
        grantedBy: dto.grantedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockAssignment as any);

      const result = await controller.create(dto);

      expect(result.data).toMatchObject({
        id: "1",
        userId: dto.userId,
      });
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it("should throw NotFoundException when user does not exist", async () => {
      const dto: CreateRoleAssignmentDto = {
        userId: "nonexistent",
        roles: ["role1"],
        accessEnvironments: ["perm1"],
        startDate: "2024-01-01",
        grantedBy: "admin1",
      };

      mockService.create.mockRejectedValue(
        new NotFoundException("User not found"),
      );

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a role assignment", async () => {
      const assignmentId = "1";
      const dto: UpdateRoleAssignmentDto = {
        endDate: "2025-12-31",
        notes: "Extended assignment",
      };

      const mockAssignment = {
        id: assignmentId,
        userId: "user1",
        roles: ["role1"],
        accessEnvironments: ["perm1"],
        startDate: new Date("2024-01-01"),
        endDate: new Date(dto.endDate!),
        notes: dto.notes,
        grantedBy: "admin1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.update.mockResolvedValue(mockAssignment as any);

      const result = await controller.update(assignmentId, dto);

      expect(result.data.id).toBe(assignmentId);
      expect(mockService.update).toHaveBeenCalledWith(assignmentId, dto);
    });

    it("should throw NotFoundException when assignment does not exist", async () => {
      const dto: UpdateRoleAssignmentDto = {
        endDate: "2025-12-31",
      };

      mockService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update("999", dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("softDelete", () => {
    it("should soft delete a role assignment", async () => {
      const assignmentId = "1";

      mockService.softDelete.mockResolvedValue(undefined);

      await controller.softDelete(assignmentId);

      expect(mockService.softDelete).toHaveBeenCalledWith(assignmentId);
    });

    it("should throw NotFoundException when assignment does not exist", async () => {
      mockService.softDelete.mockRejectedValue(new NotFoundException());

      await expect(controller.softDelete("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("hardDelete", () => {
    it("should permanently delete a role assignment", async () => {
      const assignmentId = "1";

      mockService.hardDelete.mockResolvedValue(undefined);

      await controller.hardDelete(assignmentId);

      expect(mockService.hardDelete).toHaveBeenCalledWith(assignmentId);
    });

    it("should throw NotFoundException when assignment does not exist", async () => {
      mockService.hardDelete.mockRejectedValue(new NotFoundException());

      await expect(controller.hardDelete("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("restore", () => {
    it("should restore a deleted role assignment", async () => {
      const assignmentId = "1";
      const mockAssignment = {
        id: assignmentId,
        userId: "user1",
        roleId: "role1",
        environmentPermissionId: "perm1",
        expiresAt: new Date("2024-12-31"),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.restore.mockResolvedValue(mockAssignment as any);

      const result = await controller.restore(assignmentId);

      expect(result.data.id).toBe(assignmentId);
      expect(mockService.restore).toHaveBeenCalledWith(assignmentId);
    });

    it("should throw NotFoundException when assignment does not exist", async () => {
      mockService.restore.mockRejectedValue(new NotFoundException());

      await expect(controller.restore("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
