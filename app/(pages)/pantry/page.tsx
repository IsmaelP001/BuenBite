import {
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { getUser } from "@/lib/supabase/server";
import AddIngredientsBtn from "@/components/pantry/AddIngredientsBtn";
import ShowRelatedRecipesBtn from "@/components/pantry/ShowRelatedRecipesBtn";
import { lazy, Suspense } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { ErrorWrapper } from "@/components/ErrorWraper";
import { getIngredients } from "@/actions/ingredients";
import { getUserPantryItems } from "@/actions/pantry";
const PantryIngredientListContainer = lazy(()=>import("@/components/pantry/PantryIngredientListContainer"))
const RecipesByPantrySidebar = lazy(()=>import("@/components/pantry/RecipesByPantrySidebar"))
const IngredientListContainer = lazy(()=>import("@/components/pantry/IngredientListContainer"))
const SearchAndFilterBar = lazy(()=>import("@/components/pantry/SearchAndFilterBar"))


export default async function Pantry() {
  const queryClient = getQueryClient();
  const user = await getUser();
  const isSignin =!!user

  if (isSignin) {
    queryClient.prefetchQuery({
      queryKey: ["pantry_items"],
      queryFn: async () => await getUserPantryItems(),
    });
  }

  queryClient.prefetchQuery({
    queryKey: ["ingredient_items"],
    queryFn: async () => await getIngredients(),
  });

  return (
    <MaxWidthWrapper>
      <div className="min-h-screen bg-background">
        <main className="container py-8">
          <section className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">
                  Mi Despensa
                </h1>
                {/* <p className="text-muted-foreground">
                {pantryItems.data.length} ingredientes •{" "}
                <span className="text-warning">{0} por vencer</span>
              </p> */}
              </div>
              <ShowRelatedRecipesBtn />
              <AddIngredientsBtn type={isSignin ? "pantry" : "ingredient"} />
            </div>
          </section>

          <HydrationBoundary state={dehydrate(queryClient)}>
            <div className=" grid lg:grid-cols-[auto_400px] gap-4">
              <ErrorWrapper>
                <Suspense
                  fallback={
                    <div className="flex-1  flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    </div>
                  }
                >
                  <div>
                    {isSignin && <SearchAndFilterBar />}
                    {/* <PantryCategoriesContainer isUserSignin={isSignin} /> */}
                    {isSignin ? (
                      <PantryIngredientListContainer />
                    ) : (
                      <IngredientListContainer />
                    )}
                  </div>
                </Suspense>
              </ErrorWrapper>
              <RecipesByPantrySidebar />
            </div>
          </HydrationBoundary>
        </main>
      </div>
    </MaxWidthWrapper>
  );
}
