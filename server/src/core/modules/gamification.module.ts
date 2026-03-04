import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { GamificationController } from "../insfrastructure/controller/gamification-controller";
import { GamificationFacadeImpl } from "../application/facades/gamification-facade";
import {
  GamificationServiceImpl,
  GAMIFICATION_ALERTS_QUEUE,
  GAMIFICATION_CRITICAL_QUEUE,
  GAMIFICATION_DEFERRED_QUEUE,
} from "../application/services/gamification-service-impl";
import {
  GamificationAlertsProcessor,
  GamificationCriticalProcessor,
  GamificationDeferredProcessor,
} from "../application/services/gamification-processor";
import { GamificationRepositoryImpl } from "../insfrastructure/repositories/gamification-repository-impl";
import { SOCIAL_QUEUE } from "../application/services/social-processor";
import {
  ManageAlertsUseCase,
  CheckMilestonesUseCase,
  ProcessGamificationDeferredUseCase,
  ProcessGamificationEventUseCase,
  ProcessWeeklyRankingsUseCase,
} from "../application/use-cases/gamification";
import { createNoopQueue, isUpstashRestMode } from "./queue-fallback";

const useUpstashRest = isUpstashRestMode();
const queueImports = useUpstashRest
  ? []
  : [
      BullModule.registerQueue({
        name: GAMIFICATION_CRITICAL_QUEUE,
      }),
      BullModule.registerQueue({
        name: GAMIFICATION_DEFERRED_QUEUE,
      }),
      BullModule.registerQueue({
        name: GAMIFICATION_ALERTS_QUEUE,
      }),
      BullModule.registerQueue({
        name: SOCIAL_QUEUE,
      }),
    ];
const queueProviders = useUpstashRest
  ? [
      {
        provide: getQueueToken(GAMIFICATION_CRITICAL_QUEUE),
        useValue: createNoopQueue(GAMIFICATION_CRITICAL_QUEUE),
      },
      {
        provide: getQueueToken(GAMIFICATION_DEFERRED_QUEUE),
        useValue: createNoopQueue(GAMIFICATION_DEFERRED_QUEUE),
      },
      {
        provide: getQueueToken(GAMIFICATION_ALERTS_QUEUE),
        useValue: createNoopQueue(GAMIFICATION_ALERTS_QUEUE),
      },
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
  ],
  controllers: [GamificationController],
  providers: [
    ...queueProviders,
    GamificationCriticalProcessor,
    GamificationDeferredProcessor,
    GamificationAlertsProcessor,
    // ── Use Cases ──────────────────────────────────────────────────
    ManageAlertsUseCase,
    CheckMilestonesUseCase,
    ProcessGamificationDeferredUseCase,
    ProcessGamificationEventUseCase,
    ProcessWeeklyRankingsUseCase,
    // ── Facade + Service + Repository ─────────────────────────────
    {
      provide: "GamificationFacade",
      useClass: GamificationFacadeImpl,
    },
    {
      provide: "GamificationService",
      useClass: GamificationServiceImpl,
    },
    {
      provide: "GamificationRepository",
      useClass: GamificationRepositoryImpl,
    },
  ],
  exports: ["GamificationFacade", "GamificationService"],
})
export class GamificationModule {}
