"use client";
import QuantityInput from "@/components/QuantityInput";
import { Button } from "@/components/ui/button";
import useGetPantryDetails from "@/hooks/getPantryDetails";
import UseUpdatePantryItem from "@/hooks/useUpdatePantryItem";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Edit,
  Heart,
  SaveAll,
  Share2,
  ShoppingCart,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const categoryColors: Record<string, string> = {
  Lácteos: "bg-blue-500",
  Carnes: "bg-rose-500",
  Frutas: "bg-green-500",
  Verduras: "bg-emerald-500",
  Granos: "bg-amber-500",
};

export default function PantryIngredientInfo() {
  const { data: pantryItem, isPending } = useGetPantryDetails();
  const [isEditingPantry, setIsEditingPantry] = useState(false);
  const [pantryAmount, setPantryAmount] = useState(0);
  const [isEditingPurchase, setIsEditingPurchase] = useState(false);
  const [tempPurchaseAmount, setTempPurchaseAmount] = useState(0);

  const { mutate: updatePantryMutation, isPending: isSaving } =
    UseUpdatePantryItem();

  useEffect(() => {
    if (pantryItem) {
      setPantryAmount(pantryItem?.measurementValue ?? 0);
      setTempPurchaseAmount(pantryItem?.pendingPurchaseQuantity ?? 0);
    }
  }, [pantryItem]);

  if (isPending || !pantryItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mb-10 animate-fade-in">
      {/* Header with smaller image */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Smaller Image */}
        <div className="relative w-full md:w-48 h-48 md:h-48 rounded-2xl overflow-hidden card-shadow shrink-0">
          <img
            src={pantryItem.image}
            alt={pantryItem.name.es}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-foreground/40 via-transparent to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold text-primary-foreground",
                categoryColors[pantryItem.category] || "bg-muted-foreground"
              )}
            >
              {pantryItem.category}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button className="p-1.5 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-colors">
              <Heart className="h-4 w-4 text-foreground" />
            </button>
            <button className="p-1.5 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-colors">
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Title and Expiry Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                {pantryItem.name.es}
              </h1>
              {pantryItem?.brand && (
                <p className="text-muted-foreground">{pantryItem.brand}</p>
              )}
              <p className="text-muted-foreground">{pantryItem.category}</p>
            </div>
            {pantryItem.isLowStock && pantryItem.expirationDate ? (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-warning/10 text-warning flex items-center gap-1.5 shrink-0">
                <AlertCircle className="h-3.5 w-3.5" />
                Expira {pantryItem.expirationDate}
              </span>
            ) : null}
          </div>

          <div className=" rounded-2xl  card-shadow max-w-[280px]">
            <div className="flex items-start justify-between">
              {isEditingPantry ? (
                <div className=" gap-4">
                  <QuantityInput
                    value={pantryAmount}
                    onChange={(val) => setPantryAmount(val)}
                    max={10000}
                  />
                  <p className="text-lg text-muted-foreground text-center">
                    {pantryItem.measurementType}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-display text-4xl font-bold text-foreground">
                    {pantryItem?.measurementValue?.toFixed(2) ?? 0}{" "}
                    <span className="text-xl text-muted-foreground">
                      {pantryItem.measurementType}
                    </span>
                  </p>
                </div>
              )}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditingPantry(!isEditingPantry)}
                  className="rounded-full h-10 w-10 hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                >
                  {isEditingPantry ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                </Button>
                {isEditingPantry && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      updatePantryMutation({
                        ingredientId: pantryItem.ingredientId,
                        measurementValue: pantryAmount,
                      });
                      setIsEditingPantry(false);
                    }}
                    className="rounded-full h-10 w-10 hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                  >
                    <SaveAll />
                  </Button>
                )}
              </div>
            </div>

            {pantryAmount === 0 && (
              <p className="mt-3 text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Sin stock en despensa
              </p>
            )}
          </div>

          {/* Quick Stats Row */}
          {/* <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                <span className="text-muted-foreground">Vence: </span>
                <span
                  className={cn(
                    "font-medium",
                    item.isExpiringSoon ? "text-warning" : "text-foreground"
                  )}
                >
                  {item.expiryText}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">
                {item.storageLocation}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <Thermometer className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">
                {pantryItem.}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">
                {pantryItem.expirationDate}
              </span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Quantity Management Cards */}
      <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-2xl p-6 card-shadow border-2 border-primary/20">
        <div className=" md:flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div className="">
              <p className="text-sm text-foreground font-medium">
                Pendiente de Compra
              </p>
              <p className="text-xs text-muted-foreground">
                Para lista de compras
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-center justify-end mt-2 md:mt-0">
            {isEditingPurchase ? (
              <div className=" ">
                <QuantityInput
                  value={tempPurchaseAmount}
                  onChange={(val) => setTempPurchaseAmount(val)}
                  max={10000}
                />
              </div>
            ) : (
              <div>
                <p className="font-display pb-1.5 text-4xl font-bold text-foreground">
                  <span className="text-xl text-muted-foreground">
                    {pantryItem.pendingPurchaseQuantity}{" "}
                  </span>
                  <span className="text-xl text-muted-foreground">
                    {pantryItem.measurementType}
                  </span>
                </p>
              </div>
            )}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsEditingPurchase(!isEditingPurchase);
                }}
                className="rounded-full h-10 w-10 hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
              >
                {isEditingPurchase ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>
              {isEditingPurchase && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    updatePantryMutation({
                      ingredientId: pantryItem.ingredientId,
                      pendingPurchaseQuantity: tempPurchaseAmount,
                    });
                    setIsEditingPurchase(false);
                  }}
                  className="rounded-full h-10 w-10 hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                >
                  <SaveAll />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
