import { z } from "zod";
import { OnboardingData } from "@/types/models/onboarding";

/* ===== SCHEMAS DE VALIDACIÓN POR PASO ===== */

// Paso 1: Datos Corporales
export const BodyDataSchema = z.object({
  age: z
    .number({ message: "La edad es requerida" })
    .int({ message: "La edad debe ser un número entero" })
    .min(15, { message: "Debes tener al menos 15 años" })
    .max(100, { message: "La edad máxima es 100 años" }),

  gender: z.enum(["male", "female", "other"] as const, {
    message: "El género es requerido",
  }),

  height: z
    .number({ message: "La altura es requerida" })
    .positive({ message: "La altura debe ser un número positivo" })
    .min(100, { message: "La altura mínima es 100 cm" })
    .max(250, { message: "La altura máxima es 250 cm" }),

  weight: z
    .number({ message: "El peso es requerido" })
    .positive({ message: "El peso debe ser un número positivo" })
    .min(30, { message: "El peso mínimo es 30 kg" })
    .max(300, { message: "El peso máximo es 300 kg" }),
});

// Paso 2: Objetivo y Actividad
export const GoalActivitySchema = z
  .object({
    primaryGoal: z.enum(
      ["lose_weight", "maintain_weight", "gain_weight", "build_muscle"],
      { message: "El objetivo físico es requerido" }
    ),

    weightChangePace: z
      .enum(["slow", "moderate", "aggressive"])
      .optional()
      .nullable(),

    activityLevel: z.enum(
      [
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extremely_active",
      ],
      { message: "El nivel de actividad es requerido" }
    ),
  })
  .superRefine((data, ctx) => {
    // Si el objetivo no es mantener peso, el ritmo es obligatorio
    if (
      data.primaryGoal !== "maintain_weight" &&
      !data.weightChangePace
    ) {
      ctx.addIssue({
        path: ["weightChangePace"],
        message: "Selecciona el ritmo de cambio para tu objetivo",
        code: z.ZodIssueCode.custom,
      });
    }
  });

// Paso 3: Preferencias de Comida
export const FoodPreferencesSchema = z
  .object({
    breakfastTime: z
      .string()
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:mm:ss)",
      })
      .optional()
      .nullable(),

    lunchTime: z
      .string()
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:mm:ss)",
      })
      .optional()
      .nullable(),

    dinnerTime: z
      .string()
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:mm:ss)",
      })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // Validar orden cronológico de las comidas
    if (data.breakfastTime && data.lunchTime) {
      if (data.breakfastTime >= data.lunchTime) {
        ctx.addIssue({
          path: ["lunchTime"],
          message: "El almuerzo debe ser después del desayuno",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.lunchTime && data.dinnerTime) {
      if (data.lunchTime >= data.dinnerTime) {
        ctx.addIssue({
          path: ["dinnerTime"],
          message: "La cena debe ser después del almuerzo",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.breakfastTime && data.dinnerTime) {
      if (data.breakfastTime >= data.dinnerTime) {
        ctx.addIssue({
          path: ["dinnerTime"],
          message: "La cena debe ser después del desayuno",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

/* ===== FUNCIÓN DE VALIDACIÓN POR PASO ===== */

export type ValidationError = {
  field: string;
  message: string;
};

export const validateStep = (
  step: number,
  data: OnboardingData
): { isValid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  try {
    switch (step) {
      case 1: {
        const result = BodyDataSchema.safeParse({
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
        });

        if (!result.success) {
          result.error.issues.forEach((issue) => {
            errors.push({
              field: issue.path[0]?.toString() || "unknown",
              message: issue.message,
            });
          });
        }
        break;
      }

      case 2: {
        const result = GoalActivitySchema.safeParse({
          primaryGoal: data.primaryGoal,
          weightChangePace: data.weightChangePace,
          activityLevel: data.activityLevel,
        });

        if (!result.success) {
          result.error.issues.forEach((issue) => {
            errors.push({
              field: issue.path[0]?.toString() || "unknown",
              message: issue.message,
            });
          });
        }
        break;
      }

      case 3: {
        const result = FoodPreferencesSchema.safeParse({
          breakfastTime: data.breakfastTime,
          lunchTime: data.lunchTime,
          dinnerTime: data.dinnerTime,
        });

        if (!result.success) {
          result.error.issues.forEach((issue) => {
            errors.push({
              field: issue.path[0]?.toString() || "unknown",
              message: issue.message,
            });
          });
        }
        break;
      }

      case 4:
        // Paso 4 es resumen, no requiere validación adicional
        // La validación final se hace en el submit
        break;

      default:
        errors.push({
          field: "step",
          message: "Paso inválido",
        });
    }
  } catch (error) {
    errors.push({
      field: "general",
      message: "Error de validación inesperado",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/* ===== HELPER PARA VERIFICAR SI UN PASO ESTÁ COMPLETO ===== */

export const isStepComplete = (step: number, data: OnboardingData): boolean => {
  const { isValid } = validateStep(step, data);
  return isValid;
};