import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import MealPlanCard from "@/components/MealplanCard";
import {
  Flame,
  Droplets,
  Scale,
  Activity,
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Home,
  Utensils,
  Target,
  Zap,
} from "lucide-react";
import { ApiClient } from "@/services/apiClient";
import Link from "next/link";


const NutritionResults = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const apiClient = new ApiClient();
  const [metricsResponse, suggestedMealPlansResponse] = await Promise.all([
    apiClient.userService.getUserNutritionalMetricsById(id),
    apiClient.mealplanService
      .getAllSuggestedMealPlansByUserMetrics()
      .catch(() => ({ data: [] })),
  ]);
  const metrics = metricsResponse.data;
  const suggestedMealPlansRaw = suggestedMealPlansResponse.data;
  const suggestedMealPlans = Array.isArray(suggestedMealPlansRaw)
    ? suggestedMealPlansRaw
    : Array.isArray(suggestedMealPlansRaw?.items)
    ? suggestedMealPlansRaw.items
    : Array.isArray(suggestedMealPlansRaw?.data)
    ? suggestedMealPlansRaw.data
    : [];

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "lose_weight":
        return <TrendingDown className="h-6 w-6" />;
      case "gain_weight":
      case "gain_muscle":
        return <TrendingUp className="h-6 w-6" />;
      default:
        return <Minus className="h-6 w-6" />;
    }
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      lose_weight: "Perder peso",
      maintain: "Mantener peso",
      maintain_weight: "Mantener peso",
      gain_muscle: "Ganar músculo",
      build_muscle: "Ganar músculo",
      gain_weight: "Ganar peso",
    };
    return labels[goal] || goal;
  };

  const getDietLabel = (diet: string) => {
    const labels: Record<string, string> = {
      balanced: "Balanceada",
      vegetarian: "Vegetariana",
      vegan: "Vegana",
      keto: "Keto",
      paleo: "Paleo",
      mediterranean: "Mediterránea",
      low_carb: "Baja en carbohidratos",
      "high-protein": "Alta en proteína",
      high_protein: "Alta en proteína",
    };
    return labels[diet] || diet;
  };

  const getActivityLabel = (activity: string) => {
    const labels: Record<string, string> = {
      sedentary: "Sedentario",
      light: "Ligero",
      lightly_active: "Ligero",
      moderate: "Moderado",
      moderately_active: "Moderado",
      active: "Activo",
      very_active: "Muy Activo",
      extremely_active: "Extremadamente activo",
    };
    return labels[activity] || activity;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 space-y-6">
        <Card className="border shadow-none bg-linear-to-b from-primary/10 via-card to-card">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Resultado listo
                  </p>
                  <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                    Tu plan nutricional personalizado
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Basado en tus objetivos, datos corporales y nivel de actividad.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={metrics.isHealthyGoal ? "default" : "destructive"}
                  className="h-8 px-3"
                >
                  {metrics.isHealthyGoal ? "Meta saludable" : "Revisar meta"}
                </Badge>
                <Badge variant="secondary" className="h-8 px-3">
                  {getDietLabel(metrics.dietType)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {getGoalIcon(metrics.primaryGoal)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Objetivo principal
                  </p>
                  <p className="text-xl font-semibold">
                    {getGoalLabel(metrics.primaryGoal)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Actividad:{" "}
                <span className="font-medium text-foreground">
                  {getActivityLabel(metrics.activityLevel)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-primary" />
                Objetivos diarios
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border shadow-none">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <Flame className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-semibold">{metrics.dailyCaloriesTarget}</p>
                    <p className="text-sm text-muted-foreground">Calorías</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-none">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-semibold">{metrics.dailyProteinTarget}g</p>
                    <p className="text-sm text-muted-foreground">Proteína</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-none">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-semibold">{metrics.dailyCarbsTarget}g</p>
                    <p className="text-sm text-muted-foreground">Carbohidratos</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-none">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                      <Droplets className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-semibold">{metrics.dailyFatTarget}g</p>
                    <p className="text-sm text-muted-foreground">Grasas</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Distribución de macronutrientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Proteínas</span>
                    <span className="font-medium">
                      {metrics.proteinPercentage}% • {metrics.dailyProteinTarget}g
                    </span>
                  </div>
                  <Progress value={metrics.proteinPercentage} className="h-2.5" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Carbohidratos</span>
                    <span className="font-medium">
                      {metrics.carbsPercentage}% • {metrics.dailyCarbsTarget}g
                    </span>
                  </div>
                  <Progress value={metrics.carbsPercentage} className="h-2.5" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Grasas</span>
                    <span className="font-medium">
                      {metrics.fatPercentage}% • {metrics.dailyFatTarget}g
                    </span>
                  </div>
                  <Progress value={metrics.fatPercentage} className="h-2.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Métricas corporales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Peso actual</span>
                  <span className="font-medium">{metrics.currentWeight} {metrics.weightUnit}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Altura</span>
                  <span className="font-medium">{metrics.height} {metrics.heightUnit}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">IMC</span>
                  <span className="font-medium">{metrics.currentBMI.toFixed(1)} ({metrics.bmiCategory})</span>
                </div>
                {metrics.suggestedGoalWeight && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Peso objetivo</span>
                    <span className="font-medium text-primary">
                      {metrics.suggestedGoalWeight} {metrics.weightUnit}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Edad</span>
                  <span className="font-medium">{metrics.age} años</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Metabolismo y progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">TMB</span>
                  <span className="font-medium">{metrics.bmr} kcal</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">TDEE</span>
                  <span className="font-medium">{metrics.tdee} kcal</span>
                </div>
                {metrics.calorieAdjustment !== null && metrics.calorieAdjustment !== undefined && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Ajuste diario</span>
                    <span
                      className={metrics.calorieAdjustment < 0 ? "font-medium text-red-600" : "font-medium text-green-600"}
                    >
                      {metrics.calorieAdjustment > 0 ? "+" : ""}
                      {metrics.calorieAdjustment} kcal
                    </span>
                  </div>
                )}
                {metrics.dailyWaterTarget && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Agua diaria</span>
                    <span className="font-medium">{metrics.dailyWaterTarget} L</span>
                  </div>
                )}
                {metrics.estimatedWeeks && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Objetivo estimado:</span>{" "}
                      <span className="font-medium">{metrics.totalWeightToChange} kg</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Tiempo:</span>{" "}
                      <span className="font-medium">{metrics.estimatedWeeks} semanas</span>
                    </p>
                    {metrics.estimatedCompletionDate && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Fecha:</span>{" "}
                        <span className="font-medium">{metrics.estimatedCompletionDate}</span>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {metrics.warnings?.length > 0 && (
          <Card className="border-yellow-300/70 bg-yellow-50/60 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-yellow-900">Advertencias</p>
                  <ul className="space-y-1 text-sm text-yellow-900/80">
                    {metrics.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border shadow-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Planes recomendados para ti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestedMealPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedMealPlans.slice(0, 6).map((plan) => (
                  <MealPlanCard key={plan.id} {...plan} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay planes sugeridos por ahora. Puedes explorar todo el catálogo.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Link href="/tracking">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Ir a tracking
            </Button>
          </Link>
          <Link href="/meal-plans">
            <Button className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Ver todos los planes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NutritionResults;
