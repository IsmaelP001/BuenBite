import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Instruction } from "@/hooks/useCreateRecipe";

interface RecipeStepsListProps {
  steps: Instruction[];
  onUpdate: (steps: Instruction[]) => void;
}

export function RecipeStepsList({ steps, onUpdate }: RecipeStepsListProps) {
  const handleAddStep = () => {
    onUpdate([...steps, { step: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    onUpdate(steps.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { step: value };
    onUpdate(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pasos de Preparación</h3>
        <Button onClick={handleAddStep} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Paso
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-3">
            No hay pasos añadidos
          </p>
          <Button onClick={handleAddStep} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Añadir primer paso
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((instruction, index) => (
            <div
              key={index}
              className="flex gap-3 group"
            >
              <div className="flex items-start gap-2 pt-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder={`Describe el paso ${index + 1}...`}
                  value={instruction.step}
                  onChange={(e) => handleUpdateStep(index, e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveStep(index)}
                className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
