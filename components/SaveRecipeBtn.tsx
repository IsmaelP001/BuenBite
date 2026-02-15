"use client";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import {
  useIsSavedRecipe,
  useRemoveUserRecipe,
  useSaveUserRecipe,
} from "@/hooks/useSaveUserRecipe";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/context/authContext";
import { useRouter } from "next/navigation";

type SaveRecipeBtnProps = {
  recipeId: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_MAP = {
  sm: { icon: 18, padding: 1 },
  md: { icon: 22, padding: 1.5 },
  lg: { icon: 28, padding: 2 },
};

export default function SaveRecipeBtn({
  recipeId,
  size = "md",
}: SaveRecipeBtnProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isSaved, isLoading } = useIsSavedRecipe(recipeId);
  const { mutateAsync: saveFavoriteMutation } = useSaveUserRecipe();
  const { mutateAsync: removeFavoriteMutation } = useRemoveUserRecipe();

  const { icon } = SIZE_MAP[size];

  const handlePress = async () => {
    setIsProcessing(true);
    try {
      if (isSaved) {
        await removeFavoriteMutation(recipeId);
      } else {
        await saveFavoriteMutation({ recipeId, isFavorite: false });
      }
    } catch (err: any) {
      if (err.message === "RECIPE_ALREADY_SAVED") {
        await removeFavoriteMutation(recipeId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  console.log("isSaved", isSaved, "isLoading", isLoading);

  return (
    <Button
      key={recipeId}
      className="bg-white rounded-full size-10"
      disabled={isProcessing || isLoading}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handlePress();
      }}
    >
      <Bookmark
        size={icon}
        fill={isSaved ? "black" : "none"}
        color="black"
        className="m-auto"
      />
    </Button>
  );
}
