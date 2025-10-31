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
import { RoleAssignmentService } from "../../application/services/role-assignment.service";
import { CreateRoleAssignmentDto } from "../../application/dtos/create-role-assignment.dto";
import { UpdateRoleAssignmentDto } from "../../application/dtos/update-role-assignment.dto";
import { RoleAssignmentResponseDto } from "../../application/dtos/role-assignment-response.dto";
import { RoleAssignmentMapper } from "../../application/mappers/role-assignment.mapper";
import { Roles } from "../auth";
import { UserRole } from "../../domain/user/user.entity";

@ApiTags("Role Assignments")
@ApiBearerAuth("JWT-auth")
@Controller("role-assignments")
export class RoleAssignmentController {
  constructor(private readonly roleAssignmentService: RoleAssignmentService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a new role assignment" })
  @ApiResponse({
    status: 201,
    description: "Role assignment created successfully",
    type: RoleAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 400, description: "Invalid date range" })
  async create(
    @Body() createDto: CreateRoleAssignmentDto,
  ): Promise<RoleAssignmentResponseDto> {
    const assignment = await this.roleAssignmentService.create(createDto);
    return RoleAssignmentMapper.toResponse(assignment);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: "Get all role assignments" })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: "Role assignments retrieved successfully",
    type: [RoleAssignmentResponseDto],
  })
  async findAll(
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<RoleAssignmentResponseDto[]> {
    const assignments = await this.roleAssignmentService.findAll(
      includeDeleted === "true",
    );
    return RoleAssignmentMapper.toResponseArray(assignments);
  }

  @Get("user/:userId")
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: "Get role assignments by user ID" })
  @ApiResponse({
    status: 200,
    description: "Role assignments retrieved successfully",
    type: [RoleAssignmentResponseDto],
  })
  async findByUserId(
    @Param("userId") userId: string,
  ): Promise<RoleAssignmentResponseDto[]> {
    const assignments = await this.roleAssignmentService.findByUserId(userId);
    return RoleAssignmentMapper.toResponseArray(assignments);
  }

  @Get("user/:userId/active")
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiOperation({ summary: "Get active role assignments for a user" })
  @ApiResponse({
    status: 200,
    description: "Active role assignments retrieved successfully",
    type: [RoleAssignmentResponseDto],
  })
  async findActiveByUserId(
    @Param("userId") userId: string,
  ): Promise<RoleAssignmentResponseDto[]> {
    const assignments =
      await this.roleAssignmentService.findActiveByUserId(userId);
    return RoleAssignmentMapper.toResponseArray(assignments);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiOperation({ summary: "Get role assignment by ID" })
  @ApiResponse({
    status: 200,
    description: "Role assignment retrieved successfully",
    type: RoleAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Role assignment not found" })
  async findById(@Param("id") id: string): Promise<RoleAssignmentResponseDto> {
    const assignment = await this.roleAssignmentService.findById(id);
    return RoleAssignmentMapper.toResponse(assignment);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update role assignment" })
  @ApiResponse({
    status: 200,
    description: "Role assignment updated successfully",
    type: RoleAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Role assignment not found" })
  @ApiResponse({ status: 400, description: "Invalid date range" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateRoleAssignmentDto,
  ): Promise<RoleAssignmentResponseDto> {
    const assignment = await this.roleAssignmentService.update(id, updateDto);
    return RoleAssignmentMapper.toResponse(assignment);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft delete role assignment" })
  @ApiResponse({
    status: 204,
    description: "Role assignment deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Role assignment not found" })
  async softDelete(@Param("id") id: string): Promise<void> {
    await this.roleAssignmentService.softDelete(id);
  }

  @Post(":id/restore")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Restore deleted role assignment" })
  @ApiResponse({
    status: 200,
    description: "Role assignment restored successfully",
    type: RoleAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Role assignment not found" })
  async restore(@Param("id") id: string): Promise<RoleAssignmentResponseDto> {
    const assignment = await this.roleAssignmentService.restore(id);
    return RoleAssignmentMapper.toResponse(assignment);
  }

  @Delete(":id/hard")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Permanently delete role assignment" })
  @ApiResponse({
    status: 204,
    description: "Role assignment permanently deleted",
  })
  @ApiResponse({ status: 404, description: "Role assignment not found" })
  async hardDelete(@Param("id") id: string): Promise<void> {
    await this.roleAssignmentService.hardDelete(id);
  }
}
