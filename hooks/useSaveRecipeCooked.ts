import { RegisterRecipeAsCooked } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { saveRecipeCooked } from "@/actions/recipes";

export default function useSaveRecipeCooked() {


  return useAppMutation(
    ( data: RegisterRecipeAsCooked) =>
      saveRecipeCooked(data),
    {
      invalidateQueries: ["pantry_items", "user_nutritional_history","pantry_transactions"],
      toastVisibility: {
        showError: true,
        showSuccess: true,
        showLoading: true,
      },
      toastConfig: {
        success:
          "Receta guardada. Ingredientes y datos nutricionales actualizados.",
        loading: "Registrado receta",
        error: "Error al registrar receta",
      },
      onSuccess: () => {
     
      },
    }
  );
}
