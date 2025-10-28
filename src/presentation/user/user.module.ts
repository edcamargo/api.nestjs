import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/user/user.constants';
import { UserService } from '../../application/services/user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule { }
