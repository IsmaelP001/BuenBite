import HorizontalScrollList from "../HorizontalScrollList";
import { AlertTriangle, ShoppingBasket } from "lucide-react";
import IngredientCard from "../IngredientCard";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ChefHat, Sparkles, ShoppingCart, TrendingDown, Brain } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { getUserPantryItems } from "@/actions/pantry";

export default async function PriorityPantrySection() {
  const queryClient = new QueryClient();
  const { data: pantryItems } = await queryClient.fetchQuery({
    queryKey: ["pantry_items"],
    queryFn: async () => await getUserPantryItems(),
  });

  const priorityItems = (pantryItems ?? [])
    .filter((item) => item.isExpiring || item.isLowStock)
    .sort((a, b) => {
      if (a.isExpiring && !b.isExpiring) return -1;
      if (!a.isExpiring && b.isExpiring) return 1;

      if (a.isLowStock && !b.isLowStock) return -1;
      if (!a.isLowStock && b.isLowStock) return 1;

      if (a.expirationDate && b.expirationDate) {
        return (
          new Date(a.expirationDate).getTime() -
          new Date(b.expirationDate).getTime()
        );
      }

      return 0;
    });

  const displayItems = priorityItems.length > 0 
    ? priorityItems 
    : (pantryItems ?? []).slice(0, 8);

  const getTitle = () => {
    if (priorityItems.length === 0) return "Tu Despensa";
    
    const hasExpiring = priorityItems.some(item => item.isExpiring);
    const hasLowStock = priorityItems.some(item => item.isLowStock);
    
    if (hasExpiring && hasLowStock) return "¡Atención Necesaria!";
    if (hasExpiring) return "Próximos a Vencer";
    return "Bajo Stock";
  };

  if(!pantryItems?.length){
    return (<AddRecipesBanner/>)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HorizontalScrollList
        data={displayItems}
        titleIcon={AlertTriangle}
        title={getTitle()}
        subTitle={{
          href: "/pantry",
          text: "Ver Más",
        }}
        renderItem={(ingredient) => {
          return (
            <div className="w-[180px]">
              <IngredientCard selectable={false}  {...ingredient} />
            </div>
          );
        }}
      />
    </HydrationBoundary>
  );
}





function AddRecipesBanner() {
  const benefits = [
    { icon: Brain, text: "Despensa Inteligente" },
    { icon: Sparkles, text: "Recetas según lo que tienes" },
    { icon: TrendingDown, text: "Reduce desperdicios" },
    { icon: ShoppingCart, text: "Control de stock" },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-orange-50 via-orange-100 to-white p-6 shadow-md border border-orange-200 mb-6">
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-orange-100 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Contenido */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Convierte tu despensa en recetas inteligentes
            </h3>
          </div>

          <p className="text-sm text-gray-700 md:text-sm font-light px-1">
Gestiona tu despensa de forma inteligente, descubre recetas basadas en los ingredientes y cantidades que tienes en casa, cocina sin desperdiciar comida y mantén tu stock siempre actualizado automáticamente.          </p>

          {/* Beneficios */}
          <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 rounded-lg bg-white/60 px-2 py-1.5 backdrop-blur-sm border border-orange-200/50"
              >
                <benefit.icon className="h-3.5 w-3.5 flex-shrink-0 text-orange-600" />
                <span className="text-xs font-medium text-gray-700">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <Link
            
            href="/pantry/create"
            className={buttonVariants({variant:'hero-outline'})}
          >
            <ShoppingBasket className="h-5 w-5" />
            <span>Añadir ingredientes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
