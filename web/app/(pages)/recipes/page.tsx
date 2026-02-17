import { ErrorWrapper } from "@/components/ErrorWraper";
import Loading from "@/components/Loading";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import CategoriesTabContainer from "@/components/recipes/CategoriesTabContainer";
import FiltersRecipes from "@/components/recipes/FiltersRecipes";
import { lazy, Suspense } from "react";

const RecipesContainer = lazy(
  () => import("@/components/recipes/RecipesContainer")
);
const Recipes = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const { filterType, ...params } = await searchParams;
  return (
    <MaxWidthWrapper>
      <div className="min-h-screen bg-background pb-6 ">
        <main className="container py-4">
          <section className="mb-3 animate-fade-in">
            <h1 className="font-display text-3xl md:text-4xl  font-bold mb-2">
              Explora <span className="text-primary">Inspiración</span>{" "}
              Culinaria
            </h1>
            <p className="text-sm md:text-lg max-w-2xl">
              Recetas seleccionadas para el día a día, desde platos sencillos
              hasta ideas especiales para sorprender.
            </p>
          </section>

          <FiltersRecipes />
          <section className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                Filtros rapidos
              </h2>
              <button className="text-sm font-medium text-primary hover:underline">
                Ver Todo
              </button>
            </div>
            <CategoriesTabContainer />
          </section>

          <ErrorWrapper>
            <Suspense
              key={Object?.values(params)?.join("")}
              fallback={
                <div className="grid place-content-center min-h-[300px]">
                  <Loading />
                </div>
              }
            >
              <RecipesContainer searchParams={params} />
            </Suspense>
          </ErrorWrapper>
        </main>
      </div>
    </MaxWidthWrapper>
  );
};

export default Recipes;
