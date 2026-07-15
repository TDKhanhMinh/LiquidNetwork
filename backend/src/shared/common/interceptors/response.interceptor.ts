import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T | T[]>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T | T[]>> {
    return next.handle().pipe(
      map((data) => {
        const timestamp = new Date().toISOString();

        // Handle case where handler returns nothing (e.g., 204 No Content)
        if (data === undefined || data === null) {
          return {
            success: true,
            data: null as any,
            timestamp,
          };
        }

        let responseData = data;
        let message: string | undefined;
        let meta: any | undefined;

        // Check if data is an object and conforms to our expected wrapper shapes
        if (typeof data === 'object' && !Array.isArray(data)) {
          // Check for PaginatedData shape
          if (data.hasOwnProperty('items') && data.hasOwnProperty('meta')) {
            responseData = data.items;
            meta = data.meta;
            message = data.message;
          } 
          // Check for StandardResponse shape (explicit { data, message } return)
          else if (data.hasOwnProperty('data') && Object.keys(data).length <= 2) {
            // We check length to avoid accidentally extracting from a domain object 
            // that just happens to have a 'data' property.
            responseData = data.data;
            message = data.message;
          }
        }

        const response: ApiResponse<T | T[]> = {
          success: true,
          data: responseData,
          timestamp,
        };

        if (message) {
          response.message = message;
        }

        if (meta) {
          response.meta = meta;
        }

        return response;
      }),
    );
  }
}
