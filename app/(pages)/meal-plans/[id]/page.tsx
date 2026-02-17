import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RecipesList from "@/components/mealplan/MealplanDetails/RecipesList";
import AllMealplanRecipes from "@/components/mealplan/MealplanDetails/AllMealplanRecipes";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { lazy, Suspense } from "react";
import { ErrorWrapper } from "@/components/ErrorWraper";
import Image from "next/image";
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleMealPlan from "@/components/mealplan/ScheduleMealplan";
import {
  getSuggestedMealPlan,
  getSuggestedMealplanIngredients,
} from "@/actions/mealplan";

const IngredientList = lazy(
  () => import("@/components/mealplan/MealplanDetails/IngredientList")
);

interface RecipeDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const MealPlanDetail = async ({ params }: RecipeDetailProps) => {
  const { id } = await params;
  const { data: plan } = await getSuggestedMealPlan(id);

  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: ["suggested_mealplan_ingredients", id],
    queryFn: async () => await getSuggestedMealplanIngredients(id),
    staleTime: 5 * 60 * 1000,
  });

  if (!plan) {
    return (
      <MaxWidthWrapper>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-card rounded-3xl p-6 sm:p-8 card-shadow animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ChefHat className="h-7 w-7 text-muted-foreground" />
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-2">
              Plan no encontrado
            </h2>

            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Este plan de comidas no existe, fue eliminado o ya no está
              disponible. Puedes volver a la lista y explorar otras opciones que
              se adapten a ti.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/meal-plans">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a planes
                </Link>
              </Button>

              <Button asChild className="w-full sm:w-auto">
                <Link href="/meal-plans">Explorar planes</Link>
              </Button>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <div className="min-h-screen bg-background mt-2 sm:mt-5">
        <main className="container ">
          <Link
            href="/meal-plans"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 sm:mb-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a planes
          </Link>

          <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 animate-fade-in">
            <div className="absolute inset-0">
              <Image
                src={plan.imageUrl}
                alt={plan.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/50" />
            </div>

            <div className="relative py-6 sm:py-8 px-4 sm:px-6">
              <div className="max-w-2xl">
                <Badge className="mb-3 sm:mb-4">{plan.dietType}</Badge>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                  {plan.name}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
                  {plan.description}
                </p>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate">
                      {plan.durationDays} días
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                    <ChefHat className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate">
                      {plan.durationDays} recetas
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                    <Flame className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate">
                      ~{plan.dailyCaloriesAvg} kcal
                    </span>
                  </div>
                </div>
              </div>
              <ScheduleMealPlan />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-6 sm:pb-8">
            <div className="space-y-4 sm:space-y-6 lg:col-span-1 order-1 lg:order-2">
              <ErrorWrapper>
                <Suspense
                  fallback={<Skeleton className="w-full h-full rounded-3xl" />}
                >
                  <HydrationBoundary state={dehydrate(queryClient)}>
                    <IngredientList id={id} />
                  </HydrationBoundary>
                </Suspense>
              </ErrorWrapper>
            </div>

            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1">
              <RecipesList id={id} />
              <section className="flex-1 bg-card rounded-2xl p-4 sm:p-6 card-shadow">
                <h3 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  Información Nutricional
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Promedio diario
                </p>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="text-sm">Calorías</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {plan.dailyCaloriesAvg} Kcals
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <Dumbbell className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-sm">Proteínas</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {plan.dailyProteinsAvg}g
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Wheat className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-sm">Carbohidratos</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {plan.dailyCarbsAvg}g
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Droplets className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-sm">Grasas</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {plan.dailyFatsAvg}g
                    </span>
                  </div>
                </div>
              </section>
              <AllMealplanRecipes id={id} />
            </div>
          </div>
        </main>
      </div>
    </MaxWidthWrapper>
  );
};

export default MealPlanDetail;
