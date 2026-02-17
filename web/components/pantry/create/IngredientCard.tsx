
import { Badge } from "@/components/ui/badge";
import { categoryIcons } from "@/lib/constants";
import { Ingredient } from "@/types/models/ingredient";
import { Apple } from "lucide-react";

interface IngredientCardProps {
  ingredient: Ingredient;
  onClick: (ingredient: Ingredient) => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(ingredient)}
      className="w-full p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {categoryIcons[ingredient.category as keyof typeof categoryIcons] || <Apple className="w-5 h-5" />}
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">{ingredient.name_es}</p>
          <p className="text-xs text-muted-foreground">{ingredient.category}</p>
        </div>
      </div>
      <Badge
        variant="secondary"
        className="group-hover:bg-primary group-hover:text-primary-foreground"
      >
        {ingredient.calories_100g} kcal
      </Badge>
    </button>
  );
};