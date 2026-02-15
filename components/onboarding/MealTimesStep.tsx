import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Coffee, Sun, Moon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealTimesStepProps {
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  onBreakfastChange: (value: string) => void;
  onLunchChange: (value: string) => void;
  onDinnerChange: (value: string) => void;
}

const MealTimesStep = ({
  breakfastTime,
  lunchTime,
  dinnerTime,
  onBreakfastChange,
  onLunchChange,
  onDinnerChange,
}: MealTimesStepProps) => {
  const isSkipped = (value: string) => value === "";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          ¿A qué hora sueles comer?
        </h2>
        <p className="text-sm text-muted-foreground">
          Puedes omitir cualquier comida si no la realizas
        </p>
      </div>

      <div className="space-y-4">
        {/* Breakfast */}
        <div
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl",
            isSkipped(breakfastTime)
              ? "bg-muted/30 border border-dashed"
              : "bg-muted/50"
          )}
        >
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Coffee className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <Label className="font-medium">Desayuno</Label>
            <p className="text-xs text-muted-foreground">
              {isSkipped(breakfastTime)
                ? "Comida omitida"
                : "Primera comida del día"}
            </p>
          </div>

          {isSkipped(breakfastTime) ? (
            <button
              onClick={() => onBreakfastChange("08:00")}
              className="text-xs text-primary hover:underline"
            >
              Restaurar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={breakfastTime}
                onChange={(e) => onBreakfastChange(e.target.value)}
                className="w-28"
              />
               <button
                onClick={() => onBreakfastChange("")}
                title="Omitir cena"
                className="text-muted-foreground hover:text-destructive flex items-center border border-accent p-3 gap-2 rounded-2xl hover:border-destructive"
              >
                <span> Omitir</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Lunch */}
        <div
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl",
            isSkipped(lunchTime)
              ? "bg-muted/30 border border-dashed"
              : "bg-muted/50"
          )}
        >
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Sun className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <Label className="font-medium">Almuerzo</Label>
            <p className="text-xs text-muted-foreground">
              {isSkipped(lunchTime) ? "Comida omitida" : "Comida del mediodía"}
            </p>
          </div>

          {isSkipped(lunchTime) ? (
            <button
              onClick={() => onLunchChange("13:00")}
              className="text-xs text-primary hover:underline"
            >
              Restaurar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={lunchTime}
                onChange={(e) => onLunchChange(e.target.value)}
                className="w-28"
              />
              <button
                onClick={() => onLunchChange("")}
                title="Omitir cena"
                className="text-muted-foreground hover:text-destructive flex items-center border border-accent p-3 gap-2 rounded-2xl hover:border-destructive"
              >
                <span> Omitir</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dinner */}
        <div
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl",
            isSkipped(dinnerTime)
              ? "bg-muted/30 border border-dashed"
              : "bg-muted/50"
          )}
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Moon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <Label className="font-medium">Cena</Label>
            <p className="text-xs text-muted-foreground">
              {isSkipped(dinnerTime)
                ? "Comida omitida"
                : "Última comida del día"}
            </p>
          </div>

          {isSkipped(dinnerTime) ? (
            <button
              onClick={() => onDinnerChange("20:00")}
              className="text-xs text-primary hover:underline"
            >
              Restaurar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={dinnerTime}
                onChange={(e) => onDinnerChange(e.target.value)}
                className="w-28"
              />
              <button
                onClick={() => onDinnerChange("")}
                title="Omitir cena"
                className="text-muted-foreground hover:text-destructive flex items-center border border-accent p-3 gap-2 rounded-2xl hover:border-destructive"
              >
                <span> Omitir</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealTimesStep;
