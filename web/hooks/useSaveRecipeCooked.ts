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
      invalidateQueries: [
        "pantry_items",
        "pantry_transactions",
        "user_nutritional_history",
        "user_weekly_nutritional_resume",
        "user_mealplan_entries",
        "todays_user_mealplan_entries",
        "recipe_cooked",
      ],
      toastVisibility: {
        showError: true,
        showSuccess: true,
        showLoading: true,
      },
      toastConfig: {
        success:
          "Receta guardada. Ingredientes y datos nutricionales actualizados.",
        loading: "Registrando receta...",
        error: "Error al registrar receta",
      },
      onSuccess: () => {
     
      },
    }
  );
}
