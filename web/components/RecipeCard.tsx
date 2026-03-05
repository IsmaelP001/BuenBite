import {  Clock, Star, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RecipeItem } from "@/types/models/recipes";
import dynamic from "next/dynamic";
const SaveRecipeBtn = dynamic(() => import("./SaveRecipeBtn"));

const RecipeCard = ({
  id ,
  image,
  name,
  user,
  totalTime,
  rating,
  views,
}: RecipeItem) => {
  return (
    <Link
      href={`/recipes/${id}`}
      className="block group  bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={image!}
          alt={name || "Recipe Image"}
          width={300}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <SaveRecipeBtn key={id} recipeId={id} size="sm" />
        </div>
        {views && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <Eye className="h-3 w-3" />
            <span>{views}+</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {user?.fullName && (
          <div className="flex items-center gap-2 mb-2 ">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-semibold">
                {user.fullName.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {user.fullName}
            </span>
          </div>
        )}

        <h3 className="font-display font-semibold text-base md:text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalTime}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
