import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/customErrors';
import { Injectable, NestMiddleware } from '@nestjs/common';

// export const errorHandler = (
//   error: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   console.error(`Error: ${error.message}`);
//   console.error(error.stack);

//   if (error instanceof AppError) {
//     res.status(error.statusCode).json({
//       success: false,
//       error: error.code,
//       message: error.message,
//       details: error.details,
//       timestamp: error.timestamp,
//       path: req.path
//     });
//     return;
//   }

//   if (error instanceof ZodError) {
//     res.status(400).json({
//       success: false,
//       error: 'ZOD_VALIDATION_ERROR',
//       message: 'Error de validación en los datos enviados',
//       details: error.errors,
//       timestamp: new Date().toISOString(),
//       path: req.path
//     });
//     return;
//   }

//   // Error por defecto
//   res.status(500).json({
//     success: false,
//     error: 'INTERNAL_SERVER_ERROR',
//     message: 'Error interno del servidor',
//     timestamp: new Date().toISOString(),
//     path: req.path
//   });
// };




@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.getStatus()).json({
          status: 'error',
          message: err.message,
          details: err.details ?? null,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

