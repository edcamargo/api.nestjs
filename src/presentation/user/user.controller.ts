import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
} from "@nestjs/common";
import { UserService } from "../../application/services/user.service";
import { CreateUserDto } from "../../application/dtos/create-user.dto";
import { UpdateUserDto } from "../../application/dtos/update-user.dto";
import { instanceToPlain } from "class-transformer";
import { toResponse } from "../../application/mappers/user.mapper";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserResponseDto } from "../../application/dtos/user-response.dto";
import { PagedUserResponseDto } from "../../application/dtos/paged-user-response.dto";
import { Roles, Public } from "../auth";
import { RolesGuard, JwtAuthGuard } from "../../infrastructure/auth";
import { UserRole } from "../../domain/user/user.entity";

@ApiTags("Users")
@Controller("api/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
export class UserController {
  constructor(private readonly service: UserService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "User created",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: "Email already in use" })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.service.create(dto);
    return instanceToPlain(toResponse(user));
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get()
  @ApiOperation({ summary: "List all users" })
  @ApiQuery({
    name: "includeDeleted",
    required: false,
    type: Boolean,
    description: "Include soft deleted users",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (1-based)",
    example: 1,
  })
  @ApiQuery({
    name: "perPage",
    required: false,
    type: Number,
    description: "Items per page",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "List of users",
    type: PagedUserResponseDto,
  })
  async findAll(
    @Query("includeDeleted") includeDeleted?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query("perPage", new DefaultValuePipe(10), ParseIntPipe) perPage = 10,
  ) {
    const result = await this.service.findAll(includeDeleted, page, perPage);
    const payload = {
      data: result.data.map((u) => instanceToPlain(toResponse(u))),
      meta: result.meta,
    };
    return payload;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  @ApiResponse({
    status: 200,
    description: "User found",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async findById(@Param("id") id: string) {
    const user = await this.service.findById(id);
    return instanceToPlain(toResponse(user));
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user by id" })
  @ApiResponse({
    status: 200,
    description: "User updated",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const user = await this.service.update(id, dto);
    return instanceToPlain(toResponse(user));
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Soft delete a user" })
  @ApiResponse({ status: 204, description: "User successfully soft deleted" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id") id: string) {
    await this.service.remove(id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(":id/hard")
  @HttpCode(204)
  @ApiOperation({ summary: "Permanently delete a user" })
  @ApiResponse({
    status: 204,
    description: "User permanently deleted from database",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async hardDelete(@Param("id") id: string) {
    await this.service.hardDelete(id);
  }

  @Roles(UserRole.ADMIN)
  @Post(":id/restore")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Restore a soft deleted user" })
  @ApiResponse({
    status: 200,
    description: "User successfully restored",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "User is not deleted" })
  async restore(@Param("id") id: string) {
    const user = await this.service.restore(id);
    return instanceToPlain(toResponse(user));
  }
}
