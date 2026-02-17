import { DIETS } from "@/lib/config";
import { cn } from "@/lib/utils";

interface DietStepProps {
  dietType: string;
  onDietChange: (value: string) => void;
}



const DietStep = ({ dietType, onDietChange }: DietStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          ¿Sigues algún tipo de dieta?
        </h2>
        <p className="text-sm text-muted-foreground">
          Filtraremos las recetas según tu alimentación
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DIETS.map((diet) => {
          const isSelected = dietType === diet.id;

          return (
            <button
              key={diet.id}
              onClick={() => onDietChange(diet.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <span className="text-2xl">{diet.emoji}</span>
              <span
                className={cn(
                  "text-sm font-medium text-center",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {diet.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DietStep;
