import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  const { data: metrics } =
    await apiClient.userService.getUserNutritionalMetricsById(id);

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
      gain_muscle: "Ganar músculo",
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
    };
    return labels[diet] || diet;
  };

  const getActivityLabel = (activity: string) => {
    const labels: Record<string, string> = {
      sedentary: "Sedentario",
      light: "Ligero",
      moderate: "Moderado",
      active: "Activo",
      very_active: "Muy Activo",
    };
    return labels[activity] || activity;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className=" flex flex-row max-w-7xl mx-auto px-8">
          <div className="flex flex-row">
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-center mb-4">
              Tu Plan Nutricional Personalizado
            </h1>
          </div>
          <p className="text-xl mt-5 text-indigo-100 max-w-2xl mx-auto">
            Hemos calculado un plan único basado en tus objetivos y metabolismo
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-8 pb-12">
        {/* Goal Card - Floating */}
        <Card className="mb-8 shadow-sm border-0 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg">
                  {getGoalIcon(metrics.primaryGoal)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                    Tu Objetivo Principal
                  </p>
                  <p className="font-bold text-3xl text-foreground">
                    {getGoalLabel(metrics.primaryGoal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={metrics.isHealthyGoal ? "default" : "destructive"}
                  className="px-4 py-2 text-sm"
                >
                  {metrics.isHealthyGoal ? "✓ Meta saludable" : "Revisar meta"}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  {getDietLabel(metrics.dietType)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Daily Targets */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Nutrition Cards */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-indigo-600" />
                Objetivos Diarios
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-orange-50 to-red-50">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-linear-to-br from-orange-500 to-red-500 shadow-md">
                        <Flame className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Principal
                      </Badge>
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-1">
                      {metrics.dailyCaloriesTarget}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Calorías por día
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-red-50 to-pink-50">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-linear-to-br from-red-500 to-pink-500 shadow-md">
                        <Utensils className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {metrics.proteinPercentage}%
                      </Badge>
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-1">
                      {metrics.dailyProteinTarget}g
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Proteína diaria
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {metrics.carbsPercentage}%
                      </Badge>
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-1">
                      {metrics.dailyCarbsTarget}g
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Carbohidratos
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                        <Droplets className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {metrics.fatPercentage}%
                      </Badge>
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-1">
                      {metrics.dailyFatTarget}g
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Grasas saludables
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Macros Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Distribución de Macronutrientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Proteínas
                    </span>
                    <span className="text-sm font-bold">
                      {metrics.proteinPercentage}% •{" "}
                      {metrics.dailyProteinTarget}g
                    </span>
                  </div>
                  <Progress value={metrics.proteinPercentage} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      Carbohidratos
                    </span>
                    <span className="text-sm font-bold">
                      {metrics.carbsPercentage}% • {metrics.dailyCarbsTarget}g
                    </span>
                  </div>
                  <Progress value={metrics.carbsPercentage} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Grasas
                    </span>
                    <span className="text-sm font-bold">
                      {metrics.fatPercentage}% • {metrics.dailyFatTarget}g
                    </span>
                  </div>
                  <Progress value={metrics.fatPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metrics & Timeline */}
          <div className="space-y-8">
            {/* Body Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Scale className="h-5 w-5 text-indigo-600" />
                  Métricas Corporales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Peso actual
                  </span>
                  <span className="font-semibold text-lg">
                    {metrics.currentWeight} {metrics.weightUnit}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Altura</span>
                  <span className="font-semibold text-lg">
                    {metrics.height} {metrics.heightUnit}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    IMC actual
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-lg block">
                      {metrics.currentBMI.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {metrics.bmiCategory}
                    </span>
                  </div>
                </div>
                {metrics.suggestedGoalWeight && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Peso objetivo
                    </span>
                    <span className="font-semibold text-lg text-indigo-600">
                      {metrics.suggestedGoalWeight} {metrics.weightUnit}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Edad</span>
                  <span className="font-semibold text-lg">
                    {metrics.age} años
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metabolism */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Metabolismo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    TMB (Basal)
                  </span>
                  <span className="font-semibold text-lg">
                    {metrics.bmr} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    TDEE (Total)
                  </span>
                  <span className="font-semibold text-lg">
                    {metrics.tdee} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Actividad
                  </span>
                  <span className="font-semibold text-sm">
                    {getActivityLabel(metrics.activityLevel)}
                  </span>
                </div>
                {metrics.calorieAdjustment && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Ajuste diario
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        metrics.calorieAdjustment < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {metrics.calorieAdjustment > 0 ? "+" : ""}
                      {metrics.calorieAdjustment} kcal
                    </span>
                  </div>
                )}
                {metrics.dailyWaterTarget && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">
                      Agua diaria
                    </span>
                    <span className="font-semibold text-lg text-blue-600">
                      {metrics.dailyWaterTarget} L
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            {metrics.estimatedWeeks && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Progreso Estimado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <p className="text-4xl font-bold text-indigo-600 mb-1">
                        {metrics.totalWeightToChange}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        kg a cambiar
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.estimatedWeeks}
                        </p>
                        <p className="text-xs text-muted-foreground">semanas</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.weeklyWeightChange}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          kg/semana
                        </p>
                      </div>
                    </div>
                    {metrics.estimatedCompletionDate && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Fecha estimada
                        </p>
                        <p className="font-semibold text-indigo-600">
                          {metrics.estimatedCompletionDate}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Warnings */}
        {metrics.warnings.length > 0 && (
          <Card className="mb-12 border-yellow-500/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-lg text-yellow-700 mb-2">
                    Advertencias
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {metrics.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/calories-tracking/plans/suggested">
            <Button
              className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar Planes Sugeridos
            </Button>
          </Link>
          <Link href="/calories-tracking">
            <Button
              variant="outline"
              className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NutritionResults;
