import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RoleController } from '../../../../src/presentation/role/role.controller';
import { RoleService } from '../../../../src/application/services/role.service';
import { CreateRoleDto } from '../../../../src/application/dtos/create-role.dto';
import { UpdateRoleDto } from '../../../../src/application/dtos/update-role.dto';

describe('RoleController (unit)', () => {
  let controller: RoleController;
  let mockService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  describe('findAll', () => {
    it('should return all roles without deleted ones by default', async () => {
      const mockRoles = [
        {
          id: '1',
          name: 'Admin',
          description: 'Administrator role',
          accessAreas: ['USERS', 'SETTINGS'],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User',
          description: 'Regular user role',
          accessAreas: ['PROFILE'],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockRoles as any);

      const result = await controller.findAll();

      expect(result.data).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledWith(false);
    });

    it('should return all roles including deleted when includeDeleted is true', async () => {
      const mockRoles = [
        {
          id: '1',
          name: 'Admin',
          description: 'Administrator role',
          accessAreas: ['USERS', 'SETTINGS'],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Deleted Role',
          description: 'Deleted',
          accessAreas: ['NONE'],
          active: false,
          deletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockRoles as any);

      const result = await controller.findAll('true');

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('id', '1');
      expect(result.data[1]).toHaveProperty('id', '2');
      expect(mockService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findActive', () => {
    it('should return only active roles', async () => {
      const mockRoles = [
        {
          id: '1',
          name: 'Admin',
          description: 'Administrator role',
          accessAreas: ['USERS', 'SETTINGS'],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User',
          description: 'Regular user role',
          accessAreas: ['PROFILE'],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findActive.mockResolvedValue(mockRoles as any);

      const result = await controller.findActive();

      expect(result.data).toHaveLength(2);
      expect(mockService.findActive).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const dto: CreateRoleDto = {
        name: 'Editor',
        description: 'Content editor role',
        accessAreas: ['content', 'media'],
        active: true,
      };

      const mockRole = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockRole as any);

      const result = await controller.create(dto);

      expect(result.data).toHaveProperty('id', '1');
      expect(result.data).toHaveProperty('name', dto.name);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException when role name already exists', async () => {
      const dto: CreateRoleDto = {
        name: 'Admin',
        description: 'Duplicate role',
        accessAreas: [],
        active: true,
      };

      mockService.create.mockRejectedValue(
        new ConflictException('Role with this name already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return role by id', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        active: true,
      };

      mockService.findById.mockResolvedValue(mockRole as any);

      const result = await controller.findById('1');

      expect(result.data).toHaveProperty('id');
      expect(mockService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when role not found', async () => {
      mockService.findById.mockRejectedValue(
        new NotFoundException('Role not found'),
      );

      await expect(controller.findById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const dto: UpdateRoleDto = {
        description: 'Updated description',
      };

      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Updated description',
        active: true,
      };

      mockService.update.mockResolvedValue(mockRole as any);

      const result = await controller.update('1', dto);

      expect(result.data).toHaveProperty('id');
      expect(mockService.update).toHaveBeenCalledWith('1', dto);
    });

    it('should throw NotFoundException when role not found', async () => {
      const dto: UpdateRoleDto = { description: 'Update' };

      mockService.update.mockRejectedValue(
        new NotFoundException('Role not found'),
      );

      await expect(controller.update('999', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete role', async () => {
      mockService.softDelete.mockResolvedValue(undefined);

      await controller.softDelete('1');

      expect(mockService.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when role not found', async () => {
      mockService.softDelete.mockRejectedValue(
        new NotFoundException('Role not found'),
      );

      await expect(controller.softDelete('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when role is in use', async () => {
      mockService.softDelete.mockRejectedValue(
        new ConflictException('Cannot delete role: it is currently being used'),
      );

      await expect(controller.softDelete('1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete role', async () => {
      mockService.hardDelete.mockResolvedValue(undefined);

      await controller.hardDelete('1');

      expect(mockService.hardDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when role not found', async () => {
      mockService.hardDelete.mockRejectedValue(
        new NotFoundException('Role not found'),
      );

      await expect(controller.hardDelete('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when role is in use', async () => {
      mockService.hardDelete.mockRejectedValue(
        new ConflictException('Cannot delete role: it is currently being used'),
      );

      await expect(controller.hardDelete('1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('restore', () => {
    it('should restore soft deleted role', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Restored role',
        active: true,
      };

      mockService.restore.mockResolvedValue(mockRole as any);

      const result = await controller.restore('1');

      expect(result.data).toHaveProperty('id');
      expect(mockService.restore).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when role not found', async () => {
      mockService.restore.mockRejectedValue(
        new NotFoundException('Role not found'),
      );

      await expect(controller.restore('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when role is not deleted', async () => {
      mockService.restore.mockRejectedValue(
        new ConflictException('Role is not deleted'),
      );

      await expect(controller.restore('1')).rejects.toThrow(ConflictException);
    });
  });
});
