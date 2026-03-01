import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../errors/customErrors';


export class ZodValidator {
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  static validateAsync<T>(schema: ZodSchema<T>, data: unknown): Promise<T> {
    try {
      return schema.parseAsync(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  static safeParse<T>(schema: ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: ValidationError;
  } {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { 
      success: false, 
      error: ValidationError.fromZodError(result.error) 
    };
  }
}