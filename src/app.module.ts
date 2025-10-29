import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { UserModule } from "./presentation/user/user.module";
import { AuthModule } from "./presentation/auth";
import { JwtAuthGuard } from "./infrastructure/auth";
import { DatabaseModule } from "./infrastructure/database";
import { ObservabilityModule } from "./infrastructure/observability";
import { LoggingInterceptor, HealthController } from "./presentation/observability";

@Module({
  imports: [DatabaseModule, ObservabilityModule, AuthModule, UserModule],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
