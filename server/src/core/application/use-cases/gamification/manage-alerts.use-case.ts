import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { GamificationRepository } from "../../../domain/repositories";
import {
  GamificationAlert,
} from "../../../domain/gamification.model";
import { RedisCacheService } from "../../services/redis-cache.service";
import { CacheKeys, CacheTTL } from "../../../../shared/cache-keys-const";
import { GAMIFICATION_ALERTS_QUEUE } from "../../services/gamification-service-impl";

@Injectable()
export class ManageAlertsUseCase {
  private readonly logger = new Logger(ManageAlertsUseCase.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
    @InjectQueue(GAMIFICATION_ALERTS_QUEUE)
    private readonly gamificationQueue: Queue,
    private readonly cacheService: RedisCacheService,
  ) {}

  /**
   * Stores alert in Redis for immediate client availability,
   * then emits to the queue for DB persistence.
   * 0 DB queries — Redis SET + BullMQ queue.add only.
   */
  async storeAlertInRedisAndQueue(alert: GamificationAlert): Promise<void> {
    const existing =
      (await this.cacheService.get<GamificationAlert[]>(
        CacheKeys.GAMIFICATION.ALERTS(alert.userId),
      )) ?? [];

    const updated = [alert, ...existing];

    await this.cacheService.set(
      CacheKeys.GAMIFICATION.ALERTS_PREFIX,
      CacheKeys.GAMIFICATION.ALERTS(alert.userId),
      updated,
      CacheTTL.LONG,
    );

    await this.gamificationQueue.add("persist-alert", alert, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });

    this.logger.log(
      `Alert created for user ${alert.userId}: ${alert.alertType} - ${alert.title}`,
    );
  }

  async getUserAlerts(userId: string): Promise<GamificationAlert[]> {
    const cached = await this.cacheService.get<GamificationAlert[]>(
      CacheKeys.GAMIFICATION.ALERTS(userId),
    );

    if (cached && cached.length > 0) {
      return cached;
    }

    const dbAlerts = await this.repo.getUserAlerts(userId, true);

    if (dbAlerts.length > 0) {
      await this.cacheService.set(
        CacheKeys.GAMIFICATION.ALERTS_PREFIX,
        CacheKeys.GAMIFICATION.ALERTS(userId),
        dbAlerts,
        CacheTTL.LONG,
      );
    }

    return dbAlerts;
  }

  async dismissAlert(alertId: string, userId: string): Promise<void> {
    const cached = await this.cacheService.get<GamificationAlert[]>(
      CacheKeys.GAMIFICATION.ALERTS(userId),
    );

    if (cached) {
      const updated = cached.filter((a) => a.id !== alertId);
      if (updated.length > 0) {
        await this.cacheService.set(
          CacheKeys.GAMIFICATION.ALERTS_PREFIX,
          CacheKeys.GAMIFICATION.ALERTS(userId),
          updated,
          CacheTTL.LONG,
        );
      } else {
        await this.cacheService.invalidate(
          CacheKeys.GAMIFICATION.ALERTS(userId),
        );
      }
    }

    await this.repo.dismissAlert(alertId, userId);
  }

  async dismissAllAlerts(userId: string): Promise<void> {
    await this.cacheService.invalidate(
      CacheKeys.GAMIFICATION.ALERTS(userId),
    );
    await this.repo.dismissAllAlerts(userId);
  }
}
