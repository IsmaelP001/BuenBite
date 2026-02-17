import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useHttpApiClient } from "@/services/apiClient";
import { SaveUserRecipe } from "@/types/models/user";
import { useOptimisticMutation } from "./useOptimisticMutation";
import { toast } from "sonner";
import { getUserSavedRecipeEntries, saveUserRecipe } from "@/actions/user";
import { useAuth } from "@/lib/context/authContext";
import { useRouter } from "next/navigation";

export const savedRecipesKeys = {
  all: ["savedRecipes"] as const,
  entries: () => ["savedRecipes", "entries"] as const,
};

function useGetFavoritesEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_favorites_recepies_entries"],
    queryFn: () => getUserSavedRecipeEntries(),
    staleTime: 6 * 60 * 60 * 1000,
    select(data) {
      const favoritesMap = new Map<
        string,
        { recipeId: string; isFavorite: boolean }
      >();
      data?.data?.forEach(
        (entry: { recipeId: string; isFavorite: boolean }) => {
          favoritesMap.set(entry.recipeId, entry);
        },
      );
      return favoritesMap;
    },
    enabled: !!user,
  });
}

export function useIsSavedRecipe(recipeId: string) {
  const { data: favorites, isFetching } = useGetFavoritesEntries();
  return {
    isSaved: favorites?.has(recipeId) ?? false,
    isLoading: isFetching,
  };
}

export function useSaveUserRecipe({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { data: favorites } = useGetFavoritesEntries();
  const { user } = useAuth();
  const router = useRouter();

  return useOptimisticMutation({
    mutationFn: async (data: SaveUserRecipe) => {
      if (favorites?.has(data.recipeId)) {
        throw new Error("RECIPE_ALREADY_SAVED");
      }
      if (!user) {
        throw new Error("USER_NOT_AUTHENTICATED");
      }
      return await saveUserRecipe(data);
    },
    queries: {
      queryKey: ["user_favorites_recepies_entries"],
      updateCache: (oldData: any, newData: SaveUserRecipe) => {
        const updatedFavorites = oldData.data.filter(
          (item: any) => item.id !== newData.recipeId,
        );

        updatedFavorites.push(newData);
        return {
          ...oldData,
          data: updatedFavorites,
        };
      },
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: savedRecipesKeys.entries() });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      if (
        error instanceof Error &&
        error?.message === "USER_NOT_AUTHENTICATED"
      ) {
        toast.error("Debes iniciar sesión para guardar recetas", {
          action: {
            label: "Iniciar sesión",
            onClick: () => {
              router.push("/auth/signin");
            },
          },
        });

        return;
      }
      const errMessage =
        error?.message === "RECIPE_ALREADY_SAVED"
          ? "Esta receta ya está en tus favoritos"
          : "Error al guardar la receta. Inténtelo de nuevo.";

      toast.error(errMessage);
    },
  });
}

export function useRemoveUserRecipe({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const apiClient = useHttpApiClient();

  return useOptimisticMutation({
    mutationFn: async (recipeId: string) => {
      return await apiClient.userService.removeUserRecipe(recipeId);
    },
    queries: [
      {
        queryKey: ["user-favorites-recipes"],
        updateCache: (oldData, recipeId: string) => {
          const updatedFavorites = oldData.data.filter(
            (item: any) => item.id !== recipeId,
          );

          return {
            ...oldData,
            data: updatedFavorites,
          };
        },
      },
      {
        queryKey: ["user_favorites_recepies_entries"],
        updateCache: (oldData: any, newData: SaveUserRecipe) => {
          const updatedFavorites = oldData.data.filter(
            (item: any) => item.id !== newData.recipeId,
          );

          updatedFavorites.push(newData);
          return {
            ...oldData,
            data: updatedFavorites,
          };
        },
      },
    ],
    onSuccess: async () => {
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error("Error al remover recetas de tus favoritos");
    },
  });
}
