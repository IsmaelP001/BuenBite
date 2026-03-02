import { Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

interface TrackRecipeViewDto {
  recipeId: string;
  userId: string;
  sessionId: string;
}

@Injectable()
export class TrackRecipeViewUseCase {
  private readonly VIEWS_KEY = "VIEWS_KEYS";

  constructor(
    @Inject("CACHE_MANAGER")
    private readonly cacheManager: Cache,
  ) {}

  async execute(dto: TrackRecipeViewDto): Promise<void> {
    const now = new Date();
    const uniqueKey = `${dto.recipeId}:${dto.userId}:${dto.sessionId}:${now.getTime()}`;

    const viewData = {
      recipeId: dto.recipeId,
      userId: dto.userId,
      sessionId: dto.sessionId,
      date: now.toISOString().split("T")[0],
      timestamp: now.getTime(),
    };

    const existingViews =
      (await this.cacheManager.get<any[]>(this.VIEWS_KEY)) || [];
    existingViews.push({ key: uniqueKey, data: viewData });

    await this.cacheManager.set(this.VIEWS_KEY, existingViews, 7200000);
  }
}
