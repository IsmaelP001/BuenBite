import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from "./core/modules/auth.module";
import { CacheModule } from "./core/modules/cache.module";
import { GamificationModule } from "./core/modules/gamification.module";
import { IaModule } from "./core/modules/ia.module";
import { IngredientsModule } from "./core/modules/ingredient.module";
import { MealplanModule } from "./core/modules/mealplan.module";
import { PantryModule } from "./core/modules/pantry.module";
import { PurchaseModule } from "./core/modules/purchase.module";
import { RecipeModule } from "./core/modules/recipes.module";
import { SocialModule } from "./core/modules/social.module";
import { UploadModule } from "./core/modules/upload.module";
import { UserModule } from "./core/modules/user.module";
import { isUpstashRestMode } from "./core/modules/queue-fallback";

const queueModules = isUpstashRestMode()
  ? []
  : [
      BullModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get<string>("REDIS_HOST", "localhost"),
            port: configService.get<number>("REDIS_PORT", 6379),
          },
        }),
        inject: [ConfigService],
      }),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ...queueModules,
    CacheModule,
    MulterModule.register({
      storage: 'memory', 
      fileFilter: (req, file, callback) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          callback(null, true);
        } else {
          callback(new Error('Solo se permiten archivos de imagen'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, 
      },
    }),
    UserModule,
    AuthModule,
    PurchaseModule,
    IngredientsModule,
    PantryModule,
    IaModule,
    UploadModule,
    RecipeModule,
    MealplanModule,
    SocialModule,
    GamificationModule,
  ],
})
export class AppModule {}
