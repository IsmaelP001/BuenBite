import { useState } from "react";
import { Search, Clock, Flame, Plus, Check, Circle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, extractDateFromDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import useGetRecommendedByPantry from "@/hooks/getRecommendedByPantryRecipes";
import useGetUserSavedRecipe from "@/hooks/useGetUserSavedRecipes";
import useGetUserRecommendedRecipes from "@/hooks/useGetUserRecommendedRecipes";
import { RecipeItem, RecommendedRecipe } from "@/types/models/recipes";
import useCreateMealPlanEntry from "@/hooks/useCreateMealPlanEntry";
import { useSearchParams } from "next/navigation";
import { Progress } from "../ui/progress";
import Image from "next/image";

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
}

type TabsTypes = "recommended" | "user-recipes" | "saved-recipes";

function LoaderStateTab() {
  return (
    <div className="grid place-content-center min-h-[500px]">
      <Circle className="animate-spin" />
    </div>
  );
}

interface TabsContentContainerProps {
  recipes: RecommendedRecipe[];
  selectedRecipe: RecipeItem | undefined;
  toggleRecipe: (recipe: RecipeItem) => void;
  handleClose: () => void;
  handleAddRecipes: () => void;
  isSaving: boolean;
}
function TabsContentContainer({
  recipes,
  selectedRecipe,
  toggleRecipe,
  handleClose,
  handleAddRecipes,
  isSaving,
}: TabsContentContainerProps) {
  return (
    <>
      {" "}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {recipes?.map((recipe) => {
          const isSelected = selectedRecipe
            ? selectedRecipe.id === recipe.id
            : false;

          return (
            <RecipeModalCard
              key={recipe.id}
              recipe={recipe}
              isSelected={isSelected}
              toggleRecipe={() => toggleRecipe(recipe)}
            ></RecipeModalCard>
          );
        })}

        {recipes.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron recetas</p>
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center justify-between pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddRecipes}
            disabled={!selectedRecipe || isSaving}
            className="gap-1.5"
          >
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

const AddRecipeModal = ({ isOpen, onClose, mealType }: AddRecipeModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>();
  const [activeTab, setActiveTab] = useState<TabsTypes>("recommended");
  const searchParams = useSearchParams();

  const {
    mutateAsync: createMealPlanEntryMutation,
    isPending: isPendingMealEntryMutation,
  } = useCreateMealPlanEntry();

  const { data: recommendedByPantry, isFetching: isFetchingRecommended } =
    useGetRecommendedByPantry({
      isDisabled: activeTab !== "recommended",
    });
  const { recipes: userSavedRecipes, isFetching: isFetchingUserSaved } =
    useGetUserSavedRecipe({
      isDisabled: activeTab !== "recommended",
    });
  const { recipes: userRecipes = [], isFetching: isFetchingUserRecipes } =
    useGetUserRecommendedRecipes({
      isDisabled: activeTab !== "saved-recipes",
    });

  const toggleRecipe = (recipe: RecipeItem) => {
    setSelectedRecipe(recipe);
  };

  const handleAddRecipes = async () => {
    if (!selectedRecipe) return;
    const selectedDate =
      searchParams.get("date") ?? extractDateFromDate(new Date());
    try {
      await createMealPlanEntryMutation({
        image: selectedRecipe?.image ?? undefined,
        name: selectedRecipe?.name,
        plannedDate: selectedDate,
        recipeId: selectedRecipe.id,
        servings: selectedRecipe?.servings,
        prepTime: selectedRecipe?.prepTime,
        mealType: mealType,
      });
      onClose();
    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);
    }
  };

  const handleClose = () => {
    setSelectedRecipe(null);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] gap-2 flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Agregar receta a {mealType}
          </DialogTitle>
        </DialogHeader>
        <div className="relative ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabsTypes)}
          defaultValue="recommended"
          className="max-h-[65vh] pt-0 mt-0"
        >
          <TabsList>
            <TabsTrigger value="recommended">Recomendadas</TabsTrigger>
            <TabsTrigger value="user-recipes">Mis recetas</TabsTrigger>
            <TabsTrigger value="saved-recipes">Guardadas</TabsTrigger>
          </TabsList>
          <TabsContent
            className="overflow-y-auto flex flex-col h-screen"
            value="recommended"
          >
            {isFetchingRecommended ? (
              <LoaderStateTab />
            ) : (
              <TabsContentContainer
                recipes={recommendedByPantry ?? []}
                selectedRecipe={selectedRecipe!}
                toggleRecipe={toggleRecipe}
                handleClose={handleClose}
                handleAddRecipes={handleAddRecipes}
                isSaving={isPendingMealEntryMutation}
              />
            )}
          </TabsContent>
          <TabsContent
            className="overflow-y-auto flex flex-col h-screen"
            value="user-recipes"
          >
            {isFetchingUserRecipes ? (
              <LoaderStateTab />
            ) : (
              <TabsContentContainer
                recipes={userRecipes ?? []}
                selectedRecipe={selectedRecipe!}
                toggleRecipe={toggleRecipe}
                handleClose={handleClose}
                handleAddRecipes={handleAddRecipes}
                isSaving={isPendingMealEntryMutation}
              />
            )}
          </TabsContent>
          <TabsContent
            className="overflow-y-auto flex flex-col h-screen"
            value="saved-recipes"
          >
            {isFetchingUserSaved ? (
              <LoaderStateTab />
            ) : (
              <TabsContentContainer
                recipes={userSavedRecipes ?? []}
                selectedRecipe={selectedRecipe!}
                toggleRecipe={toggleRecipe}
                handleClose={handleClose}
                handleAddRecipes={handleAddRecipes}
                isSaving={isPendingMealEntryMutation}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipeModal;

interface RecipeModalCardProps {
  recipe: RecommendedRecipe;
  isSelected: boolean;
  toggleRecipe: (id: string) => void;
}
function RecipeModalCard({
  recipe,
  toggleRecipe,
  isSelected,
}: RecipeModalCardProps) {
  const isComplete = recipe.completionPercentage > 98;

  return (
    <button
      key={recipe.id}
      onClick={() => toggleRecipe(recipe.id)}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left",
        isSelected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-secondary/50 hover:bg-secondary border-2 border-transparent",
      )}
    >
      <div className="relative">
        <div className="w-16 h-16 bg-gray-200 rounded-lg">
          {recipe?.image && (
            <Image
              src={recipe.image}
              alt={recipe.name}
              width={300}
              height={300}
              className="w-full h-full rounded-lg object-cover"
            />
          )}
        </div>
        {isSelected && (
          <div className="absolute inset-0 bg-primary/80 rounded-lg flex items-center justify-center">
            <Check className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{recipe.name}</h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.totalTime}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {Math.round(recipe.calories)} kcal
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600">
            P: {Math.round(recipe.proteins)}g
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
            C: {Math.round(recipe.carbs)}g
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
            G: {Math.round(recipe.fats)}g
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 min-w-20">
        <span className="text-xs text-muted-foreground font-medium">
          Ingredientes
        </span>
        {isComplete ? (
          <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1">
            <Check className="h-3 w-3" />
            100%
          </span>
        ) : recipe.completionPercentage >= 70 ? (
          <div className="flex items-center gap-1.5">
            <Progress
              value={recipe.completionPercentage}
              className="w-16 h-2 [&>div]:bg-amber-500"
            />
            <span className="text-xs font-medium text-amber-600">
              {Math.round(recipe.completionPercentage)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Progress
              value={recipe.completionPercentage}
              className="w-16 h-2 [&>div]:bg-rose-500"
            />
            <span className="text-xs font-medium text-rose-600">
              {Math.round(recipe.completionPercentage)}%
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
