'use client'
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ACTIVITY_LEVELS,
  GENDER_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
} from "@/lib/config";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, Salad } from "lucide-react";
import useGetUserNutritionalMetrics from "@/hooks/useGetUserNutritionalMetrics";
import { useEffect, useMemo, useState } from "react";
import useUpdateUserNutritionalMetrics from "@/hooks/useUpdateUserNutritionalMetrics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";

const VALIDATION_RULES = {
  currentWeight: { min: 20, max: 300, label: "Peso" },
  height: { min: 100, max: 250, label: "Altura" },
  age: { min: 15, max: 100, label: "Edad" },
} as const;

type NumericField = keyof typeof VALIDATION_RULES;
type SelectField = "primaryGoal" | "activityLevel" | "gender";

interface LocalNutritionValues {
  currentWeight: number;
  height: number;
  age: number;
}

interface PendingChange {
  field: SelectField | "numeric";
  value: string | LocalNutritionValues;
  type: "select" | "numeric";
}

export default function NutritionTab() {
  const { data: nutrition,isFetching:isPendingNutrition } = useGetUserNutritionalMetrics();
  const { mutate: updateNutritionMutation, isPending } =
    useUpdateUserNutritionalMetrics();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(
    null
  );

  const hasNutritionData = useMemo(() => {
    return !!(
      nutrition &&
      nutrition.currentWeight &&
      nutrition.height &&
      nutrition.age &&
      nutrition.gender &&
      nutrition.primaryGoal &&
      nutrition.activityLevel
    );
  }, [nutrition]);

  const initialValues = useMemo(
    () => ({
      currentWeight: nutrition?.currentWeight ?? 0,
      height: nutrition?.height ?? 0,
      age: nutrition?.age ?? 0,
    }),
    [nutrition?.currentWeight, nutrition?.height, nutrition?.age]
  );

  const [localValues, setLocalValues] =
    useState<LocalNutritionValues>(initialValues);

  useEffect(() => {
    setLocalValues(initialValues);
  }, [initialValues]);

  

  const validateField = (
    field: NumericField,
    value: number
  ): { isValid: boolean; message?: string } => {
    if (!value && value !== 0) {
      return { isValid: false, message: "Este campo es obligatorio" };
    }

    const rules = VALIDATION_RULES[field];
    if (value < rules.min || value > rules.max) {
      return {
        isValid: false,
        message: `${rules.label} debe estar entre ${rules.min} y ${rules.max}`,
      };
    }

    return { isValid: true };
  };

  const fieldValidations = useMemo(() => {
    return {
      currentWeight: validateField("currentWeight", localValues.currentWeight),
      height: validateField("height", localValues.height),
      age: validateField("age", localValues.age),
    };
  }, [localValues]);

  const hasUnsavedChanges = useMemo(() => {
    if (!nutrition) return false;
    return (
      nutrition.currentWeight !== localValues.currentWeight ||
      nutrition.height !== localValues.height ||
      nutrition.age !== localValues.age
    );
  }, [nutrition, localValues]);

  const allFieldsValid = useMemo(() => {
    return Object.values(fieldValidations).every((v) => v.isValid);
  }, [fieldValidations]);

  const handleNumericChange = (field: NumericField, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setLocalValues((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSelectChange = (field: SelectField, value: string) => {
    setPendingChange({ field, value, type: "select" });
    setShowConfirmDialog(true);
  };

  const prepareNumericSave = () => {
    if (!allFieldsValid) {
      toast.error("Por favor corrige los errores antes de guardar");
      return;
    }

    setPendingChange({
      field: "numeric",
      value: localValues,
      type: "numeric",
    });
    setShowConfirmDialog(true);
  };

  const confirmChange = () => {
    if (!pendingChange) return;

    if (pendingChange.type === "select") {
      updateNutritionMutation({ [pendingChange.field]: pendingChange.value });
    } else if (pendingChange.type === "numeric") {
      const values = pendingChange.value as LocalNutritionValues;
      updateNutritionMutation({
        currentWeight: values.currentWeight,
        height: values.height,
        age: values.age,
      });
    }

    setShowConfirmDialog(false);
    setPendingChange(null);
  };

  const cancelChange = () => {
    if (pendingChange?.type === "numeric") {
      setLocalValues(initialValues);
    }

    setShowConfirmDialog(false);
    setPendingChange(null);
  };

  const getModalMessage = () => {
    if (pendingChange?.type === "numeric") {
      return "Estos cambios afectarán tu plan nutricional personalizado. Los cálculos de calorías y macronutrientes se actualizarán según tus nuevos datos físicos.";
    }
    return "Este cambio afectará tu plan nutricional personalizado. Los cálculos de calorías y macronutrientes se actualizarán según tu nueva configuración.";
  };

  console.log('nutrition data',nutrition)
    console.log('isPendingNutrition nutrition data',isPendingNutrition)


  return (
    <>
      <TabsContent value="nutrition" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan de nutrición</CardTitle>
            <CardDescription>
              Configura tus datos para calcular tu plan nutricional
              personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!nutrition && !isPendingNutrition ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Salad className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No tienes tus datos nutricionales configurados
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Configura tu perfil nutricional para obtener un plan
                  personalizado de calorías y macronutrientes adaptado a tus
                  objetivos.
                </p>
               <Link href="/tracking/onboarding">
                  <Button size="lg">
                    Configurar ahora
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Campos de selección - Se guardan inmediatamente con confirmación */}
                <div className="space-y-2">
                  <Label>Objetivo principal</Label>
                  <Select
                    value={nutrition?.primaryGoal}
                    onValueChange={(value) =>
                      handleSelectChange("primaryGoal", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIMARY_GOAL_OPTIONS.map(({ id, label }) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nivel de actividad</Label>
                  <Select
                    value={nutrition?.activityLevel}
                    onValueChange={(value) =>
                      handleSelectChange("activityLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map(({ id, label }) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Campos numéricos - Se guardan con el botón y confirmación modal */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso actual (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      min={VALIDATION_RULES.currentWeight.min}
                      max={VALIDATION_RULES.currentWeight.max}
                      value={localValues.currentWeight || ""}
                      onChange={(e) =>
                        handleNumericChange("currentWeight", e.target.value)
                      }
                    />
                    {!fieldValidations.currentWeight.isValid && (
                      <p className="text-sm text-destructive">
                        {fieldValidations.currentWeight.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Entre {VALIDATION_RULES.currentWeight.min} y{" "}
                      {VALIDATION_RULES.currentWeight.max} kg
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      min={VALIDATION_RULES.height.min}
                      max={VALIDATION_RULES.height.max}
                      value={localValues.height || ""}
                      onChange={(e) =>
                        handleNumericChange("height", e.target.value)
                      }
                    />
                    {!fieldValidations.height.isValid && (
                      <p className="text-sm text-destructive">
                        {fieldValidations.height.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Entre {VALIDATION_RULES.height.min} y{" "}
                      {VALIDATION_RULES.height.max} cm
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="30"
                      min={VALIDATION_RULES.age.min}
                      max={VALIDATION_RULES.age.max}
                      value={localValues.age || ""}
                      onChange={(e) => handleNumericChange("age", e.target.value)}
                    />
                    {!fieldValidations.age.isValid && (
                      <p className="text-sm text-destructive">
                        {fieldValidations.age.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Entre {VALIDATION_RULES.age.min} y {VALIDATION_RULES.age.max}{" "}
                      años
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Género</Label>
                    <Select
                      value={nutrition?.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu género" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map(({ id, label }) => (
                          <SelectItem key={id} value={id}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botón para guardar campos numéricos */}
                <Button
                  onClick={prepareNumericSave}
                  disabled={!hasUnsavedChanges || !allFieldsValid || isPending}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isPending ? "Guardando..." : "Guardar configuración nutricional"}
                </Button>

                {hasUnsavedChanges && (
                  <p className="text-sm text-muted-foreground">
                    Tienes cambios sin guardar
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Modal de confirmación para todos los cambios */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambios?</AlertDialogTitle>
            <AlertDialogDescription>{getModalMessage()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelChange}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange} disabled={isPending}>
              {isPending ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}