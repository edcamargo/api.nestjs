import { Module } from "@nestjs/common";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { USER_REPOSITORY } from "../../domain/user/user.constants";
import { UserService } from "../../application/services/user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [],
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
