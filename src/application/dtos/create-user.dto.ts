import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice', description: 'Full name of the user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alice@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', description: 'Password (min 6 chars)', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
