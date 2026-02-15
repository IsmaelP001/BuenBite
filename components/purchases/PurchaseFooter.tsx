"use client";
import { useSelectedPurchaseItems } from "@/lib/context/purchase";
import { Button } from "../ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import useCreatePurchase from "@/hooks/useCreatePurchase";
import MaxWidthWrapper from "../MaxWithWrapper";

export default function PurchaseFooter() {
  const { selectedItemsArray } = useSelectedPurchaseItems();
  const { mutate: createPurchaseMutation, isPending } = useCreatePurchase();
  const handleCreatePurchase = () => {
    const itemsToSave = selectedItemsArray.map((item) => ({
      ingredientId: item.id,
      measurementType: item.unitType,
      amountToBuy: item.amount,
    }));
    createPurchaseMutation(itemsToSave);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl py-4">
      <MaxWidthWrapper>
        <div className=" mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-start gap-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Productos seleccionados
              </p>
            </div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
       
        </div>
        <Button
          size="lg"
          className="gap-2 px-8"
          disabled={selectedItemsArray.length === 0 || isPending}
          onClick={handleCreatePurchase}
        >
          {isPending
            ? "Creando..."
            : `Crear Orden
          ${selectedItemsArray.length > 0 ? `(${selectedItemsArray.length})` : ""}`}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      </MaxWidthWrapper>
    </div>
  );
}
