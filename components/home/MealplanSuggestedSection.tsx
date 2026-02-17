import React from "react";
import HorizontalScrollList from "../HorizontalScrollList";
import MealPlanCard from "../MealplanCard";
import { ApiClient } from "@/services/apiClient";


export default async function MealplanSuggestedSection() {
  const apiClient = new ApiClient();
  const {data:mealplan} = await apiClient.mealplanService.getDefaultSuggestedMealPlans();

  if(!mealplan)return
  return (
    <HorizontalScrollList
      data={mealplan?.mealplans}
      title={mealplan?.name}
      subTitle={{
        href: "/recipes",
        text: "Ver Todos",
      }}
      renderItem={(plan) => {
        return (
          <div className="w-[230px] md:w-[300px]">
            <MealPlanCard {...plan} />
          </div>
        );
      }}
    />
  );
}
