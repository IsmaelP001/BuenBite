"use client";
import { Flame, Beef, Droplets, Wheat, Target, Settings, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useGetMealplanMacrosSummary from "@/hooks/useGetMealplanMacrosSummary";
import useGetUserNutritionalMetrics from "@/hooks/useGetUserNutritionalMetrics";
import Link from "next/link";

const NutritionSummary = () => {
  const {
    macrosSummary: { calories, carbs, fats, proteins },
    isPending: isMacrosPending,
  } = useGetMealplanMacrosSummary();

  const {
    data: nutritionalMetrics,
    isPending: isMetricsPending,
    isError: isMetricsError,
  } = useGetUserNutritionalMetrics();

  if (isMacrosPending || isMetricsPending) {
    return <SkeletonNutritionSummary />;
  }

  if (isMetricsError) {
    return <ErrorMessage message="Error al cargar el resumen nutricional" />;
  }

  if (!nutritionalMetrics || isMetricsError) {
    return <EmptyStateMessage />;
  }

  const caloriesPercent = Math.min(
    (calories.consumed / calories.targetCalories) * 100,
    100
  );
  const proteinPercent = Math.min(
    (proteins.consumed / proteins.target) * 100,
    100
  );
  const fatsPercent = Math.min((fats.consumed / fats.target) * 100, 100);
  const carbsPercent = Math.min((carbs.consumed / carbs.target) * 100, 100);

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold">
          Resumen Nutricional
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>Meta: {calories?.targetCalories} kcal</span>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${caloriesPercent * 4.4} 440`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="h-6 w-6 text-primary mb-1" />
            <span className="text-3xl font-bold">{calories.consumed}</span>
            <span className="text-sm text-muted-foreground">kcal</span>
          </div>
        </div>
      </div>

      {/* Remaining calories */}
      <div
        className={cn(
          "text-center mb-6 py-3 rounded-xl",
          calories.remainingCalories > 0
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        )}
      >
        <span className="font-semibold">
          {calories.remainingCalories > 0
            ? `${calories.remainingCalories} kcal restantes`
            : `${Math.abs(calories.remainingCalories)} kcal excedidas`}
        </span>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4">
        <MacroCard
          icon={Beef}
          label="Proteína"
          value={proteins.consumed}
          goal={proteins.target}
          percent={proteinPercent}
          color="text-rose-500"
          bgColor="bg-rose-500"
        />
        <MacroCard
          icon={Droplets}
          label="Grasas"
          value={fats.consumed}
          goal={fats.target}
          percent={fatsPercent}
          color="text-amber-500"
          bgColor="bg-amber-500"
        />
        <MacroCard
          icon={Wheat}
          label="Carbos"
          value={carbs.consumed}
          goal={carbs.target}
          percent={carbsPercent}
          color="text-blue-500"
          bgColor="bg-blue-500"
        />
      </div>
    </div>
  );
};

const EmptyStateMessage = () => (
  <div className="bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 card-shadow border-2 border-primary/20">
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="bg-primary/10 p-4 rounded-full">
          <Settings className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-foreground">
          Diseña tu Plan Personalizado
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Configura tus métricas nutricionales para comenzar a trackear tus macros 
          y alcanzar tus objetivos de salud
        </p>
      </div>

      <Link
        href="/tracking/onboarding"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        <Settings className="h-5 w-5" />
        Configurar Métricas
      </Link>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
        <Target className="h-4 w-4" />
        <span>Solo te tomará 2 minutos completar el formulario</span>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-8 card-shadow">
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-foreground">
          Error al Cargar Datos
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {message}. Por favor, intenta recargar la página.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
      >
        Recargar Página
      </button>
    </div>
  </div>
);

interface MacroCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  goal: number;
  percent: number;
  color: string;
  bgColor: string;
}

const MacroCard = ({
  icon: Icon,
  label,
  value,
  goal,
  percent,
  color,
  bgColor,
}: MacroCardProps) => (
  <div className="bg-secondary/50 rounded-xl p-4 text-center">
    <Icon className={cn("h-5 w-5 mx-auto mb-2", color)} />
    <div className="text-lg font-bold">{value}g</div>
    <div className="text-xs text-muted-foreground mb-2">{label}</div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          bgColor
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
    <div className="text-xs text-muted-foreground mt-1">{goal}g meta</div>
  </div>
);

function SkeletonNutritionSummary() {
  return (
    <div className="bg-card rounded-2xl p-6 card-shadow animate-pulse min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-muted rounded-md"></div>
        <div className="h-6 w-24 bg-muted rounded-md"></div>
      </div>

      {/* Main Calories Circle */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="h-6 w-6 bg-muted rounded-full mb-1"></div>
            <div className="h-8 w-16 bg-muted rounded-md mb-2"></div>
            <div className="h-4 w-12 bg-muted rounded-md"></div>
          </div>
        </div>
      </div>

      <div className={cn("text-center mb-6 py-3 rounded-xl bg-muted")}>
        <div className="h-4 w-32 bg-muted rounded-md mx-auto"></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-secondary/50 rounded-xl p-4 text-center">
            <div className="h-5 w-5 mx-auto mb-2 bg-muted rounded-full"></div>
            <div className="h-6 w-12 bg-muted rounded-md mx-auto mb-2"></div>
            <div className="h-4 w-8 bg-muted rounded-md mx-auto mb-2"></div>
            <div className="h-3 w-full bg-muted rounded-full mx-auto mb-2"></div>
            <div className="h-4 w-16 bg-muted rounded-md mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NutritionSummary;