"use client";
import { useState, useRef } from "react";
import { ArrowLeft, ChefHat, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCreateRecipe from "@/hooks/useCreateRecipe";
import { RecipeBasicInfo } from "@/components/recipes/create/RecipeBasicInfo";
import { RecipeIngredientsList } from "@/components/recipes/create/RecipeIngredientList";
import { RecipeStepsList } from "@/components/recipes/create/RecipeStepsList";
import { IngredientSearchModal } from "@/components/recipes/create/IngredientSearchModal";

export default function CreateRecipe() {
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);

  const basicInfoRef = useRef<HTMLDivElement>(null);
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const scrollToError = (section: "basic" | "ingredients" | "steps") => {
    const refs = {
      basic: basicInfoRef,
      ingredients: ingredientsRef,
      steps: stepsRef,
    };

    const ref = refs[section];
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      ref.current.classList.add("ring-2", "ring-red-500", "ring-offset-2");
      setTimeout(() => {
        ref.current?.classList.remove(
          "ring-2",
          "ring-red-500",
          "ring-offset-2"
        );
      }, 2000);
    }
  };

  const {
    validationErrors,
    handleSave,
    recipe,
    handleRecipeChange,
    ingredients,
    handleAddIngredient,
    handleRemoveIngredient,
    steps,
    isSubmitting,
    setSteps,
    setValidationErrors
  } = useCreateRecipe({ scrollToErrFn: scrollToError });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Crear Receta</h1>
              </div>
            </div>
            <Button disabled={isSubmitting} onClick={handleSave}>
              {isSubmitting ? "Guardando..." : "Guardar Receta"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <div
            ref={basicInfoRef}
            className="bg-card rounded-2xl border p-6 shadow-sm transition-all duration-200"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                1
              </span>
              Información Básica
            </h2>

            {(validationErrors.name ||
              validationErrors.prepTime ||
              validationErrors.cookTime ||
              validationErrors.servings ||
              validationErrors.dificulty ||
              validationErrors.mealTypes 
            ) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  {validationErrors.name && <div>{validationErrors.name}</div>}
                  {validationErrors.prepTime && (
                    <div>{validationErrors.prepTime}</div>
                  )}
                  {validationErrors.cookTime && (
                    <div>{validationErrors.cookTime}</div>
                  )}
                  {validationErrors.servings && (
                    <div>{validationErrors.servings}</div>
                  )}
                  {validationErrors.dificulty && (
                    <div>{validationErrors.dificulty}</div>
                  )}
                  {validationErrors.mealTypes && (
                    <div>{validationErrors.mealTypes}</div>
                  )}
                </div>
              </div>
            )}

            <RecipeBasicInfo recipe={recipe} onChange={handleRecipeChange} />
          </div>

          <div className="space-y-6">
            <div
              ref={ingredientsRef}
              className="bg-card rounded-2xl border p-6 shadow-sm transition-all duration-200"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Ingredientes
              </h2>

              {validationErrors.ingredients && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    {validationErrors.ingredients}
                  </div>
                </div>
              )}

              <RecipeIngredientsList
                ingredients={ingredients}
                onRemove={handleRemoveIngredient}
                onAddClick={() => setIsIngredientModalOpen(true)}
              />
            </div>

            <div
              ref={stepsRef}
              className="bg-card rounded-2xl border p-6 shadow-sm transition-all duration-200"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Preparación
              </h2>

              {validationErrors.steps && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    {validationErrors.steps}
                  </div>
                </div>
              )}

              <RecipeStepsList
                steps={steps}
                onUpdate={(newSteps) => {
                  setSteps(newSteps);
                  if (newSteps.some((s) => s.step.trim())) {
                    const newErrors = { ...validationErrors };
                    delete newErrors.steps;
                    setValidationErrors(newErrors);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <IngredientSearchModal
        open={isIngredientModalOpen}
        onOpenChange={setIsIngredientModalOpen}
        onAddIngredient={handleAddIngredient}
      />
    </div>
  );
}
