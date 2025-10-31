import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { EnvironmentPermissionService } from "../../application/services/environment-permission.service";
import { CreateEnvironmentPermissionDto } from "../../application/dtos/create-environment-permission.dto";
import { UpdateEnvironmentPermissionDto } from "../../application/dtos/update-environment-permission.dto";
import { EnvironmentPermissionResponseDto } from "../../application/dtos/environment-permission-response.dto";
import { EnvironmentPermissionMapper } from "../../application/mappers/environment-permission.mapper";
import { Roles } from "../auth";
import { UserRole } from "../../domain/user/user.entity";

@ApiTags("Environment Permissions")
@ApiBearerAuth("JWT-auth")
@Controller("environment-permissions")
export class EnvironmentPermissionController {
  constructor(
    private readonly environmentPermissionService: EnvironmentPermissionService,
  ) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a new environment permission" })
  @ApiResponse({
    status: 201,
    description: "Environment permission created successfully",
    type: EnvironmentPermissionResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Environment permission already exists",
  })
  async create(
    @Body() createDto: CreateEnvironmentPermissionDto,
  ): Promise<{ data: EnvironmentPermissionResponseDto }> {
    const permission =
      await this.environmentPermissionService.create(createDto);
    return { data: EnvironmentPermissionMapper.toResponse(permission) };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: "Get all environment permissions" })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: "Environment permissions retrieved successfully",
    type: [EnvironmentPermissionResponseDto],
  })
  async findAll(
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<{ data: EnvironmentPermissionResponseDto[] }> {
    const permissions = await this.environmentPermissionService.findAll(
      includeDeleted === "true",
    );
    return { data: EnvironmentPermissionMapper.toResponseArray(permissions) };
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiOperation({ summary: "Get environment permission by ID" })
  @ApiResponse({
    status: 200,
    description: "Environment permission retrieved successfully",
    type: EnvironmentPermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Environment permission not found" })
  async findById(
    @Param("id") id: string,
  ): Promise<{ data: EnvironmentPermissionResponseDto }> {
    const permission = await this.environmentPermissionService.findById(id);
    return { data: EnvironmentPermissionMapper.toResponse(permission) };
  }

  @Put(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update environment permission" })
  @ApiResponse({
    status: 200,
    description: "Environment permission updated successfully",
    type: EnvironmentPermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Environment permission not found" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateEnvironmentPermissionDto,
  ): Promise<{ data: EnvironmentPermissionResponseDto }> {
    const permission = await this.environmentPermissionService.update(
      id,
      updateDto,
    );
    return { data: EnvironmentPermissionMapper.toResponse(permission) };
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft delete environment permission" })
  @ApiResponse({
    status: 204,
    description: "Environment permission deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Environment permission not found" })
  async softDelete(@Param("id") id: string): Promise<void> {
    await this.environmentPermissionService.softDelete(id);
  }

  @Post(":id/restore")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Restore deleted environment permission" })
  @ApiResponse({
    status: 200,
    description: "Environment permission restored successfully",
    type: EnvironmentPermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Environment permission not found" })
  async restore(
    @Param("id") id: string,
  ): Promise<{ data: EnvironmentPermissionResponseDto }> {
    const permission = await this.environmentPermissionService.restore(id);
    return { data: EnvironmentPermissionMapper.toResponse(permission) };
  }

  @Delete(":id/hard")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Permanently delete environment permission" })
  @ApiResponse({
    status: 204,
    description: "Environment permission permanently deleted",
  })
  @ApiResponse({ status: 404, description: "Environment permission not found" })
  async hardDelete(@Param("id") id: string): Promise<void> {
    await this.environmentPermissionService.hardDelete(id);
  }
}
