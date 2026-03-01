// cache-interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import 'reflect-metadata';
import { CACHE_KEY_METADATA } from '@nestjs/cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const controller = context.getClass();
    const methodName = handler.name;

    console.log('\n========== INTERCEPTOR ==========');
    console.log('🎯 Controller:', controller.name);
    console.log('🎯 Method:', methodName);
    console.log('🎯 Handler:', handler);

    // Intentar leer metadata de TODOS los lugares posibles
    const metadata1 = Reflect.getMetadata(CACHE_KEY_METADATA, handler);
    const metadata2 = Reflect.getMetadata(CACHE_KEY_METADATA, controller, methodName);
    const metadata3 = Reflect.getMetadata(CACHE_KEY_METADATA, controller.prototype, methodName);
    const metadata4 = Reflect.getOwnMetadata(CACHE_KEY_METADATA, handler);

    console.log('📦 Metadata intento 1 (handler):', metadata1);
    console.log('📦 Metadata intento 2 (controller, methodName):', metadata2);
    console.log('📦 Metadata intento 3 (prototype):', metadata3);
    console.log('📦 Metadata intento 4 (getOwnMetadata):', metadata4);

    // Listar TODAS las metadata keys del handler
    const allKeys = Reflect.getMetadataKeys(handler);
    console.log('🔑 Todas las metadata keys del handler:', allKeys);

    // Listar todas del prototype
    const protoKeys = Reflect.getMetadataKeys(controller.prototype, methodName);
    console.log('🔑 Todas las metadata keys del prototype:', protoKeys);

    console.log('================================\n');

    return next.handle();
  }
}