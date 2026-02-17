import { useHttpApiClient } from "@/services/apiClient";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useScanPantryReceipt() {
  const apiClient = useHttpApiClient();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const { mutate: scanFoodIaMutation, ...rest } = useMutation({
    mutationFn: async (data: FormData) =>
      await apiClient.pantryService.scanReceiptImage(data),
  });

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
