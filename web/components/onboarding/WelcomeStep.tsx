import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Clock } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <ChefHat className="w-10 h-10 text-primary" />
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-3">
        ¡Bienvenido a PantryChef!
      </h1>
      
      <p className="text-muted-foreground mb-8 max-w-sm">
        Vamos a personalizar tu experiencia para mostrarte las recetas perfectas para ti.
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Clock className="w-4 h-4" />
        <span>Menos de 1 minuto</span>
      </div>

      <div className="grid gap-4 w-full max-w-xs mb-8">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground">Recetas personalizadas</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground">Filtros por tus preferencias</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground">Sugerencias nutricionales</span>
        </div>
      </div>

      <Button onClick={onNext} size="lg" className="w-full max-w-xs bg-primary hover:bg-primary/90">
        Comenzar
      </Button>
    </div>
  );
};

export default WelcomeStep;
