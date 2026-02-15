'use client'
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carrot, Clock, Flame, Globe, Utensils, X, Loader2 } from "lucide-react";
import { filterTypes, useRecipeFilters } from "@/hooks/useFilterRecipes";

const filterIcons = {
  meal: Utensils,
  cuisine: Globe,
  ingredientIds: Carrot,
  time: Clock,
  difficulty: Flame,
};

export default function FiltersRecipes() {
  const {
    activeFilterType,
    allActiveFilters,
    currentOptions,
    hasActiveFilters,
    isLoadingIngredients,
    setActiveFilterType,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    isFilterSelected,
  } = useRecipeFilters({ ingredientsLimit: 10 });

  return (
    <section className="mb-3 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filter Type Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Filtrar por:
          </span>
          <Select value={activeFilterType} onValueChange={setActiveFilterType}>
            <SelectTrigger className="w-[180px] bg-card">
              <div className="flex items-center gap-2">
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {filterTypes.map((filter) => {
                const Icon = filterIcons[filter.id as keyof typeof filterIcons];
                return (
                  <SelectItem key={filter.id} value={filter.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {filter.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Options as Chips */}
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          {isLoadingIngredients && activeFilterType === "ingredientIds" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Cargando ingredientes...</span>
            </div>
          ) : (
            currentOptions?.map((option) => {
              const selected = isFilterSelected(activeFilterType, option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleFilter(activeFilterType, option.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selected
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:scale-102"
                  }`}
                >
                  {option.label}
                  {selected && <X className="inline ml-1.5 h-3 w-3" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Activos:
          </span>
          {allActiveFilters.map(({ type, id, label }) => {
            const FilterIcon = filterIcons[type as keyof typeof filterIcons] || Utensils;
            return (
              <Badge
                key={`${type}-${id}`}
                variant="secondary"
                className="gap-1.5 pl-2 pr-1 py-1 bg-primary/10 text-primary border-primary/20"
              >
                <FilterIcon className="h-3 w-3" />
                {label}
                <button
                  onClick={() => removeFilter(type, id)}
                  className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground h-7"
          >
            Limpiar todo
          </Button>
        </div>
      )}
    </section>
  );
}