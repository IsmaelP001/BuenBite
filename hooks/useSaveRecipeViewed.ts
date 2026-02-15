import { useHttpApiClient } from "@/services/apiClient";
import { useMutation } from "@tanstack/react-query";

const STORAGE_KEY = "@viewed_recipes";

const getCurrentDate = () => new Date().toISOString().split("T")[0];

export default function useSaveRecipeViewed() {
  const apiClient = useHttpApiClient();

  const mutation = useMutation({
    mutationFn: async (recipeId: string) => {
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
  });

  return mutation;
}