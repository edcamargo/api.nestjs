import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoggerService } from "../../infrastructure/observability/logger.service";
import type { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.logRequest(method, url, statusCode, responseTime);
        },
        error: (err: unknown) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          this.logger.logRequest(method, url, statusCode, responseTime);

          if (err instanceof Error) {
            this.logger.error(
              `Error processing ${method} ${url}`,
              err.stack,
              "LoggingInterceptor",
            );
          }
        },
      }),
    );
  }
}
