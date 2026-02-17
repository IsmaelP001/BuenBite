import {
  Plus,
  ChefHat,
  Trash2,
  Check,
  Clock,
  Flame,
  Circle,
  CircleDashed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MealPlanEntry } from "@/types/models/pantry";
import Image from "next/image";
import Link from "next/link";

export interface MealSectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  meals: MealPlanEntry[];
  onAddMeal: () => void;
  onToggleCooked: (data: MealPlanEntry) => void;
  onRemoveMeal: (data: MealPlanEntry) => void;
  isPendingRemove: boolean;
  isPendingToogleCooked: boolean;
}

const MealSection = ({
  title,
  icon: Icon,
  iconColor,
  meals,
  onAddMeal,
  onToggleCooked,
  onRemoveMeal,
  isPendingRemove,
  isPendingToogleCooked,
}: MealSectionProps) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", iconColor)}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {meals.length} {meals.length === 1 ? "receta" : "recetas"} •{" "}
              {totalCalories} kcal
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddMeal}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {meals.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
          <Icon
            className={cn("h-8 w-8 mx-auto mb-2 text-muted-foreground/50")}
          />
          <p className="text-sm text-muted-foreground">
            No hay recetas programadas
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddMeal}
            className="mt-2 text-primary"
          >
            Agregar receta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {meals?.map((meal, index) => (
            <Link key={meal.id} href={`/recipes/${meal.recipeId}`}>
              <div
                key={`${meal.id}${meal.mealType}${meal.plannedDate}${index}`}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                  meal.isCooked
                    ? "bg-success/10 border border-success/20"
                    : "bg-secondary/50 hover:bg-secondary"
                )}
              >
                {!meal?.recipe?.image ? (
                  <Image
                    src={meal.recipe?.image}
                    alt={meal.recipe.name}
                    width={55}
                    height={55}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "font-medium truncate",
                      meal.isCooked && "line-through text-muted-foreground"
                    )}
                  >
                    {meal.recipe?.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {meal.plannedDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meal.plannedDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {Math.round(meal.recipe?.calories || 0)} kcal
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    disabled={isPendingToogleCooked}
                    variant={meal.isCooked ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      meal.isCooked && "bg-success hover:bg-success/90"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleCooked(meal);
                    }}
                  >
                    {isPendingToogleCooked ? (
                      <CircleDashed className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  {!meal.isCooked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveMeal(meal);
                      }}
                    >
                      {isPendingRemove ? (
                      <CircleDashed className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    </Button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealSection;
