"use client";
import useGetUserSavedRecipe from "@/hooks/useGetUserSavedRecipes";
import PantryRecipeCard from "../PantryRecipeCard";
import { HeartOff } from "lucide-react";
import Link from "next/link";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-32 h-32 rounded-full bg-linear-to-br from-orange-100 to-red-100 flex items-center justify-center mb-6">
        <HeartOff className="w-16 h-16 text-orange-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        No hay favoritos aún
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Comienza a explorar y guarda tus recetas favoritas para acceder a ellas
        fácilmente en cualquier momento.
      </p>
      <Link href="/recipes">
        <button className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl">
          Explorar Recetas
        </button>
      </Link>
    </div>
  );
};

export default function FavoritesListContainer() {
  const { recipes, isPending } = useGetUserSavedRecipe({});

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">Cargando...</div>
    );
  }

  if (!isPending && recipes.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <PantryRecipeCard {...recipe} />
        </div>
      ))}
    </div>
  );
}
