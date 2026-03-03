import { useHttpApiClient } from "@/services/apiClient";
import { useAppMutation } from "./useAppMutation";
import { useEffect, useState } from "react";

export default function useScanFoodIa() {
  const apiClient = useHttpApiClient();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const {
    mutate: generateRecipeIaMutation,
    ...rest
  } = useAppMutation(
    async (data: FormData) => apiClient.recipeService.analizeRecipeImageIa(data),
    {
      toastConfig: {
        loading: "Analizando imagen...",
        success: "Análisis completado",
        error: "No se pudo analizar la imagen",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: false,
        showError: true,
      },
    },
  );

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

