// nutrition-calculator.service.ts
/**
 * Application Service: Thin wrapper around NutritionCalculatorDomainService.
 * Keeps the NestJS @Injectable() contract while delegating all business logic to the domain layer.
 */
import { Injectable } from '@nestjs/common';
import {
  NutritionCalculatorDomainService,
  NutritionInput,
  NutritionPlan,
  MacroDistribution,
  BMIResult,
} from '../../domain/services/nutrition-calculator.domain-service';
import { ActivityLevel, Gender, HeightUnit, PrimaryGoal, WeightUnit } from '../../domain/user.model';

// Re-export domain types so existing consumers keep working
export { NutritionInput as UserInput, NutritionPlan, MacroDistribution, BMIResult };

@Injectable()
export class NutritionCalculatorService {

  calculateNutritionPlan(input: NutritionInput): NutritionPlan {
    return NutritionCalculatorDomainService.calculatePlan(input);
  }

  calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
    return NutritionCalculatorDomainService.calculateBMR(weightKg, heightCm, age, gender);
  }

  calculateBMI(weightKg: number, heightCm: number): number {
    return NutritionCalculatorDomainService.calculateBMI(weightKg, heightCm);
  }

  getBMICategory(bmi: number, heightCm: number): BMIResult {
    return NutritionCalculatorDomainService.getBMICategory(bmi, heightCm);
  }

  calculateHealthyGoalWeight(
    currentWeightKg: number,
    heightCm: number,
    goal: PrimaryGoal,
    currentBMI: number,
  ): number {
    return NutritionCalculatorDomainService.calculateHealthyGoalWeight(currentWeightKg, heightCm, goal, currentBMI);
  }

  calculateMacros(dailyCalories: number, weightKg: number, goal: PrimaryGoal): MacroDistribution {
    return NutritionCalculatorDomainService.calculateMacros(dailyCalories, weightKg, goal);
  }

  calculateDailyWater(weightKg: number, activityLevel: ActivityLevel): number {
    return NutritionCalculatorDomainService.calculateDailyWater(weightKg, activityLevel);
  }

  convertToKg(weight: number, unit: WeightUnit): number {
    return NutritionCalculatorDomainService.convertToKg(weight, unit);
  }

  convertFromKg(weightKg: number, unit: WeightUnit): number {
    return NutritionCalculatorDomainService.convertFromKg(weightKg, unit);
  }

  convertToCm(height: number, unit: HeightUnit): number {
    return NutritionCalculatorDomainService.convertToCm(height, unit);
  }

  calculateTDEE(bmr: number, activityMultiplier: number): number {
    return bmr * activityMultiplier;
  }

  calculateDailyCalories(tdee: number, calorieAdjustment: number): number {
    return Math.round(tdee + calorieAdjustment);
  }

  addWeeks(date: Date, weeks: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
  }

  daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatEstimatedDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}