import { useHttpApiClient } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SaveRecipeTipInput {
  recipeId: string;
  tip: string;
  image?: File | null;
}

export function useSaveRecipeTip() {
  const apiClient = useHttpApiClient();
  const queryClient = useQueryClient();

  const { mutateAsync: saveRecipeTipMutation, isPending } = useMutation({
    mutationFn: async (data: FormData) =>
      await apiClient.recipeService.saveRecipeTip(data),
    onSuccess(data, input) {
      queryClient.invalidateQueries({
        queryKey: ["recipe_most_recent_tip", input.get("recipeId")],
      });
      queryClient.invalidateQueries({
        queryKey: ["recipe_tips", input.get("recipeId")],
      });
    },
  });

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
