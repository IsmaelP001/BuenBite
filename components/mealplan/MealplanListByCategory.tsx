import { getSuggestedMealPlansByCategory } from "@/actions/mealplan";
import HorizontalScrollList from "../HorizontalScrollList";
import MealPlanCard from "../MealplanCard";

export default async function MealplanListByCategory() {
  const {data:mealPlansList}= await getSuggestedMealPlansByCategory({limit:3})
  return (
    <div>
      {mealPlansList?.map(({ id, name, mealplans }) => (
        <HorizontalScrollList
          key={id}
          data={mealplans || []}
          title={name}
          subTitle={{
            href: "/recipes",
            text: "Ver Todas",
          }}
          renderItem={(plan) => {
            return (
              <div className="w-[250px]">
                <MealPlanCard {...plan} />
              </div>
            );
          }}
        />
      ))}
    </div>
  );
}
