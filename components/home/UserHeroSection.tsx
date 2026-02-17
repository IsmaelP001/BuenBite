import React, { lazy, Suspense } from "react";
import { Button } from "../ui/button";
import { ChefHat, Plus } from "lucide-react";
import MaxWidthWrapper from "../MaxWithWrapper";
import { ErrorWrapper } from "../ErrorWraper";
import { getUser } from "@/lib/supabase/server";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
const PantrySummary = lazy(() => import("@/components/home/PantrySummary"));

export default async function UserHeroSection() {
  const user = await getUser();
  return (
    <section className="bg-card rounded-2xl mb-8 card-shadow animate-fade-in p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Bienvenido,{" "}
            <span className="text-primary">{user?.user_metadata?.name}</span>!
          </h1>
          <p className="text-muted-foreground mb-4 max-w-xl">
            Administra ingredientes, descubre recetas y planifica comidas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pantry/create">
              <Button className="w-full md:w-fit" variant="hero" size="default">
                <Plus className="h-4 w-4" />
                Agregar Ingredientes
              </Button>
            </Link>
            <Link href="/recipes/create">
              <Button
                className="w-full md:w-fit"
                variant="outline"
                size="default"
              >
                <ChefHat className="h-4 w-4" />
                Crear Receta
              </Button>
            </Link>
          </div>
        </div>
        <div className="lg:w-56">
          <MaxWidthWrapper>
            <ErrorWrapper fallback={<p></p>}>
              <Suspense fallback={<Skeleton className="w-full h-20"/>}>
                <PantrySummary />
              </Suspense>
            </ErrorWrapper>
          </MaxWidthWrapper>
        </div>
      </div>
    </section>
  );
}
