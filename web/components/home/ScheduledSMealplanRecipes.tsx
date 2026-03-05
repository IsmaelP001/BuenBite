import { Clock, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import ScheduledMealCard from "./ScheduledMealCard";
import { Button } from "../ui/button";
import { getTodaysUserMealPlanEntries } from "@/actions/mealplan";

export default async function ScheduledSMealplanRecipes() {
  const mealScheduled = await getTodaysUserMealPlanEntries();

  return (
    <section className="mb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Comidas de Hoy</h2>
        </div>
        <Link
          href="/tracking"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver Calendario
        </Link>
      </div>

      {mealScheduled?.data?.length ? (
        <div className="flex flex-nowrap gap-3 overflow-x-auto">
          {mealScheduled?.data?.map((meal) => (
            <ScheduledMealCard key={meal.id} {...meal} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg px-4 py-3 border border-dashed flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            No tienes comidas agendadas para hoy
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href="/tracking">
              <Plus className="h-3.5 w-3.5" />
              Agendar
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
