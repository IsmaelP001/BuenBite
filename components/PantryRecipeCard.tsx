import { Clock, Star, CheckCircle, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecommendedRecipe } from "@/types/models/recipes";
import SaveRecipeBtn from "./SaveRecipeBtn";
import Image from "next/image";

const PantryRecipeCard = ({
  id = "1",
  image,
  name,
  totalTime,
  rating,
  completionPercentage,
  totalInPantryIngredients,
  totalIngredients,
  targetServings,
  targetServingsCompletionPercentage,
}: RecommendedRecipe) => {
  const hasCustomServings =
    targetServings && targetServingsCompletionPercentage !== undefined
      ? true
      : false;
  const displayPercentage = hasCustomServings
    ? targetServingsCompletionPercentage
    : completionPercentage;
  const isComplete = displayPercentage > 98;

  return (
    <Link
      href={`/recipes/${id}`}
      className="block group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={image!}
          alt={name}
          width={300}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="bg-white px-3 rounded-full flex items-center justify-center">
            <UsersRound size={20} className=" inline-flex my-auto" />
            <span className="text-lg font-medium ml-1">
              {`${targetServings}`}
            </span>
          </div>
          <SaveRecipeBtn recipeId={id} size="sm" />
        </div>

        <div
          className={`absolute bottom-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium ${
            isComplete
              ? "bg-primary text-primary-foreground"
              : "bg-card/90 backdrop-blur-sm text-foreground"
          }`}
        >
          {isComplete && <CheckCircle className="h-3.5 w-3.5" />}
          <span>
            {totalInPantryIngredients}/{totalIngredients} ingredientes
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-base text-nowrap truncate md:text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Disponibilidad</span>
            <span className={isComplete ? "text-primary font-medium" : ""}>
              {displayPercentage}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? "bg-primary" : "bg-primary/60"
              }`}
              style={{ width: `${targetServingsCompletionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-1">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalTime}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {rating}
            </span>
          </div>

          <Link className="flex-1 w-full" href={`/recipes/${id}/cook`}>
            <Button
              variant={isComplete ? "default" : "outline"}
              size="sm"
              className="rounded-full flex-1  w-full"
            >
              {isComplete ? "¡Cocinar!" : "Ver Receta"}
            </Button>
          </Link>
        </div>
      </div>
    </Link>
  );
};

export default PantryRecipeCard;
