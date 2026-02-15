"use client";
import { useState } from "react";
import TabContainer from "../TabContainer";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const categories = [
  { id: "all", label: "Todos" },
  { id: "keto", label: "Keto" },
  { id: "mediterranean", label: "Mediterránea" },
  { id: "balanced", label: "Balanceada" },
  { id: "vegetarian", label: "Vegetariana" },
  { id: "high-Protein", label: "Alta en proteína" },
  { id: "vegan", label: "Vegana" },
  { id: "lose_weight", label: "Perder peso" },
  { id: "maintain_weight", label: "Mantener peso" },
  { id: "gain_weight", label: "Ganar peso" },
  { id: "build_muscle", label: "Construir músculo" },
];

export function MealplanCategoriesContainer() {
  const [activeCategory, setActiveCategory] = useState("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <section className="mb-8">
      <TabContainer
        items={categories}
        activeId={!activeCategory ? "all" : activeCategory}
        onTabChange={(id) => {
          setActiveCategory(id);
          const params = new URLSearchParams(searchParams.toString());
          if (id === "all") {
            params.delete("category");
          } else {
            params.set("category", id);
          }
          router.replace(
            `/meal-plans${
              params.toString().length > 0 ? `?${params.toString()}` : ""
            }`
          );
        }}
      />
    </section>
  );
}
