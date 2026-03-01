import { Injectable, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Cache } from "@nestjs/cache-manager";
import { RecipesService } from "./interfaces/recipe";
import { RecipeView } from "../../domain/recipe.model";
import { RecipeViewDto } from "../dto";
import { v4 as uuidv4,validate as isUUID } from "uuid";

@Injectable()
export class RecipeSchedulerServiceImpl {
  private readonly VIEWS_KEY = "VIEWS_KEYS";

  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("CACHE_MANAGER")
    private readonly cacheManager: Cache
  ) {
      console.log('RecipeSchedulerServiceImpl instantiated');

  }

  
  @Cron(CronExpression.EVERY_30_SECONDS)
  async saveViewsToDatabase(): Promise<void> {
    try {
      const cachedViews = await this.cacheManager.get<any[]>(this.VIEWS_KEY);

      if (!cachedViews || cachedViews.length === 0) {
        return;
      }

      const viewsToSave: RecipeViewDto[] = cachedViews.map(({ key, data }) => ({
        id: uuidv4(),
        userId: data.userId,
        sessionId: data.sessionId,
        recipeId: data.recipeId,
      }))
      .filter(item=>isUUID(item.id) && isUUID(item.recipeId) && isUUID(item.userId))

      console.log('views to save',viewsToSave)

      await this.recipeService.saveRecipeViews(viewsToSave);
      await this.cacheManager.del(this.VIEWS_KEY);
    } catch (error) {
      console.error("❌ Error guardando vistas:", error);
    }
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async saveRecipeMetrics(): Promise<void> {
  //   const startDate = new Date();
  //   startDate.setHours(-4, 0, 0, 0);

  //   const endDate = new Date();

  //   return this.recipeService.saveRecipeMetrics({ startDate, endDate });
  // }
}
