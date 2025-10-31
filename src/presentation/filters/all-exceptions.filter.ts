import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawResponse: any = isHttp ? exception.getResponse() : null;
    let message: string | null = null;
    let details: unknown = null;
    let code: string | null = null;

    if (isHttp) {
      if (typeof rawResponse === "string") {
        message = rawResponse;
      } else if (rawResponse && typeof rawResponse === "object") {
        if (Array.isArray(rawResponse.message)) {
          details = rawResponse.message;
          message = rawResponse.message[0] ?? null;
        } else {
          message = rawResponse.message ?? rawResponse.error ?? null;
        }
        code = rawResponse.code ?? null;
      }
    } else {
      message = (exception as any)?.message ?? "Internal server error";
    }

    const errorPayload = {
      statusCode: status,
      error: {
        message,
        details,
        code,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Don't wrap errors for /auth and /health endpoints
    // These endpoints use a simpler error format
    const path = request.url;
    if (path.startsWith('/auth') || path.startsWith('/health')) {
      const simpleError: any = {
        statusCode: status,
        message: message || 'Error',
        timestamp: errorPayload.timestamp,
        path: request.url,
      };
      
      if (details) {
        simpleError.details = details;
      }
      
      response.status(status).json(simpleError);
      return;
    }

    // Return the error wrapped inside { data: ... } to keep successful and
    // error responses consistent (both under the `data` key).
    response.status(status).json({ data: errorPayload });
  }
}
