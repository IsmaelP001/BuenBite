import { SuggestedMealPlan } from "@/types/models/mealplan";
import { Clock, Calendar, ChefHat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


const MealPlanCard = ({
  id,
  imageUrl,
  name,
  description,
  durationDays,
}: SuggestedMealPlan) => {
  return (
    <Link 
      href={`/meal-plans/${id}`} 
      className="block group bg-card rounded-2xl card-shadow overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-48 p-4">
        <div className="relative w-full h-full">
          <div
            className="absolute rounded-xl shadow-md transition-all duration-300 bg-blue-400 group-hover:rotate-[-8deg]"
            style={{
              width: '100%',
              height: '100%',
              left: '0px',
              top: '0px',
              zIndex: 1,
              transform: 'rotate(-6deg)',
            }}
          />

          <div
            className="absolute rounded-xl shadow-md transition-all duration-300 bg-yellow-400 group-hover:rotate-[4deg]"
            style={{
              width: '100%',
              height: '100%',
              left: '0px',
              top: '0px',
              zIndex: 2,
              transform: 'rotate(3deg)',
            }}
          />

          <div
            className="absolute rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 group-hover:scale-[1.02]"
            style={{
              width: '100%',
              height: '100%',
              left: '0px',
              top: '0px',
              zIndex: 3,
              transform: 'rotate(0deg)',
            }}
          >
            <Image
              src={imageUrl || '/placeholder-meal.jpg'}
              alt={name}
              width={300}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          </div>
          
          <div className="absolute -bottom-2 -right-2 z-20 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg flex items-center gap-1.5 group-hover:scale-110 transition-transform duration-300">
            <ChefHat className="h-4 w-4" />
            {5} recetas
          </div>
        </div>
      </div>

      <div className=" px-5 py-2">
        <h3 className="font-display text-base md:text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{durationDays} días</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>~{Math.round(durationDays * 45)}min total</span>
          </div>
        </div> */}
      </div>
    </Link>
  );
};

export default MealPlanCard;