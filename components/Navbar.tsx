"use client";
import {
  Apple,
  CalendarDays,
  Carrot,
  ChevronDown,
  ChevronRight,
  Flame,
  History,
  Lightbulb,
  LucideIcon,
  Menu,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Store,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useSearchRecipes from "@/hooks/useSearchRecipes";
import { useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { mealTypes } from "@/lib/config";
import MaxWidthWrapper from "./MaxWithWrapper";
import { useRecipeFilters } from "@/hooks/useFilterRecipes";
import dynamic from 'next/dynamic';

const RecipesMegaMenu = dynamic(() => import("./RecipesNavbarMenu"), {
  ssr: false,
});
const PurchasesMegaMenu = dynamic(() => import("./PurchaseNavbarMenu"), {
  ssr: false,
});
interface NavLinkProps {
  href: string;
  label: string;
  className?: string;
}

interface QuickLink {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface MenuSection {
  title: string;
  links: QuickLink[];
}

const MAIN_NAV_LINKS: NavLinkProps[] = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recetas" },
  { href: "/meal-plans", label: "Planes" },
  { href: "/pantry", label: "Despensa" },
  { href: "/purchases", label: "Compras" },
  { href: "/social", label: "Comunidad" },
  { href: "/tracking", label: "Calorías" },
];


export const PANTRY_LINKS: QuickLink[] = [
  { icon: Package, label: "Mi Despensa", href: "/pantry" },
  { icon: Plus, label: "Agregar Ingrediente", href: "/pantry/create" },
  { icon: Store, label: "Stock Bajo", href: "/pantry?filters=low_stock" },
  { icon: Apple, label: "Por Vencer", href: "/pantry?filters=expiring" },
];

export const SHOPPING_LINKS: QuickLink[] = [
  { icon: ShoppingCart, label: "Lista de Compras", href: "/purchases" },
  { icon: History, label: "Historial de Compras", href: "/purchases/history" },
  { icon: Lightbulb, label: "Sugerencias", href: "/purchases?tab=suggestions" },
];

export const PLANNING_LINKS: QuickLink[] = [
  { icon: CalendarDays, label: "Planes de Comida", href: "/meal-plans" },
  { icon: Flame, label: "Tracking Calorías", href: "/tracking" },
];

const COMMUNITY_LINKS: QuickLink[] = [
  { icon: Users, label: "Feed Social", href: "/social" },
];

const MOBILE_SECTIONS: MenuSection[] = [
  { title: "Planificación", links: PLANNING_LINKS },
  { title: "Despensa", links: PANTRY_LINKS },
  { title: "Compras", links: SHOPPING_LINKS },
  { title: "Comunidad", links: COMMUNITY_LINKS },
];


export const RECIPES_QUICK_LINKS: QuickLink[] = [
  { icon: Star, label: "Mis Favoritas", href: "/user/favorites" },
  { icon: History, label: "Guardadas", href: "/user/recipes" },
  { icon: Plus, label: "Crear Receta", href: "/recipes/create" },
];



interface NavLinkComponentProps extends NavLinkProps {
  activeClassName?: string;
  onClick?: () => void;
}

const NavLink = ({
  href,
  label,
  className,
  activeClassName,
  onClick,
}: NavLinkComponentProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};





interface QuickLinkComponentProps {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick?: () => void;
  variant?: "default" | "primary";
}

export const QuickLinkComponent = ({
  icon: Icon,
  label,
  href,
  onClick,
  variant = "default",
}: QuickLinkComponentProps) => {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors group"
    >
      <div
        className={cn(
          "p-2 rounded-lg transition-colors",
          isPrimary
            ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
        )}
      >
        <Icon className={cn(isPrimary ? "h-5 w-5" : "h-4 w-4")} />
      </div>
      <span
        className={cn(
          "transition-colors",
          isPrimary
            ? "font-medium"
            : "text-sm text-muted-foreground group-hover:text-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  );
};

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader = ({ title }: SectionHeaderProps) => (
  <h3 className="font-display font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">
    {title}
  </h3>
);


const MobileSidebar = ({ onClose }: { onClose: () => void }) => {
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
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <SectionHeader title="Recetas" />
          
          <Collapsible defaultOpen={false} className="mb-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 hover:bg-accent rounded-lg transition-colors group">
              <h4 className="text-xs font-semibold text-muted-foreground">
                Por Tipo de Comida
              </h4>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-1">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => handleMealTypeClick(meal.id, "meal")}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors group w-full text-left"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <meal.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{meal.label}</span>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {ingredients && ingredients.length > 0 && (
            <Collapsible defaultOpen={false} className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 hover:bg-accent rounded-lg transition-colors group">
                <h4 className="text-xs font-semibold text-muted-foreground">
                  Por Ingredientes
                </h4>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-1">
                  {ingredients.slice(0, 6).map((ingredient) => (
                    <button
                      key={ingredient.id}
                      onClick={() => handleIngredientClick(ingredient.id)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors group w-full text-left"
                    >
                      <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Carrot className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {ingredient.name_es}
                      </span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Quick Access - Collapsible */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 hover:bg-accent rounded-lg transition-colors group">
              <h4 className="text-xs font-semibold text-muted-foreground">
                Acceso Rápido
              </h4>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
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
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Dynamic Sections - All Collapsible */}
        {MOBILE_SECTIONS.map((section) => (
          <div key={section.title} className="px-4 mb-6">
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 hover:bg-accent px-2 py-2 rounded-lg transition-colors group">
                <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1">
                  {section.links.map((link) => (
                    <QuickLinkComponent
                      key={link.href}
                      icon={link.icon}
                      label={link.label}
                      href={link.href}
                      variant="primary"
                      onClick={onClose}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-border p-4 space-y-3">
        <Button variant="hero" className="w-full" asChild>
          <Link href="/auth" onClick={onClose}>
            <User className="h-4 w-4 mr-2" />
            Iniciar Sesión
          </Link>
        </Button>
      </div>
    </div>
  );
};


interface SearchBarProps {
  isExpanded: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onExpand: () => void;
  onClose: () => void;
}

const SearchBar = ({
  isExpanded,
  searchQuery,
  onSearchChange,
  onExpand,
  onClose,
}: SearchBarProps) => {
  const router = useRouter();
  const { data: recipes, isPending } = useSearchRecipes({
    searchParams: { query: searchQuery },
  });

  const handleNavigateToRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
    onClose();
  };

  const handleNavigateToPantry = () => {
    router.push("/pantry");
    onClose();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 transition-all duration-300",
        isExpanded
          ? "absolute left-1/2 -translate-x-1/2 w-[85%]"
          : "relative"
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-full bg-secondary px-4 py-2 transition-all duration-300",
          isExpanded ? "w-full" : "w-auto"
        )}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />

        <input
          type="text"
          placeholder="Buscar recetas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onExpand}
          className={cn(
            "bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all duration-300",
            isExpanded ? "w-full" : "w-24 md:w-40"
          )}
        />

        {isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {searchQuery.length > 0 && (
          <div className="absolute top-14 left-0 w-full max-h-96 overflow-y-auto overflow-x-hidden bg-card border border-border rounded-md shadow-lg">
            <button onClick={handleNavigateToPantry} className="w-full">
              <div className="flex gap-2 p-2 items-center border-b border-border cursor-pointer hover:bg-muted/50">
                <Image
                  src="https://img.freepik.com/free-vector/cartoon-ingredients-breakfast-eggs-flour-juice_24877-59984.jpg"
                  alt="Buscar por ingredientes"
                  width={50}
                  height={50}
                  className="object-cover rounded-lg"
                />
                <p className="text-sm font-semibold">
                  Buscar por ingredientes en la despensa
                </p>
                <ChevronRight className="ml-auto" size={30} />
              </div>
            </button>

            <div>
              {isPending ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Cargando...
                </p>
              ) : recipes && recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <Button
                    key={recipe.id}
                    variant="ghost"
                    className="block px-4 py-2 hover:bg-muted/50 w-full text-left rounded-none"
                    onClick={() => handleNavigateToRecipe(recipe.id)}
                  >
                    {recipe.name}
                  </Button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No se encontraron recetas
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleMenuEnter = (menu: string) => setActiveMenu(menu);
  const handleMenuLeave = () => setActiveMenu(null);
  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
  };

  const hasMenuLinks = ["recipes", "purchases"];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <MaxWidthWrapper>
        <div className="container flex h-16 items-center justify-between relative">
          <div
            className={cn(
              "flex items-center gap-8 transition-all duration-300",
              isSearchExpanded && "opacity-0 pointer-events-none"
            )}
          >
            <NavLink
              href="/"
              label={
                <span className="font-display text-2xl font-bold">
                  Buen<span className="text-primary">Bite</span>
                </span>
              }
              className="flex items-center gap-2"
            />

            <nav className="hidden lg:flex items-center gap-1">
              {MAIN_NAV_LINKS.map((link) => {
                const hasMenu = hasMenuLinks.includes(
                  link.href.replace("/", "")
                );

                if (hasMenu) {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() =>
                        handleMenuEnter(link.href.replace("/", ""))
                      }
                      onMouseLeave={handleMenuLeave}
                    >
                      <NavLink
                        href={link.href}
                        label={link.label}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent flex items-center gap-1"
                        activeClassName="text-foreground bg-accent"
                      />
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent"
                    activeClassName="text-foreground bg-accent"
                  />
                );
              })}
            </nav>
          </div>

          <SearchBar
            isExpanded={isSearchExpanded}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onExpand={() => setIsSearchExpanded(true)}
            onClose={handleCloseSearch}
          />

          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300",
              isSearchExpanded && "opacity-0 pointer-events-none"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hidden md:flex"
            >
              <User className="h-5 w-5" />
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="text-left font-display text-xl">
                    Buen<span className="text-primary">Bite</span>
                  </SheetTitle>
                </SheetHeader>
                <MobileSidebar onClose={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <RecipesMegaMenu
          isOpen={activeMenu === "recipes"}
          onMouseEnter={() => handleMenuEnter("recipes")}
          onMouseLeave={handleMenuLeave}
          onClose={() => setActiveMenu(null)}
        />
        <PurchasesMegaMenu
          isOpen={activeMenu === "purchases"}
          onMouseEnter={() => handleMenuEnter("purchases")}
          onMouseLeave={handleMenuLeave}
          onClose={() => setActiveMenu(null)}
        />
      </MaxWidthWrapper>
    </header>
  );
};

export default Navbar;