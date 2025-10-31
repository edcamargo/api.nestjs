import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request } from "express";

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { data: T } | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ data: T } | T> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;

    // Skip transformation for /auth and /health endpoints
    if (path.startsWith("/auth") || path.startsWith("/health")) {
      return next.handle();
    }

    // Wrap response in data object for all other endpoints
    return next.handle().pipe(
      map((data: T) => ({
        data,
      })),
    );
  }
}
