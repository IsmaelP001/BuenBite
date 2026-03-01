export interface LogOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  includeArgs?: boolean;
  includeResult?: boolean;
  includeDuration?: boolean;
}

/**
 * Decorador que registra ejecución de métodos
 * Útil para debugging y monitoreo
 */
export function LogExecution(options: LogOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const level = options.level || 'info';
    const methodName = String(propertyKey);
    const includeDuration = options.includeDuration ?? true;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const className = target.constructor.name;
      
      console.log(`📝 [${level.toUpperCase()}] ${className}.${methodName}()`);
      
      if (options.includeArgs) {
        console.log(`   📥 Args:`, args);
      }

      try {
        const result = await originalMethod.apply(this, args);
        
        if (includeDuration) {
          const duration = Date.now() - startTime;
          console.log(`✅ ${className}.${methodName}() completado en ${duration}ms`);
        }
        
        if (options.includeResult) {
          console.log(`   📤 Result:`, result);
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${className}.${methodName}() falló después de ${duration}ms:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
