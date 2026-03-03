import { useHttpApiClient } from "@/services/apiClient";
import { useAppMutation } from "./useAppMutation";
import { useEffect, useState } from "react";

export default function useScanPantryReceipt() {
  const apiClient = useHttpApiClient();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const { mutate: scanFoodIaMutation, ...rest } = useAppMutation(
    async (data: FormData) => apiClient.pantryService.scanReceiptImage(data),
    {
      toastConfig: {
        loading: "Escaneando recibo...",
        success: "Recibo escaneado",
        error: "No se pudo escanear el recibo",
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
      formData.append("image", uploadedImage);
      scanFoodIaMutation(formData);
    }
  }, [uploadedImage, scanFoodIaMutation]);

  const handleUploadImage = (file: File) => {
    setUploadedImage(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
  };

  return {
    uploadedImage,
    scanFoodIaMutation,
    handleUploadImage,
    clearImage,
    ...rest,
  };
}
