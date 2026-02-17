import { Clock, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MealPlanEntry } from "@/types/models/pantry";



const ScheduledMealCard = ({ 
  mealType, 
  recipe, 
  recipeId
}: MealPlanEntry) => {
  const isNext = false;
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${isNext ? 'bg-primary/10 border-2 border-primary/30' : 'bg-card border border-border/50'}`}>
      <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0">
        <img src={recipe!.image!} alt={`scheduled-meal-${recipe?.name}`} className="h-full w-full object-cover" />
        {isNext && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded">Próximo</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary uppercase tracking-wide">{mealType}</p>
        <h4 className="font-semibold truncate">{recipe?.name}</h4>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Clock className="h-3.5 w-3.5" />
          <span>{recipe?.totalTime}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" asChild className="shrink-0">
        <Link href={`/recipes/${recipeId}/cook`}>
          <ChefHat className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};

export default ScheduledMealCard;
