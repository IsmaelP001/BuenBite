import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import 'reflect-metadata';
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./errors/GlobalExceptionsFilter";
import { ResponseInterceptor } from "./shared/interceptors/responseInterceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: '*',
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

        const exception = new BadRequestException({
          message: "Validation failed",
          errors: errors, 
          statusCode: 400,
        });

        return exception;
      },
    })
  );

  // IMPORTANTE: Agregar '0.0.0.0' como segundo parámetro
  await app.listen(3003, '0.0.0.0');
  
  console.log(`🚀 API corriendo en:`);
  console.log(`   - Local: http://localhost:3002/api`);
  console.log(`   - Red: http://192.168.1.5:3002/api`);
}
bootstrap();
