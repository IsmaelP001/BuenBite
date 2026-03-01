import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, ERROR_SUBCODES, ValidationError } from "./customErrors";

interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    subCode?: string;
    message: string;
    context?: any;
    severity?: string;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = this.generateRequestId();

    // ZodError -> convertirlo a ValidationError
    if (exception instanceof ZodError) {
      exception = ValidationError.fromZodError(exception);
    }

    // Detectar errores de class-validator (vienen envueltos en BadRequestException)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && 
          exceptionResponse !== null && 
          (exceptionResponse as any).errors &&
          typeof (exceptionResponse as any).errors === 'object') {
        
        const validationErrors = (exceptionResponse as any).errors;
        const validationError = ValidationError.fromInvalidFields(validationErrors);

        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: validationError.code,
            subCode: validationError.subCode,
            message: validationError.message,
            context: {
              ...validationError.context,
              invalidFields: validationError.invalidFields
            },
            severity: validationError.context?.severity || "medium",
          },
          timestamp: validationError.timestamp,
          path: request.url,
          requestId,
        };

        this.logError(validationError, request, requestId);
        return response.status(validationError.getStatus()).json(errorResponse);
      }
  
    }

    // Si es un AppError personalizado
    if (exception instanceof AppError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: exception.code,
          subCode: exception.subCode,
          message: exception.message,
          context: exception.context,
          severity: exception.context?.severity || "medium",
        },
        timestamp: exception.timestamp,
        path: request.url,
        requestId,
      };

      this.logError(exception, request, requestId);
      return response.status(exception.getStatus()).json(errorResponse);
    }

    // Si es HttpException estándar
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === "string" ? res : (res as any).message || "Error HTTP";

      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: this.getHttpErrorCode(status),
          message,
          context: typeof res === "object" ? res : null,
          severity: this.getHttpErrorSeverity(status),
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      this.logHttpError(exception, request, requestId);
      return response.status(status).json(errorResponse);
    }

    // Error no controlado
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado en el servidor",
        severity: "critical",
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    this.logUnhandledError(exception, request, requestId);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }



  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(
    exception: AppError,
    request: Request,
    requestId: string
  ): void {
    const logContext = {
      requestId,
      url: request.url,
      method: request.method,
      code: exception.code,
      subCode: exception.subCode,
      severity: exception.context?.severity || "medium",
      userAgent: request.get("User-Agent"),
      ip: request.ip,
    };

    switch (exception.context?.severity) {
      case "critical":
        this.logger.error(
          `Critical AppError: ${exception.message}`,
          exception.stack,
          logContext
        );
        break;
      case "high":
        this.logger.error(
          `High Severity AppError: ${exception.message}`,
          logContext
        );
        break;
      case "medium":
        this.logger.warn(
          `Medium Severity AppError: ${exception.message}`,
          logContext
        );
        break;
      case "low":
        this.logger.log(
          `Low Severity AppError: ${exception.message}`,
          logContext
        );
        break;
      default:
        this.logger.warn(`AppError: ${exception.message}`, logContext);
    }
  }

  private logHttpError(
    exception: HttpException,
    request: Request,
    requestId: string
  ): void {
    const status = exception.getStatus();
    const logContext = {
      requestId,
      url: request.url,
      method: request.method,
      statusCode: status,
      userAgent: request.get("User-Agent"),
      ip: request.ip,
    };

    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error: ${exception.message}`,
        exception.stack,
        logContext
      );
    } else if (status >= 400) {
      this.logger.warn(
        `HTTP ${status} Error: ${exception.message}`,
        logContext
      );
    } else {
      this.logger.log(`HTTP ${status} Error: ${exception.message}`, logContext);
    }
  }

  private logUnhandledError(
    exception: any,
    request: Request,
    requestId: string
  ): void {
    const logContext = {
      requestId,
      url: request.url,
      method: request.method,
      errorName: exception?.constructor?.name || "UnknownError",
      userAgent: request.get("User-Agent"),
      ip: request.ip,
    };

    this.logger.error(
      `Unhandled Exception: ${exception?.message || "Unknown error"}`,
      exception?.stack || exception,
      logContext
    );

    if (process.env.NODE_ENV === "production") {
      // Ejemplo: Sentry.captureException(exception, { extra: logContext });
    }
  }

  private getHttpErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.METHOD_NOT_ALLOWED:
        return "METHOD_NOT_ALLOWED";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return "UNPROCESSABLE_ENTITY";
      case HttpStatus.TOO_MANY_REQUESTS:
        return "TOO_MANY_REQUESTS";
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return "INTERNAL_SERVER_ERROR";
      case HttpStatus.BAD_GATEWAY:
        return "BAD_GATEWAY";
      case HttpStatus.SERVICE_UNAVAILABLE:
        return "SERVICE_UNAVAILABLE";
      case HttpStatus.GATEWAY_TIMEOUT:
        return "GATEWAY_TIMEOUT";
      default:
        return `HTTP_${status}`;
    }
  }

  private getHttpErrorSeverity(status: number): string {
    if (status >= 500) {
      return "critical";
    } else if (status >= 400) {
      return "medium";
    } else {
      return "low";
    }
  }
}