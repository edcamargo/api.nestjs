import { Controller, Post, Body, Get, Param, Put, Delete, HttpCode } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { instanceToPlain } from 'class-transformer';
import { toResponse } from '../../application/mappers/user.mapper';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(private readonly service: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.service.create(dto);
    return instanceToPlain(toResponse(user));
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  async findAll() {
    const users = await this.service.findAll();
    return users.map((u) => instanceToPlain(toResponse(u)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string) {
    const user = await this.service.findById(id);
    return instanceToPlain(toResponse(user));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.service.update(id, dto);
    return instanceToPlain(toResponse(user));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    // 204 No Content — explicit return not required
  }
}
