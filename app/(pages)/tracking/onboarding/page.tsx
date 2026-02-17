"use client";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BodyDataStep } from "@/components/mealplan/onboarding/BodyDataStep";
import { GoalActivityStep } from "@/components/mealplan/onboarding/GoalActivityStep";
import { FoodPreferencesStep } from "@/components/mealplan/onboarding/FoodPreferencesStep";
import { SummaryStep } from "@/components/mealplan/onboarding/SummaryStep";
import { StepIndicator } from "@/components/mealplan/onboarding/StepIndicator";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 4;
const STEP_LABELS = ["Datos", "Objetivo", "Comidas", "Resumen"];

const Onboarding = () => {
  const {
    data,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    submit,
    isPending,
    updateData,
    canAdvanceToStep,
  } = useOnboardingForm();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BodyDataStep data={data} onChange={updateData} />;
      case 2:
        return <GoalActivityStep data={data} onChange={updateData} />;
      case 3:
        return <FoodPreferencesStep data={data} onChange={updateData} />;
      case 4:
        return <SummaryStep data={data} onEdit={goToStep} />;
      default:
        return null;
    }
  };

  const handleStepClick = (step: number) => {
    if (canAdvanceToStep(step)) {
      goToStep(step);
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;


  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            labels={STEP_LABELS}
          />
        </div>

        {/* Content */}
        <div className="min-h-[500px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              "gap-2 transition-opacity",
              currentStep === 1 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </Button>

          {!isLastStep ? (
            <Button onClick={nextStep} className="gap-2">
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={isPending}
              className="gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Crear plan
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step === currentStep
                  ? "w-8 bg-primary"
                  : step < currentStep
                  ? "w-6 bg-primary/60"
                  : "w-6 bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;