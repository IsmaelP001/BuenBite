"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Clock,
  Check,
  Play,
  Users,
} from "lucide-react";
import QuantityInput from "@/components/QuantityInput";
import useRecipeServings from "@/hooks/useRecipeServings";
import useGetRecipeIngredients from "@/hooks/useGetRecipeIngredients";
import useGetRecipyDetails from "@/hooks/useGetRecipeDetails";
import ConfirmationCookDialog from "@/components/recipes/ConfirmationCookDialog";
import IngredientAvailabilityCard from "@/components/recipes/IngredientAvailabilityCard";

const CookRecipe = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { recipe, isPending: isPendingRecipe } = useGetRecipyDetails();

  const totalSteps = recipe?.instructions?.length ?? 0;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const { data: recipeIngredientsData, isPending: isPendingIngredients } =
    useGetRecipeIngredients();

    
  const {
    ingredients,
    servings,
    updateServingValue,
    updateIngredientQuantity,
    resetIngredientQuantity,
    resetAllIngredients,
    removeIngredient,
  } = useRecipeServings({
    originalServings: recipe?.servings ?? 0,
    ingredientsData: recipeIngredientsData?.ingredients || [],
  });


  console.log('orig servings main',servings)

  const handleNextStep = () => {
    if (isLastStep) {
      setShowConfirmModal(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentInstruction = recipe?.instructions[currentStep];

  if (isPendingIngredients || isPendingRecipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="font-semibold">Cocinando</span>
              <span className="text-muted-foreground">{recipe?.name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {recipe?.totalTime} min
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Paso {currentStep + 1} de {totalSteps}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 pb-24">
          {/* Left Column - Instructions */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              {currentInstruction?.image && (
                <div className="aspect-video relative">
                  <img
                    src={currentInstruction?.image}
                    alt={`Paso ${currentStep + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {currentInstruction?.videoUrl && !currentInstruction?.image && (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Ver video
                  </Button>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {currentStep + 1}
                  </div>
                  <p className="text-lg leading-relaxed">
                    {currentInstruction?.step}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Porciones</span>
                </div>
                <QuantityInput
                  value={servings}
                  onChange={updateServingValue}
                  min={1}
                  max={99}
                  size="md"
                />
              </div>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span>Ingredientes</span>
                <Badge variant="outline">{ingredients.length}</Badge>
              </h2>
              <div className="grid gap-2">
                {ingredients?.map((ing) => {
                  return (
                 <IngredientAvailabilityCard
                  key={`recipe-ingredient-${ing.ingredientId}`}
                  ingredient={{
                      ...ing,
                    availabilityStatus: ing.updatedAvailabilityStatus,
                    missingAmount: ing.updatedMissingAmount,
                    measurementValue:ing.updatedValue,
                  
                  }}
                />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
        <div className="container mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button className="flex-1" onClick={handleNextStep}>
            {isLastStep ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      <ConfirmationCookDialog
        ingredients={ingredients}
        show={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        updateIngredientQuantity={updateIngredientQuantity}
        resetIngredientQuantity={resetIngredientQuantity}
        removeIngredient={removeIngredient}
        resetIngredients={resetAllIngredients}
        servings={servings}
      />
    </div>
  );
};

export default CookRecipe;
