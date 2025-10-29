import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoleService } from '../../application/services/role.service';
import { CreateRoleDto } from '../../application/dtos/create-role.dto';
import { UpdateRoleDto } from '../../application/dtos/update-role.dto';
import { RoleResponseDto } from '../../application/dtos/role-response.dto';
import { RoleMapper } from '../../application/mappers/role.mapper';
import { Roles } from '../auth';
import { UserRole } from '../../domain/user/user.entity';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<{ data: RoleResponseDto }> {
    const role = await this.roleService.create(createRoleDto);
    return { data: RoleMapper.toResponse(role) };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: [RoleResponseDto] })
  async findAll(@Query('includeDeleted') includeDeleted?: string): Promise<{ data: RoleResponseDto[] }> {
    const roles = await this.roleService.findAll(includeDeleted === 'true');
    return { data: RoleMapper.toResponseArray(roles) };
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiOperation({ summary: 'Get all active roles' })
  @ApiResponse({ status: 200, description: 'Active roles retrieved successfully', type: [RoleResponseDto] })
  async findActive(): Promise<{ data: RoleResponseDto[] }> {
    const roles = await this.roleService.findActive();
    return { data: RoleMapper.toResponseArray(roles) };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findById(@Param('id') id: string): Promise<{ data: RoleResponseDto }> {
    const role = await this.roleService.findById(id);
    return { data: RoleMapper.toResponse(role) };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<{ data: RoleResponseDto }> {
    const role = await this.roleService.update(id, updateRoleDto);
    return { data: RoleMapper.toResponse(role) };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete role' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.roleService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore deleted role' })
  @ApiResponse({ status: 200, description: 'Role restored successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async restore(@Param('id') id: string): Promise<{ data: RoleResponseDto }> {
    const role = await this.roleService.restore(id);
    return { data: RoleMapper.toResponse(role) };
  }

  @Delete(':id/hard')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete role' })
  @ApiResponse({ status: 204, description: 'Role permanently deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.roleService.hardDelete(id);
  }
}
