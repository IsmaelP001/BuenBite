import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AllergiesStepProps {
  allergies: string[];
  dislikes: string[];
  onAllergiesChange: (value: string[]) => void;
  onDislikesChange: (value: string[]) => void;
}

const commonAllergies = [
  "Maní", "Nueces", "Mariscos", "Huevo", "Leche", "Trigo", "Soja", "Pescado"
];

const commonDislikes = [
  "Cilantro", "Cebolla", "Ajo", "Picante", "Champiñones", "Aceitunas", "Pepino"
];

const AllergiesStep = ({
  allergies,
  dislikes,
  onAllergiesChange,
  onDislikesChange,
}: AllergiesStepProps) => {
  const [allergyInput, setAllergyInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");

  const addAllergy = (item: string) => {
    if (item.trim() && !allergies.includes(item.trim())) {
      onAllergiesChange([...allergies, item.trim()]);
    }
    setAllergyInput("");
  };

  const removeAllergy = (item: string) => {
    onAllergiesChange(allergies.filter((a) => a !== item));
  };

  const addDislike = (item: string) => {
    if (item.trim() && !dislikes.includes(item.trim())) {
      onDislikesChange([...dislikes, item.trim()]);
    }
    setDislikeInput("");
  };

  const removeDislike = (item: string) => {
    onDislikesChange(dislikes.filter((d) => d !== item));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Alergias y preferencias
        </h2>
        <p className="text-sm text-muted-foreground">
          Evitaremos estos ingredientes en tus recetas
        </p>
      </div>

      {/* Allergies Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          🚨 Alergias alimentarias
        </label>
        
        <div className="flex gap-2">
          <Input
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            placeholder="Escribe una alergia..."
            onKeyDown={(e) => e.key === "Enter" && addAllergy(allergyInput)}
            className="flex-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => addAllergy(allergyInput)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {commonAllergies
            .filter((a) => !allergies.includes(a))
            .slice(0, 4)
            .map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => addAllergy(item)}
              >
                + {item}
              </Badge>
            ))}
        </div>

        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-destructive/10 rounded-lg">
            {allergies.map((item) => (
              <Badge
                key={item}
                variant="destructive"
                className="gap-1"
              >
                {item}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeAllergy(item)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Dislikes Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          👎 Alimentos que no te gustan
        </label>
        
        <div className="flex gap-2">
          <Input
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            placeholder="Escribe un alimento..."
            onKeyDown={(e) => e.key === "Enter" && addDislike(dislikeInput)}
            className="flex-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => addDislike(dislikeInput)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {commonDislikes
            .filter((d) => !dislikes.includes(d))
            .slice(0, 4)
            .map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => addDislike(item)}
              >
                + {item}
              </Badge>
            ))}
        </div>

        {dislikes.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
            {dislikes.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="gap-1"
              >
                {item}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeDislike(item)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllergiesStep;
