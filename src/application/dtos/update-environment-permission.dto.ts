import { PartialType } from '@nestjs/swagger';
import { CreateEnvironmentPermissionDto } from './create-environment-permission.dto';

export class UpdateEnvironmentPermissionDto extends PartialType(CreateEnvironmentPermissionDto) {}
