import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { AuthController } from "../../../../src/presentation/auth/auth.controller";
import { AuthService } from "../../../../src/application/auth/auth.service";
import { LoginDto } from "../../../../src/application/auth/login.dto";

describe("AuthController (unit)", () => {
  let controller: AuthController;
  let mockService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    mockService = {
      login: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("login", () => {
    it("should return access token and user on successful login", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse = {
        accessToken: "mock-jwt-token",
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          password: "hashed-password",
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockService.login.mockResolvedValue(mockResponse as any);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(mockService.login).toHaveBeenCalledWith(loginDto);
    });

    it("should throw UnauthorizedException when credentials are invalid", async () => {
      const loginDto: LoginDto = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      mockService.login.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when user not found", async () => {
      const loginDto: LoginDto = {
        email: "notfound@example.com",
        password: "password123",
      };

      mockService.login.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when password is incorrect", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      mockService.login.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
