import { Module } from "@nestjs/common";
import { UploadController } from "../insfrastructure/controller/upload-controller";
import { UploadFacadeImpl } from "../application/facades/upload-facade";
import { UploadServiceImpl } from "../application/services/upload-service-impl";
import { SupabaseUploadRepository } from "../insfrastructure/repositories/upload-repository-impl";
import { MulterModule } from "@nestjs/platform-express";
import { AuthModule } from "./auth.module";
import { NutritionCalculatorService } from "../application/services/nutricional-calculator.service";

@Module({
  imports: [
    MulterModule.register({
      storage: "memory",
    }),
    AuthModule,
  ],
  controllers: [UploadController],

  providers: [
    {
      provide: "UploadFacade",
      useClass: UploadFacadeImpl,
    },
    {
      provide: "UploadService",
      useClass: UploadServiceImpl,
    },
    {
      provide: "UploadRepository",
      useClass: SupabaseUploadRepository,
    },
  ],
  exports: ["UploadFacade", "UploadService"],
})
export class UploadModule {}
