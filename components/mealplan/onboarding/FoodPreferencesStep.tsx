import { UtensilsCrossed, Clock, Sun, Coffee, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {  OnboardingData } from '@/types/models/onboarding';

interface FoodPreferencesStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export const FoodPreferencesStep = ({ data, onChange }: FoodPreferencesStepProps) => {

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <UtensilsCrossed className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Preferencias alimenticias</h2>
        <p className="text-muted-foreground">Personaliza tu plan según tus gustos</p>
      </div>

      <div className="space-y-6">
    
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Horarios de comidas
          </Label>
          
          <div className="space-y-3">
            {/* Breakfast */}
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">Desayuno</span>
              </div>
              <Input
                type="time"
                value={data.breakfastTime}
                onChange={(e) => onChange({ breakfastTime: `${e.target.value}:00` })}
                className="w-32 h-10 text-center rounded-lg border-2 focus:border-primary"
              />
            </div>

            {/* Lunch */}
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">Comida</span>
              </div>
              <Input
                type="time"
                value={data.lunchTime}
                onChange={(e) => onChange({ lunchTime: `${e.target.value}:00` })}
                className="w-32 h-10 text-center rounded-lg border-2 focus:border-primary"
              />
            </div>

            {/* Dinner */}
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">Cena</span>
              </div>
              <Input
                type="time"
                value={data.dinnerTime}
                onChange={(e) => onChange({ dinnerTime: `${e.target.value}:00` })}
                className="w-32 h-10 text-center rounded-lg border-2 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
