import { useRecipeFilters } from "@/hooks/useFilterRecipes";
import { mealTypes } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Carrot, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { QuickLinkComponent, RECIPES_QUICK_LINKS, SectionHeader } from "./Navbar";


interface MegaMenuProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

interface MealTypeItemProps {
  icon: LucideIcon;
  label: string;
  mealType: string;
  onClick: () => void;
}


const MealTypeItem = ({ icon: Icon, label, onClick }: MealTypeItemProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors group text-left w-full"
  >
    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const RecipesMegaMenu = ({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: MegaMenuProps) => {
  const router = useRouter();
  const { ingredients } = useRecipeFilters({
    searchValue: "",
    ingredientsLimit: 6,
  });

  const handleMealTypeClick = (id: string, mealType: string) => {
    router.push(`/recipes?meal=${id}&filterType=${mealType}`);
    onClose();
  };

  const handleIngredientClick = (ingredientId: string) => {
    router.push(
      `/recipes?ingredientIds=${ingredientId}&filterType=ingredientIds`
    );
    onClose();
  };

  return (
    <div
      className={cn(
        "absolute left-0 right-0 px-4 top-full bg-card border-b border-border shadow-xl transition-all duration-300 overflow-hidden",
        isOpen
          ? "opacity-100 visible max-h-[400px]"
          : "opacity-0 invisible max-h-0"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClose}
    >
      <div className="container py-6">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <SectionHeader title="Por Tipo de Comida" />
            <div className="space-y-1">
              {mealTypes.map((item) => (
                <MealTypeItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  mealType={item.id}
                  onClick={() => handleMealTypeClick(item.id, "meal")}
                />
              ))}
            </div>
          </div>

          {ingredients && ingredients.length > 0 && (
            <div>
              <SectionHeader title="Por Ingredientes" />
              <div className="space-y-1">
                {ingredients.slice(0, 6).map((item) => (
                  <QuickLinkComponent
                    key={item.id}
                    icon={Carrot}
                    label={item.name_es}
                    href={`/recipes?ingredientIds=${item.id}&filterType=ingredientIds`}
                    onClick={() => handleIngredientClick(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionHeader title="Acceso Rápido" />
            <div className="space-y-1">
              {RECIPES_QUICK_LINKS.map((link) => (
                <QuickLinkComponent
                  key={link.href}
                  icon={link.icon}
                  label={link.label}
                  href={link.href}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          <div className="bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl p-5">
            <h3 className="font-display font-semibold mb-2">Receta del Día</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Descubre nuevas recetas cada día seleccionadas especialmente para
              ti.
            </p>
            <Button variant="hero" size="sm" asChild>
              <Link href="/recipes/featured" onClick={onClose}>
                Ver Receta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesMegaMenu;
