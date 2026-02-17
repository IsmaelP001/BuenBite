import { useHttpApiClient } from "@/services/apiClient";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useScanFoodIa() {
  const apiClient = useHttpApiClient();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const {
    mutate: generateRecipeIaMutation,
    ...rest
  } = useMutation({
    mutationFn: async (data: FormData) =>
      await apiClient.recipeService.analizeRecipeImageIa(data),
  });

  useEffect(() => {
    if (uploadedImage) {
      const formData = new FormData();
      formData.append("image", uploadedImage );
      generateRecipeIaMutation(formData);
    }
  }, [uploadedImage,generateRecipeIaMutation]);


  const handleUploadImage = (file: File) => {
    setUploadedImage(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
  };
  return {
    generateRecipeIaMutation,
    handleUploadImage,
    uploadedImage,
    clearImage,
    ...rest
  };
}


