import { Button } from "@/components/ui/button";
import { PartyPopper, ChefHat, ArrowRight } from "lucide-react";

interface ConfirmationStepProps {
  onComplete: () => void;
}

const ConfirmationStep = ({ onComplete }: ConfirmationStepProps) => {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
        <ChefHat className="w-12 h-12 text-primary" />
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <PartyPopper className="w-5 h-5 text-amber-600" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-3">
        ¡Todo listo! 🎉
      </h1>
      
      <p className="text-muted-foreground mb-8 max-w-sm">
        Ya podemos mostrarte recetas personalizadas según tus preferencias y objetivos.
      </p>

      <div className="grid gap-3 w-full max-w-xs mb-8">
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-700">Preferencias guardadas</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-700">Recetas filtradas</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-700">Notificaciones configuradas</span>
        </div>
      </div>

      <Button onClick={onComplete} size="lg" className="w-full max-w-xs bg-primary hover:bg-primary/90">
        Ver recetas
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default ConfirmationStep;
