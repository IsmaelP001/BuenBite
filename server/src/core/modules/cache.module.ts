import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheManagementService } from '../application/services/cache-service';
import { RedisCacheService } from '../application/services/redis-cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 900000, // 15 minutos por defecto
      max: 10000,  // máximo 10000 items
    }),
  ],
  providers: [CacheManagementService, RedisCacheService],
  exports: [NestCacheModule, CacheManagementService, RedisCacheService],
})
export class CacheModule {}