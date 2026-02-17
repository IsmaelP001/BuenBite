import {
  Armchair,
  BookOpen,
  Cake,
  CalendarCheck,
  Clock,
  Coffee,
  Cookie,
  Dumbbell,
  Flame,
  Heart,
  Home,
  Mars,
  Moon,
  Recycle,
  Scale,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Venus,
  Wallet,
  Zap,
} from "lucide-react";

export const mealTypes = [
  {
    id: "breakfast",
    label: "Desayuno",
    icon: Coffee,
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "lunch",
    label: "Almuerzo",
    icon: Sun,
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "dinner",
    label: "Cena",
    icon: Moon,
    color: "from-indigo-400 to-purple-500",
  },
  {
    id: "dessert",
    label: "Postres",
    icon: Cake,
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "snack",
    label: "Snacks",
    icon: Cookie,
    color: "from-yellow-400 to-amber-500",
  },
];

export const GOALS = [
  {
    id: "no-waste",
    label: "Cocinar sin desperdicios",
    description: "Aprovecha todo lo que tienes en casa",
    icon: Recycle,
  },
  {
    id: "budget",
    label: "Cuidar mi presupuesto",
    description: "Opciones económicas y accesibles",
    icon: Wallet,
  },
  {
    id: "save-time",
    label: "Ahorrar tiempo",
    description: "Recetas fáciles y rápidas",
    icon: Clock,
  },
  {
    id: "healthy",
    label: "Comer más saludable",
    description: "Recetas balanceadas y nutritivas",
    icon: Heart,
  },
  {
    id: "learn",
    label: "Aprender a cocinar",
    description: "Paso a paso y sin complicaciones",
    icon: BookOpen,
  },
  {
    id: "plan",
    label: "Planear mejor mis comidas",
    description: "Organiza tu semana con facilidad",
    icon: CalendarCheck,
  },
  {
    id: "explore",
    label: "Explorar nuevas ideas",
    description: "Descubre recetas que se adapten a ti",
    icon: Sparkles,
  },
];

export const DIETS = [
  { id: "none", label: "Sin preferencias", emoji: "✨" },
  { id: "omnivore", label: "Omnívora", emoji: "🍖" },
  { id: "vegetarian", label: "Vegetariana", emoji: "🥗" },
  { id: "vegan", label: "Vegana", emoji: "🌱" },
  { id: "keto", label: "Keto", emoji: "🥑" },
  { id: "paleo", label: "Paleo", emoji: "🥩" },
  { id: "gluten-free", label: "Sin gluten", emoji: "🌾" },
  { id: "lactose-free", label: "Sin lactosa", emoji: "🥛" },
];

export enum ActivityLevel {
  SEDENTARY = "sedentary", // Poco o ningún ejercicio
  LIGHTLY_ACTIVE = "lightly_active", // Ejercicio ligero 1-3 días/semana
  MODERATELY_ACTIVE = "moderately_active", // Ejercicio moderado 3-5 días/semana
  VERY_ACTIVE = "very_active", // Ejercicio intenso 6-7 días/semana
  EXTREMELY_ACTIVE = "extremely_active", // Ejercicio muy intenso + trabajo físico
}

export const ACTIVITY_LEVELS = [
  {
    id: ActivityLevel.SEDENTARY,
    label: "Sedentario",
    description: "Poco o ningún ejercicio",
    detail: "Trabajo de oficina, sin actividad física regular",
    Icon: Armchair,
    color: "bg-gray-500",
  },
  {
    id: ActivityLevel.LIGHTLY_ACTIVE,
    label: "Ligera",
    description: "Ejercicio 1-3 días/semana",
    detail: "Caminatas ocasionales, ejercicio ligero",
    Icon: Home,
    color: "bg-blue-500",
  },
  {
    id: ActivityLevel.MODERATELY_ACTIVE,
    label: "Moderada",
    description: "Ejercicio 3-5 días/semana",
    detail: "Rutina de ejercicio regular",
    Icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    id: ActivityLevel.VERY_ACTIVE,
    label: "Activa",
    description: "Ejercicio 6-7 días/semana",
    detail: "Entrenamiento intenso diario",
    Icon: Zap,
    color: "bg-purple-500",
  },
  {
    id: ActivityLevel.EXTREMELY_ACTIVE,
    label: "Muy activa",
    description: "Ejercicio intenso diario + trabajo físico",
    detail: "Atleta o trabajo físicamente demandante",
    Icon: Flame,
    color: "bg-red-500",
  },
];

export enum PrimaryGoal {
  LOSE_WEIGHT = "lose_weight",
  MAINTAIN_WEIGHT = "maintain_weight",
  GAIN_WEIGHT = "gain_weight",
  BUILD_MUSCLE = "build_muscle",
}
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export const GENDER_OPTIONS = [
  {
    id: Gender.MALE,
    label: "Masculino",
    icon: Mars,
    // Material blue 500
    color: "#2196F3",
  },
  {
    id: Gender.FEMALE,
    label: "Femenino",
    icon: Venus,
    // Material pink 500
    color: "#E91E63",
  },
];

export const PRIMARY_GOAL_OPTIONS = [
  {
    id: PrimaryGoal.LOSE_WEIGHT,
    label: "Perder peso",
    Icon: Scale,
    description: "Alcanza tu peso ideal de forma saludable",
    color: "#F97316",
  },
  {
    id: PrimaryGoal.BUILD_MUSCLE,
    label: "Ganar masa muscular",
    Icon: Dumbbell,
    description: "Desarrolla músculo de manera efectiva",
    color: "#3B82F6",
  },
  {
    id: PrimaryGoal.MAINTAIN_WEIGHT,
    label: "Mantener mi dieta",
    Icon: Target,
    description: "Consistencia en tu alimentación",
    color: "#EF4444",
  },
];

export enum WeightChangePace {
  SLOW = "slow", // Lento: 0.25kg/semana
  MODERATE = "moderate", // Moderado: 0.5kg/semana
  AGGRESSIVE = "aggressive",
}
export const PACE_OPTIONS = [
  {
    id: WeightChangePace.SLOW,
    label: "Lento y sostenible",
    emoji: "🐢",
    weeklyChange: "0.25 kg/semana",
    description: "Cambio gradual, más fácil de mantener",
    color: "#10b981",
  },
  {
    id: WeightChangePace.MODERATE,
    label: "Moderado",
    emoji: "🚶",
    weeklyChange: "0.5 kg/semana",
    description: "Balance entre resultados y comodidad",
    color: "#f59e0b",
  },
  {
    id: WeightChangePace.AGGRESSIVE,
    label: "Rápido e intensivo",
    emoji: "🏃",
    weeklyChange: "0.75 kg/semana",
    description: "Resultados rápidos, requiere más disciplina",
    color: "#ef4444",
  },
];
