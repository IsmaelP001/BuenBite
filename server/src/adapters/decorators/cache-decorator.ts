import 'reflect-metadata';

export interface CacheableOptions {
  prefix: string;
  ttl?: number; // en milisegundos
  keyGenerator?: (...args: any[]) => string;
}

/**
 * Decorador que intercepta métodos y agrega lógica de caché
 * Funciona en CUALQUIER clase que tenga cacheManagement inyectado
 */
export function Cacheable(options: CacheableOptions): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = String(propertyKey);
    
    console.log(`🎨 @Cacheable registrado: ${target.constructor.name}.${methodName}`);

    descriptor.value = async function (...args: any[]) {
      const instance = this as any;
      
      // Verificar si tiene cacheManagement
      if (!instance.cacheManagement) {
        console.warn(`⚠️  ${target.constructor.name}.${methodName}: No se encontró 'cacheManagement', ejecutando sin caché`);
        return originalMethod.apply(this, args);
      }

      // Generar cache key
      const cacheKey = options.keyGenerator
        ? `${options.prefix}:${options.keyGenerator(...args)}`
        : `${options.prefix}:${JSON.stringify(args)}`;

      // Intentar obtener del caché
      const cached = await instance.cacheManagement.get(cacheKey);
      if (cached !== undefined && cached !== null) {
        console.log(`✅ Cache HIT service: ${cacheKey}`);
        return cached;
      }

      console.log(`❌ Cache MISS service: ${cacheKey}`);

      // Ejecutar método original
      const result = await originalMethod.apply(this, args);

      // Guardar en caché
      const ttl = options.ttl || 900000; // 15 min por defecto
      await instance.cacheManagement.set(options.prefix, cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}
