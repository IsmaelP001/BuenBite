"use client";
import { useMemo, useState } from "react";
import MealSection from "./MealSection";
import { extractDateFromDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Apple, Cake, Moon, Sun, Utensils } from "lucide-react";
import AddRecipeModal from "./AddRecipeModal";
import useGetMealplanEntries from "@/hooks/useGetMealplanEntries";
import useMarkMealplanRecipeAsCooked from "@/hooks/useMarkMealplanRecipeAsCooked";
import useRemoveMealPlanEntry from "@/hooks/useRemoveMealPlanEntry";
import MealSectionSkeleton from "./MealSectionSkeleton";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "desserts";

export default function MealSectionContainer() {
  const searchParams = useSearchParams();
  const {
    data: weeklyMealPlan,
    isPending: isPendingEntries,
    isFetching: isFetchingEntries,
  } = useGetMealplanEntries({
    selectedDate: new Date(),
  });

  const { mutate, isPending: isPendingMarkCooked } =
    useMarkMealplanRecipeAsCooked();
  const { mutate: removeScheduledRecipe, isPending: isPendingRemove } =
    useRemoveMealPlanEntry();

  const scheduledMealsForSelectedDate = useMemo(() => {
    if (!weeklyMealPlan || isPendingEntries) return [];
    const selectedDate =
      searchParams.get("date") ?? extractDateFromDate(new Date());
    return weeklyMealPlan?.data?.[selectedDate as keyof unknown] ?? [];
  }, [searchParams, weeklyMealPlan, isPendingEntries]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>("breakfast");

  const weeklyMeals = useMemo(() => {
    const initial = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
      desserts: [],
    };
    return scheduledMealsForSelectedDate.reduce((acc, item) => {
      type MealType = keyof typeof initial;
      if (!acc?.[item.mealType as MealType]) return acc;
      acc[item.mealType as MealType]?.push(item);
      return acc;
    }, initial);
  }, [scheduledMealsForSelectedDate]);

  const openAddModal = (mealType: MealType) => {
    setActiveMealType(mealType);
    setIsModalOpen(true);
  };

  if (isPendingEntries || isFetchingEntries) {
    return (
      <div className="lg:col-span-2 space-y-6">
        <MealSectionSkeleton />
        <MealSectionSkeleton />
        <MealSectionSkeleton />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MealSectionSkeleton />
          <MealSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:col-span-2 space-y-6">
        <MealSection
          title="Desayuno"
          icon={Sun}
          iconColor="bg-amber-500"
          meals={weeklyMeals.breakfast}
          onAddMeal={() => openAddModal("breakfast")}
          isPendingRemove={isPendingRemove}
          isPendingToogleCooked={isPendingMarkCooked}
          onToggleCooked={(recipe) => {
            mutate({
              id: recipe.id,
              recipeId: recipe?.recipe?.id ?? "",
              isCooked: true,
              activeMealplanId: recipe?.activeMealPlanId ?? "",
            });
          }}
          onRemoveMeal={(recipe) =>
            removeScheduledRecipe({
              plannedDate: recipe.plannedDate,
              mealType: activeMealType,
              recipeId: recipe.recipe?.id ?? "",
            })
          }
        />

        <MealSection
          title="Almuerzo"
          icon={Utensils}
          iconColor="bg-primary"
          meals={weeklyMeals.lunch}
          onAddMeal={() => openAddModal("lunch")}
          isPendingRemove={isPendingRemove}
          isPendingToogleCooked={isPendingMarkCooked}
          onToggleCooked={(recipe) => {
            mutate({
              id: recipe.id,
              recipeId: recipe?.recipe?.id ?? "",
              isCooked: true,
              activeMealplanId: recipe?.activeMealPlanId ?? "",
            });
          }}
          onRemoveMeal={(recipe) =>
            removeScheduledRecipe({
              plannedDate: recipe.plannedDate,
              mealType: activeMealType,
              recipeId: recipe.recipe?.id ?? "",
            })
          }
        />

        <MealSection
          title="Cena"
          icon={Moon}
          iconColor="bg-indigo-500"
          meals={weeklyMeals.dinner}
          onAddMeal={() => openAddModal("dinner")}
          isPendingRemove={isPendingRemove}
          isPendingToogleCooked={isPendingMarkCooked}
          onToggleCooked={(recipe) => {
            mutate({
              id: recipe.id,
              recipeId: recipe?.recipe?.id ?? "",
              isCooked: true,
              activeMealplanId: recipe?.activeMealPlanId ?? "",
            });
          }}
          onRemoveMeal={(recipe) =>
            removeScheduledRecipe({
              plannedDate: recipe.plannedDate,
              mealType: activeMealType,
              recipeId: recipe.recipe?.id ?? "",
            })
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MealSection
            title="Snacks"
            icon={Apple}
            iconColor="bg-green-500"
            meals={weeklyMeals.snacks}
            onAddMeal={() => openAddModal("snacks")}
            isPendingRemove={isPendingRemove}
            isPendingToogleCooked={isPendingMarkCooked}
            onToggleCooked={(recipe) => {
              mutate({
                id: recipe.id,
                recipeId: recipe?.recipe?.id ?? "",
                isCooked: true,
                activeMealplanId: recipe?.activeMealPlanId ?? "",
              });
            }}
            onRemoveMeal={(recipe) =>
              removeScheduledRecipe({
                plannedDate: recipe.plannedDate,
                mealType: activeMealType,
                recipeId: recipe.recipe?.id ?? "",
              })
            }
          />

          <MealSection
            title="Postres"
            icon={Cake}
            iconColor="bg-pink-500"
            meals={weeklyMeals.desserts}
            onAddMeal={() => openAddModal("desserts")}
            isPendingRemove={isPendingRemove}
            isPendingToogleCooked={isPendingMarkCooked}
            onToggleCooked={(recipe) => {
              mutate({
                id: recipe.id,
                recipeId: recipe?.recipe?.id ?? "",
                isCooked: true,
                activeMealplanId: recipe?.activeMealPlanId ?? "",
              });
            }}
            onRemoveMeal={(recipe) =>
              removeScheduledRecipe({
                plannedDate: recipe.plannedDate,
                mealType: activeMealType,
                recipeId: recipe.recipe?.id ?? "",
              })
            }
          />
        </div>
      </div>
      <AddRecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mealType={activeMealType}
      />
    </>
  );
}
