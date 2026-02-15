import { Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WaterTrackerProps {
  glasses: number;
  goal: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const WaterTracker = ({ glasses, goal, onIncrement, onDecrement }: WaterTrackerProps) => {
  const percent = Math.min((glasses / goal) * 100, 100);

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Hidratación</h3>
            <p className="text-xs text-muted-foreground">Meta: {goal} vasos (250ml c/u)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 my-6">
        <Button
          variant="outline"
          size="icon"
          onClick={onDecrement}
          disabled={glasses === 0}
          className="h-10 w-10 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="text-4xl font-bold text-blue-500">{glasses}</div>
          <div className="text-sm text-muted-foreground">de {goal} vasos</div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onIncrement}
          className="h-10 w-10 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-center gap-1 mt-4">
        {Array.from({ length: goal }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-6 rounded-sm transition-all duration-300",
              i < glasses ? "bg-blue-500" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default WaterTracker;
