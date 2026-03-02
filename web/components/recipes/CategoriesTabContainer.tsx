"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import TabContainer from "../TabContainer";

interface FilterOption {
  label: string;
  id: string;
}

// Solo filtros rápidos combinados que son convenientes
const filterOptions: FilterOption[] = [
  { label: "Todas", id: "all" },
  { label: "Cena rápida", id: "quick-dinner" }, // Combina: cena + <30min + fácil
  { label: "Desayuno express", id: "quick-breakfast" }, // Combina: desayuno + <20min
  { label: "Pocos ingredientes", id: "few-ingredients" }, // ≤5 ingredientes
  { label: "Almuerzo saludable", id: "healthy-lunch" }, // Combina: almuerzo + saludable
  { label: "Snack rápido", id: "quick-snack" }, // Combina: snack + <15min
];

export default function CategoriesTabContainer() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const router = useRouter();

  return (
    <div>
      <TabContainer
        items={filterOptions}
        activeId={selectedCategory ?? searchParams.get("category")}
        onTabChange={(id) => {
          setSelectedCategory(id);
          const params = new URLSearchParams(searchParams.toString());
          if (id === "all") {
            params.delete("category");
          } else {
            params.set("category", id);
          }
          router.replace(
            `/recipes${
              params.toString().length > 0 ? `?${params.toString()}` : ""
            }`
          );
        }}
      />
    </div>
  );
}

