import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { INestApplication } from "@nestjs/common";
import { GlobalExceptionFilter } from "./errors/GlobalExceptionsFilter";
import { ResponseInterceptor } from "./shared/interceptors/responseInterceptor";

export function configureNestApp(app: INestApplication) {
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === "production",
      validateCustomDecorators: true,
      exceptionFactory: (validationErrors) => {
        const errors: any = {};

        validationErrors.forEach((error: any) => {
          if (error.constraints) {
            errors[error?.property as keyof unknown] = Object.values(
              error.constraints
            )[0];
          }
        });

        return new BadRequestException({
          message: "Validation failed",
          errors,
          statusCode: 400,
        });
      },
    })
  );
}
