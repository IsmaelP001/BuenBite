"use client";
import React, { JSX, useState } from "react";
import { Calendar, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import useCreateMealPlanFromSuggestion from "@/hooks/useCreateMealplanFromSuggestion";
import { useParams } from "next/navigation";
import Loading from "../Loading";

/* =======================
   Tipos e interfaces
======================= */

interface DayOfWeek {
  id: number;
  name: string;
  shortName: string;
}

interface PlanSetupPayload {
  startDate: string;
  excludedDays: number[];
}

interface PlanSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanSetupPayload) => void;
  isPendingSubmit: boolean;
}

const PlanSetupModal: React.FC<PlanSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isPendingSubmit,
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [excludedDays, setExcludedDays] = useState<number[]>([]);

  const daysOfWeek: DayOfWeek[] = [
    { id: 0, name: "Domingo", shortName: "Dom" },
    { id: 1, name: "Lunes", shortName: "Lun" },
    { id: 2, name: "Martes", shortName: "Mar" },
    { id: 3, name: "Miércoles", shortName: "Mié" },
    { id: 4, name: "Jueves", shortName: "Jue" },
    { id: 5, name: "Viernes", shortName: "Vie" },
    { id: 6, name: "Sábado", shortName: "Sáb" },
  ];

  const toggleDay = (dayId: number) => {
    setExcludedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-linear-to-br from-background via-primary/20 to-background rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:rotate-90 group"
        >
          <X className="w-5 h-5 text-black-200 group-hover:text-white" />
        </button>

        <div className="relative p-8">
          <div className="mb-4">
            <h2 className="font-semibold text-2xl">Configura tu Plan</h2>
            <p>Personaliza el inicio y los días de tu plan de entrenamiento</p>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStartDate(e.target.value)
            }
            className="w-full px-5 py-4 bg-black/5 border border-primary rounded-xl text-black"
          />

          <div className="grid grid-cols-7 gap-2 mt-6">
            {daysOfWeek.map((day) => {
              const isExcluded = excludedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`p-3 rounded-xl text-xs ${
                    isExcluded
                      ? "bg-red-500/10 text-red-500"
                      : "bg-primary text-white"
                  }`}
                >
                  {day.shortName}
                  {isExcluded ? <X /> : <Check />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onSubmit({ startDate, excludedDays })}
            disabled={!startDate || isPendingSubmit}
            className="mt-6 w-full bg-primary text-white py-3 rounded-xl disabled:opacity-40 flex justify-center"
          >
            {isPendingSubmit ? <Loading /> : "Confirmar Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ScheduleMealPlan(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { id } = useParams();

  const {
    mutateAsync: createMealPlanFromSuggestion,
    isPending: isSavingMealSuggestion,
  } = useCreateMealPlanFromSuggestion();

  const handlePlanSubmit = async (data: PlanSetupPayload) => {
    try {
      await createMealPlanFromSuggestion({
        ...data,
        suggestedMealplanId: id as string,
      });
      setIsModalOpen(false);
    } catch (error) {}
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Calendar />
        Empezar plan
      </Button>

      <PlanSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePlanSubmit}
        isPendingSubmit={isSavingMealSuggestion}
      />
    </>
  );
}
