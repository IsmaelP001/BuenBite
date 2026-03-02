"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  defaultOnboardingData,
  OnboardingData,
} from "@/types/models/onboarding";
import useSetUpUserNutritionalMetrics from "@/hooks/useSetupUserPreferences";
import { validateStep, ValidationError } from "@/lib/validation/onboarding";

/* ===== ENUMS ===== */

const GenderEnum = z.enum(["male", "female", "other"]);
const WeightUnitEnum = z.enum(["kg", "lbs"]);
const HeightUnitEnum = z.enum(["cm", "inches"]);
const ActivityLevelEnum = z.enum([
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "extremely_active",
]);
const PrimaryGoalEnum = z.enum([
  "lose_weight",
  "maintain_weight",
  "gain_weight",
  "build_muscle",
]);
const WeightChangePaceEnum = z.enum(["slow", "moderate", "aggressive"]);

/* ===== TIME ===== */

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

const TimeSchema = z.string().regex(
  timeRegex,
  "Formato de hora inválido. Debe ser HH:mm:ss"
);

/* ===== MAIN SCHEMA ===== */

const NutritionPlanInputSchema = z
  .object({
    age: z.number().int().min(15).max(100),
    gender: GenderEnum,
    weight: z.number().positive(),
    weightUnit: WeightUnitEnum,
    height: z.number().positive({ message: "La altura debe ser un número positivo" }),
    heightUnit: HeightUnitEnum,
    primaryGoal: PrimaryGoalEnum,
    weightChangePace: WeightChangePaceEnum.optional().nullable(),
    activityLevel: ActivityLevelEnum,
    breakfastTime: TimeSchema.optional().nullable(),
    lunchTime: TimeSchema.optional().nullable(),
    dinnerTime: TimeSchema.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const weightKg =
      data.weightUnit === "lbs" ? data.weight * 0.453592 : data.weight;

    if (weightKg < 30 || weightKg > 300) {
      ctx.addIssue({
        path: ["weight"],
        message: "El peso debe estar entre 30 y 300 kg",
        code: z.ZodIssueCode.custom,
      });
    }

    const heightCm =
      data.heightUnit === "inches" ? data.height * 2.54 : data.height;

    if (heightCm < 100 || heightCm > 250) {
      ctx.addIssue({
        path: ["height"],
        message: "La altura debe estar entre 100 y 250 cm",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.breakfastTime &&
      data.lunchTime &&
      data.breakfastTime >= data.lunchTime
    ) {
      ctx.addIssue({
        path: ["breakfastTime"],
        message: "El desayuno debe ser antes del almuerzo",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.lunchTime &&
      data.dinnerTime &&
      data.lunchTime >= data.dinnerTime
    ) {
      ctx.addIssue({
        path: ["lunchTime"],
        message: "El almuerzo debe ser antes de la cena",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const TOTAL_STEPS = 4;

type NutritionMetricsPayload = {
  age: number;
  gender: "male" | "female" | "other";
  currentWeight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "inches";
  primaryGoal: "lose_weight" | "maintain_weight" | "gain_weight" | "build_muscle";
  weightChangePace: "slow" | "moderate" | "aggressive";
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  dietType: "balanced" | "low_carb" | "keto" | "vegetarian" | "vegan" | "high-protein" | "mediterranean";
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const err = error as { message?: string | string[]; error?: string };
    if (Array.isArray(err.message) && err.message.length > 0) {
      return err.message.join(", ");
    }
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }
    if (typeof err.error === "string" && err.error.trim()) {
      return err.error;
    }
  }
  return "Error al guardar las preferencias. Inténtalo de nuevo.";
};

export function useOnboardingForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useSetUpUserNutritionalMetrics();

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // ==================== STATE ====================

  const updateData = (updates: Partial<OnboardingData>) => {
    const normalizedUpdates = { ...updates } as Partial<OnboardingData>;
    if (normalizedUpdates.physicalGoal && !normalizedUpdates.primaryGoal) {
      normalizedUpdates.primaryGoal = normalizedUpdates.physicalGoal;
    }
    setData((prev) => ({ ...prev, ...normalizedUpdates }));
    // Limpiar errores al actualizar datos
    setValidationErrors([]);
  };

  // ==================== VALIDACIÓN ====================

  const showValidationErrors = (errors: ValidationError[]) => {
    errors.forEach((error) => {
      toast.error(error.message);
    });
    setValidationErrors(errors);
  };

  const validateCurrentStep = (): boolean => {
    const { isValid, errors } = validateStep(currentStep, data);

    if (!isValid) {
      showValidationErrors(errors);
      return false;
    }

    return true;
  };

  // ==================== STEPS ====================

  const nextStep = () => {
    // Validar antes de avanzar
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
      setValidationErrors([]);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      setValidationErrors([]);
    }
  };

  const goToStep = (step: number) => {
    // No validar si vamos hacia atrás
    if (step < currentStep) {
      setCurrentStep(step);
      setValidationErrors([]);
      return;
    }

    // Validar todos los pasos intermedios si vamos hacia adelante
    for (let i = currentStep; i < step; i++) {
      const { isValid, errors } = validateStep(i, data);
      if (!isValid) {
        toast.error(`Completa el paso ${i} correctamente antes de continuar`);
        showValidationErrors(errors);
        return;
      }
    }

    setCurrentStep(step);
    setValidationErrors([]);
  };

  // ==================== VALIDACIÓN FINAL ====================

  const validateFinal = (): boolean => {
    const result = NutritionPlanInputSchema.safeParse(data);

    if (result.success) return true;

    const issues = result.error.issues;
    issues.forEach((issue) => {
      toast.error(issue.message);
    });

    return false;
  };

  // ==================== SUBMIT ====================

  const submit = async () => {
    if (!validateFinal()) return;

    try {
      const payload: NutritionMetricsPayload = {
        age: data.age as number,
        gender: data.gender as "male" | "female" | "other",
        currentWeight: data.weight as number,
        weightUnit: data.weightUnit,
        height: data.height as number,
        heightUnit: data.heightUnit,
        primaryGoal: data.primaryGoal as
          | "lose_weight"
          | "maintain_weight"
          | "gain_weight"
          | "build_muscle",
        weightChangePace: (data.weightChangePace ?? "moderate") as
          | "slow"
          | "moderate"
          | "aggressive",
        activityLevel: data.activityLevel as
          | "sedentary"
          | "lightly_active"
          | "moderately_active"
          | "very_active"
          | "extremely_active",
        breakfastTime: data.breakfastTime,
        lunchTime: data.lunchTime,
        dinnerTime: data.dinnerTime,
        // Backend requiere dietType en creación de métricas.
        dietType: "balanced",
      };

      const res = await mutateAsync(payload);

      toast.success("¡Plan de comida creado exitosamente!");
      router.push(`/tracking/onboarding/${res.data.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // ==================== HELPERS ====================

  const canAdvanceToStep = (step: number): boolean => {
    // Siempre podemos retroceder
    if (step <= currentStep) return true;

    // Para avanzar, validar todos los pasos intermedios
    for (let i = currentStep; i < step; i++) {
      const { isValid } = validateStep(i, data);
      if (!isValid) return false;
    }

    return true;
  };

  return {
    // state
    data,
    currentStep,
    isPending,
    validationErrors,

    // actions
    updateData,
    nextStep,
    prevStep,
    goToStep,
    submit,

    // helpers
    canAdvanceToStep,
    validateCurrentStep,

    // constants
    TOTAL_STEPS,
  };
}
