import { RegisterRecipeAsCooked } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { saveRecipeCooked } from "@/actions/recipes";

function buildFormData(data: RegisterRecipeAsCooked): FormData {
  const formData = new FormData();
  formData.append("recipeId", data.recipeId);
  formData.append("ingredients", JSON.stringify(data.ingredients));
  formData.append("servings", data.servings.toString());

  if (data.image) {
    formData.append("image", data.image);
  }
  if (data.notes) {
    formData.append("notes", data.notes);
  }
  if (data.rating) {
    formData.append("rating", data.rating.toString());
  }
  if (data.mealPlanEntryId) {
    formData.append("mealPlanEntryId", data.mealPlanEntryId);
  }
  return formData;
}

export default function useSaveRecipeCooked() {


  return useAppMutation(
    (data: RegisterRecipeAsCooked) =>
      saveRecipeCooked(buildFormData(data)),
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
