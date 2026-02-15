"use client";

import { Filter, LayoutGrid, List, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import useGetPantryItems from "@/hooks/useGetPantryItems";

export default function SearchAndFilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lowStockItems, expiringProductsItems } = useGetPantryItems({});

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters derivados directamente de la URL (single source of truth)
  const activeFilters = searchParams.get("filters")?.split(",").filter(Boolean) || [];
  const activeFiltersCount = activeFilters.length;

  const handleFilterChange = (
    type: "low_stock" | "expiring",
    isChecked: boolean
  ) => {
    const paramsObject = new URLSearchParams(searchParams.toString());
    
    const newFilters = isChecked
      ? [...activeFilters, type]
      : activeFilters.filter((f) => f !== type);

    if (newFilters.length === 0) {
      paramsObject.delete("filters");
    } else {
      paramsObject.set("filters", newFilters.join(","));
    }
    
    router.replace(`/pantry?${paramsObject.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filters");
    router.replace(`/pantry?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("query", value);
    } else {
      params.delete("query");
    }
    router.replace(`/pantry?${params.toString()}`);
  };

  return (
    <section className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 rounded-xl bg-card px-4 py-3 border border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchParams.get("query") || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl relative"
              >
                <Filter className="h-5 w-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Filtros</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={activeFilters.includes("expiring")}
                      onCheckedChange={(checked) =>
                        handleFilterChange("expiring", checked === true)
                      }
                    />
                    <div className="flex-1">
                      <span className="text-sm">Por vencer</span>
                      <span className="text-xs text-warning ml-2">
                        ({expiringProductsItems?.length ?? 0})
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={activeFilters.includes("low_stock")}
                      onCheckedChange={(checked) =>
                        handleFilterChange("low_stock", checked === true)
                      }
                    />
                    <div className="flex-1">
                      <span className="text-sm">Sin stock</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({lowStockItems?.length ?? 0})
                      </span>
                    </div>
                  </label>
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="rounded-xl"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="rounded-xl"
            onClick={() => setViewMode("list")}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}