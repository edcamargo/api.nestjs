import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let rawResponse: any = isHttp ? (exception as HttpException).getResponse() : null;
    let message: string | null = null;
    let details: unknown = null;
    let code: string | null = null;

    if (isHttp) {
      if (typeof rawResponse === 'string') {
        message = rawResponse;
      } else if (rawResponse && typeof rawResponse === 'object') {
        if (Array.isArray((rawResponse as any).message)) {
          details = (rawResponse as any).message;
          message = (rawResponse as any).message[0] ?? null;
        } else {
          message = (rawResponse as any).message ?? (rawResponse as any).error ?? null;
        }
        code = (rawResponse as any).code ?? null;
      }
    } else {
      message = (exception as any)?.message ?? 'Internal server error';
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

    // Return the error wrapped inside { data: ... } to keep successful and
    // error responses consistent (both under the `data` key).
    response.status(status).json({ data: errorPayload });
  }
}
