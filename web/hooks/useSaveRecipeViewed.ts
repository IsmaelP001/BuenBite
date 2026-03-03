import { useHttpApiClient } from "@/services/apiClient";
import { useAppMutation } from "./useAppMutation";

const STORAGE_KEY = "@viewed_recipes";

const getCurrentDate = () => new Date().toISOString().split("T")[0];

export default function useSaveRecipeViewed() {
  const apiClient = useHttpApiClient();

  return useAppMutation(
    async (recipeId: string) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : { date: "", recipeIds: [] };
        const today = getCurrentDate();

        if (data.date !== today) {
          data.date = today;
          data.recipeIds = [];
        }

        if (data.recipeIds.includes(recipeId)) {
          return null;
        }

        const result = await apiClient.recipeService.saveViewedRecipe(recipeId);

        data.recipeIds.push(recipeId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        return result;
      } catch (err) {
        console.log("err saving recipe viewed:", err);
        throw err;
      }
    },
    {
      invalidateQueries: ["recent_recepies_viewed"],
      toastConfig: {
        error: "No se pudo guardar la receta vista",
      },
      toastVisibility: {
        showLoading: false,
        showSuccess: false,
        showError: true,
      },
    },
  );
}
