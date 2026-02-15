import { cn } from "@/lib/utils";
import { Minus, Plus, Users } from "lucide-react";

interface PeopleStepProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN = 1;
const MAX = 12;

const getLabel = (value: number) => {
  if (value === 1) return "Solo yo";
  if (value === 2) return "En pareja";
  if (value <= 4) return "Familia pequeña";
  if (value <= 6) return "Familia mediana";
  return "Familia grande";
};

const getSubLabel = (value: number) =>
  value === 1 ? "1 persona" : `${value} personas`;

const PeopleStep = ({ value, onChange }: PeopleStepProps) => {
  const increment = () => value < MAX && onChange(value + 1);
  const decrement = () => value > MIN && onChange(value - 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          ¿Para cuántas personas cocinas?
        </h2>
        <p className="text-sm text-muted-foreground">
          Ajustaremos las porciones de forma exacta
        </p>
      </div>

      {/* Card */}
      <div className="max-w-sm mx-auto">
        <div className="rounded-2xl border-2 p-6 text-center space-y-5 transition-all bg-background">
          {/* Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-7 h-7" />
          </div>

          {/* Label */}
          <div>
            <p className="text-lg font-semibold text-foreground">
              {getLabel(value)}
            </p>
            <p className="text-sm text-muted-foreground">
              {getSubLabel(value)}
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={decrement}
              disabled={value <= MIN}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition",
                value <= MIN
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-muted hover:bg-muted/70"
              )}
            >
              <Minus className="w-5 h-5" />
            </button>

            <span className="text-4xl font-bold text-foreground w-12 text-center">
              {value}
            </span>

            <button
              onClick={increment}
              disabled={value >= MAX}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition",
                value >= MAX
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-muted hover:bg-muted/70"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {[1, 2, 4, 6].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "rounded-xl border-2 p-3 text-center transition",
              value === n
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <span className="text-sm font-medium">{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeopleStep;
