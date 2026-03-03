import { useHttpApiClient } from "@/services/apiClient";
import { useAppMutation } from "./useAppMutation";

interface SaveRecipeTipInput {
  recipeId: string;
  tip: string;
  image?: File | null;
}

export function useSaveRecipeTip() {
  const apiClient = useHttpApiClient();

  const { mutateAsync: saveRecipeTipMutation, isPending } = useAppMutation(
    async (data: FormData) => apiClient.recipeService.saveRecipeTip(data),
    {
      invalidateQueries: ["recipe_tips", "recipe_most_recent_tip"],
      toastConfig: {
        loading: "Guardando tip...",
        success: "Tip guardado correctamente",
        error: "No se pudo guardar el tip",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    },
  );

  const handleSaveTip = async (data: SaveRecipeTipInput) => {
    const formData = new FormData();
    if (data.image) {
      formData.append("image", data.image);
    }
    formData.append("recipeId", data.recipeId);
    formData.append("tip", data.tip);

    return saveRecipeTipMutation(formData);
  };

  return {
    isPending,
    handleSaveTip,
  };
}
