import { getRecipeById } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export interface EditField {
  name: EditElement<string>;
  description: EditElement<string>;
  instructions: EditElement<{ step: string }[]>;
  notes: EditElement<string>;
  ingredients: EditElement<any[]>;
}

export interface EditElement<T> {
  isEdit: boolean;
  value: T;
}

export default function useGetRecipyDetails() {
  const { id } = useParams();
  const { data, isPending,...rest } = useQuery({
    queryKey: ["recepies_by_id", id],
    queryFn: async () => getRecipeById(id as string),
    select: (data) => {
      if (!data) return null;
      return data?.data;
    },
   
  });


  return {
    recipe:data,
    isPending,
    ...rest
  };
}
