import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResponse } from '../dto/response';



@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this.isPaginated(data)) {
          return {
            ok: true,
            data: data.items,
            hasMore: data?.hasMore,
            page:data?.page
          };
        }

        return {
          ok: true,
          data,
        };
      }),
    );
  }

  private isPaginated(data: any): data is PaginatedResponse<any> {
    return (
      data &&
      typeof data === 'object' &&
      'items' in data &&
      'hasMore' in data &&
      Array.isArray(data.items)
    );
  }
}
