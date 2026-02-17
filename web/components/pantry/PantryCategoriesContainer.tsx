"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TabContainer from "../TabContainer";
import useGetPantryItems from "@/hooks/useGetPantryItems";
import { usePantryIngredientSelection } from "@/lib/context/pantryIngredientContext";
export const PANTRY_CATEGORIES = [
  {
    label: "Todas",
    value: "all",
    color: {
      light: "bg-red-50",
      text: "text-red-800",
      border: "border-red-300",
      icon: "📦",
    },
  },
  {
    label: "Carnes",
    value: "meats",
    color: {
      light: "bg-red-50",
      text: "text-red-800",
      border: "border-red-300",
      icon: "🥩",
    },
  },
  {
    label: "Pescados y Mariscos",
    value: "seafood",
    color: {
      light: "bg-sky-50",
      text: "text-sky-800",
      border: "border-sky-300",
      icon: "🐟",
    },
  },
  {
    label: "Lácteos",
    value: "dairy",
    color: {
      light: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-300",
      icon: "🧀",
    },
  },
  {
    label: "Granos, Arroces y Pastas",
    value: "grains",
    color: {
      light: "bg-yellow-50",
      text: "text-yellow-900",
      border: "border-yellow-400",
      icon: "🌾",
    },
  },
  {
    label: "Legumbres",
    value: "legumes",
    color: {
      light: "bg-purple-50",
      text: "text-purple-900",
      border: "border-purple-400",
      icon: "🫘",
    },
  },
  {
    label: "Harinas y Azúcares",
    value: "flours_and_sugars",
    color: {
      light: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-300",
      icon: "🍯", // miel = azúcar general
    },
  },
  {
    label: "Especias",
    value: "spices",
    color: {
      light: "bg-lime-50",
      text: "text-lime-800",
      border: "border-lime-300",
      icon: "🌶️",
    },
  },
  {
    label: "Hierbas",
    value: "herbs",
    color: {
      light: "bg-green-50",
      text: "text-green-800",
      border: "border-green-300",
      icon: "🌿",
    },
  },
  {
    label: "Condimentos y Salsas",
    value: "condiments_and_sauces",
    color: {
      light: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-300",
      icon: "🧂",
    },
  },
  {
    label: "Verduras",
    value: "vegetables",
    color: {
      light: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-300",
      icon: "🥦",
    },
  },
  {
    label: "Frutas",
    value: "fruits",
    color: {
      light: "bg-green-50",
      text: "text-green-700",
      border: "border-green-300",
      icon: "🍎",
    },
  },
  {
    label: "Frutos Secos y Semillas",
    value: "nuts_and_seeds",
    color: {
      light: "bg-stone-50",
      text: "text-stone-800",
      border: "border-stone-300",
      icon: "🥜",
    },
  },
  {
    label: "Productos de Panadería y Repostería",
    value: "bakery_and_pastry",
    color: {
      light: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
      icon: "🍞",
    },
  },
  {
    label: "Huevos y Derivados",
    value: "eggs_and_derivatives",
    color: {
      light: "bg-yellow-50",
      text: "text-yellow-900",
      border: "border-yellow-300",
      icon: "🥚",
    },
  },
  {
    label: "Aceites y Grasas",
    value: "oils_and_fats",
    color: {
      light: "bg-amber-50",
      text: "text-amber-900",
      border: "border-amber-400",
      icon: "🛢️", // barril de aceite
    },
  },
  {
    label: "Bebidas No Alcohólicas",
    value: "beverages_non_alcoholic",
    color: {
      light: "bg-indigo-50",
      text: "text-indigo-800",
      border: "border-indigo-300",
      icon: "🥤",
    },
  },
  {
    label: "Bebidas Alcohólicas",
    value: "beverages_alcoholic",
    color: {
      light: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-300",
      icon: "🍺",
    },
  },
  {
    label: "Suplementos y Vitaminas",
    value: "supplements_and_vitamins",
    color: {
      light: "bg-teal-50",
      text: "text-teal-800",
      border: "border-teal-300",
      icon: "💊",
    },
  },
  {
    label: "Postres y Dulces",
    value: "desserts_and_sweets",
    color: {
      light: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-300",
      icon: "🍬",
    },
  },
  {
    label: "Alimentos Congelados",
    value: "frozen_foods",
    color: {
      light: "bg-cyan-50",
      text: "text-cyan-800",
      border: "border-cyan-300",
      icon: "❄️",
    },
  },
  {
    label: "Enlatados",
    value: "canned_goods",
    color: {
      light: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-300",
      icon: "🥫",
    },
  },
  {
    label: "Comidas Preparadas",
    value: "ready_to_eat",
    color: {
      light: "bg-gray-50",
      text: "text-gray-800",
      border: "border-gray-300",
      icon: "🍱",
    },
  },
  {
    label: "Sin registrar",
    value: "unregistered",
    color: {
      light: "bg-gray-50",
      text: "text-gray-800",
      border: "border-gray-300",
      icon: "❓",
    },
  },
];

export default function PantryCategoriesContainer({isUserSignin}:{isUserSignin:boolean}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const isSignin = isUserSignin;
  const {categories:ingredientCategories}=usePantryIngredientSelection()
  const { categories:pantryCategories } = useGetPantryItems({});

  const actualCategories = useMemo(()=>{
    if(isSignin){
      return pantryCategories
    }
    return ingredientCategories
  },[isSignin,ingredientCategories,pantryCategories])

  return (
    <section className="mb-8">
      <TabContainer
        items={[{label:'Todos',id:'all'},...actualCategories]}
        activeId={activeCategory}
        onTabChange={(id) => {
          setActiveCategory(id);
          const params = new URLSearchParams(searchParams.toString());
          if (id === "all") {
            params.delete("category");
          } else {
            params.set("category", id);
          }
          router.replace(
            `/pantry${
              params.toString().length > 0 ? `?${params.toString()}` : ""
            }`
          );
        }}
      />
    </section>
  );
}
