import { Injectable, Inject } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheManagementService {
  private keyRegistry = new Map<string, Set<string>>();

  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error(`❌ Error obteniendo cache key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Guardar valor en caché con registro
   */
  async set<T>(prefix: string, key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      // Registrar la key
      if (!this.keyRegistry.has(prefix)) {
        this.keyRegistry.set(prefix, new Set());
      }
      this.keyRegistry.get(prefix)!.add(key);

      // Guardar en caché
      await this.cacheManager.set(key, value, ttlMs);
    } catch (error) {
      console.error(`❌ Error guardando cache key ${key}:`, error);
    }
  }

  /**
   * Obtener o ejecutar (patrón cache-aside)
   */
  async getOrSet<T>(
    key: string,
    prefix: string,
    factory: () => Promise<T>,
    ttlMs: number = 900000,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      console.log(`✅ Cache HIT: ${key}`);
      console.log('cached',cached);
      return cached;
    }

    console.log(`❌ Cache MISS: ${key}`);

    const value = await factory();
    await this.set(prefix, key, value, ttlMs);

    return value;
  }

  /**
   * Invalidar todas las keys de un prefijo
   */
  async invalidatePrefix(prefix: string): Promise<number> {
    const keys = this.keyRegistry.get(prefix);
    if (!keys || keys.size === 0) {
      return 0;
    }

    await Promise.all(
      Array.from(keys).map(key => this.cacheManager.del(key))
    );

    const count = keys.size;
    this.keyRegistry.delete(prefix);
    console.log(`🗑️  Invalidados ${count} keys con prefijo: ${prefix}`);
    return count;
  }

  /**
   * Invalidar una key específica
   */
  async invalidate(key: string): Promise<void> {
    await this.cacheManager.del(key);

    // Remover del registro
    for (const [prefix, keys] of this.keyRegistry.entries()) {
      if (keys.has(key)) {
        keys.delete(key);
        if (keys.size === 0) {
          this.keyRegistry.delete(prefix);
        }
      }
    }
  }

  /**
   * Invalidar múltiples keys
   */
  async invalidateMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await Promise.all(keys.map(key => this.invalidate(key)));
  }

  /**
   * Estadísticas del caché
   */
  getStats(): { prefix: string; count: number }[] {
    return Array.from(this.keyRegistry.entries()).map(([prefix, keys]) => ({
      prefix,
      count: keys.size,
    }));
  }

  /**
   * Limpiar todo el caché
   */
  async clear(): Promise<void> {
    for (const [prefix, keys] of this.keyRegistry.entries()) {
      await Promise.all(Array.from(keys).map(key => this.cacheManager.del(key)));
    }
    this.keyRegistry.clear();
    console.log('🗑️  Caché completamente limpiado');
  }
}
