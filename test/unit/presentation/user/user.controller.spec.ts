import { UserController } from "../../../../src/presentation/user/user.controller";
import { UserService } from "../../../../src/application/services/user.service";
import { User, UserRole } from "../../../../src/domain/user/user.entity";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("UserController (unit)", () => {
  let controller: UserController;
  let mockService: Partial<Record<keyof UserService, jest.Mock>> & {
    findAll?: jest.Mock;
  };

  beforeEach(() => {
    mockService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
    };

    controller = new UserController(mockService as unknown as UserService);
  });

  describe("findAll", () => {
    it("should return users and call service.findAll with false when includeDeleted not provided", async () => {
      const now = new Date();
      const user = new User(
        "id-1",
        "Rambo",
        "rambo@rambo.com",
        "hashed",
        UserRole.ADMIN,
        now,
        now,
      );
      mockService.findAll!.mockResolvedValue({
        data: [user],
        meta: { total: 1, page: 1, perPage: 10, totalPages: 1 },
      });

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalledWith(undefined, 1, 10);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty("id", "id-1");
      expect(result.data[0]).toHaveProperty("email", "rambo@rambo.com");
    });

    it('should call service.findAll with true when includeDeleted is "true"', async () => {
      const now = new Date();
      const user = new User(
        "id-2",
        "Jane",
        "jane@example.com",
        "hashed",
        UserRole.USER,
        now,
        now,
      );
      mockService.findAll!.mockResolvedValue({
        data: [user],
        meta: { total: 1, page: 1, perPage: 10, totalPages: 1 },
      });

      const result = await controller.findAll("true");

      expect(mockService.findAll).toHaveBeenCalledWith("true", 1, 10);
      expect(result.data[0]).toHaveProperty("id", "id-2");
    });
  });

  describe("create", () => {
    it("should create a user and return response", async () => {
      const now = new Date();
      const user = new User(
        "id-3",
        "Alice",
        "alice@example.com",
        "hashed",
        UserRole.USER,
        now,
        now,
      );
      mockService.create!.mockResolvedValue(user);

      const dto = {
        name: "Alice",
        email: "alice@example.com",
        password: "secret",
        role: UserRole.USER,
      } as any;
      const res = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty("id", "id-3");
      expect(res).toHaveProperty("email", "alice@example.com");
    });

    it("should propagate ConflictException when create fails due to email in use", async () => {
      mockService.create!.mockRejectedValue(
        new ConflictException("Email already in use"),
      );
      const dto = {
        name: "Bob",
        email: "bob@example.com",
        password: "secret",
      } as any;

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("findById", () => {
    it("should return a user when found", async () => {
      const now = new Date();
      const user = new User(
        "id-4",
        "Carl",
        "carl@example.com",
        "hashed",
        UserRole.USER,
        now,
        now,
      );
      mockService.findById!.mockResolvedValue(user);

      const res = await controller.findById("id-4");
      expect(mockService.findById).toHaveBeenCalledWith("id-4");
      expect(res).toHaveProperty("id", "id-4");
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockService.findById!.mockRejectedValue(
        new NotFoundException("User not found"),
      );
      await expect(controller.findById("missing")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update and return updated user", async () => {
      const now = new Date();
      const user = new User(
        "id-5",
        "Dana",
        "dana@example.com",
        "hashed",
        UserRole.USER,
        now,
        now,
      );
      mockService.update!.mockResolvedValue(user);

      const dto = { name: "Dana", email: "dana@example.com" } as any;
      const res = await controller.update("id-5", dto);

      expect(mockService.update).toHaveBeenCalledWith("id-5", dto);
      expect(res).toHaveProperty("id", "id-5");
    });

    it("should propagate NotFoundException when updating non-existent user", async () => {
      mockService.update!.mockRejectedValue(
        new NotFoundException("User not found"),
      );
      await expect(
        controller.update("nope", { name: "x" } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it("should propagate ConflictException when email is already in use", async () => {
      mockService.update!.mockRejectedValue(
        new ConflictException("Email already in use"),
      );
      await expect(
        controller.update("id", { email: "taken@example.com" } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("remove", () => {
    it("should call service.remove and not throw on success", async () => {
      mockService.remove!.mockResolvedValue(undefined);
      await expect(controller.remove("id-6")).resolves.toBeUndefined();
      expect(mockService.remove).toHaveBeenCalledWith("id-6");
    });

    it("should throw NotFoundException when removing non-existent user", async () => {
      mockService.remove!.mockRejectedValue(
        new NotFoundException("User not found"),
      );
      await expect(controller.remove("missing")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("hardDelete", () => {
    it("should call service.hardDelete and not throw on success", async () => {
      mockService.hardDelete!.mockResolvedValue(undefined);
      await expect(controller.hardDelete("id-7")).resolves.toBeUndefined();
      expect(mockService.hardDelete).toHaveBeenCalledWith("id-7");
    });

    it("should throw NotFoundException when hard deleting non-existent user", async () => {
      mockService.hardDelete!.mockRejectedValue(
        new NotFoundException("User not found"),
      );
      await expect(controller.hardDelete("missing")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("restore", () => {
    it("should restore and return user on success", async () => {
      const now = new Date();
      const user = new User(
        "id-8",
        "Eve",
        "eve@example.com",
        "hashed",
        UserRole.USER,
        now,
        now,
      );
      mockService.restore!.mockResolvedValue(user);

      const res = await controller.restore("id-8");
      expect(mockService.restore).toHaveBeenCalledWith("id-8");
      expect(res).toHaveProperty("id", "id-8");
    });

    it("should throw NotFoundException when restoring non-existent user", async () => {
      mockService.restore!.mockRejectedValue(
        new NotFoundException("User not found"),
      );
      await expect(controller.restore("missing")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when user is not deleted", async () => {
      mockService.restore!.mockRejectedValue(
        new ConflictException("User is not deleted"),
      );
      await expect(controller.restore("not-deleted")).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
