export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';

export type PhysicalGoal = 'lose_weight' | 'maintain_weight' | 'build_muscle' | 'gain_weight';

export type WeightChangePace = 'slow' | 'moderate' | 'aggressive';

export type DietType =  | "balanced"
  | "low_carb"
  | "keto"
  | "vegetarian"
  | "vegan"
  | "high-protein"
  | "mediterranean"

export interface OnboardingData {
  age: number | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null; 
  primaryGoal: PhysicalGoal | null;
  weightChangePace: WeightChangePace | null;
  activityLevel: ActivityLevel | null;
  physicalGoal?: PhysicalGoal;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'inches';
}

export const defaultOnboardingData: OnboardingData = {
  age: null,
  gender: null,
  height: null,
  weight: null,
  primaryGoal: null,
  weightChangePace: null,
  activityLevel: null,
  breakfastTime: '08:00:00',
  lunchTime: '13:00:00',
  dinnerTime: '20:00:00',
  weightUnit: 'kg',
  heightUnit: 'cm',
};



export const genderLabels: Record<Gender, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
};

export const activityLabels: Record<ActivityLevel, { label: string; description: string }> = {
  sedentary: { label: 'Sedentario', description: 'Poco o nada de ejercicio' },
  lightly_active: { label: 'Ligero', description: '1-3 días/semana' },
  moderately_active : { label: 'Moderado', description: '3-5 días/semana' },
  very_active: { label: 'Muy Activo', description: 'Ejercicio intenso diario' },
  extremely_active: { label: 'Extremadamente Activo', description: 'Ejercicio físico muy intenso o trabajo físico' },
};

export const goalLabels: Record<PhysicalGoal, { label: string; icon: string }> = {
  lose_weight: { label: 'Perder peso', icon: 'TrendingDown' },
  maintain_weight : { label: 'Mantener peso', icon: 'Minus' },
  build_muscle: { label: 'Ganar músculo', icon: 'Dumbbell' },
  gain_weight: { label: 'Ganar peso', icon: 'TrendingUp' },
};

export const paceLabels: Record<WeightChangePace, { label: string; description: string }> = {
  slow: { label: 'Lento', description: '0.25 kg/semana' },
  moderate: { label: 'Moderado', description: '0.5 kg/semana' },
  aggressive: { label: 'Agresivo', description: '1 kg/semana' },
};

export const dietLabels: Record<DietType, { label: string; description: string }> = {
  balanced: { label: 'Balanceada', description: 'Todo tipo de alimentos' },
  vegetarian: { label: 'Vegetariana', description: 'Sin carne ni pescado' },
  vegan: { label: 'Vegana', description: 'Solo alimentos vegetales' },
  keto: { label: 'Keto', description: 'Baja en carbohidratos' },
  mediterranean: { label: 'Mediterránea', description: 'Aceite, pescado, verduras' },
  low_carb: { label: 'Baja en carbohidratos', description: 'Reducido en carbohidratos' },
  "high-protein": { label: 'Alta en proteínas', description: 'Rica en proteínas' },
};



