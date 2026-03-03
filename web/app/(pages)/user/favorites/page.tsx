import { Heart } from "lucide-react";
import FavoritesListContainer from "@/components/favorites/FavoritesListContainer";
import { getUserSavedRecipes } from "@/actions/recipes";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

export const dynamic = "force-dynamic";

const FavoritesPage = async () => {
  const queryClient = getQueryClient()
  const {data:favorites} = await queryClient.fetchQuery({
    queryKey:['user-favorites-recipes'],
    queryFn:async ()=>await getUserSavedRecipes()
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Mis Favoritos
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length > 0
                  ? `${favorites.length} ${
                      favorites.length === 1
                        ? "receta guardada"
                        : "recetas guardadas"
                    }`
                  : "Colección de recetas favoritas"}
              </p>
            </div>
          </div>

          {/* Filters */}
          {/* {favorites.length > 0 && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setFilter("all")}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  filter === "all"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter("recent")}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  filter === "recent"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Recientes
              </button>
              <button
                onClick={() => setFilter("popular")}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  filter === "popular"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Más Populares
              </button>
              <button className="px-5 py-2 rounded-full font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-2 ml-auto">
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          )} */}
        </div>

        {/* Content */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FavoritesListContainer  />
        </HydrationBoundary>
      </div>
    </div>
  );
};

export default FavoritesPage;
