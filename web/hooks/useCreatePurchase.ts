import { PurchaseItemDto } from "@/types/models/purchase";
import { useAppMutation } from "./useAppMutation";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase";

export interface PurchaseData {
  id: string;
  userId: string;
  purchaseDate: string;
  status: PurchaseStatus;
  totalItems: number | null;
}


type PurchaseStatus = "creating" | "pending" | "completed" | "failed";

export default function useCreatePurchase() {
  const router = useRouter();

  return useAppMutation(
    async (data: PurchaseItemDto[]) => await createPurchase(data),
    {
      invalidateQueries: ["user_purchases", "user_purchases_items", "pantry_items"],
      toastConfig: {
        success: "¡Orden creada con exito!",
        error: "Error al crear orden",
        loading: "Creando orden",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
      onSuccess: (data) => {
        const purchaseId = (data as { data?: { purchase?: { id?: string } } })?.data?.purchase?.id;
        if (purchaseId) {
          router.push(`/purchases/history/${purchaseId}`);
        }
      },
    }
  );

}
