import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LoggerService } from "../../infrastructure/observability/logger.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const respObj = exceptionResponse as Record<string, unknown>;
        message =
          (respObj.message as string) || (respObj.error as string) || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message || "An unexpected error occurred";
      const errorCode = (exception as any).code as string | undefined;
      if (errorCode === "ECONNREFUSED") {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = "Service temporarily unavailable";
      }
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      "ExceptionFilter",
    );

    // Skip wrapping for /auth and /health endpoints
    const path = request.url;
    if (path.startsWith("/auth") || path.startsWith("/health")) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Standard error response with data wrapper
    response.status(status).json({
      data: null,
      error: {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        details:
          exception instanceof HttpException &&
          typeof exception.getResponse() === "object"
            ? (exception.getResponse() as Record<string, unknown>).details
            : undefined,
      },
    });
  }
}
