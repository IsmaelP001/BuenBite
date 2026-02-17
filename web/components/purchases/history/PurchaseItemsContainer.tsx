"use client";
import QuantityInput from "@/components/QuantityInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import useConfirmPurchase from "@/hooks/useConfirmPurchase";
import useGetPurchaseItems from "@/hooks/useGetPurchaseItems";
import { PurchaseItemDto } from "@/types/models/purchase";
import { LoaderCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface PurchaseItemsContainerProps {
  status: string;
}
export default function PurchaseItemsContainer({
  status,
}: PurchaseItemsContainerProps) {
  const { id } = useParams();

  const {
    data: purchaseItems,
    purchaseItemsMap,
    updateItemQuantity,
  } = useGetPurchaseItems(id as string);
  const router = useRouter();

  const { mutateAsync: confirmPurchaseMutation, isPending: isSaving } =
    useConfirmPurchase();

  const handleConfirmPurchase = async () => {
    const items: PurchaseItemDto[] = purchaseItems.map((item) => ({
      ingredientId: item.id,
      amountToBuy:
        purchaseItemsMap.get(item.id)?.currentQuantity ?? item.amountToBuy,
      measurementType: item.measurementType,
      purchaseItemId: item.id,
    }));

    try {
      await confirmPurchaseMutation({
        purchaseId: id as string,
        items,
      });
      router.back();
    } catch (error) {
      console.log("err confirming", error);
      throw error;
    }
  };

  return (
    <div className="gap-y-4">
      <Card className="print-container mb-4">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">
            Lista de Ingredientes
          </h2>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {purchaseItems?.map((item, index) => {
              const quantity = purchaseItemsMap.get(item.id)?.currentQuantity;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0 animate-slide-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-foreground">
                      {item?.name?.es || "Ingrediente desconocido"}
                    </span>
                  </div>
                  {status === "confirmed" ? (
                    <div className="text-right">
                      <span className="font-bold text-primary">{quantity}</span>
                      <span className="text-muted-foreground ml-1 text-sm">
                        {item.measurementType}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <QuantityInput
                        value={quantity}
                        onChange={(value) => updateItemQuantity(item.id, value)}
                        max={100000}
                        size="sm"
                      />
                      <p className="text-muted-foreground ml-1 text-sm text-center">
                        {item.measurementType}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Button
        disabled={isSaving || !purchaseItems?.length}
        onClick={handleConfirmPurchase}
        className="w-full"
        variant="hero"
      >
        {isSaving ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          "Confirmar purchase"
        )}
      </Button>
    </div>
  );
}
