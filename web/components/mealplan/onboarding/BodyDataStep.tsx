import { User, Ruler, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Gender, OnboardingData } from '@/types/models/onboarding';
import { GENDER_OPTIONS } from '@/lib/config';

interface BodyDataStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export const BodyDataStep = ({ data, onChange }: BodyDataStepProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Datos corporales</h2>
        <p className="text-muted-foreground">Cuéntanos sobre ti para personalizar tu plan</p>
      </div>

      <div className="space-y-6">
        {/* Age */}
        <div className="space-y-3">
          <Label htmlFor="age" className="text-base font-medium">Edad</Label>
          <div className="relative">
            <Input
              id="age"
              type="number"
              placeholder="25"
              min={15}
              max={100}
              value={data.age ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                onChange({ age: value ? parseInt(value) : null });
              }}
              className="h-14 text-lg pl-4 pr-16 rounded-xl border-2 focus:border-primary transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">años</span>
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Género</Label>
          <RadioGroup
            value={data.gender ?? ''}
            onValueChange={(value) => onChange({ gender: value as Gender })}
            className="grid grid-cols-3 gap-3"
          >
            {GENDER_OPTIONS.map(({ id, label }) => (
              <div key={id}>
                <RadioGroupItem value={id} id={id} className="peer sr-only" />
                <Label
                  htmlFor={id}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    data.gender === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border"
                  )}
                >
                  <span className="font-medium">{label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Height */}
        <div className="space-y-3">
          <Label htmlFor="height" className="text-base font-medium flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            Altura
          </Label>
          <div className="relative">
            <Input
              id="height"
              type="number"
              placeholder="170"
              min={100}
              max={250}
              value={data.height ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                onChange({ height: value ? parseFloat(value) : null });
              }}
              className="h-14 text-lg pl-4 pr-12 rounded-xl border-2 focus:border-primary transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">cm</span>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-3">
          <Label htmlFor="weight" className="text-base font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Peso
          </Label>
          <div className="relative">
            <Input
              id="weight"
              type="number"
              placeholder="70"
              min={30}
              max={300}
              step={0.1}
              value={data.weight ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                onChange({ weight: value ? parseFloat(value) : null });
              }}
              className="h-14 text-lg pl-4 pr-12 rounded-xl border-2 focus:border-primary transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};