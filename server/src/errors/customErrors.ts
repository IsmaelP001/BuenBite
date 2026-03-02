import { ZodError } from "zod";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ValidationError as ClassValidatorError } from "class-validator";

// Códigos principales de error
export type ErrorType =
  | "USER_NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "ACTIVE_ORDER_EXISTS"
  | "INSUFFICIENT_STOCK"
  | "DUPLICATE_EMAIL"
  | "CONFLICT_ERROR"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_VIOLATION"
  | "RESOURCE_NOT_FOUND"
  | "ZOD_VALIDATION_ERROR";

// Subcódigos específicos organizados por categorías
export const ERROR_SUBCODES = {
  VALIDATION: {
    FIELD_REQUIRED: "FIELD_REQUIRED",
    FIELD_INVALID: "FIELD_INVALID",
    QUANTITY_NOT_REGISTERED: "QUANTITY_NOT_REGISTERED",
    INVALID_MEASUREMENT_UNIT: "INVALID_MEASUREMENT_UNIT",
    INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
    DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  },
  BUSINESS_RULES: {
    QUANTITY_NOT_REGISTERED: "QUANTITY_NOT_REGISTERED",
    PRODUCT_DISCONTINUED: "PRODUCT_DISCONTINUED",
    STOCK_BELOW_MINIMUM: "STOCK_BELOW_MINIMUM",
    INSUFICCIENT_STOCK: "INSUFICCIENT_STOCK",
    ORDER_LIMIT_EXCEEDED: "ORDER_LIMIT_EXCEEDED",
    PAYMENT_METHOD_UNAVAILABLE: "PAYMENT_METHOD_UNAVAILABLE",
  },
  RESOURCES: {
    USER_NOT_FOUND: "USER_NOT_FOUND",
    PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
    ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  },
} as const;

export type ErrorSubCode =
  | (typeof ERROR_SUBCODES.VALIDATION)[keyof typeof ERROR_SUBCODES.VALIDATION]
  | (typeof ERROR_SUBCODES.BUSINESS_RULES)[keyof typeof ERROR_SUBCODES.BUSINESS_RULES]
  | (typeof ERROR_SUBCODES.RESOURCES)[keyof typeof ERROR_SUBCODES.RESOURCES];


  export interface ErrorContext {
  field?: string;
  value?: any;
  resourceId?: string;
  resourceType?: string;
  constraints?: Record<string, any>;
  suggestions?: string[];
  severity?: "low" | "medium" | "high" | "critical";
}

export class AppError extends HttpException {
  public readonly code: ErrorType;
  public readonly subCode?: ErrorSubCode;
  public readonly context?: ErrorContext;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatus,
    code: ErrorType,
    subCode?: ErrorSubCode,
    context?: ErrorContext,
    isOperational: boolean = true
  ) {
    const responseBody = {
      success: false,
      error: {
        code,
        subCode,
        message,
        context,
        severity: context?.severity || "medium",
      },
      timestamp: new Date().toISOString(),
    };

    super(responseBody, statusCode);

    this.code = code;
    this.subCode = subCode;
    this.context = context;
    this.timestamp = responseBody.timestamp;
    this.isOperational = isOperational;
  }
}

export class ValidationError extends AppError {
  public invalidFields?: Record<string, any>;

  constructor(
    message: string,
    subCode?: ErrorSubCode,
    context?: ErrorContext,
    invalidFields?: Record<string, any>
  ) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      "VALIDATION_ERROR",
      subCode,
      context
    );
    this.invalidFields = invalidFields;
  }

  static fromZodError(zodError: ZodError): ValidationError {
    const details = zodError.errors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
      code: error.code,
      received:
        error.code === "invalid_type" ? (error as any).received : undefined,
      expected:
        error.code === "invalid_type" ? (error as any).expected : undefined,
    }));

    const firstError = zodError.errors[0];
    const fieldName = firstError.path.join(".");

    // Convertir a formato invalidFields
    const invalidFields: any = {};
    zodError.errors.forEach((error) => {
      const field = error.path.join(".");
      invalidFields[field] = error.message;
    });

    return new ValidationError(
      `Error de validación en el campo '${fieldName}': ${firstError.message}`,
      ERROR_SUBCODES.VALIDATION.FIELD_INVALID,
      {
        field: fieldName,
        constraints: { zodErrors: details },
        severity: "medium",
      },
      invalidFields
    );
  }

  static fromClassValidatorErrors(
    errors: ClassValidatorError[]
  ): ValidationError {
    const field = errors[0].property;
    const formatted = errors.map((e) => ({
      field: e.property,
      constraints: e.constraints,
    }));

    // Convertir a formato invalidFields
    const invalidFields: any = {};
    errors.forEach((error) => {
      if (error.constraints) {
        invalidFields[error.property] = Object.values(error.constraints)[0];
      }
    });

    return new ValidationError(
      `Error de validación en el campo '${field}'`,
      ERROR_SUBCODES.VALIDATION.FIELD_INVALID,
      {
        field,
        constraints: { validatorErrors: formatted },
        severity: "medium",
      },
      invalidFields
    );
  }

  // Método estático para crear desde el formato del GlobalExceptionFilter
  static fromInvalidFields(
    invalidFields: Record<string, any>
  ): ValidationError {
    const firstField = Object.keys(invalidFields)[0];

    return new ValidationError(
      "Error de validación en los datos enviados",
      ERROR_SUBCODES.VALIDATION.FIELD_INVALID,
      {
        severity: "medium",
      },
      invalidFields
    );
  }

  static required(field: string): ValidationError {
    return new ValidationError(
      `El campo '${field}' es requerido`,
      ERROR_SUBCODES.VALIDATION.FIELD_REQUIRED,
      {
        field,
        severity: "high",
        suggestions: [`Proporcione un valor válido para el campo '${field}'`],
      },
      { [field]: `El campo '${field}' es requerido` }
    );
  }

  static quantityNotRegistered(
    productId: string,
    quantity: number,
    availableQuantities?: number[]
  ): ValidationError {
    return new ValidationError(
      `La cantidad ${quantity} no está registrada para el producto`,
      ERROR_SUBCODES.VALIDATION.QUANTITY_NOT_REGISTERED,
      {
        field: "quantity",
        value: quantity,
        resourceId: productId,
        resourceType: "product",
        constraints: { availableQuantities },
        severity: "medium",
        suggestions: availableQuantities
          ? [`Cantidades disponibles: ${availableQuantities.join(", ")}`]
          : ["Consulte las cantidades disponibles para este producto"],
      },
      {
        quantity: `La cantidad ${quantity} no está registrada para el producto`,
      }
    );
  }

  static invalidMeasurementUnit(
    field: string,
    value: string,
    validUnits: string[]
  ): ValidationError {
    return new ValidationError(
      `La unidad de medida '${value}' no es válida`,
      ERROR_SUBCODES.VALIDATION.INVALID_MEASUREMENT_UNIT,
      {
        field,
        value,
        constraints: { validUnits },
        severity: "medium",
        suggestions: [`Unidades válidas: ${validUnits.join(", ")}`],
      },
      { [field]: `La unidad de medida '${value}' no es válida` }
    );
  }
}
export class BusinessRuleError extends AppError {
  constructor(message: string, subCode?: ErrorSubCode, context?: ErrorContext) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      "BUSINESS_RULE_VIOLATION",
      subCode,
      context
    );
  }

  static productDiscontinued(
    productId: string,
    discontinuedDate: Date
  ): BusinessRuleError {
    return new BusinessRuleError(
      "El producto ha sido descontinuado y no está disponible para compra",
      ERROR_SUBCODES.BUSINESS_RULES.PRODUCT_DISCONTINUED,
      {
        resourceId: productId,
        resourceType: "product",
        constraints: { discontinuedDate: discontinuedDate.toISOString() },
        severity: "high",
        suggestions: ["Seleccione un producto alternativo disponible"],
      }
    );
  }

  static stockBelowMinimum(
    productId: string,
    currentStock: number,
    minimumStock: number
  ): BusinessRuleError {
    return new BusinessRuleError(
      `Stock insuficiente. Stock actual: ${currentStock}, mínimo requerido: ${minimumStock}`,
      ERROR_SUBCODES.BUSINESS_RULES.STOCK_BELOW_MINIMUM,
      {
        resourceId: productId,
        resourceType: "product",
        constraints: { currentStock, minimumStock },
        severity: "high",
        suggestions: [
          "Reduzca la cantidad solicitada o seleccione otro producto",
        ],
      }
    );
  }

  static orderLimitExceeded(
    userId: string,
    currentOrders: number,
    maxOrders: number
  ): BusinessRuleError {
    return new BusinessRuleError(
      `Límite de órdenes excedido. Órdenes activas: ${currentOrders}, máximo permitido: ${maxOrders}`,
      ERROR_SUBCODES.BUSINESS_RULES.ORDER_LIMIT_EXCEEDED,
      {
        resourceId: userId,
        resourceType: "user",
        constraints: { currentOrders, maxOrders },
        severity: "medium",
        suggestions: [
          "Complete o cancele órdenes existentes antes de crear una nueva",
        ],
      }
    );
  }
}


export class ConflictError extends AppError {
  constructor(message: string, subCode?: ErrorSubCode, context?: ErrorContext) {
    super(message, HttpStatus.CONFLICT, "CONFLICT_ERROR", subCode, context);
  }

  /**
   * Genérico: algo ya existe (violación de unique constraint)
   */
  static alreadyExists(
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ): ConflictError {
    return new ConflictError(
      `${resourceType} ya existe`,
      undefined, // aquí pones un subCode real de tu sistema si lo tienes
      {
        resourceId,
        resourceType,
        constraints: details,
        severity: "medium",
        suggestions: ["Verifique si ya lo creó antes de intentar de nuevo"],
      }
    );
  }

  /**
   * Caso específico de orden activa
   */
  static activeOrderExists(
    userId: string,
    blockedItems?: any[]
  ): ConflictError {
    return new ConflictError(
      "Ya existe una orden de compra activa para algunos productos",
      ERROR_SUBCODES.BUSINESS_RULES.ORDER_LIMIT_EXCEEDED,
      {
        resourceId: userId,
        resourceType: "user",
        constraints: { blockedItems },
        severity: "medium",
        suggestions: ["Complete la orden existente antes de crear una nueva"],
      }
    );
  }

  /**
   * Caso específico: pantry
   */
  static pantryItemExists(
    userId: string,
    ingredientId: string
  ): ConflictError {
    return new ConflictError(
      "El ingrediente ya está en la despensa del usuario",
      undefined, // o el subCode que tengas para Pantry
      {
        resourceId: userId,
        resourceType: "pantry",
        constraints: { ingredientId },
        severity: "low",
        suggestions: ["Actualice la cantidad en lugar de crear un duplicado"],
      }
    );
  }
}



export class NotFoundError extends AppError {
  constructor(
    message: string,
    subCode: ErrorSubCode = ERROR_SUBCODES.RESOURCES.PRODUCT_NOT_FOUND,
    context?: ErrorContext
  ) {
    super(
      message,
      HttpStatus.NOT_FOUND, 
      "RESOURCE_NOT_FOUND",
      subCode,
      context
    );
  }

  static userNotFound(userId: string): NotFoundError {
    return new NotFoundError(
      "El usuario no fue encontrado",
      ERROR_SUBCODES.RESOURCES.USER_NOT_FOUND,
      {
        resourceId: userId,
        resourceType: "user",
        severity: "medium",
        suggestions: ["Verifique que el usuario exista en la base de datos"],
      }
    );
  }

  static productNotFound(productId: string): NotFoundError {
    return new NotFoundError(
      "El producto no fue encontrado",
      ERROR_SUBCODES.RESOURCES.PRODUCT_NOT_FOUND,
      {
        resourceId: productId,
        resourceType: "product",
        severity: "medium",
        suggestions: ["Seleccione un producto válido o existente"],
      }
    );
  }

  static orderNotFound(orderId: string): NotFoundError {
    return new NotFoundError(
      "La orden no fue encontrada",
      ERROR_SUBCODES.RESOURCES.ORDER_NOT_FOUND,
      {
        resourceId: orderId,
        resourceType: "order",
        severity: "medium",
        suggestions: ["Revise que el ID de la orden sea correcto"],
      }
    );
  }
}
