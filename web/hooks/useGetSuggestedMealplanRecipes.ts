import { getSuggestedMealPlanRecipes } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const DAYS_OF_WEEK = [
  { label: "Dia 1", value: 1 },
  { label: "Dia 2", value: 2 },
  { label: "Dia 3", value: 3 },
  { label: "Dia 4", value: 4 },
  { label: "Dia 5", value: 5 },
  { label: "Dia 6", value: 6 },
  { label: "Dia 7", value: 7 },
];

export default function useGetSuggestedMealplanRecipes({id}:{id:string}) {
   
  const {data,...rest} = useQuery({
    queryKey: ["suggested_mealplan_recipes",id],
    queryFn: async () => {
      return await getSuggestedMealPlanRecipes(
        id as string
      );
    },
    select(data){
        return data?.data ?? []
    }
  });


    const groupedMeals = useMemo(() => {
      return DAYS_OF_WEEK.map((day) => {
        const recipes =
          data
            ?.filter((meal: any) => meal?.dayNumber === day.value)
            ?.map((meal: any) => {
              return {
                ...meal?.recipe,
                mealType: meal.mealType,
              };
            }) || [];
  
        return {
          ...day,
          recipes,
        };
      });
    }, [data]);
  

    return {
      groupedMeals,
      data,
      ...rest
    }

}
