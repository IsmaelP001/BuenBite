import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { SocialFacadeImpl } from "../application/facades/social-facade";
import { SocialServiceImpl } from "../application/services/social-service-impl";
import { SocialProcessor, SOCIAL_QUEUE } from "../application/services/social-processor";
import { CreatePostUseCase } from "../application/use-cases/social/create-post.use-case";
import { SocialController } from "../insfrastructure/controller/social-controller";
import { SocialRepositoryImpl } from "../insfrastructure/repositories/social-repository-impl";
import { GamificationModule } from "./gamification.module";
import { UploadModule } from "./upload.module";
import { createNoopQueue, isUpstashRestMode } from "./queue-fallback";

const useUpstashRest = isUpstashRestMode();
const queueImports = useUpstashRest
  ? []
  : [
      BullModule.registerQueue({
        name: SOCIAL_QUEUE,
      }),
    ];
const queueProviders = useUpstashRest
  ? [
      {
        provide: getQueueToken(SOCIAL_QUEUE),
        useValue: createNoopQueue(SOCIAL_QUEUE),
      },
    ]
  : [];

@Module({
  imports: [
    CacheModule.register(),
    ...queueImports,
    GamificationModule,
    UploadModule,
  ],
  controllers: [SocialController],
  providers: [
    ...queueProviders,
    SocialProcessor,
    {
      provide: "SocialFacade",
      useClass: SocialFacadeImpl,
    },
    {
      provide: "SocialService",
      useClass: SocialServiceImpl,
    },
    {
      provide: "SocialRepository",
      useClass: SocialRepositoryImpl,
    },
    CreatePostUseCase,
  ],
  exports: ["SocialFacade", "SocialService"],
})
export class SocialModule {}
