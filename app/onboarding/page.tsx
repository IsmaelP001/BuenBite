'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import GoalStep from "@/components/onboarding/GoalStep";
import PeopleStep from "@/components/onboarding/PeopleStep";
import DietStep from "@/components/onboarding/DietStep";
import MealTimesStep from "@/components/onboarding/MealTimesStep";
import ConfirmationStep from "@/components/onboarding/ConfirmationStep";
import { useRouter } from "next/navigation";

export interface UserPreferences {
  primaryGoal: string;
  dietType: string;
  servings: number;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

const INITIAL_PREFERENCES: UserPreferences = {
  primaryGoal: "no-waste",
  dietType: "none",
  servings: 1,
  breakfastTime: "08:00",
  lunchTime: "13:00",
  dinnerTime: "20:00",
};

const TOTAL_STEPS = 6;

const Onboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    
    router.push("/");
  };

 const handleSkip = () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  localStorage.setItem("onboarding_skipped_until", futureDate.toISOString());
  router.push("/");
};

  const progressSteps = TOTAL_STEPS - 2;
  const currentProgressStep = Math.max(0, currentStep - 1);
  const progress = currentStep === 0 || currentStep === TOTAL_STEPS - 1 
    ? 0 
    : ((currentProgressStep + 1) / progressSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={nextStep} />;
      case 1:
        return (
          <GoalStep
            value={preferences.primaryGoal}
            onChange={(value) => updatePreference("primaryGoal", value)}
          />
        );
      case 2:
        return (
          <PeopleStep
            value={preferences.servings}
            onChange={(value) => updatePreference("servings", value)}
          />
        );
      case 3:
        return (
          <DietStep
            dietType={preferences.dietType}
            onDietChange={(value) => updatePreference("dietType", value)}
          />
        );       
      case 4:
        return (
          <MealTimesStep
            breakfastTime={preferences.breakfastTime}
            lunchTime={preferences.lunchTime}
            dinnerTime={preferences.dinnerTime}
            onBreakfastChange={(value) => updatePreference("breakfastTime", value)}
            onLunchChange={(value) => updatePreference("lunchTime", value)}
            onDinnerChange={(value) => updatePreference("dinnerTime", value)}
          />
        );
      case 5:
        return <ConfirmationStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  const canSkip = currentStep > 0 && currentStep < TOTAL_STEPS - 1;
  const showNavigation = currentStep > 0 && currentStep < TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 bg-background z-10 border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              {currentStep > 0 && currentStep < TOTAL_STEPS - 1
                ? `Paso ${currentStep} de ${TOTAL_STEPS - 2}`
                : ""}
            </span>
            {canSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Omitir todo
              </Button>
            )}
          </div>
          {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
            <Progress value={progress} className="h-2" />
          )}
        </div>
      </header>

      <main className="flex-1 container max-w-2xl mx-auto p-6 flex flex-col justify-center">
        {renderStep()}
      </main>

      {showNavigation && (
        <footer className="sticky bottom-0 bg-background border-t">
          <div className="container max-w-lg mx-auto p-4 flex gap-3">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Atrás
            </Button>
            {currentStep === (TOTAL_STEPS - 2) ? (
               <Button onClick={nextStep} className="flex-1 bg-primary hover:bg-primary/90">
              Guardar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            ):( <Button onClick={nextStep} className="flex-1 bg-primary hover:bg-primary/90">
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>)}
          </div>
        </footer>
      )}
    </div>
  );
};

export default Onboarding;
