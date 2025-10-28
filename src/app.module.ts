import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { UserModule } from "./presentation/user/user.module";
import { AuthModule } from "./presentation/auth";
import { JwtAuthGuard } from "./infrastructure/auth";

@Module({
  imports: [AuthModule, UserModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
