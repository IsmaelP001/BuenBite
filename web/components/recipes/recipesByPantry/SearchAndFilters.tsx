"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

const availabilityFilters = [
  { id: "all", label: "Todas" },
  { id: "complete", label: "Completas" },
  { id: "almost", label: "Casi listas (>70%)" },
  { id: "partial", label: "Parciales (30-70%)" },
];
export default function SearchAndFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("availability");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [debouncedSearch] = useDebounce(searchQuery, 1000);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");

    params.set("sort", sortBy);
    params.set("availability", availabilityFilter);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, sortBy, availabilityFilter, router]);

  return (
    <section className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="availability">Mayor disponibilidad</SelectItem>
            <SelectItem value="time">Más rápidas</SelectItem>
            <SelectItem value="rating">Mejor valoradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Availability Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {availabilityFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setAvailabilityFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              availabilityFilter === filter.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}
