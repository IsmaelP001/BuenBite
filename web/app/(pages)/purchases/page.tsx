import PurchaseFooter from "@/components/purchases/PurchaseFooter";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { ErrorWrapper } from "@/components/ErrorWraper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import nextDynamic from 'next/dynamic';
import { getUserPantryItems } from "@/actions/pantry";

export const dynamic = "force-dynamic";

const MealplanIngredientsContainer = nextDynamic(() => import("@/components/purchases/MealplanIngredientsContainer"), {
});
const IngredientsContainer = lazy(()=>import("@/components/purchases/IngredientsContainer"))
const Purchases = () => {
  const queryClient = getQueryClient();
  queryClient.ensureQueryData({
    queryKey: ["pantry_items"],
    queryFn: async () => await getUserPantryItems(),
  });

  return (
    <div className="min-h-screen bg-background mb-20 ">
      <MaxWidthWrapper>
        <section className="pt-5 pb-8  bg-linear-to-b from-primary/5 to-background flex justify-between ">
          <div className="">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl lg:text-3xl font-bold text-foreground">
                Lista de Compras
              </h1>
            </div>
            <p className="text-xs text-muted-foreground pr-5">
              Selecciona los ingredientes que necesitas y crea tu orden de
              compra
            </p>
          </div>
          <div>
            <Link href={'/purchases/history'}>
            <Button variant='hero'>
              Ver historial
            </Button>
            </Link>
          </div>
        </section>
      </MaxWidthWrapper>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <MaxWidthWrapper>
          <div className=" mx-auto pb-8">
            <MealplanIngredientsContainer />
           <ErrorWrapper>
             <Suspense fallback={<p>Loading...</p>}>
              <IngredientsContainer />
            </Suspense>
           </ErrorWrapper>
          </div>
        </MaxWidthWrapper>
      </HydrationBoundary>

      <PurchaseFooter />
    </div>
  );
};

export default Purchases;
