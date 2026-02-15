import { Clock, Star, CheckCircle, ChefHat } from "lucide-react";
import Link from "next/link";

interface CompactRecipeCardProps {
  id?: string;
  image: string;
  title: string;
  category: string;
  time: string;
  rating: number;
  ingredientsAvailable: number;
  ingredientsTotal: number;
}

const CompactRecipeCard = ({
  id = "1",
  image,
  title,
  category,
  time,
  rating,
  ingredientsAvailable,
  ingredientsTotal,
}: CompactRecipeCardProps) => {
  const percentage = Math.round((ingredientsAvailable / ingredientsTotal) * 100);
  const isComplete = ingredientsAvailable === ingredientsTotal;

  return (
    <Link 
      href={`/recipes/${id}`} 
      className="flex gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
    >
      {/* Image */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isComplete && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            isComplete 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-primary' : 'bg-primary/60'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {rating}
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="h-3 w-3" />
            {ingredientsAvailable}/{ingredientsTotal}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CompactRecipeCard;
