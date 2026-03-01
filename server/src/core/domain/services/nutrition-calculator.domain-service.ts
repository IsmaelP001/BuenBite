/**
 * Domain Service: NutritionCalculator
 *
 * Pure domain logic for calculating nutrition plans, BMR, TDEE, macros, and BMI.
 * No framework dependencies — this is a pure domain service.
 */
import {
  ActivityLevel,
  Gender,
  HeightUnit,
  PrimaryGoal,
  WeightChangePace,
  WeightUnit,
} from '../user.model';

export interface NutritionInput {
  gender: Gender;
  age: number;
  currentWeight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  weightChangePace: WeightChangePace;
}

export interface NutritionPlan {
  currentWeight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  currentWeightKg: number;
  heightCm: number;
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  currentBMI: number;
  bmiCategory: string;
  goalBMI: number;
  suggestedGoalWeight: number;
  suggestedGoalWeightKg: number;
  totalWeightToChange: number;
  calorieAdjustment: number;
  dailyCaloriesTarget: number;
  dailyProteinTarget: number;
  dailyFatTarget: number;
  dailyCarbsTarget: number;
  proteinPercentage: number;
  fatPercentage: number;
  carbsPercentage: number;
  weeklyWeightChange: number;
  estimatedWeeks: number;
  estimatedMonths: number;
  estimatedCompletionDate: Date;
  dailyWaterTarget: number;
  isHealthyGoal: boolean;
  warnings: string[];
  calculatedAt: Date;
}

export interface MacroDistribution {
  protein: number;
  fat: number;
  carbs: number;
  proteinCals: number;
  fatCals: number;
  carbsCals: number;
}

export interface BMIResult {
  bmi: number;
  category: string;
  isHealthy: boolean;
  minHealthyWeight: number;
  maxHealthyWeight: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
  [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
  [ActivityLevel.VERY_ACTIVE]: 1.725,
  [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
};

const CALORIE_ADJUSTMENTS: Record<PrimaryGoal, Record<WeightChangePace, number>> = {
  [PrimaryGoal.LOSE_WEIGHT]: {
    [WeightChangePace.SLOW]: -250,
    [WeightChangePace.MODERATE]: -500,
    [WeightChangePace.AGGRESSIVE]: -750,
  },
  [PrimaryGoal.MAINTAIN_WEIGHT]: {
    [WeightChangePace.SLOW]: 0,
    [WeightChangePace.MODERATE]: 0,
    [WeightChangePace.AGGRESSIVE]: 0,
  },
  [PrimaryGoal.GAIN_WEIGHT]: {
    [WeightChangePace.SLOW]: 200,
    [WeightChangePace.MODERATE]: 300,
    [WeightChangePace.AGGRESSIVE]: 400,
  },
  [PrimaryGoal.BUILD_MUSCLE]: {
    [WeightChangePace.SLOW]: 250,
    [WeightChangePace.MODERATE]: 350,
    [WeightChangePace.AGGRESSIVE]: 450,
  },
};

const WEEKLY_WEIGHT_CHANGE: Record<WeightChangePace, number> = {
  [WeightChangePace.SLOW]: 0.25,
  [WeightChangePace.MODERATE]: 0.5,
  [WeightChangePace.AGGRESSIVE]: 0.75,
};

const CALORIES_PER_GRAM = { PROTEIN: 4, CARBS: 4, FAT: 9 };

export class NutritionCalculatorDomainService {
  static calculatePlan(input: NutritionInput): NutritionPlan {
    this.validateInput(input);

    const weightKg = this.convertToKg(input.currentWeight, input.weightUnit);
    const heightCm = this.convertToCm(input.height, input.heightUnit);
    const currentBMI = this.calculateBMI(weightKg, heightCm);
    const bmiResult = this.getBMICategory(currentBMI, heightCm);
    const goalWeightKg = this.calculateHealthyGoalWeight(weightKg, heightCm, input.primaryGoal, currentBMI);
    const goalBMI = this.calculateBMI(goalWeightKg, heightCm);
    const bmr = this.calculateBMR(weightKg, heightCm, input.age, input.gender);
    const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel];
    const tdee = bmr * activityMultiplier;
    const calorieAdjustment = CALORIE_ADJUSTMENTS[input.primaryGoal][input.weightChangePace];
    const dailyCalories = Math.round(tdee + calorieAdjustment);
    const validatedCalories = this.validateMinimumCalories(dailyCalories, input.gender);
    const macros = this.calculateMacros(validatedCalories, weightKg, input.primaryGoal);
    const totalWeightChange = Math.abs(goalWeightKg - weightKg);
    const weeklyChange =
      input.primaryGoal === PrimaryGoal.MAINTAIN_WEIGHT
        ? 0
        : WEEKLY_WEIGHT_CHANGE[input.weightChangePace];
    const estimatedWeeks = weeklyChange > 0 ? Math.ceil(totalWeightChange / weeklyChange) : 0;
    const dailyWater = this.calculateDailyWater(weightKg, input.activityLevel);
    const validation = this.validateGoalHealth(
      weightKg, goalWeightKg, heightCm, currentBMI, goalBMI, validatedCalories, input.gender,
    );

    return {
      currentWeight: input.currentWeight,
      weightUnit: input.weightUnit,
      height: input.height,
      heightUnit: input.heightUnit,
      currentWeightKg: weightKg,
      heightCm,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityMultiplier,
      currentBMI: parseFloat(currentBMI.toFixed(1)),
      bmiCategory: bmiResult.category,
      goalBMI: parseFloat(goalBMI.toFixed(1)),
      suggestedGoalWeight: this.convertFromKg(goalWeightKg, input.weightUnit),
      suggestedGoalWeightKg: goalWeightKg,
      totalWeightToChange: parseFloat(totalWeightChange.toFixed(1)),
      calorieAdjustment,
      dailyCaloriesTarget: validatedCalories,
      dailyProteinTarget: macros.protein,
      dailyFatTarget: macros.fat,
      dailyCarbsTarget: macros.carbs,
      proteinPercentage: parseFloat(((macros.proteinCals / validatedCalories) * 100).toFixed(1)),
      fatPercentage: parseFloat(((macros.fatCals / validatedCalories) * 100).toFixed(1)),
      carbsPercentage: parseFloat(((macros.carbsCals / validatedCalories) * 100).toFixed(1)),
      weeklyWeightChange: weeklyChange,
      estimatedWeeks,
      estimatedMonths: parseFloat((estimatedWeeks / 4.33).toFixed(1)),
      estimatedCompletionDate: this.addWeeks(new Date(), estimatedWeeks),
      dailyWaterTarget: dailyWater,
      isHealthyGoal: validation.isHealthy,
      warnings: validation.warnings,
      calculatedAt: new Date(),
    };
  }

  static calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === Gender.MALE) return base + 5;
    if (gender === Gender.FEMALE) return base - 161;
    return base - 78;
  }

  static calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  static getBMICategory(bmi: number, heightCm: number): BMIResult {
    const heightM = heightCm / 100;
    const minHealthyWeight = 18.5 * heightM * heightM;
    const maxHealthyWeight = 24.9 * heightM * heightM;

    let category: string;
    let isHealthy: boolean;

    if (bmi < 16) { category = 'Desnutrición severa'; isHealthy = false; }
    else if (bmi < 17) { category = 'Desnutrición moderada'; isHealthy = false; }
    else if (bmi < 18.5) { category = 'Bajo peso'; isHealthy = false; }
    else if (bmi < 25) { category = 'Peso normal'; isHealthy = true; }
    else if (bmi < 30) { category = 'Sobrepeso'; isHealthy = false; }
    else if (bmi < 35) { category = 'Obesidad clase I'; isHealthy = false; }
    else if (bmi < 40) { category = 'Obesidad clase II'; isHealthy = false; }
    else { category = 'Obesidad clase III'; isHealthy = false; }

    return {
      bmi,
      category,
      isHealthy,
      minHealthyWeight: parseFloat(minHealthyWeight.toFixed(1)),
      maxHealthyWeight: parseFloat(maxHealthyWeight.toFixed(1)),
    };
  }

  static calculateHealthyGoalWeight(
    currentWeightKg: number, heightCm: number, goal: PrimaryGoal, currentBMI: number,
  ): number {
    const heightM = heightCm / 100;
    if (goal === PrimaryGoal.LOSE_WEIGHT) {
      if (currentBMI > 24.9) return parseFloat((23 * heightM * heightM).toFixed(1));
      return parseFloat((currentWeightKg * 0.93).toFixed(1));
    }
    if (goal === PrimaryGoal.GAIN_WEIGHT || goal === PrimaryGoal.BUILD_MUSCLE) {
      if (currentBMI < 18.5) return parseFloat((20 * heightM * heightM).toFixed(1));
      return parseFloat((currentWeightKg * 1.07).toFixed(1));
    }
    return currentWeightKg;
  }

  static calculateMacros(dailyCalories: number, weightKg: number, goal: PrimaryGoal): MacroDistribution {
    let proteinGramsPerKg: number;
    let fatPercentage: number;

    switch (goal) {
      case PrimaryGoal.LOSE_WEIGHT: proteinGramsPerKg = 2.0; fatPercentage = 0.25; break;
      case PrimaryGoal.BUILD_MUSCLE: proteinGramsPerKg = 2.2; fatPercentage = 0.25; break;
      case PrimaryGoal.GAIN_WEIGHT: proteinGramsPerKg = 1.8; fatPercentage = 0.30; break;
      default: proteinGramsPerKg = 1.6; fatPercentage = 0.30;
    }

    const protein = Math.round(weightKg * proteinGramsPerKg);
    const proteinCals = protein * CALORIES_PER_GRAM.PROTEIN;
    const fat = Math.round((dailyCalories * fatPercentage) / CALORIES_PER_GRAM.FAT);
    const fatCals = fat * CALORIES_PER_GRAM.FAT;
    const carbsCals = dailyCalories - proteinCals - fatCals;
    const carbs = Math.round(carbsCals / CALORIES_PER_GRAM.CARBS);

    return { protein, fat, carbs, proteinCals, fatCals, carbsCals };
  }

  static calculateDailyWater(weightKg: number, activityLevel: ActivityLevel): number {
    const baseWater = weightKg * 0.033;
    const bonus: Record<ActivityLevel, number> = {
      [ActivityLevel.SEDENTARY]: 0,
      [ActivityLevel.LIGHTLY_ACTIVE]: 0.3,
      [ActivityLevel.MODERATELY_ACTIVE]: 0.5,
      [ActivityLevel.VERY_ACTIVE]: 0.7,
      [ActivityLevel.EXTREMELY_ACTIVE]: 1.0,
    };
    return parseFloat((baseWater + bonus[activityLevel]).toFixed(1));
  }

  static convertToKg(weight: number, unit: WeightUnit): number {
    return unit === WeightUnit.LBS ? parseFloat((weight * 0.453592).toFixed(1)) : weight;
  }

  static convertFromKg(weightKg: number, unit: WeightUnit): number {
    const w = Number(weightKg);
    return unit === WeightUnit.LBS
      ? parseFloat((w / 0.453592).toFixed(1))
      : parseFloat(w.toFixed(1));
  }

  static convertToCm(height: number, unit: HeightUnit): number {
    return unit === HeightUnit.INCHES ? parseFloat((height * 2.54).toFixed(1)) : height;
  }

  private static validateMinimumCalories(calories: number, gender: Gender): number {
    const min = gender === Gender.FEMALE ? 1200 : 1500;
    return calories < min ? min : calories;
  }

  private static validateGoalHealth(
    _currentWeightKg: number, goalWeightKg: number, _heightCm: number,
    currentBMI: number, goalBMI: number, dailyCalories: number, gender: Gender,
  ): { isHealthy: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isHealthy = true;

    if (goalBMI < 18.5) {
      warnings.push('El peso objetivo está por debajo del rango saludable (BMI < 18.5)');
      isHealthy = false;
    }
    if (goalBMI > 24.9 && goalWeightKg < _currentWeightKg) {
      warnings.push('Considera un objetivo de peso más ambicioso para mejor salud');
    }

    const weightChange = Math.abs(goalWeightKg - _currentWeightKg);
    const percentChange = (weightChange / _currentWeightKg) * 100;
    if (percentChange > 20) {
      warnings.push('El cambio de peso planteado es muy agresivo (>20%). Considera objetivos incrementales.');
      isHealthy = false;
    }

    const minCalories = gender === Gender.FEMALE ? 1200 : 1500;
    if (dailyCalories === minCalories) {
      warnings.push(
        `Has alcanzado el mínimo de calorías seguras (${minCalories}). Considera aumentar tu actividad física.`,
      );
    }

    return { isHealthy, warnings };
  }

  private static validateInput(input: NutritionInput): void {
    if (input.age < 15 || input.age > 100) {
      throw new Error('La edad debe estar entre 15 y 100 años');
    }
    const weightKg = this.convertToKg(input.currentWeight, input.weightUnit);
    if (weightKg < 30 || weightKg > 300) {
      throw new Error('El peso debe estar entre 30-300 kg (66-660 lbs)');
    }
    const heightCm = this.convertToCm(input.height, input.heightUnit);
    if (heightCm < 100 || heightCm > 250) {
      throw new Error('La altura debe estar entre 100-250 cm (39-98 inches)');
    }
    if (!Object.values(Gender).includes(input.gender)) throw new Error('Género inválido');
    if (!Object.values(ActivityLevel).includes(input.activityLevel)) throw new Error('Nivel de actividad inválido');
    if (!Object.values(PrimaryGoal).includes(input.primaryGoal)) throw new Error('Objetivo inválido');
    if (!Object.values(WeightChangePace).includes(input.weightChangePace)) throw new Error('Ritmo inválido');
  }

  private static addWeeks(date: Date, weeks: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
  }
}
