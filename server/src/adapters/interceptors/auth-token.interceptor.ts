import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthTokenProvider } from '../../core/application/services/authTokenProvider';

@Injectable()
export class AuthTokenInterceptor implements NestInterceptor {
  constructor(private readonly authTokenProvider: AuthTokenProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.token;

    if (token) {
      this.authTokenProvider.setToken(token);
    }

    return next.handle();
  }
}
