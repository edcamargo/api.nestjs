import { UserController } from './user.controller';
import { UserService } from '../../application/services/user.service';
import { User, UserRole } from '../../domain/user/user.entity';

describe('UserController (unit)', () => {
  let controller: UserController;
  let mockService: Partial<Record<keyof UserService, jest.Mock>> & {
    findAll?: jest.Mock;
  };

  beforeEach(() => {
    mockService = {
      findAll: jest.fn(),
    };

    controller = new UserController(mockService as unknown as UserService);
  });

  it('should return users and call service.findAll with false when includeDeleted not provided', async () => {
    const now = new Date();
    const user = new User('id-1', 'Rambo', 'rambo@rambo.com', 'hashed', UserRole.ADMIN, now, now);
    mockService.findAll!.mockResolvedValue({ data: [user], meta: { total: 1, page: 1, perPage: 10, totalPages: 1 } });

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalledWith(undefined, 1, 10);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data[0]).toHaveProperty('id', 'id-1');
    expect(result.data[0]).toHaveProperty('email', 'rambo@rambo.com');
  });

  it('should call service.findAll with true when includeDeleted is "true"', async () => {
    const now = new Date();
    const user = new User('id-2', 'Jane', 'jane@example.com', 'hashed', UserRole.USER, now, now);
    mockService.findAll!.mockResolvedValue({ data: [user], meta: { total: 1, page: 1, perPage: 10, totalPages: 1 } });

      const result = await controller.findAll('true');

      expect(mockService.findAll).toHaveBeenCalledWith('true', 1, 10);
    expect(result.data[0]).toHaveProperty('id', 'id-2');
  });
});
