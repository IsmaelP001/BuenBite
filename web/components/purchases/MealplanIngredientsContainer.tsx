"use client";
import { CalendarIcon, ChefHat, Filter, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import IngredientPurchaseCard from "./IngredientPurchaseCard";
import useMissingMealPlanPurchaseItems from "@/hooks/useGetMissingPlanPurchaseItems";
import { cn, extractDateFromDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { useSelectedPurchaseItems } from "@/lib/context/purchase";
import { Skeleton } from "../ui/skeleton";

export default function MealplanIngredientsContainer() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const [dateRage, setDateRange] = useState({
    startDate: today,
    endDate: nextWeek,
  });
  const [selectedWeek, setSelectedWeek] = useState<string>("all");

  const { toggleSelect, updateSelectedAmount, isSelected, getSelectedAmount } =
    useSelectedPurchaseItems();

  const { mealplanItems, isPending: isMealPlanLoading } =
    useMissingMealPlanPurchaseItems({
      dateRangeFilter: {
        startDate: extractDateFromDate(dateRage.startDate),
        endDate: extractDateFromDate(dateRage.endDate),
      },
    });

  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <ChefHat className="w-5 h-5 text-primary mr-1" />
          <h2 className="text-xl font-bold text-foreground">
            Del Plan de Comidas
          </h2>
          <Badge variant="secondary">{mealplanItems.length}</Badge>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Filtrar por:
          </span>
        </div>

        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-[140px] h-9 bg-background  flex-1 md:flex-0">
            <SelectValue placeholder="Semana" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las semanas</SelectItem>
            <SelectItem value="1">Semana 1</SelectItem>
            <SelectItem value="2">Semana 2</SelectItem>
            <SelectItem value="3">Semana 3</SelectItem>
            <SelectItem value="4">Semana 4</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border hidden sm:block" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start text-left font-normal  flex-1 md:flex-0" ,
                !dateRage.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRage.startDate
                ? format(dateRage.startDate, "dd/MM/yy", { locale: es })
                : "Desde"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRage.startDate}
              onSelect={(date) =>
                setDateRange((prev) => ({ ...prev, startDate: date! }))
              }
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Fecha fin */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start text-left font-normal flex-1 md:flex-0",
                !dateRage.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRage.endDate
                ? format(dateRage.endDate, "dd/MM/yy", { locale: es })
                : "Hasta"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRage.endDate}
              onSelect={(date) =>
                setDateRange((prev) => ({ ...prev, endDate: date! }))
              }
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Limpiar filtros */}
        {/* {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            // onClick={clearFilters}
            className="h-9 gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )} */}
      </div>
      {isMealPlanLoading && (
        <div className="md:flex gap-2.5">
          <Skeleton className="h-16 md:h-20  flex-1 rounded-lg" />
          <Skeleton className="h-16 md:h-20 flex-1 rounded-lg " />
        </div>
      )}
      {!isMealPlanLoading && !mealplanItems.length ? (
        <div className="gap-2.5 min-h-10 flex items-center justify-center  ">
          <div className="m-auto">
            <p className="text-center font-light text-sm ">
              Aqui veras los ingredientes necesarios para tus recetas agendadas
            </p>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mealplanItems?.map((ingredient) => {
          return (
            <IngredientPurchaseCard
              type="mealplan"
              key={ingredient.id}
              quantity={getSelectedAmount(ingredient.ingredientId!) ?? 1}
              isSelected={isSelected(ingredient.ingredientId!)}
              ingredient={ingredient}
              onSelect={() =>
                toggleSelect(
                  ingredient.ingredientId,
                  ingredient?.requiredQuantity,
                  ingredient.measurementType
                )
              }
              updateQuantity={(qty) =>
                updateSelectedAmount(ingredient.ingredientId, Number(qty))
              }
            />
          );
        })}
      </div>
    </section>
  );
}
