"use client";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MealplanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <section className="mb-3">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3 rounded-xl bg-card px-4 py-3 card-shadow">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar planes de comida..."
            defaultValue={searchParams.get("query") ?? ""}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value.trim() === "") {
                params.delete("query");
              } else {
                params.set("query", e.target.value);
              }
              router.replace(
                `/meal-plans${
                  params.toString().length > 0 ? `?${params.toString()}` : ""
                }`
              );
            }}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </section>
  );
}
