import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { ILogger, IMetrics } from '../../application/observability';
import { LOGGER, METRICS } from '../../application/observability';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER) private readonly logger: ILogger,
    @Inject(METRICS) private readonly metrics: IMetrics,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const startTime = Date.now();

    this.logger.info(`Incoming request: ${method} ${url}`, 'HTTP', {
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.info(
            `Response: ${method} ${url} ${statusCode} - ${duration}ms`,
            'HTTP',
          );

          this.metrics.incrementRequestCount(method, url, statusCode);
          this.metrics.recordRequestDuration(method, url, duration);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `Error: ${method} ${url} ${statusCode} - ${duration}ms`,
            error.stack,
            'HTTP',
          );

          this.metrics.incrementErrorCount(method, url, statusCode);
          this.metrics.recordRequestDuration(method, url, duration);
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
