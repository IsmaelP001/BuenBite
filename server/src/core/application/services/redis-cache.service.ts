/**
 * Redis Cache Service
 *
 * Production-grade caching layer using Redis.
 * Provides automatic get-or-set semantics and prefix-based invalidation.
 */
import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';

export interface RedisCacheOptions {
  prefix: string;
  ttlMs?: number;
}

@Injectable()
export class RedisCacheService implements OnModuleInit {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly keyRegistry = new Map<string, Set<string>>();
  private readonly DEFAULT_TTL = 900_000; // 15 minutes

  constructor(@Inject('CACHE_MANAGER') private readonly cacheManager: Cache) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('RedisCacheService initialized');
  }

  /**
   * Retrieves a value from cache by key.
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}`, error);
      return undefined;
    }
  }

  /**
   * Stores a value in cache with a prefix for group invalidation.
   */
  async set<T>(prefix: string, key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      if (!this.keyRegistry.has(prefix)) {
        this.keyRegistry.set(prefix, new Set());
      }
      this.keyRegistry.get(prefix)!.add(key);
      await this.cacheManager.set(key, value, ttlMs ?? this.DEFAULT_TTL);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}`, error);
    }
  }

  /**
   * Get from cache, or execute the factory function and cache the result.
   * This is the primary API for service-layer caching.
   */
  async getOrSet<T>(
    key: string,
    prefix: string,
    factory: () => Promise<T>,
    ttlMs: number = this.DEFAULT_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(prefix, key, value, ttlMs);
    return value;
  }

  /**
   * Invalidates all keys registered under a specific prefix.
   */
  async invalidatePrefix(prefix: string): Promise<number> {
    const keys = this.keyRegistry.get(prefix);
    if (!keys || keys.size === 0) return 0;

    await Promise.all(Array.from(keys).map((key) => this.cacheManager.del(key)));
    const count = keys.size;
    this.keyRegistry.delete(prefix);
    this.logger.debug(`Invalidated ${count} keys for prefix: ${prefix}`);
    return count;
  }

  /**
   * Invalidates a single key and removes it from all prefix registries.
   */
  async invalidate(key: string): Promise<void> {
    await this.cacheManager.del(key);
    for (const [prefix, keys] of this.keyRegistry.entries()) {
      if (keys.has(key)) {
        keys.delete(key);
        if (keys.size === 0) this.keyRegistry.delete(prefix);
      }
    }
  }

  /**
   * Invalidates multiple keys at once.
   */
  async invalidateMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await Promise.all(keys.map((key) => this.invalidate(key)));
  }

  /**
   * Clears all cached data managed by this service.
   */
  async clear(): Promise<void> {
    for (const [, keys] of this.keyRegistry.entries()) {
      await Promise.all(Array.from(keys).map((key) => this.cacheManager.del(key)));
    }
    this.keyRegistry.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Returns statistics about the cached keys per prefix.
   */
  getStats(): Array<{ prefix: string; count: number }> {
    return Array.from(this.keyRegistry.entries()).map(([prefix, keys]) => ({
      prefix,
      count: keys.size,
    }));
  }
}
