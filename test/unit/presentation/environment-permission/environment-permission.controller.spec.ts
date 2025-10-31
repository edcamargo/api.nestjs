import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { EnvironmentPermissionController } from "../../../../src/presentation/environment-permission/environment-permission.controller";
import { EnvironmentPermissionService } from "../../../../src/application/services/environment-permission.service";
import { CreateEnvironmentPermissionDto } from "../../../../src/application/dtos/create-environment-permission.dto";
import { UpdateEnvironmentPermissionDto } from "../../../../src/application/dtos/update-environment-permission.dto";
import { PermittedAction } from "../../../../src/domain/environment-permission/environment-permission.entity";

describe("EnvironmentPermissionController (unit)", () => {
  let controller: EnvironmentPermissionController;
  let mockService: jest.Mocked<EnvironmentPermissionService>;

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvironmentPermissionController],
      providers: [
        {
          provide: EnvironmentPermissionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EnvironmentPermissionController>(
      EnvironmentPermissionController,
    );
  });

  describe("findAll", () => {
    it("should return all permissions without deleted ones by default", async () => {
      const mockPermissions = [
        {
          id: "1",
          name: "@DEV",
          permittedActions: [PermittedAction.READ, PermittedAction.WRITE],
          profile: "Development",
          purpose: "Development environment",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "@QA",
          permittedActions: [PermittedAction.READ],
          profile: "QA",
          purpose: "Quality assurance",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockPermissions as any);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledWith(false);
    });

    it("should return all permissions including deleted when includeDeleted is true", async () => {
      const mockPermissions = [
        {
          id: "1",
          name: "@DEV",
          permittedActions: [PermittedAction.READ, PermittedAction.WRITE],
          profile: "Development",
          purpose: "Development environment",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "@QA",
          permittedActions: [PermittedAction.READ],
          profile: "QA",
          purpose: "Quality assurance",
          deletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockPermissions as any);

      const result = await controller.findAll("true");

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id", "1");
      expect(result[1]).toHaveProperty("id", "2");
      expect(mockService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe("create", () => {
    it("should create a new environment permission", async () => {
      const dto: CreateEnvironmentPermissionDto = {
        name: "@STAGING",
        permittedActions: [
          PermittedAction.READ,
          PermittedAction.WRITE,
          PermittedAction.EXECUTE,
        ],
        profile: "Staging Environment",
        purpose: "Pre-production testing",
      };

      const mockPermission = {
        id: "1",
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockPermission as any);

      const result = await controller.create(dto);

      expect(result).toHaveProperty("id");
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it("should throw ConflictException when permission name already exists", async () => {
      const dto: CreateEnvironmentPermissionDto = {
        name: "@DEV",
        permittedActions: [PermittedAction.READ],
        profile: "Duplicate",
        purpose: "Test",
      };

      mockService.create.mockRejectedValue(
        new ConflictException(
          "Environment permission with this name already exists",
        ),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("findById", () => {
    it("should return permission by id", async () => {
      const mockPermission = {
        id: "1",
        name: "@DEV",
        permittedActions: ["READ", "WRITE"],
        profile: "Development",
      };

      mockService.findById.mockResolvedValue(mockPermission as any);

      const result = await controller.findById("1");

      expect(result).toHaveProperty("id");
      expect(mockService.findById).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException when permission not found", async () => {
      mockService.findById.mockRejectedValue(
        new NotFoundException("Environment permission not found"),
      );

      await expect(controller.findById("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update environment permission", async () => {
      const dto: UpdateEnvironmentPermissionDto = {
        purpose: "Updated purpose",
      };

      const mockPermission = {
        id: "1",
        name: "@DEV",
        permittedActions: ["READ", "WRITE"],
        profile: "Development",
        purpose: "Updated purpose",
      };

      mockService.update.mockResolvedValue(mockPermission as any);

      const result = await controller.update("1", dto);

      expect(result).toHaveProperty("id");
      expect(mockService.update).toHaveBeenCalledWith("1", dto);
    });

    it("should throw NotFoundException when permission not found", async () => {
      const dto: UpdateEnvironmentPermissionDto = { purpose: "Update" };

      mockService.update.mockRejectedValue(
        new NotFoundException("Environment permission not found"),
      );

      await expect(controller.update("999", dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("softDelete", () => {
    it("should soft delete permission", async () => {
      mockService.softDelete.mockResolvedValue(undefined);

      await controller.softDelete("1");

      expect(mockService.softDelete).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException when permission not found", async () => {
      mockService.softDelete.mockRejectedValue(
        new NotFoundException("Environment permission not found"),
      );

      await expect(controller.softDelete("999")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when permission is in use", async () => {
      mockService.softDelete.mockRejectedValue(
        new ConflictException(
          "Cannot delete environment permission: it is currently being used",
        ),
      );

      await expect(controller.softDelete("1")).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("hardDelete", () => {
    it("should permanently delete permission", async () => {
      mockService.hardDelete.mockResolvedValue(undefined);

      await controller.hardDelete("1");

      expect(mockService.hardDelete).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException when permission not found", async () => {
      mockService.hardDelete.mockRejectedValue(
        new NotFoundException("Environment permission not found"),
      );

      await expect(controller.hardDelete("999")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when permission is in use", async () => {
      mockService.hardDelete.mockRejectedValue(
        new ConflictException(
          "Cannot delete environment permission: it is currently being used",
        ),
      );

      await expect(controller.hardDelete("1")).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("restore", () => {
    it("should restore soft deleted permission", async () => {
      const mockPermission = {
        id: "1",
        name: "@DEV",
        permittedActions: ["READ", "WRITE"],
        profile: "Development",
      };

      mockService.restore.mockResolvedValue(mockPermission as any);

      const result = await controller.restore("1");

      expect(result).toHaveProperty("id");
      expect(mockService.restore).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException when permission not found", async () => {
      mockService.restore.mockRejectedValue(
        new NotFoundException("Environment permission not found"),
      );

      await expect(controller.restore("999")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when permission is not deleted", async () => {
      mockService.restore.mockRejectedValue(
        new ConflictException("Environment permission is not deleted"),
      );

      await expect(controller.restore("1")).rejects.toThrow(ConflictException);
    });
  });
});
