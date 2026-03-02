"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Package,
  Check,
  X,
  Sparkles,
  CircleArrowDown,
  LoaderCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@radix-ui/react-dialog";
import useGetIngredients from "@/hooks/useGetIngredients";
import { Ingredient } from "@/types/models/ingredient";
import {
  AnalyzedIngredient,
  BaseIngredientForAnalysis,
} from "@/types/models/pantry";
import { PurchaseItemDto } from "@/types/models/purchase";
import useCreatePurchase from "@/hooks/useCreatePurchase";


interface CartItem {
  ingredientId: string;
  ingredientName: string;
  category: string;
  measurementType: string;
  amountToBuy: number;
  availableUnits: string[];
  isNew?: boolean;
}

interface PurchaseConfirmationModalProps<T extends BaseIngredientForAnalysis> {
  open?: boolean;
  type: "MEALPLAN" | "INGREDIENTS";
  onOpenChange?: (open: boolean) => void;
  initialItems?: AnalyzedIngredient<T>[];
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Carnes: "bg-rose-100 text-rose-700 border-rose-200",
    Verduras: "bg-green-100 text-green-700 border-green-200",
    Lácteos: "bg-blue-100 text-blue-700 border-blue-200",
    Aceites: "bg-amber-100 text-amber-700 border-amber-200",
    Condimentos: "bg-teal-100 text-teal-700 border-teal-200",
    Panadería: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Líquidos: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Otros: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return colors[category] || "bg-muted text-muted-foreground";
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    Carnes: "🥩",
    Verduras: "🥬",
    Lácteos: "🥛",
    Aceites: "🫒",
    Condimentos: "🧂",
    Panadería: "🍞",
    Líquidos: "💧",
    Otros: "📦",
  };
  return icons[category] || "📦";
};

const convertToCartItems = <T extends BaseIngredientForAnalysis>(
  items: AnalyzedIngredient<T>[]
): CartItem[] => {
  return items
    .filter(
      (item) =>
        item.availabilityStatus === "PARTIAL" ||
        item.availabilityStatus === "MISSING" ||
        item.missingAmount > 0
    )
    .map((item) => {
      const itemName =
        (item as any)?.ingredientName ||
        (item as any).name?.es ||
        "Ingrediente";

      return {
        ingredientId: item.ingredientId,
        ingredientName: itemName,
        category: item?.category || "Otros",
        measurementType: item.measurementType,
        amountToBuy: Math.ceil(item.missingAmount || item.measurementValue),
        availableUnits: item?.conversions?.allowed_units || [
          item.measurementType,
        ],
      };
    });
};


const PurchaseConfirmationModal = <T extends BaseIngredientForAnalysis>({
  open,
  onOpenChange,
  initialItems = [],
  type,
}: PurchaseConfirmationModalProps<T>) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const { mutate: createPurchaseMutation, isPending: isCreatingPurchase } =
    useCreatePurchase();

  useEffect(() => {
    setCartItems(convertToCartItems(initialItems));
    setSearchQuery("");
    setRecentlyAdded(null);
  }, [open, initialItems]);

  const { ingredients: searchResults, isPending: isPendingIngredients } =
    useGetIngredients({
      searchValue: searchQuery,
      isDisabled: false,
    });

  const isInCart = (ingredientId: string) => {
    return cartItems.some((item) => item.ingredientId === ingredientId);
  };

  const updateItemAmount = (index: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, amountToBuy: Math.max(1, item.amountToBuy + delta) }
          : item
      )
    );
  };

  const setItemAmount = (index: number, amount: number) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, amountToBuy: Math.max(1, amount) } : item
      )
    );
  };

  const updateItemUnit = (index: number, unit: string) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, measurementType: unit } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = (ingredient: Ingredient) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.ingredientId === ingredient.id
    );

    if (existingIndex >= 0) {
      updateItemAmount(existingIndex, 1);
      setRecentlyAdded(ingredient.id);
    } else {
      setCartItems((prev) => [
        {
          ingredientId: ingredient.id,
          ingredientName: ingredient.name_es,
          category: ingredient.category,
          measurementType: ingredient?.conversions?.allowed_units?.[0],
          amountToBuy: 1,
          availableUnits: ingredient?.conversions?.allowed_units ?? ["grams"],
          isNew: true,
        },
        ...prev,
      ]);
      setRecentlyAdded(ingredient.id);
    }

    setTimeout(() => {
      setRecentlyAdded(null);
      setCartItems((prev) => prev.map((item) => ({ ...item, isNew: false })));
    }, 600);

    setSearchQuery("");
  };

  const handleConfirm = () => {
    const purchaseItems: PurchaseItemDto[] = cartItems.map((item) => ({
      ingredientId: item.ingredientId,
      measurementType: item.measurementType,
      amountToBuy: item.amountToBuy,
    }));
    

    createPurchaseMutation(purchaseItems);

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const totalItems = cartItems.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' className="w-full gap-2">
          <ShoppingCart className="h-4 w-4" />
          Agregar Faltantes a Lista
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] lg:max-w-[65vw] 2xl:max-w-7xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-3 sm:p-6 pb-2 sm:pb-4 border-b bg-linear-to-r from-primary/5 to-primary/10">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Orden de Compra
            <Badge variant="outline" className="ml-auto text-xs">
              {type === "MEALPLAN" ? "Plan de Comidas" : "Ingredientes"}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-base">
            Busca ingredientes y agrégalos a tu orden
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* LEFT PANEL - Search & Browse */}
          <div className="w-full md:w-[45%] md:border-r flex flex-col bg-muted/20 max-h-[30vh] md:max-h-none">
            <div className="p-2.5 sm:p-4 border-b bg-background/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ingredientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 pr-3 h-9 sm:h-11 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 p-2.5 sm:p-4 overflow-y-auto">
              <div className="mb-2 flex items-center gap-1.5 sm:gap-2">
                {searchQuery ? (
                  <>
                    <Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">
                      Resultados
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <p className="text-xs sm:text-sm font-medium">
                      Disponibles
                    </p>
                  </>
                )}
              </div>

              {isPendingIngredients ? (
                <div className="flex items-center justify-center min-h-[100px] sm:min-h-[150px]">
                  <LoaderCircle className="animate-spin h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              ) : null}

              {!isPendingIngredients && searchResults?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-12 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                    <Search className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground px-4">
                    No se encontraron ingredientes
                  </p>
                </div>
              ) : (
                <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 sm:gap-2">
                  {searchResults && searchResults.length
                    ? searchResults?.map((ingredient) => {
                        const inCart = isInCart(ingredient.id);
                        return (
                          <button
                            key={ingredient.id}
                            onClick={() => !inCart && addIngredient(ingredient)}
                            disabled={inCart}
                            className={cn(
                              "inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs transition-all duration-200",
                              inCart
                                ? "bg-primary/10 text-primary cursor-default"
                                : "bg-background border hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-95"
                            )}
                          >
                            <span className="font-medium text-[10px] sm:text-sm truncate max-w-20 sm:max-w-none">
                              {ingredient.name_es}
                            </span>
                            {inCart ? (
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                            ) : (
                              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                            )}
                          </button>
                        );
                      })
                    : null}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - Cart */}
          <div className="w-full md:w-[55%] flex flex-col bg-background border-t md:border-t-0 flex-1 overflow-y-auto">
            <div className="p-2.5 sm:p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <p className="font-semibold text-xs sm:text-sm">
                    Tu Orden
                    {totalItems > 0 && (
                      <span className="ml-1.5 text-muted-foreground font-normal text-[10px] sm:text-xs">
                        ({totalItems})
                      </span>
                    )}
                  </p>
                </div>
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] sm:text-xs h-6 sm:h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setCartItems([])}
                  >
                    <Trash2 className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 p-2.5 sm:p-4 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium text-xs sm:text-sm mb-1">
                    Tu orden está vacía
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 px-4">
                    Busca y agrega ingredientes
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.ingredientId}-${index}`}
                      className={cn(
                        "flex flex-col gap-2 p-2.5 sm:p-3 rounded-lg border transition-all duration-300",
                        item.isNew || recentlyAdded === item.ingredientId
                          ? "bg-primary/10 border-primary/30 shadow-sm"
                          : "bg-card hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-1.5 justify-between">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <div
                            className={cn(
                              "w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base shrink-0",
                              getCategoryColor(item.category)
                            )}
                          >
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs sm:text-sm truncate">
                              {item.ingredientName}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] px-1.5 py-0 mt-0.5 hidden sm:inline-flex",
                                getCategoryColor(item.category)
                              )}
                            >
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center bg-muted rounded-lg flex-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none hover:bg-muted-foreground/10"
                            onClick={() => updateItemAmount(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.amountToBuy}
                            onChange={(e) =>
                              setItemAmount(
                                index,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="flex-1 h-8 text-xs text-center border-0 bg-transparent p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none hover:bg-muted-foreground/10"
                            onClick={() => updateItemAmount(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Select
                          value={item.measurementType}
                          onValueChange={(value) =>
                            updateItemUnit(index, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-20 sm:w-24 text-[10px] sm:text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {item.availableUnits.map((unit) => (
                              <SelectItem
                                key={unit}
                                value={unit}
                                className="text-[10px] sm:text-xs"
                              >
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-2.5 sm:p-4 border-t bg-muted/30 flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setCartItems(convertToCartItems(initialItems))}
            className="flex-1 sm:flex-none h-9 sm:h-11 text-xs sm:text-sm"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={cartItems.length === 0 || isCreatingPurchase }
            className="flex-1 sm:flex-none h-9 sm:h-11 gap-1.5 text-xs sm:text-sm"
          >
            {isCreatingPurchase ? (
              <LoaderCircle className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                Crear Orden
                {totalItems > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 text-[10px] bg-primary-foreground/20 text-primary-foreground"
                  >
                    {totalItems}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmationModal;