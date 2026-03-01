import { Inject, Injectable, Logger } from "@nestjs/common";

import { GamificationRepository } from "../../../domain/repositories";
import { GamificationEvent } from "../../../domain/gamification.model";
import { RedisCacheService } from "../../services/redis-cache.service";
import { CacheKeys } from "../../../../shared/cache-keys-const";

@Injectable()
export class ProcessGamificationDeferredUseCase {
  private readonly logger = new Logger(ProcessGamificationDeferredUseCase.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(event: GamificationEvent): Promise<void> {
    const { userId, action } = event;

    const challengeUpdate = await this.repo.incrementChallengeProgressForAction(
      userId,
      action,
    );

    if (challengeUpdate.completed > 0) {
      this.logger.log(
        `Completed ${challengeUpdate.completed} challenge(s) for user ${userId} on action ${action}`,
      );
    }

    await this.invalidateGamificationCaches(userId);
  }

  private async invalidateGamificationCaches(userId: string): Promise<void> {
    await Promise.all([
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.PROFILE(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.SUMMARY(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.XP_TODAY(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.XP_WEEK(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.STREAKS(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.USER_MILESTONES(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.RECENT_MILESTONES(userId)),
      this.cacheService.invalidate(CacheKeys.GAMIFICATION.MASTERIES(userId)),
      this.cacheService.invalidate(
        CacheKeys.GAMIFICATION.USER_CHALLENGES(userId, true),
      ),
      this.cacheService.invalidate(
        CacheKeys.GAMIFICATION.USER_CHALLENGES(userId, false),
      ),
    ]);
  }
}
