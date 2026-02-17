"use client";
import { useAppMutation } from "./useAppMutation";
import { setUpUserNutritionalMetrics } from "@/actions/user";

export default function useSetUpUserNutritionalMetrics() {
  

  return useAppMutation(
    async (data: any) => {
      return await setUpUserNutritionalMetrics(data);
    },
    {
      invalidateQueries: ["user_preferences"],
      toastConfig: {
        success: 'Datos nutricionales guardados con exito',
        error: 'Error al guardar tus datos nutricionales',
      },
    }
  );
}
