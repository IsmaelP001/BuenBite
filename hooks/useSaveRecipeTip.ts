import { useHttpApiClient } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubmitRating {
  recipeId: string;
  tip: string;
}

export function useSaveRecipeTip() {
  const apiClient = useHttpApiClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const { mutate: saveRecipeRatingMutation, isPending } = useMutation({
    mutationFn: async (data: FormData) =>
      await apiClient.recipeService.saveRecipTip(data),
    onSuccess(data, input) {
      queryClient.invalidateQueries({
        queryKey: ["recipe_most_recent_tip", input.get("recipeId")],
      });
      queryClient.invalidateQueries({
        queryKey: ["recipe_tips", input.get("recipeId")],
      });
      router.push(`/recepies/${input.get("recipeId")}`);
    },
  });

  const handleSaveTip = (data: SubmitRating) => {
    const formData = new FormData();
    if (uploadedImage) {
      formData.append("image", uploadedImage);
    }
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    saveRecipeRatingMutation(formData);
  };

  const handleUploadImage = (file: File) => {
    setUploadedImage(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
  };

  return {
    handleUploadImage,
    isPending,
    handleSaveTip,
    uploadedImage,
    clearImage,
  };
}
