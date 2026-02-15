import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Star,
  Users,
  ChefHat,
  ArrowLeft,
  Flame,
  Beef,
  Wheat,
  Droplets,
} from "lucide-react";
import CommunityPhotos from "@/components/recipes/recipeDetails/CommunityPhotos";
import RecipeTips from "@/components/recipes/recipeDetails/RecipeTips";
import { getRecipeById } from "@/actions/recipes";
import SaveRecipeBtn from "@/components/SaveRecipeBtn";
import { Suspense } from "react";
import { ErrorWrapper } from "@/components/ErrorWraper";
import IngredientsContainer from "@/components/recipes/recipeDetails/IngredientsContainer";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface RecipeDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const RecipeDetail = async ({ params }: RecipeDetailProps) => {
  const { id } = await params;
  const { data: recipe } = await getRecipeById(id);

  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      dessert: "Postre",
    };
    return labels[mealType] || mealType;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 max-w-7xl mx-auto px-4">
        <Link href="/recipes">
          <button className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a recetas</span>
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <Image
                src={
                  recipe.image ||
                  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"
                }
                width={400}
                height={400}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {recipe.mealTypes.map((type, idx) => (
                  <Badge
                    key={idx}
                    className="bg-primary text-primary-foreground"
                  >
                    {getMealTypeLabel(type)}
                  </Badge>
                ))}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <SaveRecipeBtn recipeId={recipe.id} size="md" />
              </div>
            </div>

            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {recipe.name}
              </h1>
              {recipe.description && (
                <p className="text-muted-foreground text-lg mb-6">
                  {recipe.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{recipe.totalTime}m</span>
                </div>
                {recipe.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{recipe.rating}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{recipe.servings} porciones</span>
                </div>
                {recipe.dificulty && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-primary" />
                    <span>{recipe.dificulty}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1  lg:hidden ">
              <ErrorWrapper>
                <Suspense
                  fallback={<Skeleton className="w-full lg:w-[300px] h-full" />}
                >
                  <IngredientsContainer id={id} />
                </Suspense>
              </ErrorWrapper>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="font-display text-xl font-semibold mb-4">
                Información Nutricional
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Por porción</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-base md:text-2xl font-bold">
                      {Math.round(recipe.calories)}
                    </p>
                    <p className="text-xs text-muted-foreground">Calorías</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="p-2 rounded-full bg-red-100">
                    <Beef className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-base md:text-2xl font-bold">
                      {Math.round(recipe.proteins)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Proteína</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="p-2 rounded-full bg-amber-100">
                    <Wheat className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-base md:text-2xl font-bold">
                      {Math.round(recipe.carbs)}g
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Carbohidratos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-base md:text-2xl font-bold">
                      {Math.round(recipe.fats)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Grasas</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="font-display text-xl font-semibold mb-6">
                Preparación
              </h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={instruction.step} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground pt-1">
                      {instruction.step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <RecipeTips />

            <CommunityPhotos />
          </div>
          <div className="lg:col-span-1 hidden lg:block ">
            <ErrorWrapper>
              <Suspense
                fallback={
                  <Skeleton className="w-full lg:min-w-[300px] flex-1 h-full" />
                }
              >
                <IngredientsContainer id={id} />
              </Suspense>
            </ErrorWrapper>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeDetail;
