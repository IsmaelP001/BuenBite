export interface RetryOptions {
  maxAttempts?: number;
  delay?: number; // ms
  backoff?: boolean; // exponential backoff
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Decorador que reintenta operaciones fallidas
 * Útil para operaciones de red o BD que pueden fallar temporalmente
 */
export function Retry(options: RetryOptions = {}): MethodDecorator {
  const maxAttempts = options.maxAttempts || 3;
  const delay = options.delay || 1000;
  const backoff = options.backoff ?? true;

  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = String(propertyKey);

    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          
          if (attempt === maxAttempts) {
            console.error(`❌ ${target.constructor.name}.${methodName}() falló después de ${maxAttempts} intentos`);
            throw error;
          }
          
          const waitTime = backoff ? delay * attempt : delay;
          console.warn(`⚠️  ${target.constructor.name}.${methodName}() - Intento ${attempt}/${maxAttempts} falló. Reintentando en ${waitTime}ms...`);
          
          if (options.onRetry) {
            options.onRetry(attempt, error);
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      throw lastError;
    };

    return descriptor;
  };
}
