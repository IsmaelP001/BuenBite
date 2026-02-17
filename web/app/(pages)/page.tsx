import { lazy, Suspense } from "react";
import { ErrorWrapper } from "@/components/ErrorWraper";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { getUser } from "@/lib/supabase/server";
import HeroSection from "@/components/home/HeroSection";
import InfoBanner from "@/components/home/InfoBanner";
import NewsletterBanner from "@/components/home/NewsLetterBanner";
import MealTypeFilter from "@/components/home/MealtypeFilter";
import CTASection from "@/components/home/CTASection";
import { HorizontalScrollListSkeleton } from "@/components/purchases/HoritontalLiskSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import UserHeroSection from "@/components/home/UserHeroSection";
import CommuntyRecipesSection from "@/components/home/CommunityRecipesSection";
import MealplanSuggestedSection from "@/components/home/MealplanSuggestedSection";
import SuggestedRecipesSection from "@/components/home/SuggestedRecipesSection";

const ScheduledSMealplanRecipes = lazy(
  () => import("@/components/home/ScheduledSMealplanRecipes")
);
const PriorityPantrySection = lazy(
  () => import("@/components/home/PriorityPantrySection")
);
const PantryBasedRecommendedRecipesSection = lazy(
  () => import("@/components/home/PantryBasedRecommendedRecipesSection")
);
const UserRecipesSection = lazy(
  () => import("@/components/home/UserRecipesSection")
);

export const metadata = {
  title: "Home - Descubre Recetas y Planifica tus Comidas",
  description:
    "Encuentra recetas deliciosas, gestiona tu despensa y planifica tus comidas de manera inteligente. Únete a nuestra comunidad culinaria.",
  keywords: [
    "recetas",
    "meal planning",
    "despensa",
    "cocina",
    "planificación de comidas",
  ],
  openGraph: {
    title: "Home - Descubre Recetas y Planifica tus Comidas",
    description:
      "Encuentra recetas deliciosas, gestiona tu despensa y planifica tus comidas de manera inteligente.",
    type: "website",
  },
};

export default async function Home() {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black py-5">
      {isLoggedIn && (
        <MaxWidthWrapper>
          <ErrorWrapper>
            <Suspense fallback={<Skeleton className="w-full h-20 mb-4" />}>
              <ScheduledSMealplanRecipes />
            </Suspense>
          </ErrorWrapper>
        </MaxWidthWrapper>
      )}
      <MaxWidthWrapper>
        <Suspense fallback={<HeroSection />}>
          {isLoggedIn ? <UserHeroSection /> : <HeroSection />}
        </Suspense>
      </MaxWidthWrapper>

      {!isLoggedIn && (
        <MaxWidthWrapper>
          <InfoBanner />
        </MaxWidthWrapper>
      )}

      {isLoggedIn && (
        <>
          <MaxWidthWrapper>
            <ErrorWrapper>
              <Suspense
                fallback={
                  <HorizontalScrollListSkeleton
                    count={8}
                    itemHeight="100"
                    itemWidth="100"
                  />
                }
              >
                <PriorityPantrySection />
              </Suspense>
            </ErrorWrapper>
          </MaxWidthWrapper>

          <MaxWidthWrapper>
            <ErrorWrapper>
              <Suspense fallback={<HorizontalScrollListSkeleton />}>
                <PantryBasedRecommendedRecipesSection />
              </Suspense>
            </ErrorWrapper>
          </MaxWidthWrapper>

          <MaxWidthWrapper>
            <ErrorWrapper>
              <Suspense fallback={<HorizontalScrollListSkeleton />}>
                <UserRecipesSection />
              </Suspense>
            </ErrorWrapper>
          </MaxWidthWrapper>
        </>
      )}

      <MaxWidthWrapper>
        <MealTypeFilter />
      </MaxWidthWrapper>

      <MaxWidthWrapper>
        <ErrorWrapper>
          <Suspense fallback={<HorizontalScrollListSkeleton />}>
            <CommuntyRecipesSection />
          </Suspense>
        </ErrorWrapper>
      </MaxWidthWrapper>

      <MaxWidthWrapper>
        <ErrorWrapper>
          <Suspense fallback={<HorizontalScrollListSkeleton />}>
            <MealplanSuggestedSection />
          </Suspense>
        </ErrorWrapper>
      </MaxWidthWrapper>

      <MaxWidthWrapper>
        <NewsletterBanner />
      </MaxWidthWrapper>

      <MaxWidthWrapper>
        <ErrorWrapper>
          <Suspense fallback={<HorizontalScrollListSkeleton />}>
            <SuggestedRecipesSection />
          </Suspense>
        </ErrorWrapper>
      </MaxWidthWrapper>

      {!isLoggedIn && (
        <MaxWidthWrapper>
          <CTASection />
        </MaxWidthWrapper>
      )}
    </div>
  );
}
