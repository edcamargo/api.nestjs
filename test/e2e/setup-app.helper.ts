import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "../../src/presentation/filters/all-exceptions.filter";
import { ResponseInterceptor } from "../../src/presentation/filters/response.interceptor";
import { LoggerService } from "../../src/infrastructure/observability/logger.service";

/**
 * Setup the NestJS application with global pipes, filters, and interceptors
 * This ensures the E2E tests run with the same configuration as production
 */
export function setupApp(app: INestApplication): void {
  // Global validation pipe: whitelist incoming payloads and transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Get LoggerService from the app context
  const loggerService = app.get(LoggerService);

  // Global exception filter to standardize error envelope
  app.useGlobalFilters(new AllExceptionsFilter(loggerService));

  // Global response interceptor to envelope successful responses as { data: ... }
  app.useGlobalInterceptors(new ResponseInterceptor());
}
