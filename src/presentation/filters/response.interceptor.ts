import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // Don't wrap responses for auth and health endpoints
    // These endpoints return their own specific response format
    if (path.startsWith('/auth') || path.startsWith('/health')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If the response is already enveloped (has `data`), return as-is
        if (
          data &&
          typeof data === "object" &&
          Object.prototype.hasOwnProperty.call(data, "data")
        ) {
          return data;
        }

        // Otherwise, wrap it in { data: ... }
        return { data };
      }),
    );
  }
}

