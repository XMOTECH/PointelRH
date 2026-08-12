import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSnakeCase, toCamelCase } from '../utils/case-converter';

/**
 * Global interceptor that:
 *  1. Converts incoming request bodies from snake_case → camelCase (for Prisma/NestJS DTOs)
 *  2. Converts outgoing response bodies from camelCase → snake_case (for the frontend)
 *
 * This bridges the naming convention gap between the React frontend (originally built
 * for a Laravel PHP backend using snake_case) and the NestJS/Prisma backend (camelCase).
 */
@Injectable()
export class CaseConversionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Convert incoming request body from snake_case to camelCase
    if (request.body && typeof request.body === 'object') {
      request.body = toCamelCase(request.body);
    }

    // Convert outgoing response from camelCase to snake_case
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object') {
          return toSnakeCase(data);
        }
        return data;
      }),
    );
  }
}
