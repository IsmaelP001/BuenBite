export interface CacheInvalidateOptions {
  prefixes?: string[];
  keys?: (...args: any[]) => string[];
}

/**
 * Decorador que invalida caché después de ejecutar un método
 * Útil para mutaciones (create, update, delete)
 */
export function CacheInvalidate(options: CacheInvalidateOptions): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = String(propertyKey);
    
    console.log(`🗑️  @CacheInvalidate registrado: ${target.constructor.name}.${methodName}`);

    descriptor.value = async function (...args: any[]) {
      const instance = this as any;
      
      // Ejecutar método original primero
      const result = await originalMethod.apply(this, args);

      // Invalidar caché después de la operación exitosa
      if (instance.cacheManagement) {
        // Invalidar por prefijos
        if (options.prefixes && options.prefixes.length > 0) {
          console.log(`🗑️  Invalidando prefijos:`, options.prefixes);
          for (const prefix of options.prefixes) {
            await instance.cacheManagement.invalidatePrefix(prefix);
          }
        }
        
        // Invalidar keys específicas
        if (options.keys) {
          const keysToInvalidate = options.keys(...args);
          if (keysToInvalidate.length > 0) {
            console.log(`🗑️  Invalidando keys:`, keysToInvalidate);
            await instance.cacheManagement.invalidateMultiple(keysToInvalidate);
          }
        }
      }

      return result;
    };

    return descriptor;
  };
}