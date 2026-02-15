"use client";
import { useOptimisticMutation } from "./useOptimisticMutation";
import { PantryItem } from "@/types/models/pantry";
import { useParams } from "next/navigation";
import { updatePantryItem } from "@/actions/pantry";

export default function UseUpdatePantryItem() {
  const { id } = useParams();

  return useOptimisticMutation({
    mutationFn: async (data: Partial<PantryItem>) =>
      await updatePantryItem(data),
    queries: {
      queryKey: () => ["pantry_details", id],
      updateCache: (oldData: any, data: any) => {
        console.log("oldData", oldData);
        return {
          ...oldData,
          data: {
            ...oldData.data,
            ...data,
          },
        };
      },
    },
    showToasts: true,
    toastConfig: {
      success: {
        title: "Despensa actualizada correctamente",
        description:
          "El elemento de la despensa se ha actualizado correctamente.",
      },
      error: {
        title: "Error al actualizar",
        description:
          "No se pudo actualizar el elemento de la despensa. Inténtalo de nuevo.",
      },
    },
  });
}
