import { ErrorWrapper } from "@/components/ErrorWraper";
import Loading from "@/components/Loading";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { MealplanCategoriesContainer } from "@/components/mealplan/MealplanCategoriesContainer";
import MealplanFilters from "@/components/mealplan/MealplanFilters";
import { lazy, Suspense } from "react";
const MealplanListContainer = lazy(
  () => import("@/components/mealplan/MealplanListContainer")
);

const MealPlans = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const params = await searchParams;
  const suspenseKey = JSON.stringify({
    query: params?.query || "",
    category: params?.category || "",
  });
  return (
    <MaxWidthWrapper>
      <div className="min-h-screen bg-background">
        <main className="container py-4">
          <section className="bg-linear-to-br from-primary/10 via-card to-secondary/30 rounded-3xl py-4 px-4 mb-2 animate-fade-in">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Planes de <span className="text-primary">Comida</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg">
                Organiza tu semana con planes diseñados para diferentes estilos
                de vida y necesidades nutricionales.
              </p>
            </div>
          </section>
          <MealplanFilters />
          <MealplanCategoriesContainer />
          <ErrorWrapper>
            <Suspense
              key={suspenseKey}
              fallback={
                <div className="min-h-[300px] grid place-content-center">
                  <Loading />
                </div>
              }
            >
              <MealplanListContainer searchParams={params} />
            </Suspense>
          </ErrorWrapper>
        </main>
      </div>
    </MaxWidthWrapper>
  );
};

export default MealPlans;
