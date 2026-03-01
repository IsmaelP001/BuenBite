import { Module, Scope } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtService } from "../application/services/jwt-service-impl";
import { AuthGuard } from "../../adapters/guards/authGuard";
import { AuthTokenInterceptor } from "../../adapters/interceptors/auth-token.interceptor";
import { AuthTokenProvider } from "../application/services/authTokenProvider";

@Module({
  providers: [
    JwtService,
    AuthTokenProvider,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: AuthTokenInterceptor,
    },
  ],
  exports: [AuthTokenProvider],
})
export class AuthModule {}
