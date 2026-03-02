import { mealTypes } from "@/lib/config";
import Link from "next/link";



const MealTypeFilter = () => {
  return (
    <section className="mb-10">
      <h2 className="font-display text-lg font-semibold mb-5">
        ¿Qué quieres cocinar hoy?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {mealTypes?.map((meal) => (
          <Link
            key={meal.id}
            href={`/recipes?meal=${meal?.id}&filterType=meal`}
            className="group relative"
          >
            <div
              className={`absolute inset-0 rounded-2xl bg-linear-to-br ${meal.color} opacity-[0.12] blur-lg transition-opacity duration-300 group-hover:opacity-30`}
            />

            <div className="relative rounded-2xl px-3 py-3 bg-white/70 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <div
                className={`mx-auto mb-2 h-10 w-10 rounded-xl bg-linear-to-br ${meal.color} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105`}
              >
                <meal.icon className="h-5 w-5 text-white" />
              </div>

              <p className="text-center text-xs font-semibold tracking-tight">
                {meal?.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MealTypeFilter;
