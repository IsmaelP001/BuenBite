
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Droplets, Dumbbell, Pizza, Apple } from "lucide-react";
import { Ingredient } from "@/types/models/ingredient";
import { categoryIcons } from "@/lib/constants";

interface NutritionalInfoCardProps {
  ingredient: Ingredient;
}

export const NutritionalInfoCard: React.FC<NutritionalInfoCardProps> = ({
  ingredient,
}) => {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {categoryIcons[ingredient.category as keyof typeof categoryIcons] || (
              <Apple className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle>{ingredient.name_es}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {ingredient.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Información nutricional por 100g
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Calorías</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {ingredient.calories_100g}
              </p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Proteínas</span>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {ingredient.protein_100g}
              </p>
              <p className="text-xs text-muted-foreground">gramos</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Pizza className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">
                  Carbohidratos
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-500">
                {ingredient.carbohydrates_100g}
              </p>
              <p className="text-xs text-muted-foreground">gramos</p>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Grasas</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">
                {ingredient.fat_100g}
              </p>
              <p className="text-xs text-muted-foreground">gramos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};