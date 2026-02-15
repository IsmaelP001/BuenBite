import { TrendingRecipe } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Flame, ChefHat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrendingRecipeCardProps {
  recipe: TrendingRecipe;
  rank?: number;
}

export default function TrendingRecipeCard({ recipe, rank }: TrendingRecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.recipeId}`} className="block group">
      <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5">
        <div className="relative aspect-3/2">
          {recipe.recipeImage ? (
            <Image
              src={recipe.recipeImage}
              alt={recipe.recipeName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 280px"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-primary/30" aria-hidden="true" />
            </div>
          )}
          {/* Rank badge */}
          {rank && (
            <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
              {rank}
            </div>
          )}
          {/* Cooked this week badge */}
          {recipe.cookedThisWeek > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/60 backdrop-blur-sm text-white border-0 text-[10px] gap-1">
                <Flame className="w-3 h-3 text-orange-400" aria-hidden="true" />
                {recipe.cookedThisWeek} esta semana
              </Badge>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-3">
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
              {recipe.recipeName}
            </h3>
          </div>
        </div>
        <div className="px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 shrink-0">
              <AvatarImage src={recipe.authorAvatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-semibold">
                {recipe.authorName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{recipe.authorName}</span>
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1" style={{ fontVariantNumeric: "tabular-nums" }}>
            <ChefHat className="w-3 h-3" aria-hidden="true" />
            {recipe.cookedCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}
