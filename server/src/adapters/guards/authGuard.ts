import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../../core/application/services/jwt-service-impl';
import { IS_PUBLIC_KEY } from '../decorators/public-recorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), 
      context.getClass(),   
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Si es pública Y no hay token, permitir acceso
    if (isPublic && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return true;
    }

    // Si no es pública Y no hay token, rechazar
    if (!isPublic && (!authHeader || !authHeader.startsWith('Bearer '))) {

      throw new UnauthorizedException('Token no proporcionado');
    }

    // Hay token, intentar extraer userId
    const token = authHeader.split(' ')[1];
    const userId = this.jwtService.extractUserId(token);

    // Si es pública Y el token es inválido, permitir acceso de todos modos
    if (isPublic && !userId) {
      return true;
    }

    // Si NO es pública Y el token es inválido, rechazar
    if (!isPublic && !userId) {
      throw new UnauthorizedException('Token inválido');
    }

    // Token válido, poblar el request
    request.userId = userId;
    request.token = token;

    return true;
  }
}