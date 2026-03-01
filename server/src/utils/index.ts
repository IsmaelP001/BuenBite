export const isExpiring = (expirationDate:string) => {
  if (!expirationDate) {
    return {remainingDaysExpire:null,isExpiring:false}

  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(expirationDate);
  expiryDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );
  return {remainingDaysExpire:daysDiff,isExpiring:daysDiff <= 7}
};

export interface NutritionData {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
}

export const calculateNutritionPerServing = (
  totalNutrition: NutritionData,
  totalServings: number,
  currentServings: number = 1
): NutritionData => {
  if (totalServings <= 0) {
    return { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 };
  }

  const perServing = {
    calories: totalNutrition.calories / totalServings,
    protein: totalNutrition.proteins / totalServings,
    fat: totalNutrition.fats / totalServings,
    carbohydrates: totalNutrition.carbohydrates / totalServings,
  };

  return {
    calories: Math.round(perServing.calories * currentServings),
    proteins: Math.round(perServing.protein * currentServings * 10) / 10,
    fats: Math.round(perServing.fat * currentServings * 10) / 10,
    carbohydrates:
      Math.round(perServing.carbohydrates * currentServings * 10) / 10,
  };
};