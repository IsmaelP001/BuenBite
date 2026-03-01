import { CheckCircle2, Pencil, User, Target, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { activityLabels, genderLabels, goalLabels, OnboardingData, paceLabels } from '@/types/models/onboarding';

interface SummaryStepProps {
  data: OnboardingData;
  onEdit: (step: number) => void;
}

interface SummarySectionProps {
  icon: React.ReactNode;
  title: string;
  items: { label: string; value: string }[];
  onEdit: () => void;
}

const SummarySection = ({ icon, title, items, onEdit }: SummarySectionProps) => (
  <div className="p-4 rounded-xl border-2 border-border bg-card space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onEdit}
        className="text-muted-foreground hover:text-primary"
      >
        <Pencil className="w-4 h-4 mr-1" />
        Editar
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, index) => (
        <div key={index} className="space-y-0.5">
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <p className="text-sm font-medium text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const SummaryStep = ({ data, onEdit }: SummaryStepProps) => {
  const bodyDataItems = [
    { label: 'Edad', value: data.age ? `${data.age} años` : '-' },
    { label: 'Género', value: data.gender ? genderLabels[data.gender] : '-' },
    { label: 'Altura', value: data.height ? `${data.height} cm` : '-' },
    { label: 'Peso', value: data.weight ? `${data.weight} kg` : '-' },
  ];

  const goalItems = [
    { label: 'Objetivo', value: data.primaryGoal ? goalLabels[data.primaryGoal].label : '-' },
    { label: 'Ritmo', value: data.weightChangePace ? paceLabels[data.weightChangePace].label : 'N/A' },
    { label: 'Actividad', value: data.activityLevel ? activityLabels[data.activityLevel].label : '-' },
  ];

  const foodItems = [
    { label: 'Desayuno', value: data.breakfastTime },
    { label: 'Comida', value: data.lunchTime },
    { label: 'Cena', value: data.dinnerTime },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Resumen</h2>
        <p className="text-muted-foreground">Revisa tu información antes de continuar</p>
      </div>

      <div className="space-y-4">
        <SummarySection
          icon={<User className="w-5 h-5" />}
          title="Datos corporales"
          items={bodyDataItems}
          onEdit={() => onEdit(1)}
        />

        <SummarySection
          icon={<Target className="w-5 h-5" />}
          title="Objetivo y actividad"
          items={goalItems}
          onEdit={() => onEdit(2)}
        />

        <SummarySection
          icon={<UtensilsCrossed className="w-5 h-5" />}
          title="Preferencias alimenticias"
          items={foodItems}
          onEdit={() => onEdit(3)}
        />
      </div>
    </div>
  );
};
