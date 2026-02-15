import { GOALS } from "@/lib/config";
import { cn } from "@/lib/utils";


interface GoalStepProps {
  value: string;
  onChange: (value: string) => void;
}



const GoalStep = ({ value, onChange }: GoalStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          ¿Cuál es tu objetivo principal?
        </h2>
        <p className="text-sm text-muted-foreground">
          Personalizaremos las recetas según lo que más te importa
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = value === goal.id;

          return (
            <button
              key={goal.id}
              onClick={() => onChange(goal.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left h-full",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
             <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <span
                  className={cn(
                    "font-medium block",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {goal.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {goal.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GoalStep;
