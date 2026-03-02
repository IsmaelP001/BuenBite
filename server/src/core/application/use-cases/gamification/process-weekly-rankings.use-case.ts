import { Inject, Injectable, Logger } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";

import { GamificationRepository } from "../../../domain/repositories";
import {
  GamificationAction,
  MasteryCategory,
  WeeklyChefTitle,
  WeeklyTitle,
} from "../../../domain/gamification.model";

@Injectable()
export class ProcessWeeklyRankingsUseCase {
  private readonly logger = new Logger(ProcessWeeklyRankingsUseCase.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
  ) {}

  async execute(): Promise<void> {
    this.logger.log("Processing weekly rankings...");

    try {
      const lastWeekStart = startOfWeek(subDays(new Date(), 7), {
        weekStartsOn: 1,
      });
      const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

      const weekStartStr = format(lastWeekStart, "yyyy-MM-dd");
      const weekEndStr = format(lastWeekEnd, "yyyy-MM-dd");

      const rankings = await this.repo.getWeeklyRankings(weekStartStr, 10);

      if (rankings.length === 0) {
        this.logger.log("No rankings to process this week");
        return;
      }

      const titles: WeeklyChefTitle[] = rankings.map((r) => {
        let title: WeeklyTitle;
        if (r.rank === 1) title = WeeklyTitle.CHEF_DE_ORO;
        else if (r.rank === 2) title = WeeklyTitle.CHEF_DE_PLATA;
        else if (r.rank === 3) title = WeeklyTitle.CHEF_DE_BRONCE;
        else title = WeeklyTitle.CHEF_DESTACADO;

        const bonusXp = r.rank <= 3 ? (4 - r.rank) * 100 : 25;

        return {
          id: uuid(),
          userId: r.userId,
          title,
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr,
          rank: r.rank,
          xpEarned: bonusXp,
          createdAt: new Date(),
        };
      });

      await this.repo.assignWeeklyTitles(titles);

      // Award bonus XP to title holders
      for (const title of titles) {
        if (title.xpEarned > 0) {
          await this.repo.logPoints({
            id: uuid(),
            userId: title.userId,
            action: GamificationAction.CHALLENGE_COMPLETED,
            basePoints: title.xpEarned,
            streakMultiplier: 1,
            totalPoints: title.xpEarned,
            masteryCategory: MasteryCategory.CHEF,
            masteryXpGained: title.xpEarned,
            referenceId: title.id,
            referenceType: "weekly_title",
            metadata: { title: title.title, rank: title.rank },
            createdAt: new Date(),
          });
        }
      }

      this.logger.log(
        `Weekly rankings processed: ${titles.length} titles assigned`,
      );
    } catch (error) {
      this.logger.error("Error processing weekly rankings", error);
    }
  }
}
