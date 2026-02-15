import {
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  Dumbbell,
  Zap,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  OnboardingData,
  PhysicalGoal,
} from "@/types/models/onboarding";
import {
  ACTIVITY_LEVELS,
  PACE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
} from "@/lib/config";

interface GoalActivityStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

const GoalIcon = ({ goal }: { goal: PhysicalGoal }) => {
  const icons = {
    lose_weight: TrendingDown,
    maintain_weight: Minus,
    build_muscle: Dumbbell,
    gain_weight: TrendingUp,
  };
  const Icon = icons[goal];
  return <Icon className="w-5 h-5" />;
};

export const GoalActivityStep = ({ data, onChange }: GoalActivityStepProps) => {

  const showPaceSelector =
    data.primaryGoal && data.primaryGoal !== "maintain_weight";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Objetivo y actividad
        </h2>
        <p className="text-muted-foreground">
          ¿Qué quieres lograr y qué tan activo eres?
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Objetivo físico</Label>
          <div className="grid grid-cols-2 gap-3">
            {PRIMARY_GOAL_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ physicalGoal: id })}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  "hover:border-primary/50 hover:bg-primary/5",
                  data.physicalGoal === id
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    data.physicalGoal === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <GoalIcon goal={id} />
                </div>
                <span
                  className={cn(
                    "font-medium",
                    data.physicalGoal === id ? "text-primary" : "text-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {showPaceSelector && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium">Ritmo de cambio</Label>
            <div className="grid grid-cols-3 gap-3">
              {PACE_OPTIONS.map(({ id, label, description }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange({ weightChangePace: id })}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    data.weightChangePace === id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <span
                    className={cn(
                      "font-medium mb-1",
                      data.weightChangePace === id
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Nivel de actividad
          </Label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map(({ id, label, description }) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ activityLevel: id })}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  data.activityLevel === id
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div className="flex flex-col items-start">
                  <span
                    className={cn(
                      "font-medium",
                      data.activityLevel === id
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {description}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                    data.activityLevel === id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {data.activityLevel === id && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
