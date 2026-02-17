"use client";
import { Button } from "@/components/ui/button";
import { Sparkles, Package } from "lucide-react";

import Stats from "@/components/recipes/recipesByPantry/Stats";
import SearchAndFilters from "@/components/recipes/recipesByPantry/SearchAndFilters";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import PantryRecipesList from "@/components/recipes/recipesByPantry/PantryRecipesList";

const PantryRecipes = () => {
  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper>
        <main className="container py-8">
          <section className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl  md:text-4xl font-bold">
                  Recetas con tu <span className="text-gradient">Despensa</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Descubre qué puedes cocinar con los ingredientes que ya tienes
                </p>
              </div>
            </div>
          </section>

          <Stats />
          <SearchAndFilters />
          <PantryRecipesList />

          <section className="mt-12 bg-card rounded-2xl p-6 border border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">
                    ¿Quieres más opciones?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Agrega más ingredientes a tu despensa para desbloquear
                    nuevas recetas
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/pantry">Gestionar Despensa</Link>
              </Button>
            </div>
          </section>
        </main>
      </MaxWidthWrapper>
    </div>
  );
};

export default PantryRecipes;
